"use client";

import { useId, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
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
const DEFAULT_PANEL_WIDTH = 312;
const MIN_PANEL_WIDTH = 256;
const MAX_PANEL_WIDTH = 520;
const PANEL_STEP = 16;

export function EditorShell({ title, actions, devices, panel, children }: {
  title: string; actions: ReactNode; devices: ReactNode; panel: ReactNode; children: ReactNode;
}) {
  const mobile = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
  const [open, setOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const pointerResize = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null);
  const canvasId = useId();
  const [shell, setShell] = useState<HTMLDivElement | null>(null);
  const resizePanel = (next: number) => setPanelWidth(Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, next)));
  const handleResizeKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") resizePanel(panelWidth - PANEL_STEP);
    else if (event.key === "ArrowRight") resizePanel(panelWidth + PANEL_STEP);
    else if (event.key === "Home") resizePanel(DEFAULT_PANEL_WIDTH);
    else if (event.key === "End") resizePanel(MAX_PANEL_WIDTH);
    else return;
    event.preventDefault();
  };
  const handleResizePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    pointerResize.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: panelWidth };
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };
  const handleResizePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const resize = pointerResize.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    resizePanel(resize.startWidth + event.clientX - resize.startX);
  };
  const finishResizePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerResize.current?.pointerId !== event.pointerId) return;
    pointerResize.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };
  const workspaceStyle = { "--bw-panel-width": `${panelWidth}px` } as CSSProperties;
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
    <div className="bw-ui-workspace" style={workspaceStyle}>
      {!mobile && <><aside className="bw-ui-panel" aria-label="Elementos e ajustes">{panel}</aside>
        <div className="bw-ui-panel-resizer" role="separator" tabIndex={0} aria-label="Redimensionar painel de elementos" aria-orientation="vertical" aria-valuemin={MIN_PANEL_WIDTH} aria-valuemax={MAX_PANEL_WIDTH} aria-valuenow={panelWidth} aria-valuetext={`${panelWidth} pixels`} onKeyDown={handleResizeKey} onPointerDown={handleResizePointerDown} onPointerMove={handleResizePointerMove} onPointerUp={finishResizePointer} onPointerCancel={finishResizePointer} onDoubleClick={() => resizePanel(DEFAULT_PANEL_WIDTH)} title="Arraste ou use as setas para redimensionar; Home restaura a largura" />
      </>}
      <main className="bw-ui-canvas" id={canvasId} tabIndex={-1} aria-label="Área de prévia">{children}</main>
    </div>
  </div>;
}
