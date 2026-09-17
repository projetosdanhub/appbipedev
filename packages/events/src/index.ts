import { randomUUID } from "node:crypto";
import {
  eventEnvelopeSchema,
  tenantContextSchema,
  type DomainEvent,
  type TenantContext,
} from "@bipesend/contracts";

/** Transaction adapter must insert into the outbox on the SAME connection as the business write. */
export interface OutboxTransaction {
  insertOutbox(event: DomainEvent): Promise<void>;
}
export function createEvent(
  context: TenantContext,
  name: string,
  data: Record<string, unknown>,
): DomainEvent {
  const ctx = tenantContextSchema.parse(context);
  return eventEnvelopeSchema.parse({
    id: randomUUID(),
    name,
    tenantId: ctx.tenantId,
    actorId: ctx.userId,
    correlationId: ctx.requestId,
    occurredAt: new Date().toISOString(),
    data,
  });
}
export async function appendOutbox(
  tx: OutboxTransaction,
  event: DomainEvent,
): Promise<void> {
  await tx.insertOutbox(eventEnvelopeSchema.parse(event));
}
export function tenantEventKey(event: DomainEvent, consumer: string): string {
  eventEnvelopeSchema.parse(event);
  if (!/^[a-z][a-z0-9_-]{0,63}$/.test(consumer))
    throw new Error("Invalid consumer");
  return `event:${event.tenantId}:${consumer}:${event.id}`;
}
export function retryDelay(attempt: number, random = Math.random): number {
  if (!Number.isInteger(attempt) || attempt < 0 || attempt > 20)
    throw new Error("Invalid retry attempt");
  const ceiling = Math.min(60_000, 500 * 2 ** attempt);
  return Math.floor(ceiling / 2 + (random() * ceiling) / 2);
}
export const jobPolicy = Object.freeze({
  maxAttempts: 5,
  timeoutMs: 30_000,
  maxPayloadBytes: 64 * 1024,
});

export * from "./dedupe.js";
