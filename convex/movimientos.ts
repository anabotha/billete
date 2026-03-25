import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { query } from "./_generated/server"

export const crearMovimiento = mutation({
  args: {
    tipo: v.union(
      v.literal("ingreso"),
      v.literal("egreso"),
      v.literal("ahorro")

    ),
    monto: v.float64(),
    moneda: v.string(),
    proyectoId: v.optional(v.id("proyectos")),
    metaId: v.optional(v.id("metas")),
  },

  handler: async (ctx, args) => {
    return await ctx.db.insert("movimientos", {
      ...args,
      createdAt: Date.now(),
    })
  },
})

export const obtenerMovimientos = query({
  handler: async (ctx) => {
    return await ctx.db.query("movimientos").collect()
  },
})