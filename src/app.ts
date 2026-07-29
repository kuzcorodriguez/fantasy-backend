import express from "express";
import { healthRouter } from "./routes/health";

export const app = express();

app.use(express.json());
app.use(healthRouter);

app.get("/", (_req, res) => {
  res.json({
    proyecto: "Fantasy Football — API de habilidad",
    estado: "en desarrollo",
    endpoints: ["/health"],
  });
});
