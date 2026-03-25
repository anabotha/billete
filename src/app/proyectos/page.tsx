'use client'
import React,{useState} from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { eliminarProyecto } from '../../../convex/proyectos';
import Link from "next/dist/client/link";
interface Proyecto {
  nombre: string
  presupuesto: number
  tiempo?: string
}

const Proyectos = () => {
  const [crearNuevoProyecto, setcrearNuevoProyecto] = React.useState(false)
const [nombre, setNombre] = React.useState("")
const [presupuesto, setPresupuesto] = React.useState(0)
const proyectos = useQuery(api.proyectos.obtenerProyectosConIngresos)
const crearProyecto = useMutation(api.proyectos.crearProyecto)
const eliminarProyectoMutation = useMutation(api.proyectos.eliminarProyecto)
const guardarProyecto = async () => {
  await crearProyecto({
    nombre,
    presupuesto,
  })
setcrearNuevoProyecto(false);
setNombre("");
setPresupuesto(0);
}
  return (
     <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto space-y-6">
      <div className="w-full flex justify-start mb-4">
  <Link
    href="/"
    className="bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition"
  >
    ← Inicio
  </Link>
</div>
      {proyectos?.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Proyectos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Aún no tienes proyectos creados
            </p>
          </div>

          <button
            onClick={() => setcrearNuevoProyecto(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Crear Proyecto
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto space-y-6">
        {proyectos?.map((p) => {
  const progreso = Math.min(p.progreso * 100, 100)

  return (
    <div
      key={p._id}
      className="bg-white justify-center gap-2 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-md p-6 space-y-4"
    >
      <div className="flex flex-col justify-between items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {p.nombre}</h2>

      <p>
        {p.ingresos} / {p.presupuesto}
      </p>

      <div className="w-full bg-gray-200 h-3 rounded">
        <div
          className="bg-green-500 h-3 rounded"
          style={{ width: `${progreso}%` }}
        />
      </div>
    </div>
      </div>

  )
})}
        </div>
      )}

      {crearNuevoProyecto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 space-y-6">

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Crear Proyecto
            </h2>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Nombre del Proyecto
              </label>

              <input
                type="text"
                placeholder="Ej: Viaje a Europa"
                className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2
                focus:ring-2 focus:ring-blue-400 focus:outline-none
                dark:bg-zinc-800 dark:text-white"
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Presupuesto
              </label>

              <input
                type="number"
                placeholder="$ 0"
                className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2
                focus:ring-2 focus:ring-blue-400 focus:outline-none
                dark:bg-zinc-800 dark:text-white"
                onChange={(e)=>setPresupuesto(Number(e.target.value))}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setcrearNuevoProyecto(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700"
              >
                Cancelar
              </button>

              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                onClick={guardarProyecto}
              >
                Crear Proyecto
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default Proyectos;