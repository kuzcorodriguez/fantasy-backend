import { PrismaClient } from "@prisma/client";

// Singleton: evita abrir una conexión nueva a la base de datos en cada import,
// especialmente importante con el hot-reload de ts-node-dev en desarrollo.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
