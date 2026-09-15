import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { Database } from "../../00-shared/infrastructure/database.js";
import { ErrorReportRepository } from "../infrastructure/error-report.repository.js";

const reportSchema = z.object({
  requestId: z.string().min(1),
  errorCode: z.string().min(1),
});

export const supportRoutes = (
  app: FastifyInstance,
  db: Database,
  errorReportRepository: ErrorReportRepository
) => {
  const plugin: FastifyPluginAsync = async (instance) => {
    instance.post("/tenants/:tenantId/support/error-reports", async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };
      const actorId = request.user?.id;
      
      const data = reportSchema.parse(request.body);

      // Save error report in database
      await errorReportRepository.create({
        tenantId,
        actorId,
        requestId: data.requestId,
        errorCode: data.errorCode,
      });

      return reply.status(201).send({ success: true });
    });
  };

  app.register(plugin);
};
