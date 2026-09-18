import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { type ConnectionService } from "../../application/connection.service.js";

export function connectionRoutes(
  app: FastifyInstance,
  connectionService: ConnectionService
) {
  app.post<{ Body: { name: string; provider?: string; metadata?: Record<string, unknown> } }>(
    "/connections",
    {
      schema: {
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            provider: { type: "string" },
            metadata: { type: "object" },
          },
        },
      },
    },
    async (request, reply) => {
      const tenantId = request.tenantId;
      if (!tenantId) return reply.code(401).send();
      const { name, provider, metadata } = request.body;

      const connection = await connectionService.createConnection(tenantId, name, provider, metadata);

      return reply.code(201).send(connection);
    }
  );

  app.get(
    "/connections",
    async (request, reply) => {
      const tenantId = request.tenantId;
      if (!tenantId) return reply.code(401).send();
      const connections = await connectionService.listConnections(tenantId);
      return reply.send(connections);
    }
  );

  app.get<{ Params: { instanceName: string } }>(
    "/connections/:instanceName",
    async (request, reply) => {
      const tenantId = request.tenantId;
      if (!tenantId) return reply.code(401).send();
      const { instanceName } = request.params;

      const connection = await connectionService.getConnection(tenantId, instanceName);
      if (!connection) {
        return reply.code(404).send({ message: "Connection not found" });
      }

      return reply.send(connection);
    }
  );

  app.delete<{ Params: { instanceName: string } }>(
    "/connections/:instanceName",
    async (request, reply) => {
      const tenantId = request.tenantId;
      if (!tenantId) return reply.code(401).send();
      const { instanceName } = request.params;

      await connectionService.deleteConnection(tenantId, instanceName);

      return reply.code(204).send();
    }
  );
}
