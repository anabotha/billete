"use client"
import React, { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { pagarCompromiso } from '../../../convex/compromisos';

export default function Compromisos() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [userId, setUserId] = useState<Id<"users"> | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [nombre, setNombre] = useState("")
  const [monto, setMonto] = useState(0)
  const [moneda, setMoneda] = useState("ARS")

  const crearCompromiso = useMutation(api.compromisos.crearCompromiso)
  const eliminarCompromiso = useMutation(api.compromisos.eliminarCompromiso)
  const pagarCompromiso = useMutation(api.compromisos.pagarCompromiso)
  const compromisos = useQuery(
    api.compromisos.obtenerCompromisos,
    userId ? { userId } : "skip"
  )

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
          <div className="skeleton" style={{ height: 52, borderRadius: 12, marginBottom: 12 }} />
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10, marginBottom: 8 }} />
          ))}
        </div>
      </div>
    )
  }

  const guardar = async () => {
    if (!nombre || monto <= 0) return
    await crearCompromiso({ nombre, monto, moneda, userId })
    setNombre(""); setMonto(0); setModalAbierto(false)
  }

  const totalARS = compromisos?.filter(c => c.moneda === "ARS").reduce((a, c) => a + c.monto, 0) ?? 0
  const totalUSD = compromisos?.filter(c => c.moneda === "USD").reduce((a, c) => a + c.monto, 0) ?? 0

  return (
    <div className="page-shell">
      <div className="page-container">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 className="page-title">Compromisos</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", marginTop: 2 }}>
              Gastos fijos que aún no pagaste este mes
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={() => setModalAbierto(true)}>+ Nuevo</button>
            <Link href="/choices" className="btn-ghost" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              ← Volver
            </Link>
          </div>
        </div>

        {/* Totales */}
        {(totalARS > 0 || totalUSD > 0) && (
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {totalARS > 0 && (
              <div className="card" style={{ padding: "1rem 1.25rem", flex: 1 }}>
                <div className="label">Total ARS</div>
                <div style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--danger)", marginTop: 4 }}>
                  ${totalARS.toLocaleString("es-AR")}
                </div>
              </div>
            )}
            {totalUSD > 0 && (
              <div className="card" style={{ padding: "1rem 1.25rem", flex: 1 }}>
                <div className="label">Total USD</div>
                <div style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--warning)", marginTop: 4 }}>
                  U$D {totalUSD.toLocaleString("es-AR")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lista */}
        <div className="card" style={{ overflow: "hidden" }}>
          {compromisos?.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
              Sin compromisos registrados.{" "}
              <button onClick={() => setModalAbierto(true)} style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                Agregar →
              </button>
            </div>
          ) : (
            compromisos?.map((c, i) => (
              <div
                key={c._id}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "0.875rem 1.25rem",
                  borderBottom: i < (compromisos.length - 1) ? "1px solid var(--border)" : "none",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: "0.9375rem" }}>{c.nombre}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>{c.moneda}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontWeight: 700, color: "var(--danger)", fontSize: "1rem" }}>
                    {c.moneda === "USD" ? "U$D" : "$"} {c.monto.toLocaleString("es-AR")}
                  </span>
                  <button onClick={() => pagarCompromiso({ id: c._id })} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                    Pagar
                  </button>
                  <button
                    onClick={() => eliminarCompromiso({ id: c._id })}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 18, lineHeight: 1 }}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {modalAbierto && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2 style={{ fontWeight: 600, fontSize: "1.125rem", marginBottom: "1.5rem", color: "var(--text-primary)" }}>
                Nuevo compromiso
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className="label" style={{ display: "block", marginBottom: 6 }}>Nombre</label>
                  <input type="text" placeholder="Ej. Alquiler, Netflix..." value={nombre} onChange={e => setNombre(e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="label" style={{ display: "block", marginBottom: 6 }}>Monto</label>
                    <input type="number" placeholder="0" value={monto || ""} onChange={e => setMonto(Number(e.target.value))} />
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
                <button className="btn-ghost" onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button className="btn-primary" onClick={guardar}>Guardar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
