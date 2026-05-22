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
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const metas = await ctx.db
      .query("metas")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect()

    // Use index for efficiency and correctness
    const movimientos = await ctx.db
      .query("movimientos")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect()

    // Only movimientos linked to a meta
    const movConMeta = movimientos.filter(m => m.metaId != null)

    return metas.map((meta) => {
      const linked = movConMeta.filter(m => m.metaId === meta._id)

      // Sum contributions (ahorro) minus withdrawals (egreso)
      const totalAhorro = linked
        .filter(m => m.tipo === "ahorro")
        .reduce((t, m) => t + m.monto, 0)

      const totalEgreso = linked
        .filter(m => m.tipo === "egreso")
        .reduce((t, m) => t + m.monto, 0)

      const recaudado = totalAhorro - totalEgreso

      return {
        ...meta,
        recaudado,
        progreso: meta.montoObjetivo > 0 ? recaudado / meta.montoObjetivo : 0,
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