"use client";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Badge, SkipLink } from "@bipesend/ui";
import { DesktopNavigation } from "./desktop-navigation";
import { MobileNavigation } from "./mobile-navigation";
import { WorkspaceHeader } from "./workspace-header";
import "./workspace.css";

export function DashboardShell({
  children,
  user,
}: {
  children: ReactNode;
  user: { name: string };
}) {
  const [collapsed, setCollapsed] = useState(false),
    path = usePathname();
  const demo = [
    "/crm",
    "/inbox",
    "/automations",
    "/campaigns",
    "/catalog",
    "/users",
    "/integrations",
    "/billing",
  ].some((route) => path === route || path.startsWith(`${route}/`));
  return (
    <div className="workspace-shell" data-collapsed={collapsed}>
      <SkipLink />
      <DesktopNavigation
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="workspace-body">
        <WorkspaceHeader name={user.name} />
        {demo && (
          <div className="workspace-demo">
            <Badge variant="info">Prévia de interface</Badge>
            <span>Dados de exemplo · Alterações não são salvas</span>
          </div>
        )}
        <main className="workspace-content" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
