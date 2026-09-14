import { Prisma, type PrismaClient } from "@prisma/client";
import { tenantContextSchema, type TenantContext } from "@bipesend/contracts";

/** Authorization must precede this call. No global Prisma calls inside the callback. */
export async function withTenantTransaction<T>(
  client: PrismaClient,
  context: TenantContext,
  work: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  const parsed = tenantContextSchema.parse(context);
  return client.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${parsed.tenantId}, true)`;
      return work(tx);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      maxWait: 5000,
      timeout: 10000,
    },
  );
}
