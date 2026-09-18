import type { Database } from "../../00-shared/infrastructure/database.js";
import type { EvolutionService } from "../../13-integrations/application/evolution.service.js";

export class ConnectionService {
  constructor(
    private readonly db: Database,
    private readonly evolutionService: EvolutionService
  ) {}

  async createConnection(tenantId: string, name: string) {
    // A delegação para o EvolutionService cuida de criar no BD e na API, 
    // e nós já ajustamos para que não retorne QR code gravado no BD.
    const result = await this.evolutionService.createInstance(tenantId, name);
    return {
      instanceName: result.instanceName,
      qrcode: result.qrcode,
      status: 'connecting' as const
    };
  }

  async getConnection(tenantId: string, instanceName: string) {
    const connections = await this.db.query(
      "SELECT id, name, instance_name, status FROM connections WHERE tenant_id = $1 AND instance_name = $2 LIMIT 1",
      [tenantId, instanceName]
    );

    if (connections.length === 0) {
      return null;
    }

    return {
      id: connections[0].id,
      name: connections[0].name,
      instanceName: connections[0].instance_name,
      status: connections[0].status as 'connected' | 'disconnected' | 'connecting'
    };
  }

  async listConnections(tenantId: string) {
    const connections = await this.db.query(
      "SELECT id, name, instance_name, status FROM connections WHERE tenant_id = $1",
      [tenantId]
    );

    return connections.map(conn => ({
      id: conn.id,
      name: conn.name,
      instanceName: conn.instance_name,
      status: conn.status as 'connected' | 'disconnected' | 'connecting'
    }));
  }

  async deleteConnection(tenantId: string, instanceName: string) {
    await this.evolutionService.deleteInstance(tenantId, instanceName);
  }
}
