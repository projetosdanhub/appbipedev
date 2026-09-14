"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@bipesend/ui";
import { switchTenantAction } from "./actions";

export type TenantData = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

export function TenantSwitcher({
  activeTenant,
  availableTenants,
}: {
  activeTenant: TenantData;
  availableTenants: TenantData[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSwitch = (tenantId: string) => {
    if (tenantId === activeTenant.id) return;
    
    startTransition(async () => {
      await switchTenantAction(tenantId);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md hover:bg-slate-100 p-2 transition-colors max-w-[200px] outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
        <div className="flex flex-col text-left overflow-hidden">
          <span className="text-[13px] text-slate-500 font-medium truncate">Workspace</span>
          <span className="text-[14px] font-semibold text-slate-900 truncate">
            {activeTenant.name}
          </span>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-slate-400 ml-auto flex-shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel className="text-xs text-slate-500 uppercase tracking-wider">
          Workspaces disponíveis
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableTenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            disabled={pending}
            onSelect={() => handleSwitch(tenant.id)}
            className="flex items-center justify-between py-2 cursor-pointer"
          >
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium text-[14px] text-slate-900 truncate">{tenant.name}</span>
              <span className="text-[12px] text-slate-500 truncate capitalize">{tenant.role.replace("_", " ")}</span>
            </div>
            {tenant.id === activeTenant.id && (
              <Check className="w-4 h-4 text-indigo-600 flex-shrink-0 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
