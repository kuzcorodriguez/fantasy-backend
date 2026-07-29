import test from "node:test";
import assert from "node:assert/strict";
import { calculateMatchdayScore, StartingPlayer } from "./scoringEngine";
import { computeFormationMultipliers, formatMultiplier, FORMATION_CATALOG } from "./formation";

test("formación 3-5-2: multiplicadores exactos internos y presentación redondeada al usuario (8.3)", () => {
  const c = FORMATION_CATALOG["3-5-2"];
  const mult = computeFormationMultipliers(c.def, c.mid, c.fwd);
  // Cálculo interno: fracción exacta, no redondeada (necesario para el balance matemático).
  assert.equal(mult.def, 4 / 3);
  assert.equal(mult.mid, 0.6);
  assert.equal(mult.fwd, 1.5);
  // Presentación al usuario: sí se redondea, y coincide con lo documentado en el reglamento.
  assert.equal(formatMultiplier(mult.def), "x1.33");
  assert.equal(formatMultiplier(mult.mid), "x0.60");
  assert.equal(formatMultiplier(mult.fwd), "x1.50");
});

test("todas las formaciones del catálogo suman 110 puntos si todos los titulares sacan 10 (balance matemático, 8.2)", () => {
  for (const [name, c] of Object.entries(FORMATION_CATALOG)) {
    const mult = computeFormationMultipliers(c.def, c.mid, c.fwd);
    const perfectStarters: StartingPlayer[] = [
      { id: "gk", isGoalkeeper: true, rating: 10 },
      ...Array.from({ length: c.def }, (_, i) => ({ id: `def${i}`, isGoalkeeper: false, naturalLine: "def" as const, rating: 10 })),
      ...Array.from({ length: c.mid }, (_, i) => ({ id: `mid${i}`, isGoalkeeper: false, naturalLine: "mid" as const, rating: 10 })),
      ...Array.from({ length: c.fwd }, (_, i) => ({ id: `fwd${i}`, isGoalkeeper: false, naturalLine: "fwd" as const, rating: 10 })),
    ];
    const result = calculateMatchdayScore(perfectStarters, [], mult, []);
    assert.equal(result.totalPoints, 110, `Formación ${name} debería dar 110, dio ${result.totalPoints}`);
  }
});

test("reproduce el ejemplo del reglamento sección 8.4 (formación 3-5-2) con fracciones exactas: 76.50 puntos", () => {
  // Nota: el reglamento documenta 76.45 usando redondeo informal por jugador a 1 decimal antes
  // de sumar. El motor usa fracciones exactas (4/3, no "1.33") para preservar la garantía de
  // balance matemático — ver la prueba anterior. El resultado matemáticamente preciso es 76.50.
  // Pendiente: actualizar el valor documentado en reglamento_plataforma.md, sección 8.4.
  const mult = computeFormationMultipliers(3, 5, 2); // 3-5-2: def x1.33, mid x0.60, fwd x1.50
  const starters: StartingPlayer[] = [
    { id: "gk", isGoalkeeper: true, rating: 7.0 },
    { id: "def1", isGoalkeeper: false, naturalLine: "def", rating: 6.5 },
    { id: "def2", isGoalkeeper: false, naturalLine: "def", rating: 7.2 },
    { id: "def3", isGoalkeeper: false, naturalLine: "def", rating: 6.0 },
    { id: "mid1", isGoalkeeper: false, naturalLine: "mid", rating: 8.0 },
    { id: "mid2", isGoalkeeper: false, naturalLine: "mid", rating: 6.5 },
    { id: "mid3", isGoalkeeper: false, naturalLine: "mid", rating: 7.0 },
    { id: "mid4", isGoalkeeper: false, naturalLine: "mid", rating: 6.8 },
    { id: "mid5", isGoalkeeper: false, naturalLine: "mid", rating: 7.5 },
    { id: "fwd1", isGoalkeeper: false, naturalLine: "fwd", rating: 9.0 },
    { id: "fwd2", isGoalkeeper: false, naturalLine: "fwd", rating: 5.5 },
  ];
  const result = calculateMatchdayScore(starters, [], mult, []);
  assert.equal(result.totalPoints, 76.5);
});

test("anulador_formacion regresa a x1 solo si el multiplicador penalizaba al jugador", () => {
  const mult = computeFormationMultipliers(3, 5, 2); // mid = x0.60 (penaliza)
  const starters: StartingPlayer[] = baseSquad352();
  const withBooster = calculateMatchdayScore(starters, [], mult, [
    { code: "anulador_formacion", targetPlayerId: "mid1" },
  ]);
  const mid1 = withBooster.breakdown.find((p) => p.playerId === "mid1")!;
  assert.equal(mid1.finalMultiplier, 1);
});

test("anulador_formacion no hace nada si el jugador ya tenía multiplicador >= 1", () => {
  const mult = computeFormationMultipliers(3, 5, 2); // fwd = x1.50 (no penaliza)
  const starters: StartingPlayer[] = baseSquad352();
  const result = calculateMatchdayScore(starters, [], mult, [
    { code: "anulador_formacion", targetPlayerId: "fwd1" },
  ]);
  const fwd1 = result.breakdown.find((p) => p.playerId === "fwd1")!;
  assert.equal(fwd1.finalMultiplier, 1.5); // sin cambio
  assert.equal(fwd1.boosterApplied, null);
});

test("multiplicador_2x se compone con el multiplicador de formación (no lo reemplaza)", () => {
  const mult = computeFormationMultipliers(4, 3, 3); // 4-3-3 base, todo x1
  const starters: StartingPlayer[] = baseSquad433();
  const result = calculateMatchdayScore(starters, [], mult, [
    { code: "multiplicador_2x", targetPlayerId: "fwd1" },
  ]);
  const fwd1 = result.breakdown.find((p) => p.playerId === "fwd1")!;
  assert.equal(fwd1.finalMultiplier, 2); // 1 (base) x 2
  assert.equal(fwd1.points, fwd1.rating * 2);
});

test("bench_boost suma hasta 4 jugadores de banca a x1, no más de 4 aunque se pasen más ids", () => {
  const mult = computeFormationMultipliers(4, 3, 3);
  const starters = baseSquad433();
  const bench = [
    { id: "b1", rating: 6.0 },
    { id: "b2", rating: 7.0 },
    { id: "b3", rating: 5.5 },
    { id: "b4", rating: 8.0 },
    { id: "b5", rating: 9.0 }, // no debería contar, excede el máximo de 4
  ];
  const baseResult = calculateMatchdayScore(starters, bench, mult, []);
  const boostedResult = calculateMatchdayScore(starters, bench, mult, [
    { code: "bench_boost", benchPlayerIds: ["b1", "b2", "b3", "b4", "b5"] },
  ]);
  assert.equal(boostedResult.benchBoostPlayers.length, 4);
  assert.equal(boostedResult.totalPoints, round2(baseResult.totalPoints + 6.0 + 7.0 + 5.5 + 8.0));
});

test("lanza error si se intentan usar más de 2 boosters en el torneo", () => {
  const mult = computeFormationMultipliers(4, 3, 3);
  const starters = baseSquad433();
  assert.throws(() =>
    calculateMatchdayScore(starters, [], mult, [
      { code: "multiplicador_1_5x", targetPlayerId: "fwd1" },
      { code: "multiplicador_2x", targetPlayerId: "fwd2" },
      { code: "arquero_2x", targetPlayerId: "gk" },
    ])
  );
});

// ---------- Helpers de datos de prueba ----------
function baseSquad352(): StartingPlayer[] {
  return [
    { id: "gk", isGoalkeeper: true, rating: 7 },
    { id: "def1", isGoalkeeper: false, naturalLine: "def", rating: 6.5 },
    { id: "def2", isGoalkeeper: false, naturalLine: "def", rating: 7 },
    { id: "def3", isGoalkeeper: false, naturalLine: "def", rating: 6 },
    { id: "mid1", isGoalkeeper: false, naturalLine: "mid", rating: 7 },
    { id: "mid2", isGoalkeeper: false, naturalLine: "mid", rating: 7 },
    { id: "mid3", isGoalkeeper: false, naturalLine: "mid", rating: 7 },
    { id: "mid4", isGoalkeeper: false, naturalLine: "mid", rating: 7 },
    { id: "mid5", isGoalkeeper: false, naturalLine: "mid", rating: 7 },
    { id: "fwd1", isGoalkeeper: false, naturalLine: "fwd", rating: 8 },
    { id: "fwd2", isGoalkeeper: false, naturalLine: "fwd", rating: 6 },
  ];
}

function baseSquad433(): StartingPlayer[] {
  return [
    { id: "gk", isGoalkeeper: true, rating: 7 },
    { id: "def1", isGoalkeeper: false, naturalLine: "def", rating: 6.5 },
    { id: "def2", isGoalkeeper: false, naturalLine: "def", rating: 7 },
    { id: "def3", isGoalkeeper: false, naturalLine: "def", rating: 6 },
    { id: "def4", isGoalkeeper: false, naturalLine: "def", rating: 6.8 },
    { id: "mid1", isGoalkeeper: false, naturalLine: "mid", rating: 7 },
    { id: "mid2", isGoalkeeper: false, naturalLine: "mid", rating: 7 },
    { id: "mid3", isGoalkeeper: false, naturalLine: "mid", rating: 7 },
    { id: "fwd1", isGoalkeeper: false, naturalLine: "fwd", rating: 8 },
    { id: "fwd2", isGoalkeeper: false, naturalLine: "fwd", rating: 6 },
    { id: "fwd3", isGoalkeeper: false, naturalLine: "fwd", rating: 7 },
  ];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
