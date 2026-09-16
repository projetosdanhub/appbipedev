import { z } from "zod";
import { boundedWebJsonSchema, WEB_DOCUMENT_LIMITS } from "./bounds.js";

export const WEB_BREAKPOINTS = Object.freeze({ base: 0, tablet: 768, desktop: 1024 });
export const webBreakpointSchema = z.enum(["base", "tablet", "desktop"]);
export const webNodeIdSchema = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/);
export const webColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use uma cor hexadecimal, como #075fd8.");
export const webLengthSchema = z.discriminatedUnion("unit", [
  z.strictObject({ value: z.number().int().min(0).max(160), unit: z.literal("px") }),
  z.strictObject({ value: z.number().min(0).max(10), unit: z.literal("rem") }),
  z.strictObject({ value: z.number().min(0).max(100), unit: z.literal("%") }),
]);
const webSpacingSchema = z.union([z.number().int().min(0).max(160), webLengthSchema]);
export const webLinkSchema = z.string().min(1).max(2048).refine((value) => {
  if (/[\u0000-\u0020\u007f\\]/.test(value)) return false;
  if (/^#[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(value)) return true;
  try {
    const url = new URL(value, "https://bipewpro.invalid");
    if (value.startsWith("/") && !value.startsWith("//")) return url.origin === "https://bipewpro.invalid";
    return value.startsWith("https://") && url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
}, "Use um caminho local, âncora ou endereço HTTPS sem credenciais.");

export const webStyleValuesSchema = z.strictObject({
  display: z.enum(["flex", "grid"]).optional(),
  direction: z.enum(["row", "column"]).optional(),
  align: z.enum(["start", "center", "end", "stretch"]).optional(),
  justify: z.enum(["start", "center", "end", "space-between"]).optional(),
  columns: z.number().int().min(1).max(6).optional(),
  gap: webSpacingSchema.optional(),
  padding: webSpacingSchema.optional(),
  paddingTop: webLengthSchema.optional(),
  paddingRight: webLengthSchema.optional(),
  paddingBottom: webLengthSchema.optional(),
  paddingLeft: webLengthSchema.optional(),
  maxWidth: z.number().int().min(240).max(1920).optional(),
  fontSize: z.number().int().min(12).max(120).optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  color: webColorSchema.optional(),
  background: webColorSchema.optional(),
  radius: z.number().int().min(0).max(80).optional(),
});
export const webResponsiveStylesSchema = z.strictObject({
  base: webStyleValuesSchema,
  tablet: webStyleValuesSchema.optional(),
  desktop: webStyleValuesSchema.optional(),
});
const common = { id: webNodeIdSchema, version: z.literal(1), styles: webResponsiveStylesSchema };
const leafChildren = z.array(z.never()).max(0);
export const headingNodeSchema = z.strictObject({
  ...common, type: z.literal("heading"), children: leafChildren,
  props: z.strictObject({ text: z.string().min(1).max(2000), level: z.number().int().min(1).max(6) }),
});
export const textNodeSchema = z.strictObject({
  ...common, type: z.literal("text"), children: leafChildren,
  props: z.strictObject({ text: z.string().min(1).max(20000) }),
});
export const buttonNodeSchema = z.strictObject({
  ...common, type: z.literal("button"), children: leafChildren,
  props: z.strictObject({ label: z.string().min(1).max(120), href: webLinkSchema }),
});
export const containerPropsSchema = z.strictObject({
  tag: z.enum(["div", "section", "header", "footer"]),
  label: z.string().min(1).max(80),
});
export type WebStyles = z.infer<typeof webStyleValuesSchema>;
export type WebResponsiveStyles = z.infer<typeof webResponsiveStylesSchema>;
export type WebBreakpoint = z.infer<typeof webBreakpointSchema>;
export type WebLeafNode = z.infer<typeof headingNodeSchema> | z.infer<typeof textNodeSchema> | z.infer<typeof buttonNodeSchema>;
export type WebContainerNode = {
  id: string; version: 1; type: "container"; props: z.infer<typeof containerPropsSchema>;
  styles: WebResponsiveStyles; children: WebNode[];
};
export type WebNode = WebContainerNode | WebLeafNode;

const nodeSchema: z.ZodType<WebNode> = z.lazy(() => z.discriminatedUnion("type", [
  z.strictObject({ ...common, type: z.literal("container"), props: containerPropsSchema, children: z.array(nodeSchema).max(WEB_DOCUMENT_LIMITS.maxNodes) }),
  headingNodeSchema, textNodeSchema, buttonNodeSchema,
]));

const documentV1Schema = z.strictObject({
  schemaVersion: z.literal(1),
  title: z.string().min(1).max(120),
  description: z.string().max(300),
  language: z.enum(["pt-BR", "en", "es"]),
  root: nodeSchema,
}).superRefine((document, ctx) => {
  if (document.root.type !== "container") ctx.addIssue({ code: "custom", message: "A raiz deve ser um contêiner.", path: ["root"] });
  const seen = new Set<string>();
  const pending = [{ node: document.root, depth: 1 }];
  while (pending.length) {
    const { node, depth } = pending.pop()!;
    if (seen.has(node.id) || depth > WEB_DOCUMENT_LIMITS.maxDepth || seen.size >= WEB_DOCUMENT_LIMITS.maxNodes) {
      ctx.addIssue({ code: "custom", message: "IDs repetidos ou limite de nós/profundidade excedido.", path: ["root"] });
      return;
    }
    seen.add(node.id);
    for (const child of node.children) pending.push({ node: child, depth: depth + 1 });
  }
});
export const webDocumentSchema = boundedWebJsonSchema.pipe(documentV1Schema);
export type WebDocument = z.infer<typeof webDocumentSchema>;

export function parseWebDocumentJson(json: string): WebDocument {
  if (json.length > WEB_DOCUMENT_LIMITS.maxBytes || new TextEncoder().encode(json).byteLength > WEB_DOCUMENT_LIMITS.maxBytes) {
    throw new Error("WEB_DOCUMENT_TOO_LARGE");
  }
  return webDocumentSchema.parse(JSON.parse(json));
}
