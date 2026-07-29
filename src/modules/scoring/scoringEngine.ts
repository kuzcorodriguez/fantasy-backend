import { FormationMultipliers } from "./formation";

export type PlayerLine = "def" | "mid" | "fwd";

export interface StartingPlayer {
  id: string;
  isGoalkeeper: boolean;
  /** Línea natural del jugador (irrelevante si isGoalkeeper = true) */
  naturalLine?: PlayerLine;
  /**
   * Línea asignada dentro de esta alineación específica. Normalmente igual a
   * naturalLine, salvo que el booster "cambio_posicion" lo haya reasignado
   * — en ese caso adopta el multiplicador de la línea destino (reglamento 9.2).
   */
  assignedLine?: PlayerLine;
  /** Calificación real (0.0 a 10.0) obtenida vía API deportiva para esa jornada */
  rating: number;
}

export interface BenchPlayer {
  id: string;
  rating: number;
}

export type BoosterCode =
  | "anulador_formacion"
  | "multiplicador_1_5x"
  | "multiplicador_2x"
  | "arquero_2x"
  | "bench_boost";
// Nota: "cambio_posicion" no se aplica aquí — se resuelve antes, al construir
// `assignedLine` de cada StartingPlayer, ya que es un cambio estructural de la
// alineación, no un multiplicador aplicado en el momento de puntuar.

export interface BoosterApplication {
  code: BoosterCode;
  /** Requerido para anulador_formacion, multiplicador_1_5x, multiplicador_2x, arquero_2x */
  targetPlayerId?: string;
  /** Requerido para bench_boost: hasta 4 jugadores de banca elegidos para esa jornada */
  benchPlayerIds?: string[];
}

export interface PlayerScoreBreakdown {
  playerId: string;
  rating: number;
  baseMultiplier: number;
  boosterApplied: BoosterCode | null;
  finalMultiplier: number;
  points: number;
}

export interface MatchdayScoreResult {
  totalPoints: number;
  breakdown: PlayerScoreBreakdown[];
  benchBoostPlayers: { playerId: string; rating: number; points: number }[];
}

const MAX_BOOSTERS_PER_TOURNAMENT = 2;
const MAX_BENCH_BOOST_PLAYERS = 4;

/**
 * Calcula el puntaje de una alineación para una jornada específica.
 * Implementa reglamento_plataforma.md secciones 8.4 (cálculo base) y 9 (boosters).
 */
export function calculateMatchdayScore(
  starters: StartingPlayer[],
  bench: BenchPlayer[],
  formationMultipliers: FormationMultipliers,
  boosters: BoosterApplication[]
): MatchdayScoreResult {
  if (starters.length !== 11) {
    throw new Error(`Se esperaban 11 titulares, se recibieron ${starters.length}`);
  }
  if (boosters.length > MAX_BOOSTERS_PER_TOURNAMENT) {
    throw new Error(
      `Máximo ${MAX_BOOSTERS_PER_TOURNAMENT} boosters por torneo (reglamento 9.1), se recibieron ${boosters.length}`
    );
  }

  const boosterByTarget = new Map<string, BoosterApplication>();
  let benchBoost: BoosterApplication | undefined;
  for (const b of boosters) {
    if (b.code === "bench_boost") {
      benchBoost = b;
    } else if (b.targetPlayerId) {
      boosterByTarget.set(b.targetPlayerId, b);
    }
  }

  const breakdown: PlayerScoreBreakdown[] = starters.map((player) => {
    const baseMultiplier = player.isGoalkeeper
      ? 1
      : formationMultipliers[player.assignedLine ?? player.naturalLine ?? "mid"];

    const applied = boosterByTarget.get(player.id);
    let finalMultiplier = baseMultiplier;
    let boosterApplied: BoosterCode | null = null;

    if (applied) {
      switch (applied.code) {
        case "anulador_formacion":
          // Solo tiene efecto si el multiplicador de formación penalizaba al jugador (<1).
          // Reglamento 9.2: "Regresa a x1 el multiplicador de un jugador afectado negativamente".
          if (baseMultiplier < 1) {
            finalMultiplier = 1;
            boosterApplied = applied.code;
          }
          break;
        case "multiplicador_1_5x":
          finalMultiplier = baseMultiplier * 1.5;
          boosterApplied = applied.code;
          break;
        case "multiplicador_2x":
          finalMultiplier = baseMultiplier * 2;
          boosterApplied = applied.code;
          break;
        case "arquero_2x":
          if (player.isGoalkeeper) {
            finalMultiplier = 2;
            boosterApplied = applied.code;
          }
          break;
      }
    }

    return {
      playerId: player.id,
      rating: player.rating,
      baseMultiplier,
      boosterApplied,
      finalMultiplier,
      // Sin redondear: el redondeo prematuro por jugador rompe la garantía de balance
      // matemático (ver comentario en formation.ts). Solo se redondea el total final.
      points: player.rating * finalMultiplier,
    };
  });

  let totalPoints = round2(breakdown.reduce((sum, p) => sum + p.points, 0));

  // Bench Boost: puntos de hasta 4 jugadores de banca elegidos, a x1 (reglamento 9.2 — no
  // llevan multiplicador de formación porque no ocupan una línea de la alineación titular).
  const benchBoostPlayers: { playerId: string; rating: number; points: number }[] = [];
  if (benchBoost?.benchPlayerIds) {
    const chosenIds = benchBoost.benchPlayerIds.slice(0, MAX_BENCH_BOOST_PLAYERS);
    for (const id of chosenIds) {
      const benchPlayer = bench.find((b) => b.id === id);
      if (benchPlayer) {
        benchBoostPlayers.push({ playerId: benchPlayer.id, rating: benchPlayer.rating, points: benchPlayer.rating });
        totalPoints = round2(totalPoints + benchPlayer.rating);
      }
    }
  }

  return { totalPoints, breakdown, benchBoostPlayers };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
