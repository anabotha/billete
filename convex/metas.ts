import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const crearMeta = mutation({
  args: {
    nombre: v.string(),
    montoObjetivo: v.number(),
    moneda: v.optional(v.string()),
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {

    return await ctx.db.insert("metas", {
      nombre: args.nombre,
      montoObjetivo: args.montoObjetivo,
      moneda: args.moneda || "ARS",
      userId: args.userId,
      createdAt: Date.now(),
      estado: "activo",
    })
  },
})
export const obtenerMetasConRecaudado = query({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {

    const metas = await ctx.db
      .query("metas")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect()

    const movimientos = await ctx.db
      .query("movimientos")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect()

    return metas.map((meta) => {

      const ahorro = movimientos
        .filter(
          m => m.metaId === meta._id && m.tipo === "ahorro"
        )
        .reduce((t, m) => t + m.monto, 0)

      const egreso = movimientos
        .filter(
          m => m.metaId === meta._id && m.tipo === "egreso"
        )
        .reduce((t, m) => t + m.monto, 0)

      const recaudado = ahorro - egreso

      return {
        ...meta,
        recaudado,
        progreso: recaudado / meta.montoObjetivo,
      }

    })
  },
})
export const obtenerMetas = query({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {

    return await ctx.db
      .query("metas")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect()
  },
})
export const eliminarMeta = mutation({
  args: { id: v.id("metas") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})