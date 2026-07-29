import { Router } from "express";
import { prisma } from "../db/prisma";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "conectada" });
  } catch (err) {
    res.status(500).json({ status: "error", database: "sin conexión", detail: String(err) });
  }
});
