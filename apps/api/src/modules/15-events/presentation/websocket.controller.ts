import type { FastifyInstance } from "fastify";
import type { WebsocketGateway } from "../infrastructure/websocket.gateway.js";
import type { SessionRepository } from "../../01-identity/infrastructure/session.repository.js";
import type { UserRepository } from "../../01-identity/infrastructure/user.repository.js";

export async function websocketRoutes(
  app: FastifyInstance,
  gateway: WebsocketGateway,
  sessionRepository: SessionRepository,
  userRepository: UserRepository
) {
  // The types for fastify-websocket extend the RouteOptions but might not be perfectly inferred here
  app.get("/ws", { websocket: true }, async (socket: any, req: any) => {
    // 1. Extração do Token
    const query = req.query as { token?: string };
    let token = query.token;

    if (!token && req.cookies) {
      token = req.cookies["authjs.session-token"] || req.cookies["__Secure-authjs.session-token"];
    }

    if (!token) {
      req.log.warn("[WS] Conexão rejeitada: token ausente.");
      socket.close(1008, "Token missing");
      return;
    }

    // 2. Validação do Token
    const session = await sessionRepository.findByTokenHash(token);
    if (!session || new Date(session.expires_at) < new Date()) {
      req.log.warn("[WS] Conexão rejeitada: token inválido ou expirado.");
      socket.close(1008, "Invalid session");
      return;
    }

    // 3. Obtenção do Usuário
    const user = await userRepository.findById(session.user_id);
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
    socket.on("message", (raw: string) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.action === "subscribe" && msg.tenantId) {
          if (!client.tenantIds.includes(msg.tenantId)) {
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
