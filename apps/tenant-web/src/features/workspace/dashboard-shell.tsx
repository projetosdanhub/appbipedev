"use client";
import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
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
  const [navigationOpen, setNavigationOpen] = useState(false);
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
    <div className="workspace-shell">
      <SkipLink />
      <DesktopNavigation
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
      />
      <div className="workspace-body">
        <WorkspaceHeader
          name={user.name}
          activeTenant={user.activeTenant}
          availableTenants={user.availableTenants}
          navigationOpen={navigationOpen}
          onNavigationToggle={() => setNavigationOpen((current) => !current)}
        />
        <main className="workspace-content" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
