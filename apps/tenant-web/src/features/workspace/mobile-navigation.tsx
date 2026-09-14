"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DialogTitle,
  DialogDescription,
  BrandLogo,
} from "@bipesend/ui";
import { navigation, isActiveRoute } from "./navigation";
import { logout } from "./actions";

export function MobileNavigation() {
  const path = usePathname(),
    [open, setOpen] = React.useState(false);
  return (
    <nav className="workspace-mobile-nav" aria-label="Navegação mobile">
      {navigation.slice(0, 3).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActiveRoute(path, item.href) ? "page" : undefined}
        >
          <item.icon aria-hidden="true" />
          <span>{item.name}</span>
        </Link>
      ))}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button type="button">
            <Menu aria-hidden="true" />
            <span>Mais</span>
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DialogTitle>Seu workspace</DialogTitle>
          <DialogDescription>
            Acesse todas as áreas do BipeSend.
          </DialogDescription>
          <BrandLogo />
          <div className="workspace-nav">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="workspace-nav-link"
                aria-current={
                  isActiveRoute(path, item.href) ? "page" : undefined
                }
                onClick={() => setOpen(false)}
              >
                <item.icon aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </div>
          <form action={logout}>
            <button type="submit" className="workspace-nav-link">
              <LogOut aria-hidden="true" />
              Sair da conta
            </button>
          </form>
        </DrawerContent>
      </Drawer>
    </nav>
  );
}
