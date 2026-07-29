// Siembra la base de datos con datos de catálogo que no dependen de la API externa:
// formaciones (calculadas con la fórmula de balance) y catálogo de boosters.
// Ejecutar con: npx prisma db seed

import { PrismaClient } from "@prisma/client";
import { computeFormationMultipliers, FORMATION_CATALOG } from "../src/modules/scoring/formation";

const prisma = new PrismaClient();

async function main() {
  console.log("Sembrando formaciones...");
  for (const [name, c] of Object.entries(FORMATION_CATALOG)) {
    const mult = computeFormationMultipliers(c.def, c.mid, c.fwd);
    await prisma.formation.upsert({
      where: { name },
      update: { defMultiplier: mult.def, midMultiplier: mult.mid, fwdMultiplier: mult.fwd },
      create: {
        name,
        defCount: c.def,
        midCount: c.mid,
        fwdCount: c.fwd,
        defMultiplier: mult.def,
        midMultiplier: mult.mid,
        fwdMultiplier: mult.fwd,
      },
    });
  }

  console.log("Sembrando catálogo de boosters...");
  const boosters = [
    { code: "anulador_formacion", name: "Anulador de debilidad por formación", unlockType: "gratuito_inscripcion" },
    { code: "multiplicador_1_5x", name: "Multiplicador x1.5", unlockType: "comprable" },
    { code: "multiplicador_2x", name: "Multiplicador x2", unlockType: "premio" },
    { code: "cambio_posicion", name: "Cambio de posición", unlockType: "objetivo_temporada" },
    { code: "venta_precio_completo", name: "Venta a precio completo", unlockType: "objetivo_temporada" },
    { code: "bench_boost", name: "Bench Boost", unlockType: "objetivo_temporada" },
    { code: "arquero_2x", name: "Arquero x2", unlockType: "objetivo_temporada" },
    { code: "fichaje_cortesia", name: "Tarjeta de fichaje de cortesía", unlockType: "unico_bienvenida" },
  ];
  for (const b of boosters) {
    await prisma.boosterCatalog.upsert({
      where: { code: b.code },
      update: {},
      create: b,
    });
  }

  console.log("Siembra completa.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
