"use client"
import React, { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import Link from "next/link"
import { useRouter } from "next/navigation"

const Proyectos = () => {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [userId, setUserId] = useState<Id<"users"> | null>(null)
  const [crearNuevoProyecto, setCrearNuevoProyecto] = useState(false)
  const [nombre, setNombre] = useState("")
  const [presupuesto, setPresupuesto] = useState(0)

  const crearProyecto = useMutation(api.proyectos.crearProyecto)
  const eliminarProyectoMutation = useMutation(api.proyectos.eliminarProyecto)

  const proyectos = useQuery(api.proyectos.obtenerProyectosConIngresos, userId ? { userId } : "skip")

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
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />)}
          </div>
        </div>
      </div>
    )
  }

  const guardarProyecto = async () => {
    if (!userId) return
    await crearProyecto({ nombre, presupuesto, userId })
    setCrearNuevoProyecto(false)
    setNombre(""); setPresupuesto(0)
  }

  return (
    <div className="page-shell">
      <div className="page-container">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 className="page-title">Proyectos</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", marginTop: 2 }}>
              Tus proyectos y su progreso
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={() => setCrearNuevoProyecto(true)}>+ Nuevo</button>
            <Link href="/choices" className="btn-ghost" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              ← Volver
            </Link>
          </div>
        </div>

        {/* Content */}
        {proyectos === undefined ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />)}
          </div>
        ) : proyectos.length === 0 ? (
          <div className="card" style={{ padding: "4rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>◻</div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: 16 }}>
              No tenés proyectos todavía
            </p>
            <button className="btn-primary" onClick={() => setCrearNuevoProyecto(true)}>
              Crear primer proyecto
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {proyectos.map((p) => {
              const pct = Math.min(p.progreso * 100, 100)
              return (
                <div key={p._id} className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                      {p.nombre}
                    </div>
                    <span style={{
                      fontSize: "0.8125rem", fontWeight: 700,
                      color: pct >= 100 ? "var(--success)" : "var(--text-secondary)"
                    }}>
                      {Math.round(pct)}%
                    </span>
                  </div>

                  <div className="progress-track" style={{ marginBottom: 10 }}>
                    <div className="progress-fill" style={{
                      width: `${pct}%`,
                      background: pct >= 100 ? "var(--success)" : "var(--accent)"
                    }} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "var(--text-tertiary)", marginBottom: 14 }}>
                    <span>${p.ingresos.toLocaleString()} ingresado</span>
                    <span>${p.presupuesto.toLocaleString()} total</span>
                  </div>

                  {/* Mini distribución */}
                  <div style={{
                    borderTop: "1px solid var(--border)", paddingTop: 12,
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6
                  }}>
                    {[
                      { label: "Ahorro", pct: 25, color: "var(--success)" },
                      { label: "Dólares", pct: 15, color: "var(--accent)" },
                    ].map(dist => (
                      <div key={dist.label} style={{ background: "var(--bg)", borderRadius: 8, padding: "6px 10px" }}>
                        <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", marginBottom: 2 }}>{dist.label}</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: dist.color }}>
                          ${Math.round(p.presupuesto * dist.pct / 100).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal */}
        {crearNuevoProyecto && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2 style={{ fontWeight: 600, fontSize: "1.125rem", marginBottom: "1.5rem", color: "var(--text-primary)" }}>
                Nuevo proyecto
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className="label" style={{ display: "block", marginBottom: 6 }}>Nombre</label>
                  <input type="text" placeholder="Ej. App móvil" onChange={e => setNombre(e.target.value)} />
                </div>
                <div>
                  <label className="label" style={{ display: "block", marginBottom: 6 }}>Presupuesto</label>
                  <input type="number" placeholder="0" onChange={e => setPresupuesto(Number(e.target.value))} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button className="btn-ghost" onClick={() => setCrearNuevoProyecto(false)}>Cancelar</button>
                <button className="btn-primary" onClick={guardarProyecto}>Crear</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Proyectos