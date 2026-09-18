import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const root = resolve(import.meta.dirname, "..");
const requireE2e = createRequire(`${root}/apps/e2e-tests/package.json`),
  requireUi = createRequire(`${root}/packages/ui/package.json`),
  requireApp = createRequire(`${root}/apps/tenant-web/package.json`);
const { chromium } = requireE2e("@playwright/test"),
  { default: AxeBuilder } = requireUi("@axe-core/playwright");
const port = process.env.UI_SMOKE_PORT || "3107",
  origin = `http://127.0.0.1:${port}`;
const output = resolve(
  root,
  process.env.UI_SMOKE_OUTPUT || "test-results/foundation",
);
await mkdir(output, { recursive: true });
const server = spawn(
  process.execPath,
  [
    requireApp.resolve("next/dist/bin/next"),
    "dev",
    "-H",
    "127.0.0.1",
    "-p",
    port,
  ],
  {
    cwd: `${root}/apps/tenant-web`,
    env: {
      ...process.env,
      NODE_ENV: "development",
      NEXT_TELEMETRY_DISABLED: "1",
      AUTH_SECRET: randomBytes(32).toString("hex"),
      AUTH_TRUST_HOST: "true",
      DATABASE_URL: "postgresql://localhost:5432/smoke_unconnected",
      REDIS_URL: "redis://localhost:6379",
      NEXT_PUBLIC_APP_URL: origin,
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
server.stdout.on("data", (v) => {
  logs = (logs + v.toString()).slice(-12000);
});
server.stderr.on("data", (v) => {
  logs = (logs + v.toString()).slice(-12000);
});
const report = {
  date: new Date().toISOString(),
  scope: "Development catalogue and auth UI; no live database or identity E2E",
  browser: "",
  checks: [],
  failures: [],
};
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const r = await fetch(`${origin}/robots.txt`);
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!ready) throw new Error(`Next server unavailable: ${logs}`);
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
          args: [
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-zygote",
          ],
        }
      : {}),
  });
  report.browser = browser.version();
  const context = await browser.newContext(),
    page = await context.newPage();
  page.on("pageerror", (error) =>
    report.failures.push({ type: "runtime", message: error.message }),
  );
  for (const width of [320, 360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${origin}/design-system`, { timeout: 60000 });
    for (const tab of ["Componentes", "Dados e listas", "Estados"]) {
      await page.getByRole("tab", { name: tab, exact: true }).click();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .exclude("nextjs-portal")
        .analyze();
      report.checks.push({
        width,
        theme: "light",
        tab,
        overflow,
        violations: violations.length,
      });
      if (overflow || violations.length)
        report.failures.push({
          width,
          theme: "light",
          tab,
          overflow,
          violations: violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              summary: n.failureSummary,
            })),
          })),
        });
    }
    await page.getByRole("tab", { name: "Componentes", exact: true }).click();
    if (width === 360 || width === 1440)
      await page.screenshot({
        path: `${output}/catalogue-${width}-light.png`,
        fullPage: true,
      });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Abrir menu principal" }).click();
  assert.ok(
    await page.getByRole("navigation", { name: "Navegação principal" }).isVisible(),
  );
  await page.keyboard.press("Escape");
  assert.ok(
    await page.getByRole("button", { name: "Abrir menu principal" }).isVisible(),
  );
  report.checks.push({
    interaction: "desktop menu opens and closes with Escape",
    passed: true,
  });
  const modal = page.getByRole("button", { name: "Abrir modal", exact: true });
  await modal.click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  await assert.doesNotReject(() =>
    page.waitForFunction(
      () => document.activeElement?.textContent === "Abrir modal",
    ),
  );
  report.checks.push({
    interaction: "modal Escape and focus restored",
    passed: true,
  });
  await page
    .getByRole("button", { name: "Etapa do contato Novo contato", exact: true })
    .click();
  await page.getByRole("combobox").fill("con");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  assert.ok(
    await page
      .getByRole("button", { name: "Etapa do contato Concluído", exact: true })
      .isVisible(),
  );
  report.checks.push({
    interaction: "combobox filter and keyboard selection",
    passed: true,
  });
  await page.getByRole("tab", { name: "Dados e listas", exact: true }).click();
  await page
    .getByRole("searchbox", { name: "Pesquisar exemplos" })
    .fill("exemplo B");
  await page.waitForFunction(
    () =>
      !document.body.textContent.includes("Empresa de exemplo A") &&
      document.body.textContent.includes("Empresa de exemplo B"),
  );
  await page
    .getByRole("checkbox", { name: "Selecionar registro b", exact: true })
    .check();
  assert.ok(
    await page
      .getByText("1 registro(s) selecionado(s)", { exact: true })
      .isVisible(),
  );
  report.checks.push({
    interaction: "debounced table search and explicit selection",
    passed: true,
  });
  await page.getByRole("tab", { name: "Componentes", exact: true }).click();
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByRole("button", { name: "Mais", exact: true }).click();
  assert.ok(
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Configurações", exact: true })
      .isVisible(),
  );
  await page.keyboard.press("Escape");
  report.checks.push({
    interaction: "mobile navigation reaches full menu",
    passed: true,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.ok(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  );
  const duration = await page
    .locator(".ui-spinner")
    .first()
    .evaluate((el) => getComputedStyle(el).animationDuration);
  assert.ok(parseFloat(duration) <= 0.01);
  report.checks.push({
    interaction: "reduced motion applied to spinner",
    duration,
    passed: true,
  });
  for (const route of ["/login", "/register", "/forgot-password"]) {
    await page.goto(`${origin}${route}`, { timeout: 60000 });
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute("content");
    assert.ok(robots?.includes("noindex"));
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .exclude("nextjs-portal")
      .analyze();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    report.checks.push({
      route,
      width: 360,
      overflow,
      violations: violations.length,
      noindex: true,
    });
    if (violations.length || overflow)
      report.failures.push({
        route,
        overflow,
        violations: violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      });
  }
  await context.addCookies([
    { name: "bipesend.tenant.session-token", value: "forged", url: origin },
  ]);
  await page.goto(origin, { timeout: 60000 });
  assert.equal(new URL(page.url()).pathname, "/login");
  report.checks.push({
    security: "forged cookie rejected by server guard",
    passed: true,
  });
  await context.close();
} catch (error) {
  report.failures.push({ type: "runner", message: error.message });
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  await writeFile(
    `${output}/report.json`,
    JSON.stringify(report, null, 2) + "\n",
  );
}
console.log(JSON.stringify(report, null, 2));
if (report.failures.length) process.exitCode = 1;
