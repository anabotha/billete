import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

const TIPO = v.union(
  v.literal("ingreso"),
  v.literal("egreso"),
  v.literal("ahorro"),
  v.literal("sueldo")
)

export const crearMovimiento = mutation({
  args: {
    tipo: TIPO,
    monto: v.float64(),
    moneda: v.string(),
    proyectoId: v.optional(v.id("proyectos")),
    metaId: v.optional(v.id("metas")),
    userId: v.id("users"),
    categoria: v.optional(v.string()),
    esReserva: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("movimientos", {
      ...args,
      createdAt: Date.now(),
    })
  },
})

export const obtenerMovimientos = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("movimientos")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .order("desc")
      .take(50)
  },
})