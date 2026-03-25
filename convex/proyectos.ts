import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { query } from "./_generated/server"

export const crearProyecto = mutation({
  args: {
    nombre: v.string(),
    presupuesto: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("proyectos", {
      ...args,
      createdAt: Date.now(),
      estado: "activo",
    })
  },
})
export const obtenerProyectosConIngresos = query({
  handler: async (ctx) => {
    const proyectos = await ctx.db.query("proyectos").collect()

    const movimientos = await ctx.db.query("movimientos").collect()

    return proyectos.map((proyecto) => {
      const ingresos = movimientos
        .filter(
          (m) =>
            m.proyectoId === proyecto._id &&
            m.tipo === "ingreso"
        )
        .reduce((total, m) => total + m.monto, 0)

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
  handler: async (ctx) => {
    return await ctx.db.query("proyectos").collect()
  },
})
export const eliminarProyecto = mutation({
  args: { id: v.id("proyectos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})