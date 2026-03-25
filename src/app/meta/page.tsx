'use client'

import { useQuery,useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { eliminarMeta } from '../../../convex/metas';
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
 const metas = useQuery(api.metas.obtenerMetasConRecaudado)
 const [nombre, setNombre] = useState("");
 const [montoObjetivo, setMontoObjetivo] = useState(0);
 const [moneda, setMoneda] = useState("ARS");
 const [estado, setEstado] = useState("activa");
 const crearMeta = useMutation(api.metas.crearMeta);
 const eliminarMetaMutation = useMutation(api.metas.eliminarMeta);
const guardarMeta = async () => {
  await crearMeta({
    nombre,
    montoObjetivo,
    moneda,
  })

  setNombre("")
  setMontoObjetivo(0)
  setCrearNuevaMeta(false)
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      <div>
   {metas?.map((meta) => {
  const progreso = Math.min(
    (meta.recaudado / meta.montoObjetivo) * 100,
    100
  )

  return (
    <div
      key={meta._id}
      className="bg-white justify-center gap-2 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-md p-6 space-y-4"
    >
      <div className="flex justify-between items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {meta.nombre}
        </h2>

        <span className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(progreso)}%
        </span>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        {meta.recaudado} / {meta.montoObjetivo} {meta.moneda}
      </div>

      {/* barra progreso */}
      <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-600 h-3 transition-all"
          style={{ width: `${progreso}%` }}
        />
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        creada {new Date(meta.createdAt).toLocaleDateString()}
      </div>
      <button className="bg-red-600 hover:bg-red-700 text-white font-semibold m-5px py-2 px-4 rounded-lg transition"
      onClick={async () => {
        await eliminarMetaMutation({ id: meta._id });
      }}> Eliminar meta</button>
    </div>
  )
})}
  </div>
</div>
     <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
     onClick={()=>setCrearNuevaMeta(true)}>
        Crear meta
      </button>


        {crearNuevaMeta && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

  <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">

    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
      Crear Nueva Meta
    </h2>

    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        Nombre de la meta
      </label>
      <input
        type="text"
        placeholder="Ej: Viaje a Europa"
        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2
        focus:ring-2 focus:ring-blue-400 focus:outline-none
        dark:bg-zinc-800 dark:text-white"
        onChange={(e)=>{setNombre(e.target.value)}}
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        Monto objetivo
      </label>
      <input
        type="number"
        placeholder="$ 0"
        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2
        focus:ring-2 focus:ring-blue-400 focus:outline-none
        dark:bg-zinc-800 dark:text-white"
        onChange={(e) => setMontoObjetivo(Number(e.target.value))}
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        Moneda
      </label>
      <input
        type="text"
        placeholder="ARS, USD, etc."
        className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2
        focus:ring-2 focus:ring-blue-400 focus:outline-none
        dark:bg-zinc-800 dark:text-white"
        value={moneda}
        onChange={(e) => setMoneda(e.target.value)}
      />
    </div>

    <div className="flex justify-end gap-3 pt-2">
      <button
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700
        text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
      onClick={()=>setCrearNuevaMeta(false)}>
        Cancelar
      </button>

      <button
        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold
        hover:bg-blue-700 transition"
        onClick={guardarMeta}
      >
        Guardar
      </button>
    </div>

  </div>

  </div>

)}
</div>
     )}