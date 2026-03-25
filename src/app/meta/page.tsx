'use client'

import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { eliminarMeta } from '../../../convex/metas';
import { Id } from "@/convex/_generated/dataModel"
import Link from "next/dist/client/link";
type Meta = {
  nombre: string;
  montoObjetivo: number;
  moneda: string;
  estado: string; // activa | completada
  createdAt: number;
};
export default function Metas() {
  const [crearNuevaMeta, setCrearNuevaMeta] = useState(false);
  const [nombre, setNombre] = useState("");
  const [montoObjetivo, setMontoObjetivo] = useState(0);
  const [moneda, setMoneda] = useState("ARS");
  const [estado, setEstado] = useState("activa");
  const crearMeta = useMutation(api.metas.crearMeta);
  const eliminarMetaMutation = useMutation(api.metas.eliminarMeta);
  const userId = localStorage.getItem("userId") as Id<"users">
  const metas = useQuery(api.metas.obtenerMetasConRecaudado, userId ? { userId } : "skip")

  const guardarMeta = async () => {

    try {

      await crearMeta({
        nombre,
        montoObjetivo,
        moneda,
        userId,
      })
      setNombre("")
      setMontoObjetivo(0)
      setCrearNuevaMeta(false)

    } catch (err) {

      console.log(err)

    }

  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-10 px-4">



      <div className="max-w-5xl mx-auto flex items-center justify-between mb-8">

        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow transition"
        >
          ← Inicio
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Metas
        </h1>

        <button
          onClick={() => setCrearNuevaMeta(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          + Nueva
        </button>

      </div>




      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {metas === undefined ? (



          [1, 2, 3, 4, 5, 6].map((i) => (

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

          ))

        ) : (

          metas.map((meta) => {

            const progreso = Math.min(
              (meta.recaudado / meta.montoObjetivo) * 100,
              100
            )

            return (

              <div
                key={meta._id}
                className="
              bg-white dark:bg-zinc-900
              border border-gray-200 dark:border-zinc-800
              rounded-2xl
              shadow-sm hover:shadow-lg
              transition
              p-6 space-y-4
              "
              >

                <div className="flex justify-between items-center">

                  <h2 className="text-lg font-semibold">
                    {meta.nombre}
                  </h2>

                  <span className="text-sm text-gray-500">
                    {Math.round(progreso)}%
                  </span>

                </div>

                <p className="text-sm text-gray-500">
                  {meta.recaudado} / {meta.montoObjetivo} {meta.moneda}
                </p>

                <div className="w-full h-3 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${progreso}%` }}
                  />

                </div>

                <p className="text-xs text-gray-400">
                  creada {new Date(meta.createdAt).toLocaleDateString()}
                </p>

                <button
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                  onClick={async () => {
                    await eliminarMetaMutation({ id: meta._id })
                  }}
                >
                  Eliminar meta
                </button>

              </div>

            )

          })

        )}

      </div>




      {crearNuevaMeta && (

        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">

          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 space-y-5">

            <h2 className="text-2xl font-bold">
              Crear meta
            </h2>

            <input
              type="text"
              placeholder="Nombre"
              className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-800"
              onChange={(e) => setNombre(e.target.value)}
            />

            <input
              type="number"
              placeholder="Monto"
              className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-800"
              onChange={(e) =>
                setMontoObjetivo(Number(e.target.value))
              }
            />

            <input
              type="text"
              placeholder="Moneda"
              className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-800"
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setCrearNuevaMeta(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={guardarMeta}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Guardar
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )

}