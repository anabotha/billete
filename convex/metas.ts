import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const crearMeta = mutation({
  args: {
    nombre: v.string(),
    montoObjetivo: v.number(),
    moneda: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("metas", {
      nombre: args.nombre,
      montoObjetivo: args.montoObjetivo,
      moneda: args.moneda || "ARS",
      createdAt: Date.now(),
      estado: "activo",
    })
  },
})
export const obtenerMetasConRecaudado = query({
  handler: async (ctx) => {
    const metas = await ctx.db.query("metas").collect()
    const movimientos = await ctx.db.query("movimientos").collect()

    return metas.map((meta) => {
      const ahorro = movimientos
        .filter((m) => m.metaId === meta._id && m.tipo === "ahorro")
        .reduce((total, m) => total + m.monto, 0)

      const egreso = movimientos
        .filter((m) => m.metaId === meta._id && m.tipo === "egreso")
        .reduce((total, m) => total + m.monto, 0)

      const recaudado = ahorro - egreso

      const progreso = Math.min(
        Math.max(recaudado / meta.montoObjetivo, 0),
        1
      )

      return {
        ...meta,
        recaudado,
        progreso,
      }
    })
  },
})
export const obtenerMetas = query({
  handler: async (ctx) => {
    return await ctx.db.query("metas").collect()
  },
})
export const eliminarMeta = mutation({
  args: { id: v.id("metas") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})