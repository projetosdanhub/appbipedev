import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPage, renderPreviewDocument } from "../src/index.js";

function fixture() {
  return { schemaVersion: 1, title: '<script>alert("synthetic")</script>', description: '"><img src=x onerror=alert(1)>', language: "pt-BR", root: {
    id: "root", type: "container", version: 1, props: { tag: "section", label: '" onmouseover="alert(1)' }, styles: { base: { padding: 24 }, tablet: { padding: 32 }, desktop: { padding: 48 } }, children: [
      { id: "title", type: "heading", version: 1, props: { level: 1, text: "<img src=x onerror=alert(1)>" }, styles: { base: {} }, children: [] },
      { id: "link", type: "button", version: 1, props: { label: "Saiba mais", href: 'https://example.invalid/?q=%22&safe=1' }, styles: { base: {} }, children: [] },
    ],
  } };
}
test("escapes text/attributes and compiles a single semantic responsive tree without scripts", () => {
  const result = renderPage(fixture());
  assert.equal(result.nodeCount, 3);
  assert.equal((result.html.match(/id="title"/g) ?? []).length, 1);
  assert.match(result.html, /<h1 /);
  assert.doesNotMatch(result.html, /<img|<script|<iframe/);
  assert.match(result.html, /&amp;safe=1/);
  assert.match(result.css, /@media\(min-width:768px\)/);
  assert.match(result.css, /@media\(min-width:1024px\)/);
  assert.doesNotMatch(result.css, /undefined|url\(/);
});
test("renders allowlisted spacing units and individual sides", () => {
  const document: any = fixture();
  document.root.styles.base = { padding: 24, paddingTop: { value: 1.5, unit: "rem" }, paddingRight: { value: 10, unit: "%" } };
  const result = renderPage(document);
  assert.match(result.css, /padding:24px/);
  assert.match(result.css, /padding-top:1.5rem/);
  assert.match(result.css, /padding-right:10%/);
});
test("preview blocks navigation and network and includes escaped metadata", () => {
  const html = renderPreviewDocument(fixture());
  assert.match(html, /default-src 'none'/);
  assert.match(html, /noindex,nofollow/);
  assert.doesNotMatch(html, /<script|<img|href=|onclick=/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /lang="pt-BR"/);
});
test("renderer revalidates untrusted input rather than trusting a TypeScript cast", () => {
  const document: any = fixture();
  document.root.children[1].props.href = "javascript:alert(1)";
  assert.throws(() => renderPage(document));
  const css: any = fixture(); css.root.styles.base.background = "red;position:fixed";
  assert.throws(() => renderPage(css));
});
