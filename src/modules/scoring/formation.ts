/**
 * Fórmula de balance de formaciones — reglamento_plataforma.md, sección 8.2
 *
 *   multiplicador de línea = (jugadores de esa línea en la formación base 4-3-3)
 *                             ÷ (jugadores de esa línea en la formación elegida)
 *
 * Esta fórmula garantiza matemáticamente que, para cualquier formación válida
 * (defensas + medio + delanteros = 10), la suma ponderada de multiplicadores
 * siempre da 10 — es decir, con calificación hipotética 10 para los 11 titulares,
 * el puntaje total sin boosters siempre es 110, sin importar la formación.
 */

// Conteos de la formación base 4-3-3, usados como referencia en la fórmula.
const BASE_DEF = 4;
const BASE_MID = 3;
const BASE_FWD = 3;

export interface FormationMultipliers {
  def: number;
  mid: number;
  fwd: number;
}

/**
 * Calcula los multiplicadores de una formación a partir de su conteo de jugadores
 * por línea. El arquero nunca se calcula aquí: siempre puntúa x1 (su booster
 * específico es "Arquero x2", ver boosterEngine.ts).
 */
export function computeFormationMultipliers(defCount: number, midCount: number, fwdCount: number): FormationMultipliers {
  if (defCount + midCount + fwdCount !== 10) {
    throw new Error(
      `Formación inválida: defensas(${defCount}) + medio(${midCount}) + delanteros(${fwdCount}) debe sumar 10`
    );
  }
  // IMPORTANTE: no se redondea aquí. La garantía matemática de balance (sección 8.2 del
  // reglamento: cualquier formación válida suma 110 puntos con calificación perfecta) solo se
  // cumple con fracciones exactas. Redondear a 2 decimales antes de multiplicar (ej. 4/3 → 1.33)
  // rompe la igualdad por errores de acumulación. El redondeo a 2 decimales se aplica únicamente
  // al mostrar el multiplicador al usuario (ver `formatMultiplier`), nunca en el cálculo interno.
  return {
    def: BASE_DEF / defCount,
    mid: BASE_MID / midCount,
    fwd: BASE_FWD / fwdCount,
  };
}

/** Redondeo solo para presentación en la interfaz (ej. "x1.33") — nunca usar en cálculos. */
export function formatMultiplier(n: number): string {
  return `x${(Math.round(n * 100) / 100).toFixed(2)}`;
}

/**
 * Catálogo de referencia de formaciones (reglamento_plataforma.md, sección 8.3).
 * En producción estos valores viven en la tabla `Formation` de la base de datos
 * (sembrados una vez con este mismo cálculo) — este catálogo es la fuente de verdad
 * para el script de siembra (seed) y para pruebas.
 */
export const FORMATION_CATALOG: Record<string, { def: number; mid: number; fwd: number }> = {
  "4-3-3": { def: 4, mid: 3, fwd: 3 },
  "4-4-2": { def: 4, mid: 4, fwd: 2 },
  "3-5-2": { def: 3, mid: 5, fwd: 2 },
  "5-3-2": { def: 5, mid: 3, fwd: 2 },
  "3-4-3": { def: 3, mid: 4, fwd: 3 },
  "4-5-1": { def: 4, mid: 5, fwd: 1 },
  "5-4-1": { def: 5, mid: 4, fwd: 1 },
};
