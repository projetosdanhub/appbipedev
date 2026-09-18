import type { FastifyInstance } from "fastify";
import type { WebsocketGateway } from "../infrastructure/websocket.gateway.js";
import type { SessionRepository } from "../../01-identity/infrastructure/session.repository.js";
import type { UserRepository } from "../../01-identity/infrastructure/user.repository.js";
import { verifySession } from "@bipesend/auth/session";
import { decode } from "@auth/core/jwt";
import type { MembershipRepository } from "../../02-tenancy/infrastructure/membership.repository.js";

export async function websocketRoutes(
  app: FastifyInstance,
  gateway: WebsocketGateway,
  sessionRepository: SessionRepository,
  userRepository: UserRepository,
  membershipRepository: MembershipRepository
) {
  // The types for fastify-websocket extend the RouteOptions but might not be perfectly inferred here
  app.get("/ws", { websocket: true }, async (socket: any, req: any) => {
    // 1. Extração do Token
    const query = req.query as { token?: string };
    let token = query.token;

    if (!token && req.cookies) {
      token = req.cookies["bipesend.tenant.session-token"] || req.cookies["__Secure-bipesend.tenant.session-token"];
    }

    if (!token && req.headers?.cookie) {
      const match = req.headers.cookie.match(/(?:^|;\s*)(?:__Secure-)?bipesend\.tenant\.session-token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      req.log?.warn?.("[WS] Conexão rejeitada: token ausente.");
      socket.close(1008, "Token missing");
      return;
    }

    let decoded;
    try {
      decoded = await decode({
        token,
        secret: process.env.AUTH_SECRET as string,
        salt: "bipesend.tenant.session-token",
      });
    } catch {
      try {
        decoded = await decode({
          token,
          secret: process.env.AUTH_SECRET as string,
          salt: "__Secure-bipesend.tenant.session-token",
        });
      } catch {
        req.log?.warn?.("[WS] Conexão rejeitada: erro ao decodificar token.");
        socket.close(1008, "Invalid token");
        return;
      }
    }

    if (!decoded || !decoded.sessionId || decoded.surface !== "tenant") {
      req.log.warn("[WS] Conexão rejeitada: token inválido ou não pertence a tenant.");
      socket.close(1008, "Unauthorized");
      return;
    }

    const isValid = await verifySession(decoded.sessionId as string, "tenant");
    if (!isValid) {
      req.log.warn("[WS] Conexão rejeitada: sessão expirada ou inválida.");
      socket.close(1008, "Session expired");
      return;
    }

    // 3. Obtenção do Usuário
    const user = await userRepository.findById(decoded.id as string);
    if (!user) {
      socket.close(1008, "User not found");
      return;
    }
    
    const client = {
      socket: socket,
      userId: user.id,
      tenantIds: [] as string[]
    };

    gateway.addClient(client);

    // 4. Listeners da conexão
    socket.on("message", async (raw: string) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.action === "subscribe" && msg.tenantId) {
          if (!client.tenantIds.includes(msg.tenantId)) {
            const membership = await membershipRepository.findByUserAndTenant(user.id, msg.tenantId);
            if (!membership) {
              req.log.warn(`[WS] Acesso negado ao tenant ${msg.tenantId} para o user ${user.id}`);
              socket.close(1008, "Policy Violation");
              return;
            }
            client.tenantIds.push(msg.tenantId);
            req.log.info(`[WS] User ${user.id} subscribed to tenant ${msg.tenantId}`);
          }
        }
      } catch (_err) {
        req.log.error("[WS] Mensagem inválida recebida");
      }
    });

    socket.on("error", (err: Error) => {
      req.log.error(`[WS] Erro no socket do user ${user.id}`, err);
    });

    socket.send(JSON.stringify({ event: "connected", userId: user.id }));
  });
}
