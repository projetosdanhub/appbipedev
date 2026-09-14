import { auth } from "@bipesend/auth";
import { prisma } from "@bipesend/db";
import { redirect } from "next/navigation";
import { InviteClient } from "./invite-client";
import { acceptInviteAction } from "./actions";

export default async function InvitePage(props: { searchParams: Promise<{ token?: string }> }) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  if (!token) return redirect("/login");

  const { createHash } = await import("node:crypto");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const invitation = await prisma.invitation.findFirst({
    where: { tokenHash },
    include: { tenant: true }
  });

  if (!invitation) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Convite inválido</h1>
        <p className="text-muted-foreground">Este convite não existe ou já foi revogado.</p>
      </div>
    );
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Convite expirado</h1>
        <p className="text-muted-foreground">O prazo de validade deste convite já passou.</p>
      </div>
    );
  }

  const session = await auth();

  // If user is not logged in, we let the client component know so it prompts them to log in/register
  return (
    <InviteClient 
      invitation={{
        id: invitation.id,
        email: invitation.email,
        tenantName: invitation.tenant.name,
      }}
      isLoggedIn={!!session?.user}
      userEmail={session?.user?.email}
      token={token}
    />
  );
}
