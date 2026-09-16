import { test, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentEditor } from "../src/index.js";
import { exampleDocument } from "../demo/example.js";
import { findNode } from "@bipesend/web-builder-core";
import type { WebDocument } from "@bipesend/contracts/web";

test("edits content, applies responsive overrides, restores inheritance and supports undo/redo", async () => {
  const user = userEvent.setup();
  let latest: WebDocument = exampleDocument;
  render(<DocumentEditor initialDocument={exampleDocument} onDocumentChange={(doc) => { latest = doc; }} />);
  await user.click(screen.getByRole("button", { name: "Adicionar título" }));
  const id = latest.root.children.at(-1)!.id;
  await user.clear(screen.getByLabelText("Texto do título"));
  await user.type(screen.getByLabelText("Texto do título"), "Título de teste");
  await user.click(screen.getByRole("button", { name: "Aplicar conteúdo" }));
  await waitFor(() => expect(findNode(latest, id)!.props).toMatchObject({ text: "Título de teste" }));
  await user.type(screen.getByLabelText("Tamanho do texto (px)"), "42");
  await user.click(screen.getByRole("button", { name: "Aplicar estilo" }));
  expect(findNode(latest, id)!.styles).toEqual({ base: {}, desktop: { fontSize: 42 } });
  await user.click(screen.getByRole("radio", { name: "Mobile" }));
  expect(screen.getByLabelText("Tamanho do texto (px)")).toHaveValue(null);
  await user.type(screen.getByLabelText("Tamanho do texto (px)"), "18");
  await user.click(screen.getByRole("button", { name: "Aplicar estilo" }));
  await user.click(screen.getByRole("radio", { name: "Desktop" }));
  expect(screen.getByLabelText("Tamanho do texto (px)")).toHaveValue(42);
  await user.click(screen.getByRole("button", { name: "Restaurar herança" }));
  expect(findNode(latest, id)!.styles).toEqual({ base: { fontSize: 18 } });
  await user.click(screen.getByRole("button", { name: "Desfazer", exact: true }));
  expect(findNode(latest, id)!.styles.desktop?.fontSize).toBe(42);
  await user.click(screen.getByRole("button", { name: "Refazer", exact: true }));
  expect(findNode(latest, id)!.styles.desktop).toBeUndefined();
  expect(latest.root.children.filter((node) => node.id === id)).toHaveLength(1);
});

test("invalid link stays in its labelled field, does not change document or weaken preview", async () => {
  const user = userEvent.setup();
  let latest: WebDocument = exampleDocument;
  render(<DocumentEditor initialDocument={exampleDocument} onDocumentChange={(doc) => { latest = doc; }} />);
  await user.click(screen.getByRole("button", { name: "Adicionar botão" }));
  const before = JSON.stringify(latest);
  const field = screen.getByLabelText("Destino do botão");
  await user.clear(field);
  await user.type(field, "javascript:alert(1)");
  await user.click(screen.getByRole("button", { name: "Aplicar conteúdo" }));
  expect(field).toHaveAttribute("aria-invalid", "true");
  expect(field).toHaveAccessibleDescription("Use um caminho local, âncora ou endereço HTTPS válido.");
  expect(JSON.stringify(latest)).toBe(before);
  const frame = screen.getByTitle("Prévia da página — Desktop");
  expect(frame).toHaveAttribute("sandbox", "");
  expect(frame).toHaveAttribute("referrerpolicy", "no-referrer");
  expect(frame.getAttribute("srcdoc")).not.toContain("javascript:");
});

test("resizes the desktop panel with the keyboard and restores its default width", async () => {
  const user = userEvent.setup();
  render(<DocumentEditor initialDocument={exampleDocument} />);
  const separator = screen.getByRole("separator", { name: "Redimensionar painel de elementos" });
  expect(separator).toHaveAttribute("aria-valuenow", "312");
  await user.click(separator);
  await user.keyboard("{ArrowRight}{ArrowRight}");
  expect(separator).toHaveAttribute("aria-valuenow", "344");
  expect(separator).toHaveAttribute("aria-valuetext", "344 pixels");
  await user.keyboard("{End}{ArrowRight}");
  expect(separator).toHaveAttribute("aria-valuenow", "520");
  await user.keyboard("{Home}");
  expect(separator).toHaveAttribute("aria-valuenow", "312");
});

test("resizes the desktop panel with a primary pointer and clamps the width", () => {
  render(<DocumentEditor initialDocument={exampleDocument} />);
  const separator = screen.getByRole("separator", { name: "Redimensionar painel de elementos" });
  Object.defineProperty(separator, "setPointerCapture", { value: () => undefined });
  Object.defineProperty(separator, "releasePointerCapture", { value: () => undefined });
  fireEvent.pointerDown(separator, { pointerId: 7, isPrimary: true, button: 0, clientX: 312 });
  fireEvent.pointerMove(separator, { pointerId: 7, isPrimary: true, clientX: 430 });
  expect(separator).toHaveAttribute("aria-valuenow", "430");
  fireEvent.pointerMove(separator, { pointerId: 7, isPrimary: true, clientX: 900 });
  expect(separator).toHaveAttribute("aria-valuenow", "520");
  fireEvent.pointerUp(separator, { pointerId: 7, isPrimary: true, clientX: 900 });
  fireEvent.pointerMove(separator, { pointerId: 7, isPrimary: true, clientX: 256 });
  expect(separator).toHaveAttribute("aria-valuenow", "520");
});
