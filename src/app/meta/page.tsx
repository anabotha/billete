"use client"
import React, { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Metas() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [userId, setUserId] = useState<Id<"users"> | null>(null)
  const [crearNuevaMeta, setCrearNuevaMeta] = useState(false)
  const [nombre, setNombre] = useState("")
  const [montoObjetivo, setMontoObjetivo] = useState(0)
  const [moneda, setMoneda] = useState("ARS")

  const crearMeta = useMutation(api.metas.crearMeta)
  const eliminarMetaMutation = useMutation(api.metas.eliminarMeta)
  const metas = useQuery(api.metas.obtenerMetasConRecaudado, userId ? { userId } : "skip")

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 12 }} />)}
          </div>
        </div>
      </div>
    )
  }

  const guardarMeta = async () => {
    if (!userId) return
    await crearMeta({ nombre, montoObjetivo, moneda, userId })
    setNombre(""); setMontoObjetivo(0); setCrearNuevaMeta(false)
  }

  return (
    <div className="page-shell">
      <div className="page-container">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 className="page-title">Metas</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", marginTop: 2 }}>
              Tus objetivos de ahorro
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={() => setCrearNuevaMeta(true)}>+ Nueva</button>
            <Link href="/choices" className="btn-ghost" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              ← Volver
            </Link>
          </div>
        </div>

        {/* Grid */}
        {metas === undefined ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 12 }} />)}
          </div>
        ) : metas.length === 0 ? (
          <div className="card" style={{ padding: "4rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>◎</div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: 16 }}>
              No tenés metas todavía
            </p>
            <button className="btn-primary" onClick={() => setCrearNuevaMeta(true)}>
              Crear primera meta
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {metas.map((meta) => {
              const pct = Math.min((meta.recaudado / meta.montoObjetivo) * 100, 100)
              return (
                <div key={meta._id} className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                        {meta.nombre}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
                        {new Date(meta.createdAt).toLocaleDateString("es-AR")}
                      </div>
                    </div>
                    <span style={{
                      fontSize: "0.8125rem", fontWeight: 700,
                      color: pct >= 100 ? "var(--success)" : "var(--text-secondary)"
                    }}>
                      {Math.round(pct)}%
                    </span>
                  </div>

                  <div className="progress-track" style={{ marginBottom: 10 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 100 ? "var(--success)" : "var(--accent)" }} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "var(--text-tertiary)", marginBottom: 14 }}>
                    <span>${meta.recaudado.toLocaleString()}</span>
                    <span>${meta.montoObjetivo.toLocaleString()} {meta.moneda}</span>
                  </div>

                  <button
                    onClick={() => eliminarMetaMutation({ id: meta._id })}
                    style={{
                      width: "100%", padding: "6px 0", fontSize: "0.8125rem",
                      color: "var(--text-tertiary)", background: "none",
                      border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer",
                      transition: "color 0.15s, border-color 0.15s"
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = "var(--danger)"
                      ;(e.currentTarget as HTMLElement).style.borderColor = "var(--danger)"
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"
                      ;(e.currentTarget as HTMLElement).style.borderColor = "var(--border)"
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal */}
        {crearNuevaMeta && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2 style={{ fontWeight: 600, fontSize: "1.125rem", marginBottom: "1.5rem", color: "var(--text-primary)" }}>
                Nueva meta
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className="label" style={{ display: "block", marginBottom: 6 }}>Nombre</label>
                  <input type="text" placeholder="Ej. Fondo de emergencia" onChange={e => setNombre(e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="label" style={{ display: "block", marginBottom: 6 }}>Monto objetivo</label>
                    <input type="number" placeholder="0" onChange={e => setMontoObjetivo(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="label" style={{ display: "block", marginBottom: 6 }}>Moneda</label>
                    <select value={moneda} onChange={e => setMoneda(e.target.value)}>
                      <option>ARS</option>
                      <option>USD</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button className="btn-ghost" onClick={() => setCrearNuevaMeta(false)}>Cancelar</button>
                <button className="btn-primary" onClick={guardarMeta}>Guardar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}