import { WEB_BREAKPOINTS, webDocumentSchema, type WebNode, type WebStyles } from "@bipesend/contracts/web";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

function length(value: unknown): string {
  if (typeof value === "number") return `${value}px`;
  if (value && typeof value === "object" && "value" in value && "unit" in value) {
    const typed = value as { value: number; unit: "px" | "rem" | "%" };
    return `${typed.value}${typed.unit}`;
  }
  throw new TypeError("Invalid validated web length");
}

function declarations(styles: WebStyles): string {
  const result: string[] = [];
  for (const [key, value] of Object.entries(styles)) {
    switch (key) {
      case "display": result.push(`display:${value}`); break;
      case "direction": result.push(`flex-direction:${value};flex-wrap:wrap`); break;
      case "align": result.push(`align-items:${value}`); break;
      case "justify": result.push(`justify-content:${value}`); break;
      case "columns": result.push(`grid-template-columns:repeat(${value},minmax(0,1fr))`); break;
      case "gap": case "padding": result.push(`${key}:${length(value)}`); break;
      case "paddingTop": result.push(`padding-top:${length(value)}`); break;
      case "paddingRight": result.push(`padding-right:${length(value)}`); break;
      case "paddingBottom": result.push(`padding-bottom:${length(value)}`); break;
      case "paddingLeft": result.push(`padding-left:${length(value)}`); break;
      case "maxWidth": result.push(`max-width:${value}px;width:100%`); break;
      case "fontSize": result.push(`font-size:${value}px`); break;
      case "textAlign": result.push(`text-align:${value}`); break;
      case "color": case "background": result.push(`${key}:${value}`); break;
      case "radius": result.push(`border-radius:${value}px`); break;
    }
  }
  return result.join(";");
}

export interface RenderedPage { html: string; css: string; nodeCount: number }

/** No editor, React, network, scripts, arbitrary CSS or HTML in the public runtime. */
export function renderPage(input: unknown, options: { preview?: boolean } = {}): RenderedPage {
  const document = webDocumentSchema.parse(input);
  const rules: Record<keyof typeof WEB_BREAKPOINTS, string[]> = { base: [], tablet: [], desktop: [] };
  let nodeCount = 0;
  function render(node: WebNode): string {
    nodeCount++;
    for (const breakpoint of ["base", "tablet", "desktop"] as const) {
      const values = node.styles[breakpoint];
      if (values && Object.keys(values).length) rules[breakpoint].push(`#${node.id}{${declarations(values)}}`);
    }
    const attrs = `id="${node.id}" class="bw-node bw-${node.type}"`;
    switch (node.type) {
      case "container": return `<${node.props.tag} ${attrs}${node.props.tag === "div" ? ' role="group"' : ""} aria-label="${escapeHtml(node.props.label)}">${node.children.map(render).join("")}</${node.props.tag}>`;
      case "heading": return `<h${node.props.level} ${attrs}>${escapeHtml(node.props.text)}</h${node.props.level}>`;
      case "text": return `<p ${attrs}>${escapeHtml(node.props.text)}</p>`;
      case "button": return options.preview
        ? `<span ${attrs}>${escapeHtml(node.props.label)}</span>`
        : `<a ${attrs} href="${escapeHtml(node.props.href)}">${escapeHtml(node.props.label)}</a>`;
    }
  }
  const html = `<main class="bw-page">${render(document.root)}</main>`;
  // Public defaults are independent of the SaaS theme and can be overridden by typed node styles.
  const base = "*{box-sizing:border-box}body{margin:0;font-family:system-ui,sans-serif;color:#0f172a;background:#ffffff}" +
    ".bw-page{line-height:1.6}.bw-page>.bw-container{min-height:100svh}.bw-node{min-width:0;overflow-wrap:anywhere}h1,h2,h3,h4,h5,h6,p{margin:0}" +
    ".bw-heading{line-height:1.2;text-wrap:balance}.bw-text{white-space:pre-wrap}.bw-button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;max-width:100%;padding:12px 24px;border-radius:14px;background:#075fd8;color:#ffffff;text-decoration:none;font-weight:600;align-self:start}" +
    "a:focus-visible{outline:3px solid currentColor;outline-offset:4px}";
  const css = base + rules.base.join("") +
    `@media(min-width:${WEB_BREAKPOINTS.tablet}px){${rules.tablet.join("")}}` +
    `@media(min-width:${WEB_BREAKPOINTS.desktop}px){${rules.desktop.join("")}}`;
  return { html, css, nodeCount };
}

/** Read-only sandbox content: links inactive, zero network resources, no admin cookies. */
export function renderPreviewDocument(input: unknown): string {
  const document = webDocumentSchema.parse(input);
  const { html, css } = renderPage(document, { preview: true });
  const csp = "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; object-src 'none'";
  return `<!doctype html><html lang="${document.language}"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(document.title)}</title><meta name="description" content="${escapeHtml(document.description)}"><style>${css}</style></head><body>${html}</body></html>`;
}
