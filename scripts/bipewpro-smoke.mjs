import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import assert from "node:assert/strict";
const root = resolve(import.meta.dirname, "..");
const requireEditor = createRequire(`${root}/packages/web-builder/package.json`);
const requireE2e = createRequire(`${root}/apps/e2e-tests/package.json`);
const requireUi = createRequire(`${root}/packages/ui/package.json`);
const { chromium, expect } = requireE2e("@playwright/test");
const { default: AxeBuilder } = requireUi("@axe-core/playwright");
const port = process.env.BIPEWPRO_SMOKE_PORT || "3111";
const origin = `http://127.0.0.1:${port}`;
const output = resolve(root, "test-results/bipewpro");
await mkdir(output, { recursive: true });
const server = spawn(process.execPath, [resolve(dirname(requireEditor.resolve("vite/package.json")), "bin/vite.js"), "--config", "vite.config.ts", "--port", port], { cwd: `${root}/packages/web-builder`, stdio: ["ignore", "pipe", "pipe"] });
let logs = "";
for (const stream of [server.stdout, server.stderr]) stream.on("data", (value) => { logs = (logs + value.toString()).slice(-8000); });
const report = { date: new Date().toISOString(), scope: "Development gallery only; no persistence, tenant API, publication or production Lighthouse", browser: "", checks: [], failures: [] };
let browser;
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await new Promise((done) => setTimeout(done, 250));
  }
  if (!ready) throw Error(`Preview server unavailable: ${logs}`);
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-zygote"] } : {}) });
  report.browser = browser.version();
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("pageerror", (error) => report.failures.push({ type: "runtime", message: error.message }));
  for (const width of [320, 360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(origin);
    await expect(page.getByRole("radio", { name: "Desktop", exact: true })).toBeVisible();
    for (const theme of ["light", "dark"]) {
      if (theme === "dark") await page.getByRole("button", { name: "Tema escuro", exact: true }).click();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).exclude("iframe").analyze();
      report.checks.push({ scope: "editor chrome", width, theme, overflow, violations: violations.length });
      if (overflow || violations.length) report.failures.push({ width, theme, overflow, violations: violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })) })) });
      if (width === 360 || width === 1440) await page.screenshot({ path: `${output}/editor-${width}-${theme}.png`, fullPage: true });
      if (width < 768) {
        const trigger = page.getByRole("button", { name: "Elementos e ajustes", exact: true });
        await trigger.click();
        await expect(page.getByRole("dialog")).toBeVisible();
        const { violations: panelViolations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
        report.checks.push({ scope: "mobile dialog", width, theme, violations: panelViolations.length });
        if (panelViolations.length) report.failures.push({ width, theme, panelViolations: panelViolations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })) });
        if (width === 360) await page.screenshot({ path: `${output}/panel-${width}-${theme}.png`, fullPage: true });
        await page.keyboard.press("Escape");
        await expect(trigger).toBeFocused();
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin);
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("#titulo")).toHaveCSS("font-size", "64px");
  await page.getByRole("radio", { name: "Mobile", exact: true }).check();
  await expect(frame.locator("#titulo")).toHaveCSS("font-size", "36px");
  assert.equal(await frame.locator("body").evaluate(() => innerWidth), 390);
  assert.equal(await frame.locator("#titulo").count(), 1);
  assert.equal(await page.locator("iframe").getAttribute("sandbox"), "");
  assert.equal(await page.evaluate(() => { try { void document.querySelector("iframe").contentWindow.document; return false; } catch { return true; } }), true);
  assert.equal(await frame.locator("a[href],script,img,form").count(), 0);
  report.checks.push({ interaction: "real iframe viewport, responsive CSS, single tree, opaque origin and inactive links", passed: true });
  await page.getByRole("button", { name: "Camadas", exact: true }).click();
  await page.getByRole("button", { name: "Sua próxima grande ideia começa aqui.", exact: true }).click();
  await page.getByLabel("Texto do título", { exact: true }).fill("Edição validada no navegador");
  await page.getByRole("button", { name: "Aplicar conteúdo", exact: true }).click();
  await expect(frame.locator("#titulo")).toHaveText("Edição validada no navegador");
  await page.getByRole("button", { name: "Desfazer", exact: true }).click();
  await expect(frame.locator("#titulo")).toHaveText("Sua próxima grande ideia começa aqui.");
  await page.getByRole("button", { name: "Refazer", exact: true }).click();
  await expect(frame.locator("#titulo")).toHaveText("Edição validada no navegador");
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Baixar rascunho", exact: true }).click();
  const download = await downloading;
  await download.saveAs(`${output}/draft.json`);
  const draft = JSON.parse(await readFile(`${output}/draft.json`, "utf8"));
  assert.ok(JSON.stringify(draft).includes("Edição validada no navegador"));
  assert.equal(draft.schemaVersion, 1);
  report.checks.push({ interaction: "edit, undo, redo and JSON download", passed: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await page.getByRole("button", { name: "Desfazer", exact: true }).evaluate((node) => getComputedStyle(node).transitionDuration), "0s");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
  report.checks.push({ interaction: "reduced motion and 200% root text scale (not browser zoom certification)", passed: true });
  await context.close();
} catch (error) { report.failures.push({ type: "runner", message: error.message }); }
finally { await browser?.close(); server.kill("SIGTERM"); await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2) + "\n"); }
console.log(JSON.stringify(report, null, 2));
if (report.failures.length) process.exitCode = 1;
