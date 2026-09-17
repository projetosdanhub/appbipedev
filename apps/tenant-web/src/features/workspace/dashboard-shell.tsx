"use client";
import { useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SkipLink } from "@bipesend/ui";
import { DesktopNavigation } from "./desktop-navigation";
import { MobileNavigation } from "./mobile-navigation";
import { WorkspaceHeader } from "./workspace-header";
import type { TenantData } from "./tenant-switcher";
import "./workspace.css";

export function DashboardShell({
  children,
  user,
}: {
  children: ReactNode;
  user: { name: string; activeTenant: TenantData; availableTenants: TenantData[] };
}) {
  const [collapsed, setCollapsed] = useState(false);
  const searchParams = useSearchParams();
  const isFocusMode = searchParams.get("focus") === "true";

  if (isFocusMode) {
    return (
      <div className="workspace-shell">
        <main className="workspace-content h-full w-full" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="workspace-shell" data-collapsed={collapsed}>
      <SkipLink />
      <DesktopNavigation
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="workspace-body">
        <WorkspaceHeader 
          name={user.name} 
          activeTenant={user.activeTenant} 
          availableTenants={user.availableTenants} 
        />
        <main className="workspace-content" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
