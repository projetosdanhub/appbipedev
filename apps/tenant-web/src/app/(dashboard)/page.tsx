import Link from "next/link";
import {
  MessageSquare,
  Briefcase,
  Users,
  Zap,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  MetricCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  EmptyState,
  Badge,
} from "@bipesend/ui";
import { getWorkspaceUser } from "@/features/workspace/server/session";
export default async function DashboardPage() {
  const user = await getWorkspaceUser();
  return (
    <PageContainer>
      <PageHeader
        title="Visão geral"
        description={`Olá, ${user.name.split(" ")[0]}. Seu atendimento e sua operação, no mesmo lugar.`}
        actions={<Badge variant="info">Workspace em configuração</Badge>}
      />
      <div className="ui-grid-metrics">
        {[
          { label: "Conversas", icon: MessageSquare },
          { label: "Negócios em aberto", icon: Briefcase },
          { label: "Contatos", icon: Users },
          { label: "Automações ativas", icon: Zap },
        ].map((item) => (
          <MetricCard
            key={item.label}
            label={item.label}
            value="—"
            description="Dados ainda indisponíveis"
            icon={<item.icon className="ui-icon" />}
          />
        ))}
      </div>
      <div className="workspace-home-columns">
        <Card>
          <CardHeader>
            <CardTitle>Seu próximo passo</CardTitle>
            <CardDescription>
              Explore as áreas que vão apoiar sua operação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {[
              {
                href: "/inbox",
                title: "Centralizar conversas",
                description: "Atendimento com contexto em uma única visão.",
              },
              {
                href: "/crm",
                title: "Organizar oportunidades",
                description: "Acompanhe cada etapa do relacionamento.",
              },
              {
                href: "/automations",
                title: "Desenhar automações",
                description: "Planeje fluxos e reduza tarefas repetitivas.",
              },
            ].map((item) => (
              <Link
                className="workspace-module-link"
                href={item.href}
                key={item.href}
              >
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <ArrowUpRight aria-hidden="true" className="ui-icon" />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Atividade recente</CardTitle>
            <CardDescription>
              O histórico aparecerá conforme sua operação começar.
            </CardDescription>
          </CardHeader>
          <EmptyState
            title="Tudo começa por aqui"
            description="Ainda não há atividade disponível para exibir."
            icon={<Sparkles />}
          />
        </Card>
      </div>
    </PageContainer>
  );
}
