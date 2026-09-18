"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation, isActiveRoute } from "./navigation";

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
      <div
        className="workspace-nav-backdrop"
        data-open={open}
        aria-hidden="true"
        onClick={onClose}
      />
      <aside
        id="workspace-navigation-panel"
        className="workspace-sidebar"
        data-open={open}
        aria-label="Navegação principal"
      >
        <div className="workspace-nav-heading">
          <strong>Navegação</strong>
          <span className="text-slate-400 text-xs">Módulos do sistema</span>
        </div>
        <nav className="workspace-nav">
          {["Operação", "Canais", "Configurações"].map((group) => (
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
      </aside>
    </>
  );
}
