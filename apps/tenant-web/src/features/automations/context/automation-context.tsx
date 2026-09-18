"use client";

import { createContext, useContext } from "react";

interface AutomationContextType {
  openNodeConfig: (nodeId: string) => void;
}

export const AutomationContext = createContext<AutomationContextType>({
  openNodeConfig: () => {},
});

export const useAutomationContext = () => useContext(AutomationContext);
