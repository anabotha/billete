"use client"
import React, { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useRouter } from "next/navigation"
import { Id } from "../../../convex/_generated/dataModel"

const navItems = [
  { label: "Dashboard",     path: "/dashboard",     icon: "▦",  desc: "Indicadores" },
  { label: "Ingresos",      path: "/ingresos",      icon: "↕",  desc: "Movimientos" },
  { label: "Proyectos",     path: "/proyectos",     icon: "◻",  desc: "Mis proyectos" },
  { label: "Metas",         path: "/meta",          icon: "◎",  desc: "Objetivos" },
  { label: "Compromisos",   path: "/compromisos",   icon: "📋", desc: "Gastos fijos" },
  { label: "Configuración", path: "/configuracion", icon: "⚙",  desc: "Parámetros" },
]

export default function ChoicesPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [userId, setUserId] = useState<Id<"users"> | null>(null)
  const getOrCreateDefaultUser = useMutation(api.users.getOrCreateDefaultUser)

  useEffect(() => { setIsMounted(true) }, [])
  useEffect(() => {
    const id = localStorage.getItem("userId")
    if (id && id !== "null" && id !== "undefined") {
      setUserId(id as Id<"users">)
    } else {
      router.push("/login")
    }
  }, [])

  if (!isMounted) return null

  const handleLogout = () => {
    localStorage.removeItem("userId")
    router.push("/login")
  }

  return (
    <div className="page-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* Brand */}
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "var(--accent)", margin: "0 auto 1rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22
          }}>💰</div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Billete
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", marginTop: 4 }}>
            ¿A dónde vas hoy?
          </p>
        </div>

        {/* Nav grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="card"
              style={{
                padding: "1.125rem 0.875rem",
                textAlign: "left",
                cursor: "pointer",
                transition: "box-shadow 0.15s, transform 0.1s",
                border: "1px solid var(--border)",
                background: "var(--surface)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"
                ;(e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = ""
                ;(e.currentTarget as HTMLElement).style.transform = ""
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                {item.label}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
                {item.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Logout */}
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <button
            onClick={handleLogout}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: "0.8125rem" }}
          >
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  )
}