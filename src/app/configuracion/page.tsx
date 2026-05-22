"use client"
import React, { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import Link from "next/link"
import { useRouter } from "next/navigation"

type CategoriaBudget = { categoria: string; limite: number; moneda: string }

export default function Configuracion() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [userId, setUserId] = useState<Id<"users"> | null>(null)

  // Sueldo
  const [sueldo, setSueldo] = useState<number>(0)
  // Distribución
  const [dist, setDist] = useState({ ahorro: 20, dolares: 30, vivir: 50 })
  // Presupuesto por categorías
  const [categorias, setCategorias] = useState<CategoriaBudget[]>([])
  const [newCat, setNewCat] = useState<CategoriaBudget>({ categoria: "", limite: 0, moneda: "ARS" })

  const user = useQuery(api.users.getUserById, userId ? { userId } : "skip")
  const updateSueldo = useMutation(api.users.updateSueldo)
  const updateDist = useMutation(api.users.updateConfiguracion)
  const updateCategorias = useMutation(api.users.updatePresupuestoCategorias)

  useEffect(() => { setIsMounted(true) }, [])
  useEffect(() => {
    const id = localStorage.getItem("userId")
    if (id && id !== "null" && id !== "undefined") {
      setUserId(id as Id<"users">)
    } else {
      router.push("/login")
    }
  }, [])

  // Sync with DB values once loaded
  useEffect(() => {
    if (!user) return
    if (user.sueldo != null) setSueldo(user.sueldo)
    if (user.configuracion) setDist(user.configuracion)
    if (user.presupuestoCategorias) setCategorias(user.presupuestoCategorias)
  }, [user])

  if (!isMounted || !userId) {
    return (
      <div className="page-shell">
        <div className="page-container">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 12 }} />
          ))}
        </div>
      </div>
    )
  }

  const agregarCategoria = () => {
    if (!newCat.categoria || newCat.limite <= 0) return
    setCategorias(prev => [...prev, newCat])
    setNewCat({ categoria: "", limite: 0, moneda: "ARS" })
  }

  const eliminarCategoria = (idx: number) => {
    setCategorias(prev => prev.filter((_, i) => i !== idx))
  }

  const guardarTodo = async () => {
    if (!userId) return
    await Promise.all([
      updateSueldo({ userId, sueldo }),
      updateDist({ userId, configuracion: dist }),
      updateCategorias({ userId, presupuestoCategorias: categorias }),
    ])
    router.push("/choices")
  }

  return (
    <div className="page-shell">
      <div className="page-container" style={{ maxWidth: 600 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 className="page-title">Configuración</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", marginTop: 2 }}>
              Parámetros de tu economía personal
            </p>
          </div>
          <Link href="/choices" className="btn-ghost" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            ← Volver
          </Link>
        </div>

        {/* Sueldo autodefinido */}
        <Section title="Buffer · Sueldo mensual" desc={'El monto que te "pagás" cada mes de tu reserva de proyectos.'}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label className="label" style={{ display: "block", marginBottom: 6 }}>Monto (ARS)</label>
              <input type="number" value={sueldo || ""} onChange={e => setSueldo(Number(e.target.value))} placeholder="0" />
            </div>
          </div>
        </Section>

        {/* Distribución */}
        <Section title="Distribución de ingresos" desc="Cómo se divide cada peso que entra.">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {(["ahorro", "dolares", "vivir"] as const).map(k => (
              <div key={k}>
                <label className="label" style={{ display: "block", marginBottom: 6, textTransform: "capitalize" }}>
                  {k} (%)
                </label>
                <input
                  type="number" value={dist[k]}
                  onChange={e => setDist({ ...dist, [k]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 8 }}>
            Total: {dist.ahorro + dist.dolares + dist.vivir}% {dist.ahorro + dist.dolares + dist.vivir !== 100 && "⚠ debería sumar 100%"}
          </p>
        </Section>

        {/* Presupuesto por categorías */}
        <Section title="Semáforo · Presupuesto por categoría" desc="Límite mensual de gasto por categoría para el semáforo.">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {categorias.map((c, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "0.625rem 1rem", background: "var(--bg)",
                borderRadius: 8, border: "1px solid var(--border)"
              }}>
                <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{c.categoria}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    {c.moneda === "USD" ? "U$D" : "$"} {c.limite.toLocaleString("es-AR")} / mes
                  </span>
                  <button onClick={() => eliminarCategoria(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 18 }}>×</button>
                </div>
              </div>
            ))}
          </div>

          {/* Add new category */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, alignItems: "flex-end" }}>
            <div>
              <label className="label" style={{ display: "block", marginBottom: 6 }}>Categoría</label>
              <input type="text" placeholder="Comida, Ocio..." value={newCat.categoria} onChange={e => setNewCat({ ...newCat, categoria: e.target.value })} />
            </div>
            <div>
              <label className="label" style={{ display: "block", marginBottom: 6 }}>Límite</label>
              <input type="number" placeholder="0" value={newCat.limite || ""} onChange={e => setNewCat({ ...newCat, limite: Number(e.target.value) })} style={{ width: 100 }} />
            </div>
            <div>
              <label className="label" style={{ display: "block", marginBottom: 6 }}>Moneda</label>
              <select value={newCat.moneda} onChange={e => setNewCat({ ...newCat, moneda: e.target.value })} style={{ width: 80 }}>
                <option>ARS</option>
                <option>USD</option>
              </select>
            </div>
            <button className="btn-ghost" onClick={agregarCategoria} style={{ alignSelf: "flex-end" }}>+ Agregar</button>
          </div>
        </Section>

        {/* Save */}
        <button className="btn-primary" onClick={guardarTodo} style={{ width: "100%", padding: "0.75rem", fontSize: "0.9375rem", marginTop: 8 }}>
          Guardar configuración
        </button>

      </div>
    </div>
  )
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: "1.5rem", marginBottom: 16 }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-primary)" }}>{title}</div>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", marginTop: 3 }}>{desc}</div>
      </div>
      {children}
    </div>
  )
}
