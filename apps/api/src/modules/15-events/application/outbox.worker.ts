import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { Database } from "../../00-shared/infrastructure/database.js";
import { OutboxRepository, OutboxEventRow } from "../infrastructure/outbox.repository.js";
import { WebsocketGateway } from "../infrastructure/websocket.gateway.js";

export class OutboxProcessor {
  public queue: Queue;
  private worker: Worker;
  private pollerTimer?: NodeJS.Timeout;
  private repo: OutboxRepository;
  private redisConnection: Redis;

  constructor(
    private readonly db: Database,
    private readonly wsGateway: WebsocketGateway
  ) {
    this.repo = new OutboxRepository(db);
    
    // We assume REDIS_URL is provided for BullMQ connection
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    this.redisConnection = new Redis(redisUrl, { maxRetriesPerRequest: null });

    this.queue = new Queue("outbox-events", {
      connection: this.redisConnection,
    });

    this.worker = new Worker(
      "outbox-events",
      async (job: Job) => {
        const event = job.data as OutboxEventRow;
        try {
          await this.processEvent(event);
          await this.repo.markAsProcessed(event.id);
        } catch (err) {
          console.error(`[OutboxProcessor] Failed to process event ${event.id}:`, err);
          await this.repo.markAsFailed(event.id);
          throw err;
        }
      },
      { connection: this.redisConnection }
    );
  }

  start() {
    console.log("[OutboxProcessor] Starting outbox poller and worker...");
    // Poll the DB every 5 seconds (MVP logic)
    this.pollerTimer = setInterval(() => this.pollAndEnqueue(), 5000);
  }

  async stop() {
    console.log("[OutboxProcessor] Stopping outbox poller and worker...");
    if (this.pollerTimer) {
      clearInterval(this.pollerTimer);
    }
    await this.worker.close();
    await this.queue.close();
    this.redisConnection.disconnect();
  }

  private async pollAndEnqueue() {
    try {
      const events = await this.repo.fetchPendingEvents(50);
      if (events.length > 0) {
        console.log(`[OutboxProcessor] Found ${events.length} pending events, enqueueing...`);
        
        // Use bulk addition for efficiency
        const jobs = events.map(e => ({
          name: e.name,
          data: e,
        }));
        
        await this.queue.addBulk(jobs);
      }
    } catch (err) {
      console.error("[OutboxProcessor] Polling error:", err);
    }
  }

  private async processEvent(event: OutboxEventRow) {
    console.log(`[OutboxProcessor] Processing event ${event.name} for tenant ${event.tenantId}`);
    
    switch (event.name) {
      case "crm.deal.assigned":
      case "crm.deal.created":
      case "crm.deal.stage_changed":
      case "crm.deal.updated":
        // Broadcast the event via WebSocket to the specific tenant
        this.wsGateway.broadcastToTenant(event.tenantId, event.name, event.payload);
        break;
      
      case "inbox.conversation.created":
      case "inbox.conversation.assigned":
      case "inbox.conversation.updated":
      case "inbox.message.received":
      case "inbox.message.sent":
        // Broadcast via WebSocket
        this.wsGateway.broadcastToTenant(event.tenantId, event.name, event.payload);
        break;
        
      default:
        // Ignore or log unknown events
        console.log(`[OutboxProcessor] Unhandled event type: ${event.name}`);
        break;
    }
  }
}
