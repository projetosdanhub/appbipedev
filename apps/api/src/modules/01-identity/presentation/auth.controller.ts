import type { FastifyInstance } from "fastify";
/**
 * Browser identity is owned by Auth.js in the web surface.
 * The legacy HTTP implementation used a separate session store and an unthrottled
 * six-digit reset, bypassing the new recovery controls. Do not expose both paths.
 * A future machine identity contract belongs to AUTH-015, not this controller.
 */
export function authRoutes(fastify: FastifyInstance) {
  for (const path of [
    "register",
    "login",
    "logout",
    "verify-email",
    "request-password-reset",
    "reset-password",
  ]) {
    fastify.post(`/auth/${path}`, async (request, reply) =>
      reply.code(410).send({
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Use a autenticação da aplicação web.",
          requestId: request.id,
        },
      }),
    );
  }
}
