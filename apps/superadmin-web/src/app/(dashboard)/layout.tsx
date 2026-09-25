import React from "react";
import { SuperadminShell } from "@/components/superadmin-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperadminShell>{children}</SuperadminShell>;
}
