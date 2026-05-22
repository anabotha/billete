import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const crearCompromiso = mutation({
  args: {
    nombre: v.string(),
    monto: v.number(),
    moneda: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("compromisos", {
      ...args,
      createdAt: Date.now(),
    })
  },
})

export const eliminarCompromiso = mutation({
  args: { id: v.id("compromisos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
export const pagarCompromiso = mutation({
  args: { id: v.id("compromisos") },
  handler: async (ctx, args) => {
    const compromiso = await ctx.db.get(args.id)
    if (!compromiso) return
    await ctx.db.delete(args.id)
    await ctx.db.insert("movimientos", {
      tipo: "egreso",
      monto: compromiso.monto,
      moneda: compromiso.moneda,
      userId: compromiso.userId,
      categoria: "Compromiso: " + compromiso.nombre,
      createdAt: Date.now(),
    })
  },
})
export const obtenerCompromisos = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("compromisos")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect()
  },
})
