import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({

  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
    // Distribución porcentual
    configuracion: v.optional(v.object({
      ahorro: v.number(),
      dolares: v.number(),
      vivir: v.number(),
    })),
    // Buffer: sueldo autodefinido mensual
    sueldo: v.optional(v.number()),
    // Semáforo: límites de gasto por categoría
    presupuestoCategorias: v.optional(v.array(v.object({
      categoria: v.string(),
      limite: v.number(),
      moneda: v.string(),
    }))),
  }).index("by_email", ["email"]),

  proyectos: defineTable({
    nombre: v.string(),
    presupuesto: v.number(),
    estado: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  metas: defineTable({
    nombre: v.string(),
    montoObjetivo: v.number(),
    moneda: v.string(),
    estado: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  movimientos: defineTable({
    tipo: v.union(
      v.literal("ingreso"),
      v.literal("egreso"),
      v.literal("ahorro"),
      v.literal("sueldo")    // retiro del Buffer
    ),
    monto: v.float64(),
    moneda: v.string(),
    proyectoId: v.optional(v.id("proyectos")),
    metaId: v.optional(v.id("metas")),
    userId: v.id("users"),
    categoria: v.optional(v.string()),
    esReserva: v.optional(v.boolean()),
    compromisoId: v.optional(v.id("compromisos")),  // vincula egreso a un compromiso
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Gastos fijos recurrentes aún no pagados este mes
  compromisos: defineTable({
    nombre: v.string(),
    monto: v.number(),
    moneda: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

})