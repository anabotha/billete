"use client"
import React, { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { semaforo, SEMAFORO_COLOR, SEMAFORO_BG, burnRateColor, formatMeses } from "../../lib/finanzas"

export default function DashboardPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [userId, setUserId] = useState<Id<"users"> | null>(null)

  const cobrarSueldo = useMutation(api.metricas.cobrarSueldo)

  const metricas = useQuery(api.metricas.obtenerMetricas, userId ? { userId } : "skip")
  const movimientos = useQuery(api.movimientos.obtenerMovimientos, userId ? { userId } : "skip")
  const proyectos = useQuery(api.proyectos.obtenerProyectos, userId ? { userId } : "skip")

  useEffect(() => { setIsMounted(true) }, [])
  useEffect(() => {
    const id = localStorage.getItem("userId")
    if (id && id !== "null" && id !== "undefined") {
      setUserId(id as Id<"users">)
    } else {
      router.push("/login")
    }
  }, [])

  if (!isMounted || !userId) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 16 }}>
            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
            <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
            <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
          </div>
        </div>
      </div>
    )
  }

  // ── Chart data: ingresos por proyecto ────────────────────────────────────
  const chartData = (() => {
    if (!movimientos || !proyectos) return []
    const acc: Record<string, number> = {}
    for (const m of movimientos) {
      if (m.tipo === "ingreso" && m.proyectoId) {
        acc[m.proyectoId] = (acc[m.proyectoId] ?? 0) + m.monto
      }
    }
    return Object.entries(acc).map(([id, monto]) => ({
      nombre: proyectos.find(p => p._id === id)?.nombre ?? "Otro",
      monto,
    }))
  })()

  const COLORS = ["#0066cc", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444"]

  return (
    <div className="page-shell">
      <div className="page-container">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", marginTop: 2 }}>
              Indicadores de tu economía
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/ingresos" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
              + Movimiento
            </Link>
            <Link href="/choices" className="btn-ghost" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              ← Volver
            </Link>
          </div>
        </div>

        {/* A. Safety Net ─────────────────────────────────────────────────── */}
        <SectionTitle title="Safety Net" sub="Cuánto tenés realmente disponible" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
          <MetricCard label="Saldo bruto" value={`$${(metricas?.saldoBruto ?? 0).toLocaleString("es-AR")}`} />
          <MetricCard label="Compromisos pendientes" value={`-$${(metricas?.totalCompromisos ?? 0).toLocaleString("es-AR")}`} valueColor="var(--danger)" />
          <MetricCard label="Disponible real" value={`$${(metricas?.disponibleReal ?? 0).toLocaleString("es-AR")}`} highlight />
        </div>

        {/* B. Burn Rate & C. Buffer ─────────────────────────────────────── */}
        <SectionTitle title="Supervivencia & Buffer" sub="Runway en meses y sueldo de tu reserva" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>

          {/* Burn Rate */}
          <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
            <div className="label" style={{ marginBottom: 6 }}>Burn Rate</div>
            {metricas?.burnRateMeses != null ? (
              <>
                <div style={{
                  fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.04em",
                  color: burnRateColor(metricas.burnRateMeses)
                }}>
                  {formatMeses(metricas.burnRateMeses)}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 4 }}>
                  Gasto promedio: ${(metricas.promedioGasto3M).toLocaleString("es-AR")}/mes (últ. 3 meses)
                </div>
              </>
            ) : (
              <div style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>Sin datos de gasto aún</div>
            )}
          </div>

          {/* Buffer / Sueldo */}
          <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
            <div className="label" style={{ marginBottom: 6 }}>Reserva (Buffer)</div>
            <div style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--accent)" }}>
              ${(metricas?.reservaActual ?? 0).toLocaleString("es-AR")}
            </div>
            {metricas?.sueldo ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                  Sueldo: ${metricas.sueldo.toLocaleString("es-AR")}/mes
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                  onClick={() => userId && cobrarSueldo({ userId })}
                >
                  Cobrar sueldo
                </button>
              </div>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 4 }}>
                <Link href="/configuracion" style={{ color: "var(--accent)" }}>Configurar sueldo →</Link>
              </div>
            )}
          </div>
        </div>

        {/* D. Semáforo ─────────────────────────────────────────────────── */}
        {metricas?.presupuestoCategorias && metricas.presupuestoCategorias.length > 0 && (
          <>
            <SectionTitle title="Semáforo de Gasto" sub="Gasto actual vs. límite mensual por categoría" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
              {metricas.presupuestoCategorias.map(cat => {
                const gastado = metricas.gastoPorCategoria[cat.categoria] ?? 0
                const pct = cat.limite > 0 ? gastado / cat.limite : 0
                const estado = semaforo(pct)
                return (
                  <div key={cat.categoria} className="card" style={{ padding: "1rem 1.25rem", borderLeft: `3px solid ${SEMAFORO_COLOR[estado]}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>{cat.categoria}</span>
                      <span style={{
                        fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px",
                        borderRadius: 99, background: SEMAFORO_BG[estado], color: SEMAFORO_COLOR[estado]
                      }}>
                        {Math.round(pct * 100)}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${Math.min(pct * 100, 100)}%`, background: SEMAFORO_COLOR[estado] }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 6 }}>
                      <span>${gastado.toLocaleString("es-AR")}</span>
                      <span>${cat.limite.toLocaleString("es-AR")} {cat.moneda}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* E. Pipeline + Gráfico ─────────────────────────────────────────── */}
        <SectionTitle title="Pipeline & Distribución" sub="Proyectos pendientes de cobro e ingresos históricos" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 24 }}>

          {/* Gráfico ingresos por proyecto */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: "1.25rem" }}>Ingresos por proyecto</div>
            {chartData.length > 0 ? (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "var(--border)", opacity: 0.5 }} />
                    <Bar dataKey="monto" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
                Sin datos todavía
              </div>
            )}
          </div>

          {/* Pipeline de cobros */}
          <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: 4 }}>Pipeline de cobros</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "1rem" }}>
              Disponible + proyectos pendientes
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
              ${(metricas?.pipelineTotal ?? 0).toLocaleString("es-AR")}
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Disponible real */}
              <PipelineRow label="Disponible real" monto={metricas?.disponibleReal ?? 0} color="var(--success)" />
              {/* Proyectos pendientes */}
              {(metricas?.proyectosPendientes ?? []).map(p => (
                <PipelineRow key={p._id} label={p.nombre} monto={p.presupuesto} color="var(--text-secondary)" />
              ))}
              {(metricas?.proyectosPendientes ?? []).length === 0 && (
                <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
                  Sin proyectos pendientes
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)", letterSpacing: "0.02em", textTransform: "uppercase" }}>
        {title}
      </div>
      <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>{sub}</div>
    </div>
  )
}

function MetricCard({ label, value, valueColor, highlight }: {
  label: string; value: string; valueColor?: string; highlight?: boolean
}) {
  return (
    <div className="card" style={{
      padding: "1.25rem 1.5rem",
      background: highlight ? "var(--accent-subtle)" : "var(--surface)",
      border: highlight ? "1px solid var(--accent)" : "1px solid var(--border)",
    }}>
      <div className="label" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.03em", color: valueColor ?? "var(--text-primary)" }}>
        {value}
      </div>
    </div>
  )
}

function PipelineRow({ label, monto, color }: { label: string; monto: number; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontSize: "0.875rem", fontWeight: 600, color }}>${monto.toLocaleString("es-AR")}</span>
    </div>
  )
}
