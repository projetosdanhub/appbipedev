import { auth, signOut } from "@bipesend/auth/superadmin";
import { redirect } from "next/navigation";
import {
  BrandLogo,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  PageContainer,
} from "@bipesend/ui";
export const dynamic = "force-dynamic";
async function logout() {
  "use server";
  await signOut({ redirectTo: "/login" });
}
export default async function PlatformHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return (
    <main>
      <PageContainer>
        <BrandLogo />
        <h1 className="ui-page-title">Operação da plataforma</h1>
        <Card>
          <CardHeader>
            <CardTitle>Olá, {session.user.name || "operador"}.</CardTitle>
            <CardDescription>
              Sua sessão de operação está ativa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>As ferramentas de administração estão em preparação.</p>
            <form action={logout}>
              <Button type="submit" size="md" variant="outline">
                Sair da conta
              </Button>
            </form>
          </CardContent>
        </Card>
      </PageContainer>
    </main>
  );
}
