"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw, LogOut, Settings, Maximize2, Menu, X } from "lucide-react";
import {
  Avatar,
  BrandLogo,
  IconButton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@bipesend/ui";
import { navigation, isActiveRoute } from "./navigation";
import { logout } from "./actions";
import { TenantSwitcher, type TenantData } from "./tenant-switcher";

export function WorkspaceHeader({ 
  name, 
  activeTenant, 
  availableTenants,
  navigationOpen,
  onNavigationToggle,
}: { 
  name: string; 
  activeTenant?: TenantData;
  availableTenants?: TenantData[];
  navigationOpen: boolean;
  onNavigationToggle(): void;
}) {
  const router = useRouter(),
    path = usePathname(),
    [pending, startTransition] = useTransition();
  const current = navigation.find((item) => isActiveRoute(path, item.href));
  return (
    <header className="workspace-header">
      <div className="workspace-header-start">
        <Link href="/" aria-label="BipeSend, início" className="workspace-header-brand">
          <BrandLogo width={132} />
        </Link>
        <IconButton
          label={navigationOpen ? "Fechar menu principal" : "Abrir menu principal"}
          aria-expanded={navigationOpen}
          aria-controls="workspace-navigation-panel"
          onClick={onNavigationToggle}
          className="workspace-menu-trigger"
        >
          {navigationOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </IconButton>
        <div className="workspace-context">
        {activeTenant && availableTenants && (
          <>
            <TenantSwitcher activeTenant={activeTenant} availableTenants={availableTenants} />
            <span className="text-slate-300" aria-hidden="true">/</span>
          </>
        )}
        <div className="workspace-breadcrumb">
          <strong>{current?.name ?? "Dashboard"}</strong>
        </div>
        </div>
      </div>
      <div className="workspace-header-actions">
        <IconButton
          label="Modo Foco (Nova Aba)"
          onClick={() => window.open(`${path}?focus=true`, "_blank")}
        >
          <Maximize2 aria-hidden="true" />
        </IconButton>
        <IconButton
          label="Atualizar página atual"
          isLoading={pending}
          onClick={() => startTransition(() => router.refresh())}
        >
          <RefreshCw aria-hidden="true" />
        </IconButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="workspace-profile"
              aria-label={`Opções da conta de ${name}`}
            >
              <Avatar name={name} />
              <span>{name}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{name}</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/settings/security">
                <Settings aria-hidden="true" className="ui-icon" />
                Segurança da conta
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                void logout();
              }}
            >
              <LogOut aria-hidden="true" className="ui-icon" />
              Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
