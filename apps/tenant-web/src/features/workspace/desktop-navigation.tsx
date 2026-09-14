"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { BrandLogo, IconButton } from "@bipesend/ui";
import { navigation, isActiveRoute } from "./navigation";
import { logout } from "./actions";

export function DesktopNavigation({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle(): void;
}) {
  const path = usePathname();
  return (
    <aside className="workspace-sidebar" data-collapsed={collapsed}>
      <div className="workspace-brand">
        {!collapsed && (
          <Link href="/" aria-label="BipeSend, início">
            <BrandLogo />
          </Link>
        )}
        <IconButton
          label={collapsed ? "Expandir navegação" : "Recolher navegação"}
          aria-expanded={!collapsed}
          onClick={onToggle}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" />
          ) : (
            <PanelLeftClose aria-hidden="true" />
          )}
        </IconButton>
      </div>
      <nav aria-label="Navegação principal" className="workspace-nav">
        {["Workspace", "Crescimento", "Gestão"].map((group) => (
          <div key={group} className="workspace-nav-group">
            {!collapsed && <p className="workspace-nav-label">{group}</p>}
            {navigation
              .filter((item) => item.group === group)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="workspace-nav-link"
                  aria-label={collapsed ? item.name : undefined}
                  title={collapsed ? item.name : undefined}
                  aria-current={
                    isActiveRoute(path, item.href) ? "page" : undefined
                  }
                >
                  <item.icon aria-hidden="true" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              ))}
          </div>
        ))}
      </nav>
      <form action={logout} className="workspace-sidebar-footer">
        <button
          type="submit"
          className="workspace-nav-link"
          aria-label="Sair da conta"
        >
          <LogOut aria-hidden="true" />
          {!collapsed && "Sair da conta"}
        </button>
      </form>
    </aside>
  );
}
