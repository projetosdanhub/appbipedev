"use client";

import { useTransition } from "react";
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
      <DropdownMenuTrigger className="workspace-tenant-trigger">
        <div className="workspace-tenant-copy">
          <span>Workspace</span>
          <strong>
            {activeTenant.name}
          </strong>
        </div>
        <ChevronsUpDown aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="workspace-tenant-menu">
        <DropdownMenuLabel className="ui-section-label">
          Workspaces disponíveis
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableTenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            disabled={pending}
            onSelect={() => handleSwitch(tenant.id)}
            className="workspace-tenant-option"
          >
            <div>
              <strong>{tenant.name}</strong>
              <span>{tenant.role.replace("_", " ")}</span>
            </div>
            {tenant.id === activeTenant.id && (
              <Check aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
