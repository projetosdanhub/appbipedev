import {
  webDocumentSchema, type WebDocument, type WebNode, type WebResponsiveStyles,
  type WebBreakpoint, type WebStyles,
} from "@bipesend/contracts/web";

export const WIDGETS = [
  { type: "container", label: "Contêiner", description: "Organize com flex ou grid" },
  { type: "heading", label: "Título", description: "Crie hierarquia na página" },
  { type: "text", label: "Texto", description: "Conte sua história" },
  { type: "button", label: "Botão", description: "Convide para a próxima ação" },
] as const;

export function createNode(type: WebNode["type"], id: string): WebNode {
  const common = { id, version: 1 as const, children: [], styles: { base: {} } };
  switch (type) {
    case "container": return { ...common, type, props: { tag: "section", label: "Nova seção" }, styles: { base: { display: "flex", direction: "column", gap: 16, padding: 24 } } };
    case "heading": return { ...common, type, props: { text: "Um novo título", level: 2 } };
    case "text": return { ...common, type, props: { text: "Escreva aqui o conteúdo da sua página." } };
    case "button": return { ...common, type, props: { label: "Saiba mais", href: "/saiba-mais" } };
  }
}

export function findNode(document: WebDocument, id: string): WebNode | undefined {
  const pending = [document.root];
  while (pending.length) {
    const node = pending.pop()!;
    if (node.id === id) return node;
    pending.push(...node.children);
  }
}

export function resolveStyles(styles: WebResponsiveStyles, breakpoint: WebBreakpoint): WebStyles {
  return { ...styles.base, ...(breakpoint !== "base" ? styles.tablet : {}), ...(breakpoint === "desktop" ? styles.desktop : {}) };
}

export type DocumentCommand =
  | { type: "insert"; parentId: string; index: number; node: WebNode }
  | { type: "remove"; nodeId: string }
  | { type: "move"; nodeId: string; parentId: string; index: number }
  | { type: "props"; nodeId: string; props: Record<string, unknown> }
  | { type: "styles"; nodeId: string; styles: WebResponsiveStyles };

export class DocumentCommandError extends Error {
  constructor(public readonly code: "NODE_NOT_FOUND" | "ROOT_PROTECTED" | "INVALID_PARENT" | "INVALID_POSITION" | "INVALID_MOVE") { super(code); }
}

function nodeRequired(document: WebDocument, id: string): WebNode {
  const node = findNode(document, id);
  if (!node) throw new DocumentCommandError("NODE_NOT_FOUND");
  return node;
}
function parentOf(document: WebDocument, id: string): WebNode | undefined {
  const pending = [document.root];
  while (pending.length) {
    const node = pending.pop()!;
    if (node.children.some((child) => child.id === id)) return node;
    pending.push(...node.children);
  }
}

/** Immutable transaction: reject the entire command; never leave a partial tree. */
export function applyCommand(input: WebDocument, command: DocumentCommand): WebDocument {
  const document = webDocumentSchema.parse(input);
  if (command.type === "insert" || command.type === "move") {
    const parent = nodeRequired(document, command.parentId);
    if (parent.type !== "container") throw new DocumentCommandError("INVALID_PARENT");
    if (!Number.isInteger(command.index) || command.index < 0 || command.index > parent.children.length) throw new DocumentCommandError("INVALID_POSITION");
    if (command.type === "insert") parent.children.splice(command.index, 0, structuredClone(command.node));
    else {
      if (command.nodeId === document.root.id) throw new DocumentCommandError("ROOT_PROTECTED");
      const node = nodeRequired(document, command.nodeId);
      if (findNode({ ...document, root: node }, parent.id)) throw new DocumentCommandError("INVALID_MOVE");
      const oldParent = parentOf(document, node.id)!;
      oldParent.children.splice(oldParent.children.findIndex((child) => child.id === node.id), 1);
      // index is the FINAL position in the destination, after removal.
      if (command.index > parent.children.length) throw new DocumentCommandError("INVALID_POSITION");
      parent.children.splice(command.index, 0, node);
    }
  } else {
    const node = nodeRequired(document, command.nodeId);
    if (command.type === "remove") {
      if (node === document.root) throw new DocumentCommandError("ROOT_PROTECTED");
      const parent = parentOf(document, node.id)!;
      parent.children.splice(parent.children.findIndex((child) => child.id === node.id), 1);
    } else if (command.type === "props") Object.assign(node.props, command.props);
    else node.styles = structuredClone(command.styles);
  }
  return webDocumentSchema.parse(document);
}

export interface DocumentHistory { past: WebDocument[]; present: WebDocument; future: WebDocument[] }
export const MAX_HISTORY_ENTRIES = 50;
export function createHistory(document: WebDocument): DocumentHistory {
  return { past: [], present: webDocumentSchema.parse(document), future: [] };
}
export function executeCommand(history: DocumentHistory, command: DocumentCommand): DocumentHistory {
  const next = applyCommand(history.present, command);
  if (JSON.stringify(next) === JSON.stringify(history.present)) return history;
  return { past: [...history.past, history.present].slice(-MAX_HISTORY_ENTRIES), present: next, future: [] };
}
export function undo(history: DocumentHistory): DocumentHistory {
  const previous = history.past.at(-1);
  return previous ? { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] } : history;
}
export function redo(history: DocumentHistory): DocumentHistory {
  const next = history.future[0];
  return next ? { past: [...history.past, history.present].slice(-MAX_HISTORY_ENTRIES), present: next, future: history.future.slice(1) } : history;
}
