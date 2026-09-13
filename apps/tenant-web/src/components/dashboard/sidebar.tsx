"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut, LucideIcon } from "lucide-react";
import { Button } from "@bipesend/ui";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  navigation: NavItem[];
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  tenantName?: string;
}

export function Sidebar({ navigation, collapsed, setCollapsed, tenantName = "Meu Workspace" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-50 bg-[var(--color-surface-0)] border-r border-[var(--color-border-200)] transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-[256px]"
      }`}
    >
      {/* Header da Sidebar */}
      <div className="flex items-center h-16 px-4 border-b border-[var(--color-border-200)] justify-between relative">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden truncate">
            {/* Logo placeholder */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#08A6F8] to-[#1478FF] flex items-center justify-center text-white font-bold flex-shrink-0">
              B
            </div>
            <span className="text-[15px] font-semibold text-[var(--color-ink-900)] truncate">
              {tenantName}
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-[#08A6F8] to-[#1478FF] flex items-center justify-center text-white font-bold flex-shrink-0">
            B
          </div>
        )}
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute top-5 ${
            collapsed ? "-right-3.5" : "right-3"
          } w-7 h-7 rounded-full bg-white border border-[var(--color-border-200)] flex items-center justify-center text-[var(--color-ink-600)] hover:text-[#1478FF] hover:border-[#1478FF] transition-colors shadow-sm z-10`}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-all group ${
                isActive
                  ? "bg-[#F0F5FF] text-[#1478FF] dark:bg-[#1478FF]/10"
                  : "text-[var(--color-ink-600)] hover:bg-[var(--color-surface-50)] hover:text-[var(--color-ink-900)]"
              } ${collapsed ? "justify-center px-0" : ""}`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "fill-[#1478FF]/10" : ""}`} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer da Sidebar */}
      <div className="p-3 border-t border-[var(--color-border-200)]">
        <button
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-[10px] text-[14px] font-medium text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)] transition-colors ${
            collapsed ? "justify-center px-0" : ""
          }`}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
