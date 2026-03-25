'use client'

import React, { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import Link from "next/link"
import { crearProyecto } from "@/convex/proyectos"

const Proyectos = () => {

  const [crearNuevoProyecto, setcrearNuevoProyecto] = useState(false)
  const [nombre, setNombre] = useState("")
  const [presupuesto, setPresupuesto] = useState(0)

  const crearProyecto = useMutation(api.proyectos.crearProyecto)
  const eliminarProyectoMutation = useMutation(api.proyectos.eliminarProyecto)

  const [userId, setUserId] = useState<Id<"users"> | null>(null)

  useEffect(() => {
    const id = localStorage.getItem("userId")
    if (id) {
      setUserId(id as Id<"users">)
    }
  }, [])

  const proyectos = useQuery(
    api.proyectos.obtenerProyectosConIngresos,
    userId ? { userId } : "skip"
  )

  if (!userId) return null
  const guardarProyecto = async () => {
    if (!userId) {
      throw new Error("No user")
    }
    await crearProyecto({
      nombre,
      presupuesto,
      userId,
    })
    setcrearNuevoProyecto(false);
    setNombre("");
    setPresupuesto(0);
  }

  const calcularDistribucion = (monto: number) => {

    const ahorro = Math.round(monto * 0.25)
    const dolares = Math.round(monto * 0.15)
    const metas = Math.round(monto * 0.10)
    const libre = Math.round(monto * 0.50)

    return {
      ahorro,
      dolares,
      metas,
      libre,
    }

  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-zinc-950 py-10 px-4">


      <div className="max-w-5xl mx-auto flex items-center justify-between mb-8">

        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow transition"
        >
          ← Inicio
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Proyectos
        </h1>

        <button
          onClick={() => setcrearNuevoProyecto(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          + Nuevo
        </button>

      </div>



      <div className="max-w-5xl mx-auto">

        {proyectos === undefined ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {[1, 2, 3, 4, 5, 6].map((i) => (

              <div
                key={i}
                className="
              bg-white dark:bg-zinc-900
              border border-gray-200 dark:border-zinc-800
              rounded-2xl
              p-6 space-y-4
              animate-pulse
              "
              >

                <div className="h-5 bg-gray-300 dark:bg-zinc-700 rounded w-2/3" />

                <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-1/2" />

                <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-full" />

                <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-1/3" />

              </div>

            ))}

          </div>

        ) : proyectos.length === 0 ? (



          <div className="flex flex-col items-center justify-center mt-20 space-y-4">

            <p className="text-gray-500 text-lg">
              No hay proyectos todavía
            </p>

            <button
              onClick={() => setcrearNuevoProyecto(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              Crear proyecto
            </button>

          </div>

        ) : (


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {proyectos.map((p) => {

              const progreso = Math.min(p.progreso * 100, 100)

              const dist = calcularDistribucion(p.presupuesto)

              return (

                <div
                  key={p._id}
                  className="
      bg-white dark:bg-zinc-900
      border border-gray-200 dark:border-zinc-800
      rounded-2xl
      shadow-sm hover:shadow-lg
      transition
      p-6 space-y-4
      "
                >

                  <h2 className="text-lg font-semibold">
                    {p.nombre}
                  </h2>


                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${progreso}%` }}
                    />

                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">
                      ${p.ingresos} / ${p.presupuesto}
                    </p>

                    <p className="text-xs text-right text-gray-500">
                      {Math.round(progreso)} %
                    </p>
                  </div>


                  <div className="text-sm space-y-1 text-gray-500 border-t pt-2">
                    <h4 className="text-lg font-semibold">Recomendaciones :</h4>
                    <p>Ahorro: <span className="text-sm font-semibold">{dist.ahorro}</span></p>

                    <p>Dólares: <span className="text-sm font-semibold">{dist.dolares}</span></p>

                  </div>

                </div>

              )

            })}
          </div>

        )}

      </div>



      {/* MODAL */}

      {crearNuevoProyecto && (

        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">

          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 space-y-6">

            <h2 className="text-2xl font-bold">
              Crear proyecto
            </h2>

            <input
              type="text"
              placeholder="Nombre"
              className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-800"
              onChange={(e) => setNombre(e.target.value)}
            />

            <input
              type="number"
              placeholder="Presupuesto"
              className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-800"
              onChange={(e) =>
                setPresupuesto(Number(e.target.value))
              }
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setcrearNuevoProyecto(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={guardarProyecto}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Crear
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

export default Proyectos;