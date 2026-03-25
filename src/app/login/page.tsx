"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

export default function LoginPage() {

    const router = useRouter()
    const login = useAction(api.users.login)
    const register = useAction(api.users.register)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [loading, setLoading] = useState(false)
    const [isRegister, setIsRegister] = useState(false)
    const [error, setError] = useState("")
    const [userId, setUserId] = useState<Id<"users"> | null>(null)

    const handleSubmit = async () => {

        try {

            setLoading(true)
            setError("")

            if (isRegister) {

                await register({
                    email,
                    password,
                })

            }

            const user = await login({
                email,
                password,
            })

            useEffect(() => {
                const id = localStorage.getItem("userId")
                if (id) {
                    setUserId(id as Id<"users">)
                }
                router.push("/choices")

            })
        } catch (e: any) {

            setError(e.message)

        } finally {

            setLoading(false)

        }

    }

    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">

            <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow space-y-4">

                <h1 className="text-2xl font-bold text-center">
                    {isRegister ? "Registro" : "Login"}
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border rounded-lg px-3 py-2 dark:bg-zinc-800"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border rounded-lg px-3 py-2 dark:bg-zinc-800"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                    <div className="text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                    {loading
                        ? "Cargando..."
                        : isRegister
                            ? "Registrarse"
                            : "Entrar"}
                </button>

                <button
                    onClick={() => setIsRegister(!isRegister)}
                    className="w-full text-sm text-gray-500"
                >
                    {isRegister
                        ? "Ya tengo cuenta"
                        : "Crear cuenta"}
                </button>

            </div>

        </div>
    )
}