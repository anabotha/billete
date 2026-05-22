"use client"
import React, { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import Link from "next/link"
import { useRouter } from "next/navigation"

const Ingresos = () => {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [userId, setUserId] = useState<Id<"users"> | null>(null)
  const [tipo, setTipo] = useState<"ingreso" | "egreso" | "ahorro">("ingreso")
  const [mostrarForm, setMostrarForm] = useState(false)
  const [destino, setDestino] = useState<Id<"proyectos"> | Id<"metas"> | undefined>()
  const [monto, setMonto] = useState(0)
  const [moneda, setMoneda] = useState("ARS")
  const [categoria, setCategoria] = useState("")

  const crearMovimiento = useMutation(api.movimientos.crearMovimiento)

  const movimientos = useQuery(api.movimientos.obtenerMovimientos, userId ? { userId } : "skip")
  const metas = useQuery(api.metas.obtenerMetas, userId ? { userId } : "skip")
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
          <div className="skeleton" style={{ height: 60, borderRadius: 12, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 320, borderRadius: 12 }} />
        </div>
      </div>
    )
  }

  const getProyectoNombre = (id: Id<"proyectos">) =>
    proyectos?.find(p => p._id === id)?.nombre ?? "–"
  const getMetaNombre = (id: Id<"metas">) =>
    metas?.find(m => m._id === id)?.nombre ?? "–"

  const guardarMovimiento = async () => {
    await crearMovimiento({
      tipo, monto, moneda, userId,
      proyectoId: tipo === "ingreso" ? (destino as Id<"proyectos">) : undefined,
      metaId: tipo !== "ingreso" ? (destino as Id<"metas">) : undefined,
      categoria: categoria || undefined,
    })
    setMostrarForm(false)
    setMonto(0); setCategoria(""); setDestino(undefined)
  }

  const tipoBadge = (t: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      ingreso: { color: "var(--success)", bg: "var(--success-subtle)" },
      egreso:  { color: "var(--danger)", bg: "#fff0f0" },
      ahorro:  { color: "var(--accent)", bg: "var(--accent-subtle)" },
    }
    const s = map[t] ?? { color: "var(--text-secondary)", bg: "var(--bg)" }
    return (
      <span style={{
        background: s.bg, color: s.color, padding: "2px 8px",
        borderRadius: 99, fontSize: "0.75rem", fontWeight: 600
      }}>{t}</span>
    )
  }

  return (
    <div className="page-shell">
      <div className="page-container">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 className="page-title">Movimientos</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", marginTop: 2 }}>
              Ingresos, egresos y ahorros
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {!mostrarForm && (
              <button className="btn-primary" onClick={() => setMostrarForm(true)}>+ Nuevo</button>
            )}
            <Link href="/choices" className="btn-ghost" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              ← Volver
            </Link>
          </div>
        </div>

        {/* Form */}
        {mostrarForm && (
          <div className="card" style={{ padding: "1.75rem", marginBottom: 24 }}>
            <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1.25rem", color: "var(--text-primary)" }}>
              Nuevo movimiento
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="label" style={{ display: "block", marginBottom: 6 }}>Tipo</label>
                <select value={tipo} onChange={e => setTipo(e.target.value as any)}>
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                  <option value="ahorro">Ahorro</option>
                </select>
              </div>

              <div>
                <label className="label" style={{ display: "block", marginBottom: 6 }}>
                  {tipo === "ingreso" ? "Proyecto" : "Meta"}
                </label>
                <select value={destino ?? ""} onChange={e => setDestino(e.target.value as any)}>
                  <option value="">Seleccionar</option>
                  {tipo === "ingreso"
                    ? proyectos?.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)
                    : metas?.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)
                  }
                </select>
              </div>

              <div>
                <label className="label" style={{ display: "block", marginBottom: 6 }}>Monto</label>
                <input type="number" value={monto} onChange={e => setMonto(Number(e.target.value))} placeholder="0" />
              </div>

              <div>
                <label className="label" style={{ display: "block", marginBottom: 6 }}>Moneda</label>
                <select value={moneda} onChange={e => setMoneda(e.target.value)}>
                  <option>ARS</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label className="label" style={{ display: "block", marginBottom: 6 }}>Categoría (opcional)</label>
                <input type="text" value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Ej. Comida, Transporte..." />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: "1.25rem", justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => setMostrarForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarMovimiento}>Guardar</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card" style={{ overflow: "hidden" }}>
          {movimientos?.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
              Sin movimientos todavía.{" "}
              <button onClick={() => setMostrarForm(true)} style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                Agregar uno →
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Tipo", "Destino", "Categoría", "Monto", "Moneda"].map(h => (
                    <th key={h} style={{
                      padding: "0.75rem 1.25rem", textAlign: "left",
                      fontSize: "0.75rem", fontWeight: 600, color: "var(--text-tertiary)",
                      letterSpacing: "0.04em", textTransform: "uppercase"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movimientos?.map((mov, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.875rem 1.25rem" }}>{tipoBadge(mov.tipo)}</td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--text-primary)", fontSize: "0.9rem" }}>
                      {mov.proyectoId ? getProyectoNombre(mov.proyectoId) : mov.metaId ? getMetaNombre(mov.metaId) : "–"}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
                      {mov.categoria || "–"}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {mov.monto.toLocaleString()}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
                      {mov.moneda}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}

export default Ingresos