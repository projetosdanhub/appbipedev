"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { navigation, isActiveRoute } from "./navigation";
import { logout } from "./actions";

export function DesktopNavigation({
  open,
  onClose,
}: {
  open: boolean;
  onClose(): void;
}) {
  const path = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        className="workspace-nav-backdrop"
        aria-label="Fechar menu principal"
        data-open={open}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <aside
        id="workspace-navigation-panel"
        className="workspace-sidebar"
        data-open={open}
        aria-hidden={!open}
      >
        <div className="workspace-nav-heading">
          <span className="ui-section-label">Navegação</span>
          <strong>Seu workspace</strong>
        </div>
        <nav aria-label="Navegação principal" className="workspace-nav">
          {["Workspace", "Crescimento", "Gestão"].map((group) => (
            <div key={group} className="workspace-nav-group">
              <p className="workspace-nav-label">{group}</p>
              {navigation
                .filter((item) => item.group === group)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="workspace-nav-link"
                    aria-current={
                      isActiveRoute(path, item.href) ? "page" : undefined
                    }
                    tabIndex={open ? 0 : -1}
                    onClick={onClose}
                  >
                    <item.icon aria-hidden="true" />
                    <span>{item.name}</span>
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
            tabIndex={open ? 0 : -1}
          >
            <LogOut aria-hidden="true" />
            Sair da conta
          </button>
        </form>
      </aside>
    </>
  );
}
