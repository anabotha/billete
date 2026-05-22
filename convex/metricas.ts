import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// ── Pure helpers (no side effects) ──────────────────────────────────────────

function startOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime()
}

function startOfMonthOffset(date: Date, offset: number): number {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1).getTime()
}

function sumMonto(items: { monto: number }[]): number {
  return items.reduce((acc, i) => acc + i.monto, 0)
}

function avgMonthlySpend(
  egresos: { monto: number; createdAt: number }[],
  from: number,
  to: number
): number {
  // Group egresos by month within [from, to] and return the average
  const byMonth: Record<string, number> = {}
  for (const e of egresos) {
    if (e.createdAt < from || e.createdAt >= to) continue
    const d = new Date(e.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    byMonth[key] = (byMonth[key] ?? 0) + e.monto
  }
  const months = Object.values(byMonth)
  if (months.length === 0) return 0
  return months.reduce((a, b) => a + b, 0) / months.length
}

// ── Main metrics query ───────────────────────────────────────────────────────

export const obtenerMetricas = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = new Date()
    const inicioMesActual = startOfMonth(now)
    const inicio3MesesAtras = startOfMonthOffset(now, -3)

    // Fetch all data in parallel
    const [todosMovimientos, compromisos, proyectos, user] = await Promise.all([
      ctx.db
        .query("movimientos")
        .withIndex("by_user", q => q.eq("userId", args.userId))
        .collect(),
      ctx.db
        .query("compromisos")
        .withIndex("by_user", q => q.eq("userId", args.userId))
        .collect(),
      ctx.db
        .query("proyectos")
        .withIndex("by_user", q => q.eq("userId", args.userId))
        .collect(),
      ctx.db.get(args.userId),
    ])

    // Classify movements
    const ingresos   = todosMovimientos.filter(m => m.tipo === "ingreso")
    const egresos    = todosMovimientos.filter(m => m.tipo === "egreso")
    const sueldos    = todosMovimientos.filter(m => m.tipo === "sueldo")
    const egrEstesMes = egresos.filter(m => m.createdAt >= inicioMesActual)

    // A. Safety Net
    const saldoBruto      = sumMonto(ingresos) - sumMonto(egresos) - sumMonto(sueldos)
    const totalCompromisos = sumMonto(compromisos)
    const disponibleReal  = saldoBruto - totalCompromisos

    // B. Burn Rate
    const promedioGasto3M = avgMonthlySpend(egresos, inicio3MesesAtras, inicioMesActual)
    const burnRateMeses   = promedioGasto3M > 0 ? saldoBruto / promedioGasto3M : null

    // C. Reserva (Buffer)
    const ingresosReserva = ingresos.filter(m => m.esReserva === true)
    const reservaActual   = sumMonto(ingresosReserva) - sumMonto(sueldos)

    // D. Semáforo — gasto por categoría este mes
    const gastoPorCategoria: Record<string, number> = {}
    for (const e of egrEstesMes) {
      const cat = e.categoria ?? "Sin categoría"
      gastoPorCategoria[cat] = (gastoPorCategoria[cat] ?? 0) + e.monto
    }

    // E. Pipeline — proyectos pendientes de cobro
    const proyectosPendientes = proyectos.filter(p => p.estado === "pendiente")

    return {
      // Safety Net
      saldoBruto,
      totalCompromisos,
      disponibleReal,
      // Burn Rate
      promedioGasto3M,
      burnRateMeses,
      // Buffer/Reserva
      reservaActual,
      sueldo: user?.sueldo ?? null,
      // Semáforo
      gastoPorCategoria,
      presupuestoCategorias: user?.presupuestoCategorias ?? [],
      // Pipeline
      proyectosPendientes,
      pipelineTotal: disponibleReal + sumMonto(proyectosPendientes.map(p => ({ monto: p.presupuesto }))),
    }
  },
})

// ── Sueldo: cobrar manualmente ───────────────────────────────────────────────

export const cobrarSueldo = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user?.sueldo) throw new Error("No tenés un sueldo configurado")

    return await ctx.db.insert("movimientos", {
      tipo: "sueldo",
      monto: user.sueldo,
      moneda: "ARS",
      userId: args.userId,
      createdAt: Date.now(),
    })
  },
})
