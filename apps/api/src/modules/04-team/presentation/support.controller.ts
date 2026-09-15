import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { Database } from "../../00-shared/infrastructure/database.js";
import { ErrorReportRepository } from "../infrastructure/error-report.repository.js";
import { AppError } from "../../00-shared/domain/errors.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { assertPermission } from "@bipesend/auth/policies";

export const supportRoutes = (
  app: FastifyInstance,
  db: Database,
  errorReportRepository: ErrorReportRepository
) => {
  const plugin: FastifyPluginAsync = async (instance) => {
    // Rota pública/semiautenticada para recebimento de erro
    instance.post("/tenants/:tenantId/support/error-reports", async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };
      const actorId = request.user?.id;
      
      const body = request.body as { requestId?: unknown; errorCode?: unknown; context?: unknown };
      if (!body || typeof body.requestId !== "string" || typeof body.errorCode !== "string") {
        throw new AppError("VALIDATION_FAILED", "Payload inválido. Os campos requestId e errorCode são obrigatórios e devem ser texto.", 400);
      }

      await errorReportRepository.create({
        tenantId,
        actorId,
        requestId: body.requestId,
        errorCode: body.errorCode,
        context: body.context,
      });

      return reply.status(201).send({ success: true });
    });

    // Rota de listagem de erros (Superpainel)
    instance.get(
      "/tenants/:tenantId/support/error-reports",
      { preHandler: createTenantMiddleware(db) },
      async (request, reply) => {
        const context = request.tenantContext!;
        assertPermission(context, "audit.read");

        const query = request.query as { limit?: string; offset?: string; status?: string; errorCode?: string };
        const limit = parseInt(query.limit || "") || 25;
        const offset = parseInt(query.offset || "") || 0;

        const reports = await errorReportRepository.findMany(context.tenantId, {
          status: query.status,
          errorCode: query.errorCode,
          limit,
          offset,
        });

        return reply.send({ data: reports });
      }
    );

    // Rota de atualização (Triagem)
    instance.patch(
      "/tenants/:tenantId/support/error-reports/:id",
      { preHandler: createTenantMiddleware(db) },
      async (request, reply) => {
        const context = request.tenantContext!;
        assertPermission(context, "team.audit.manage");

        const { id } = request.params as { id: string };
        const body = request.body as { status: string };

        if (!["open", "investigating", "resolved", "ignored"].includes(body.status)) {
          throw new AppError("VALIDATION_FAILED", "Status inválido", 400);
        }

        const success = await errorReportRepository.updateStatus(id, context.tenantId, body.status);
        if (!success) {
          throw new AppError("NOT_FOUND", "Relatório não encontrado", 404);
        }

        return reply.send({ success: true });
      }
    );
  };

  app.register(plugin);
};
