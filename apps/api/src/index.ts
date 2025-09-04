import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { explorerRoutes } from "./routes/explorer";

const API_PORT = Number(process.env.API_PORT ?? "3000");
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "*";

const app = new Elysia()
  .use(cors({ origin: FRONTEND_ORIGIN }))
  .get("/api/health", () => ({ status: "ok", time: new Date().toISOString() }))
  .use(explorerRoutes)
  .listen(API_PORT);

console.log(`🚀 API listening on http://localhost:${API_PORT} (CORS: ${FRONTEND_ORIGIN})`);
