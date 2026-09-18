"use client";

import * as React from "react";
import { Toaster } from "@bipesend/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
