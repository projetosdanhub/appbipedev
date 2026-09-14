import {
  LayoutDashboard,
  MessageSquare,
  Briefcase,
  Users,
  Zap,
  Boxes,
  Plug,
  CreditCard,
  Settings,
  Send,
} from "lucide-react";
export const navigation = [
  { name: "Visão geral", href: "/", icon: LayoutDashboard, group: "Workspace" },
  { name: "Inbox", href: "/inbox", icon: MessageSquare, group: "Workspace" },
  { name: "CRM", href: "/crm", icon: Briefcase, group: "Workspace" },
  { name: "Contatos", href: "/users", icon: Users, group: "Workspace" },
  { name: "Campanhas", href: "/campaigns", icon: Send, group: "Crescimento" },
  { name: "Automações", href: "/automations", icon: Zap, group: "Crescimento" },
  { name: "Catálogo", href: "/catalog", icon: Boxes, group: "Crescimento" },
  { name: "Integrações", href: "/integrations", icon: Plug, group: "Gestão" },
  { name: "Faturamento", href: "/billing", icon: CreditCard, group: "Gestão" },
  { name: "Configurações", href: "/settings", icon: Settings, group: "Gestão" },
  { name: "Equipe", href: "/settings/team", icon: Users, group: "Gestão" },
] as const;
export function isActiveRoute(path: string, href: string) {
  return path === href || (href !== "/" && path.startsWith(`${href}/`));
}
