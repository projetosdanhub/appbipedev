"use client";

import { useId, useState, useSyncExternalStore, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { PanelsTopLeft, SlidersHorizontal, X } from "lucide-react";
import { BuilderButton } from "./controls.js";

const query = "(max-width: 767px)";
const subscribe = (listener: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
};
const getSnapshot = () => window.matchMedia(query).matches;
const serverSnapshot = () => false;

export function EditorShell({ title, actions, devices, panel, children }: {
  title: string; actions: ReactNode; devices: ReactNode; panel: ReactNode; children: ReactNode;
}) {
  const mobile = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
  const [open, setOpen] = useState(false);
  const canvasId = useId();
  const [shell, setShell] = useState<HTMLDivElement | null>(null);
  return <div className="bw-ui-shell" ref={setShell}>
    <a className="bw-ui-skip" href={`#${canvasId}`}>Ir para prévia</a>
    <header className="bw-ui-topbar">
      <div className="bw-ui-brand"><span className="bw-ui-brand-mark"><PanelsTopLeft aria-hidden="true" size={21} /></span><div><strong>BipeWPRO</strong><span>{title}</span></div></div>
      <div className="bw-ui-device-slot">{devices}</div>
      <div className="bw-ui-actions">{actions}</div>
    </header>
    {mobile && <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="bw-ui-mobile-toolbar"><Dialog.Trigger asChild><BuilderButton><SlidersHorizontal aria-hidden="true" size={18} /> Elementos e ajustes</BuilderButton></Dialog.Trigger></div>
      <Dialog.Portal container={shell}><Dialog.Overlay className="bw-ui-drawer-overlay" /><Dialog.Content className="bw-ui-drawer">
        <div className="bw-ui-drawer-heading"><Dialog.Title>Elementos e ajustes</Dialog.Title><Dialog.Close asChild><BuilderButton aria-label="Fechar painel"><X aria-hidden="true" size={18} /></BuilderButton></Dialog.Close></div>
        <Dialog.Description className="bw-ui-sr-only">Edite o conteúdo e o estilo da sua página. Feche o painel para ver a prévia.</Dialog.Description>
        <div className="bw-ui-drawer-body">{panel}</div>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>}
    <div className="bw-ui-workspace">
      {!mobile && <aside className="bw-ui-panel" aria-label="Elementos e ajustes">{panel}</aside>}
      <main className="bw-ui-canvas" id={canvasId} tabIndex={-1} aria-label="Área de prévia">{children}</main>
    </div>
  </div>;
}
