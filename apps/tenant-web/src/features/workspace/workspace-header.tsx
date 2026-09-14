"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw, LogOut, Settings } from "lucide-react";
import {
  Avatar,
  IconButton,
  ThemeToggle,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@bipesend/ui";
import { navigation, isActiveRoute } from "./navigation";
import { logout } from "./actions";

export function WorkspaceHeader({ name }: { name: string }) {
  const router = useRouter(),
    path = usePathname(),
    [pending, startTransition] = useTransition();
  const current = navigation.find((item) => isActiveRoute(path, item.href));
  return (
    <header className="workspace-header">
      <div className="workspace-breadcrumb">
        <span>BipeSend</span>
        <span aria-hidden="true">/</span>
        <strong>{current?.name ?? "Workspace"}</strong>
      </div>
      <div className="ui-filter-bar">
        <IconButton
          label="Atualizar página atual"
          isLoading={pending}
          onClick={() => startTransition(() => router.refresh())}
        >
          <RefreshCw aria-hidden="true" />
        </IconButton>
        <ThemeToggle />
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
