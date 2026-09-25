import { FastifyInstance } from "fastify";
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
      try {
        const tenantId = request.tenantId || (request.headers["x-tenant-id"] as string);
        if (!tenantId) {
          return reply.code(401).send({ error: "Tenant não informado ou não autenticado" });
        }
        const { name, provider, metadata } = request.body;

        const connection = await connectionService.createConnection(tenantId, name, provider, metadata);

        return reply.code(201).send(connection);
      } catch (err: any) {
        request.log.error(err, "Failed to create connection");
        return reply.code(500).send({ error: err?.message || "Falha ao criar conexão" });
      }
    }
  );

  app.get(
    "/connections",
    async (request, reply) => {
      try {
        const tenantId = request.tenantId || (request.headers["x-tenant-id"] as string);
        if (!tenantId) {
          return reply.code(401).send({ error: "Tenant não informado ou não autenticado" });
        }
        const connections = await connectionService.listConnections(tenantId);
        return reply.code(200).send(connections);
      } catch (err: any) {
        request.log.error(err, "Failed to list connections");
        return reply.code(500).send({ error: err?.message || "Falha ao listar conexões" });
      }
    }
  );

  app.get<{ Params: { instanceName: string } }>(
    "/connections/:instanceName",
    async (request, reply) => {
      try {
        const tenantId = request.tenantId || (request.headers["x-tenant-id"] as string);
        if (!tenantId) {
          return reply.code(401).send({ error: "Tenant não informado ou não autenticado" });
        }
        const { instanceName } = request.params;

        const connection = await connectionService.getConnection(tenantId, instanceName);
        if (!connection) {
          return reply.code(404).send({ error: "Connection not found" });
        }

        return reply.code(200).send(connection);
      } catch (err: any) {
        request.log.error(err, "Failed to get connection");
        return reply.code(500).send({ error: err?.message || "Falha ao buscar conexão" });
      }
    }
  );

  app.post<{ Params: { instanceName: string } }>(
    "/connections/:instanceName/qrcode",
    async (request, reply) => {
      try {
        const tenantId = request.tenantId || (request.headers["x-tenant-id"] as string);
        if (!tenantId) {
          return reply.code(401).send({ error: "Tenant não informado ou não autenticado" });
        }
        const { instanceName } = request.params;

        const result = await connectionService.refreshQrCode(tenantId, instanceName);
        return reply.code(200).send(result);
      } catch (err: any) {
        request.log.error(err, "Failed to refresh QR Code");
        return reply.code(500).send({ error: err?.message || "Falha ao renovar QR Code" });
      }
    }
  );

  app.post<{ Body: { channel: "whatsapp" | "instagram" | "tiktok" | "telegram"; senderName: string; messageText: string } }>(
    "/connections/simulate-message",
    {
      schema: {
        body: {
          type: "object",
          required: ["channel", "senderName", "messageText"],
          properties: {
            channel: { type: "string", enum: ["whatsapp", "instagram", "tiktok", "telegram"] },
            senderName: { type: "string" },
            messageText: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const tenantId = request.tenantId || (request.headers["x-tenant-id"] as string);
        if (!tenantId) {
          return reply.code(401).send({ error: "Tenant não informado ou não autenticado" });
        }
        const { channel, senderName, messageText } = request.body;

        const result = await connectionService.simulateIncomingMessage(tenantId, channel, senderName, messageText);
        return reply.code(200).send({ success: true, result });
      } catch (err: any) {
        request.log.error(err, "Failed to simulate message");
        return reply.code(500).send({ error: err?.message || "Falha ao simular mensagem" });
      }
    }
  );

  app.delete<{ Params: { instanceName: string } }>(
    "/connections/:instanceName",
    async (request, reply) => {
      try {
        const tenantId = request.tenantId || (request.headers["x-tenant-id"] as string);
        if (!tenantId) {
          return reply.code(401).send({ error: "Tenant não informado ou não autenticado" });
        }
        const { instanceName } = request.params;

        await connectionService.deleteConnection(tenantId, instanceName);

        return reply.code(200).send({ success: true });
      } catch (err: any) {
        request.log.error(err, "Failed to delete connection");
        return reply.code(500).send({ error: err?.message || "Falha ao excluir conexão" });
      }
    }
  );
}
