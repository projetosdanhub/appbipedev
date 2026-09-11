/**
 * BipeSend API — Bootstrap mínimo.
 *
 * Responsabilidades nesta fase:
 * - Carregar e validar configuração (INF-002)
 * - Registrar GET /health e GET /ready (INF-003)
 * - Servir na porta configurada, com bind local em 127.0.0.1 por padrão
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
    await app.listen({ port: env.API_PORT, host: env.API_HOST });
    app.log.info(
      {
        host: env.API_HOST,
        port: env.API_PORT,
      },
      `${env.APP_NAME} API upstream is ready; public access must use the HTTPS proxy`
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
