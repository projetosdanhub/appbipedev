import type { Database } from "../../00-shared/infrastructure/database.js";
import type { EvolutionService } from "../../13-integrations/application/evolution.service.js";

export class ConnectionService {
  constructor(
    private readonly db: Database,
    private readonly evolutionService: EvolutionService
  ) {}

  async createConnection(tenantId: string, name: string, provider: string = "evolution_api", metadata?: Record<string, unknown>) {
    if (provider === "instagram" || provider === "tiktok") {
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || provider;
      const instanceName = `${provider}-${sanitizedName}-${tenantId.split("-")[0]}`;
      const connectionId = crypto.randomUUID();
      
      const existing = await this.db.query(
        "SELECT id FROM connections WHERE tenant_id = $1 AND instance_name = $2 LIMIT 1",
        [tenantId, instanceName]
      );
      
      if (existing.length === 0) {
        await this.db.query(
          "INSERT INTO connections (id, tenant_id, name, provider, instance_name, status, metadata, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, 'connected', $6, NOW(), NOW())",
          [connectionId, tenantId, name, provider, instanceName, JSON.stringify(metadata || {})]
        );
      } else {
        await this.db.query(
          "UPDATE connections SET name = $3, status = 'connected', metadata = $4, updated_at = NOW() WHERE tenant_id = $1 AND instance_name = $2",
          [tenantId, instanceName, name, JSON.stringify(metadata || {})]
        );
      }

      return {
        id: connectionId,
        name,
        provider,
        instanceName,
        status: "connected" as const
      };
    }

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
      "SELECT id, name, provider, instance_name, status, phone, metadata, qrcode FROM connections WHERE tenant_id = $1 AND instance_name = $2 LIMIT 1",
      [tenantId, instanceName]
    );

    if (connections.length === 0) {
      return null;
    }

    return {
      id: connections[0].id,
      name: connections[0].name,
      provider: connections[0].provider || "evolution_api",
      instanceName: connections[0].instance_name,
      status: connections[0].status as 'connected' | 'disconnected' | 'connecting',
      phone: connections[0].phone,
      metadata: connections[0].metadata,
      qrcode: connections[0].qrcode,
    };
  }

  async listConnections(tenantId: string) {
    const connections = await this.db.query(
      "SELECT id, name, provider, instance_name, status, phone, metadata, qrcode, created_at FROM connections WHERE tenant_id = $1 ORDER BY created_at ASC",
      [tenantId]
    );

    return connections.map(conn => ({
      id: conn.id,
      name: conn.name,
      provider: conn.provider || "evolution_api",
      instanceName: conn.instance_name,
      status: conn.status as 'connected' | 'disconnected' | 'connecting',
      phone: conn.phone,
      metadata: conn.metadata,
      qrcode: conn.qrcode,
      created_at: conn.created_at,
    }));
  }

  async deleteConnection(tenantId: string, instanceName: string) {
    if (instanceName.startsWith("instagram-") || instanceName.startsWith("tiktok-")) {
      await this.db.query("DELETE FROM connections WHERE tenant_id = $1 AND instance_name = $2", [tenantId, instanceName]);
      return;
    }
    await this.evolutionService.deleteInstance(tenantId, instanceName);
  }
}
