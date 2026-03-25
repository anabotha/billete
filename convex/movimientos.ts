import { mutation, query } from "./_generated/server"
import { v } from "convex/values"



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
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {

    return await ctx.db.insert("movimientos", {
      ...args,
      createdAt: Date.now(),
    })

  },
})



export const obtenerMovimientos = query({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {

    return await ctx.db
      .query("movimientos")
      .filter(q =>
        q.eq(q.field("userId"), args.userId)
      )
      .order("desc")
      .take(25)

  },
})