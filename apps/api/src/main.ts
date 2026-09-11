/**
 * BipeSend API — Bootstrap mínimo.
 *
 * Responsabilidades nesta fase:
 * - Carregar e validar configuração (INF-002)
 * - Registrar GET /health e GET /ready (INF-003)
 * - Servir na porta 4000
 */

import Fastify from "fastify";
import { loadEnv } from "./config/env.js";
import { registerHealthRoutes } from "./routes/health.js";

async function bootstrap(): Promise<void> {
  const env = loadEnv();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
  });

  await registerHealthRoutes(app);

  try {
    await app.listen({ port: env.API_PORT, host: "0.0.0.0" });
    app.log.info(
      `${env.APP_NAME} API listening on http://localhost:${env.API_PORT}`
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
