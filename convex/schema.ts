import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({

  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),



  proyectos: defineTable({
    nombre: v.string(),
    presupuesto: v.number(),
    estado: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }),

  metas: defineTable({
    nombre: v.string(),
    montoObjetivo: v.number(),
    moneda: v.string(),
    estado: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }),

  movimientos: defineTable({
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
    createdAt: v.number(),
  }),

})