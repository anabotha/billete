import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const crearProyecto = mutation({
  args: {
    nombre: v.string(),
    presupuesto: v.number(),
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {

    return await ctx.db.insert("proyectos", {
      nombre: args.nombre,
      presupuesto: args.presupuesto,
      userId: args.userId,
      createdAt: Date.now(),
      estado: "activo",
    })
  },
})



export const obtenerProyectosConIngresos = query({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {

    const proyectos = await ctx.db
      .query("proyectos")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect()

    const movimientos = await ctx.db
      .query("movimientos")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect()

    return proyectos.map((proyecto) => {

      const ingresos = movimientos
        .filter(
          m =>
            m.proyectoId === proyecto._id &&
            m.tipo === "ingreso"
        )
        .reduce((t, m) => t + m.monto, 0)

      return {
        ...proyecto,
        ingresos,
        restante: proyecto.presupuesto - ingresos,
        progreso: ingresos / proyecto.presupuesto,
      }

    })
  },
})



export const obtenerProyectos = query({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {

    return await ctx.db
      .query("proyectos")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect()
  },
})



export const eliminarProyecto = mutation({
  args: {
    id: v.id("proyectos"),
  },

  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})