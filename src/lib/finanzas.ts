// Pure financial helper functions — no framework dependencies

export type SemaforoColor = "verde" | "amarillo" | "rojo"

/** Returns semáforo color based on % of budget spent */
export function semaforo(pctGastado: number): SemaforoColor {
  if (pctGastado >= 0.8) return "rojo"
  if (pctGastado >= 0.5) return "amarillo"
  return "verde"
}

/** CSS color for each semáforo state */
export const SEMAFORO_COLOR: Record<SemaforoColor, string> = {
  verde:    "#22c55e",
  amarillo: "#f59e0b",
  rojo:     "#ef4444",
}

/** CSS background for each semáforo state */
export const SEMAFORO_BG: Record<SemaforoColor, string> = {
  verde:    "#f0fdf4",
  amarillo: "#fffbeb",
  rojo:     "#fff0f0",
}

/** Burn Rate color — months of runway */
export function burnRateColor(meses: number): string {
  if (meses >= 6) return "#22c55e"
  if (meses >= 3) return "#f59e0b"
  return "#ef4444"
}

/** Format a number as ARS currency */
export function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n)
}

/** Format months with 1 decimal */
export function formatMeses(n: number): string {
  return `${n.toFixed(1)} meses`
}

/** Percentage string */
export function formatPct(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}
