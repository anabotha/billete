"use client"
import React, { useState, useEffect } from "react"
import { useAction } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const loginAction = useAction(api.users.login)
  const fixPasswordHash = useAction(api.users.fixPasswordHash)
  const router = useRouter()

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    if (!isMounted) return
    const id = localStorage.getItem("userId")
    if (id && id !== "null" && id !== "undefined") {
      router.push("/choices")
    }
  }, [isMounted])

  if (!isMounted) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = await loginAction({ email, password })
      localStorage.setItem("userId", user._id)
      router.push("/choices")
    } catch (err: any) {
      // Si el hash no es bcrypt (fue creado en plano), lo arreglamos y reintentamos
      if (err.message?.includes("Incorrecto") || err.message?.includes("invalid")) {
        try {
          await fixPasswordHash({ email, password })
          const user = await loginAction({ email, password })
          localStorage.setItem("userId", user._id)
          router.push("/choices")
          return
        } catch {
          // fallthrough
        }
      }
      setError("Email o contraseña incorrectos.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem"
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "var(--accent)", margin: "0 auto 1rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24
          }}>💰</div>
          <h1 style={{
            fontSize: "1.375rem", fontWeight: 600,
            letterSpacing: "-0.02em", color: "var(--text-primary)"
          }}>Billete</h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", marginTop: 4 }}>
            Ingresá a tu cuenta
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            <div>
              <label className="label" style={{ display: "block", marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" style={{ display: "block", marginBottom: 6 }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                background: "#fff0f0",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "0.625rem 0.875rem",
                fontSize: "0.875rem",
                color: "var(--danger)"
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "0.625rem", marginTop: 4 }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

          </div>
        </form>

      </div>
    </div>
  )
}