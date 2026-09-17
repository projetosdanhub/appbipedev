import type { WebSocket } from "ws";
import { logger } from "../../00-shared/infrastructure/logger.js";

/**
 * Representa um cliente conectado no WebSocket.
 */
export interface WsClient {
  socket: WebSocket;
  userId: string;
  tenantIds: string[]; // Tenants que o usuário tem acesso (para isolamento)
}

/**
 * WebsocketGateway gerencia todas as conexões WS ativas e o roteamento de mensagens.
 * Ele permite enviar mensagens (broadcast) para usuários específicos ou para tenants inteiros.
 */
export class WebsocketGateway {
  private clients: Set<WsClient> = new Set();

  constructor() {}

  /**
   * Adiciona um novo cliente à pool de conexões ativas.
   */
  public addClient(client: WsClient): void {
    this.clients.add(client);
    logger.debug(`[WS] Client added. UserId: ${client.userId}`);
    
    // Configura remoção automática ao fechar a conexão
    client.socket.on("close", () => {
      this.removeClient(client);
    });
  }

  /**
   * Remove um cliente da pool.
   */
  public removeClient(client: WsClient): void {
    this.clients.delete(client);
    logger.debug(`[WS] Client removed. UserId: ${client.userId}`);
  }

  /**
   * Envia um evento de invalidação para todos os clientes ativos de um Tenant.
   * Utilizado para garantir que as alterações no CRM (deals, contatos, mensagens)
   * sejam atualizadas em tempo real nas telas dos atendentes.
   */
  public broadcastToTenant(tenantId: string, event: string, payload: unknown): void {
    const message = JSON.stringify({ event, payload });
    let count = 0;

    for (const client of this.clients) {
      if (client.tenantIds.includes(tenantId) && client.socket.readyState === 1 /* OPEN */) {
        client.socket.send(message);
        count++;
      }
    }

    logger.debug(`[WS] Broadcasted '${event}' to tenant ${tenantId} (${count} clients)`);
  }

  /**
   * Envia uma mensagem para um usuário específico, não importando em quantas abas
   * ele esteja logado.
   */
  public sendToUser(userId: string, event: string, payload: unknown): void {
    const message = JSON.stringify({ event, payload });
    let count = 0;

    for (const client of this.clients) {
      if (client.userId === userId && client.socket.readyState === 1 /* OPEN */) {
        client.socket.send(message);
        count++;
      }
    }

    if (count > 0) {
      logger.debug(`[WS] Sent '${event}' to user ${userId} (${count} connections)`);
    }
  }
}
