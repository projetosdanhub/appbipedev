"use client";
import { useEffect, useMemo, useReducer, useState } from "react";
import type { WebDocument, WebNode, WebBreakpoint } from "@bipesend/contracts/web";
import { createHistory, createNode, executeCommand, findNode, undo, redo, WIDGETS, type DocumentCommand, type DocumentHistory } from "@bipesend/web-builder-core";
import { BuilderButton, DevicePreviewFrame, DeviceSwitcher, EditorShell, InspectorSection, ElementTile, PanelNavigation } from "@bipesend/web-builder-ui";
import { renderPreviewDocument } from "@bipesend/web-renderer";
import { ContentInspector } from "./content-inspector.js";
import { StyleInspector } from "./style-inspector.js";

type State = { history: DocumentHistory; error: string | null };
type Action = { type: "command"; command: DocumentCommand } | { type: "undo" | "redo" };
function reducer(state: State, action: Action): State {
  try {
    const history = action.type === "command" ? executeCommand(state.history, action.command) : action.type === "undo" ? undo(state.history) : redo(state.history);
    return { history, error: null };
  } catch { return { ...state, error: "Não foi possível aplicar a alteração. Confira os valores e os limites do documento." }; }
}

function Layers({ node, selected, onSelect }: { node: WebNode; selected: string; onSelect(id: string): void }) {
  const label = "text" in node.props ? node.props.text : node.props.label;
  return <li><BuilderButton variant="quiet" aria-pressed={selected === node.id} onClick={() => onSelect(node.id)}>{label.slice(0,60)}</BuilderButton>
    {node.children.length > 0 && <ol className="bw-ui-layers">{node.children.map((child) => <Layers key={child.id} node={child} selected={selected} onSelect={onSelect} />)}</ol>}
  </li>;
}

function locateParent(root: WebNode, id: string): WebNode | undefined {
  if (root.children.some((node) => node.id === id)) return root;
  for (const child of root.children) { const parent = locateParent(child, id); if (parent) return parent; }
}

/** Local editor only. Ownership, durable drafts, entitlements and publish live in API features. */
export function DocumentEditor({ initialDocument, onDocumentChange }: {
  initialDocument: WebDocument; onDocumentChange?(document: WebDocument): void;
}) {
  const [state, dispatch] = useReducer(reducer, initialDocument, (document) => ({ history: createHistory(document), error: null }));
  const document = state.history.present;
  const [selectedId, setSelectedId] = useState(document.root.id);
  const [breakpoint, setBreakpoint] = useState<WebBreakpoint>("desktop");
  const [activePanel, setActivePanel] = useState("elements");
  const selected = findNode(document, selectedId) ?? document.root;
  const parent = locateParent(document.root, selected.id);
  const position = parent?.children.findIndex((node) => node.id === selected.id) ?? -1;
  const html = useMemo(() => renderPreviewDocument(document), [document]);
  useEffect(() => { onDocumentChange?.(document); }, [document, onDocumentChange]);
  function apply(command: DocumentCommand) { dispatch({ type: "command", command }); }
  function add(type: WebNode["type"]) {
    const id = `node-${crypto.randomUUID()}`;
    const target = selected.type === "container" ? selected : parent ?? document.root;
    apply({ type: "insert", parentId: target.id, index: target.children.length, node: createNode(type, id) });
    setSelectedId(id);
    setActivePanel("inspector");
  }
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(document, null, 2)], { type: "application/json" }));
    const link = window.document.createElement("a");
    link.href = url; link.download = "bipewpro-rascunho.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  const panel = <>
    <h1 className="bw-ui-panel-title">Crie sua página</h1>
    <PanelNavigation value={activePanel} onChange={setActivePanel} items={[{ id: "elements", label: "Elementos" }, { id: "layers", label: "Camadas" }, { id: "inspector", label: "Ajustes" }]} />
    {activePanel === "elements" && <><p className="bw-ui-hint">Adicione um elemento ao contêiner selecionado e ajuste cada detalhe.</p>
      <div className="bw-ui-blocks">{WIDGETS.map((widget) => <ElementTile key={widget.type} kind={widget.type} label={widget.label} description={widget.description} onClick={() => add(widget.type)} />)}</div>
      <p className="bw-ui-hint">Use Camadas para selecionar e organizar os elementos da página.</p></>}
    {activePanel === "layers" && <InspectorSection title="Estrutura da página"><ol className="bw-ui-layers"><Layers node={document.root} selected={selected.id} onSelect={(id) => { setSelectedId(id); setActivePanel("inspector"); }} /></ol></InspectorSection>}
    {activePanel === "inspector" && <>
    <h2 className="bw-ui-panel-title">Ajustes do elemento</h2>
    <p className="bw-ui-hint">{WIDGETS.find((widget) => widget.type === selected.type)?.label} selecionado</p>
    <div className="bw-ui-actions">
      <BuilderButton aria-label="Mover elemento para cima" disabled={!parent || position <= 0} onClick={() => parent && apply({ type: "move", nodeId: selected.id, parentId: parent.id, index: position - 1 })}>Subir</BuilderButton>
      <BuilderButton aria-label="Mover elemento para baixo" disabled={!parent || position >= parent.children.length - 1} onClick={() => parent && apply({ type: "move", nodeId: selected.id, parentId: parent.id, index: position + 1 })}>Descer</BuilderButton>
      <BuilderButton variant="danger" disabled={!parent} onClick={() => apply({ type: "remove", nodeId: selected.id })}>Remover</BuilderButton>
    </div>
    <hr className="bw-ui-divider" />
    <ContentInspector key={`content-${selected.id}`} node={selected} onApply={(props) => apply({ type: "props", nodeId: selected.id, props })} />
    <StyleInspector key={`style-${selected.id}-${breakpoint}`} node={selected} breakpoint={breakpoint} onApply={(styles) => apply({ type: "styles", nodeId: selected.id, styles })} />
    </>}
  </>;
  return <EditorShell title={document.title} devices={<DeviceSwitcher value={breakpoint} onChange={setBreakpoint} />} panel={panel}
    actions={<><BuilderButton onClick={() => dispatch({ type: "undo" })} disabled={!state.history.past.length}>Desfazer</BuilderButton><BuilderButton onClick={() => dispatch({ type: "redo" })} disabled={!state.history.future.length}>Refazer</BuilderButton><BuilderButton variant="primary" onClick={download}>Baixar rascunho</BuilderButton></>}>
    <p className="bw-ui-status"><span className="bw-ui-status-dot" aria-hidden="true" />Rascunho local · As alterações ficam nesta sessão até você baixar o arquivo.</p>
    {state.error && <p role="alert" className="bw-ui-error">{state.error}</p>}
    <span role="status" className="bw-ui-sr-only">{state.history.past.length ? "Rascunho atualizado nesta sessão." : "Rascunho inicial."}</span>
    <DevicePreviewFrame html={html} device={breakpoint} />
  </EditorShell>;
}
