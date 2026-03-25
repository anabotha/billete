"use client"
import React, { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"

import { obtenerMovimientos } from '../../../convex/movimientos';
import Link from "next/dist/client/link"
interface Movimiento {
  tipo: string
  destino: string
  monto: number
  moneda: string
}


const Ingresos = () => {
  const [tipo, setTipo] = useState<"ingreso" | "egreso" | "ahorro">("ingreso");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [destino, setDestino] = useState<
    Id<"proyectos"> | Id<"metas"> | undefined
  >()

  const userId = localStorage.getItem("userId") as Id<"users">

  const movimientos = useQuery(
    api.movimientos.obtenerMovimientos,
    userId ? { userId } : "skip"
  )

  const metas = useQuery(
    api.metas.obtenerMetas,
    userId ? { userId } : "skip"
  )

  const proyectos = useQuery(
    api.proyectos.obtenerProyectos,
    userId ? { userId } : "skip"
  )

  useQuery(api.metas.obtenerMetas, userId ? { userId } : "skip")
  const [monto, setMonto] = useState(0)
  const [moneda, setMoneda] = useState("ARS");
  const crearMovimiento = useMutation(api.movimientos.crearMovimiento);


  const guardarMovimiento = async () => {

    await crearMovimiento({
      tipo,
      monto,
      moneda,
      userId,
      proyectoId:
        tipo === "ingreso"
          ? (destino as Id<"proyectos">)
          : undefined,

      metaId:
        tipo === "egreso" || tipo === "ahorro"
          ? (destino as Id<"metas">)
          : undefined,
    })

    const getProyectoNombre = (id: Id<"proyectos">) => {
      const proyecto = proyectos?.find((p) => p._id === id);
      return proyecto ? proyecto.nombre : "Proyecto desconocido";
    }

    const getMetaNombre = (id: Id<"metas">) => {
      const meta = metas?.find((m) => m._id === id);
      return meta ? meta.nombre : "Meta desconocida";
    }
    return (
      <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-6">
        <div className="w-full flex justify-start mb-4">
          <Link
            href="/"
            className="bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition"
          >
            ← Inicio
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Movimientos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Registrar ingresos o egresos
          </p>
        </div>

        {/* TABLA */}
        {!mostrarForm && (
          <>
            <button
              onClick={() => setMostrarForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Nuevo movimiento
            </button>

            <div className="w-full overflow-x-auto">
              <table className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 dark:bg-zinc-800">
                  <tr>
                    <th className="p-3 text-left">Tipo</th>
                    <th className="p-3 text-left">Destino</th>
                    <th className="p-3 text-left">Monto</th>
                    <th className="p-3 text-left">Moneda</th>
                  </tr>
                </thead>

                <tbody>
                  {movimientos.map((mov, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3">{mov.tipo}</td>
                      <td className="p-3">{mov.proyectoId ? getProyectoNombre(mov.proyectoId) : mov.metaId ? getMetaNombre(mov.metaId) : "Destino no especificado"}</td>
                      <td className="p-3">{mov.monto}</td>
                      <td className="p-3">{mov.moneda}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* FORMULARIO */}
        {mostrarForm && (
          <div className="w-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 space-y-6">

            {/* Tipo */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Tipo
              </label>

              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as "ingreso" | "egreso" | "ahorro")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 dark:bg-zinc-800 dark:text-white"
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
                <option value="ahorro">Ahorro</option>

              </select>
            </div>

            {/* Proyecto o Meta */}
            {tipo === "ingreso" ? (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Proyecto
                </label>

                <select
                  value={destino}
                  onChange={(e) =>
                    setDestino(e.target.value as Id<"proyectos"> | Id<"metas">)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Seleccionar proyecto</option>

                  {proyectos?.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Meta
                </label>

                <select
                  value={destino}
                  onChange={(e) =>
                    setDestino(e.target.value as Id<"proyectos"> | Id<"metas">)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Seleccionar meta</option>

                  {metas?.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Monto */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Monto
              </label>

              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                placeholder="$ 0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            {/* Moneda */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Moneda
              </label>

              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 dark:bg-zinc-800 dark:text-white"
              >
                <option>ARS</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>

            <button
              onClick={guardarMovimiento}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Guardar
            </button>

          </div>
        )}
      </div>
    )
  }
}
export default Ingresos