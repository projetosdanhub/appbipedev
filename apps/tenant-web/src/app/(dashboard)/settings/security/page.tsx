import { auth } from "@bipesend/auth";
import { prisma } from "@bipesend/db";
import { redirect } from "next/navigation";
import { SecurityClient } from "./client";

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-[28px] font-bold leading-[36px]">Segurança</h1>
      <p className="text-[15px] text-[var(--color-ink-500)]">
        Gerencie as configurações de segurança da sua conta e ative a autenticação em duas etapas (2FA).
      </p>

      <div className="bg-[var(--color-surface-0)] border border-[var(--color-border-200)] rounded-[12px] p-6 space-y-6">
        <SecurityClient isTwoFactorEnabled={user.twoFactorEnabled} />
      </div>
    </div>
  );
}
