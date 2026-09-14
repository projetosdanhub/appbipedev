import { readFile, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, ".."),
  data = JSON.parse(await readFile(`${root}/docs/taskboard.json`, "utf8"));
const cards = data.cards,
  byId = new Map(),
  errors = [];
for (const card of cards) {
  if (!/^[A-Z]+-\d{3}$/.test(card.id) || byId.has(card.id))
    errors.push(`Invalid/duplicate ID: ${card.id}`);
  byId.set(card.id, card);
  for (const key of ["title", "objective", "owner", "milestone"])
    if (typeof card[key] !== "string" || !card[key].trim())
      errors.push(`${card.id}: missing ${key}`);
  for (const key of ["steps", "codeAreas", "tests", "acceptance"])
    if (
      !Array.isArray(card[key]) ||
      !card[key].length ||
      card[key].some((v) => typeof v !== "string" || !v.trim())
    )
      errors.push(`${card.id}: missing ${key}`);
  for (const key of ["dependencies", "evidence", "blockers"])
    if (!Array.isArray(card[key])) errors.push(`${card.id}: missing ${key}`);
  if (
    !["BACKLOG", "READY", "IN_PROGRESS", "BLOCKED", "DONE"].includes(
      card.status,
    )
  )
    errors.push(`${card.id}: invalid status`);
  if (card.status === "DONE" && (!card.evidence.length || card.blockers.length))
    errors.push(`${card.id}: DONE requires evidence and no blockers`);
  if (card.status === "BLOCKED" && !card.blockers.length)
    errors.push(`${card.id}: BLOCKED requires reason`);
  for (const path of card.evidence) {
    if (path.includes("..") || path.startsWith("/"))
      errors.push(`${card.id}: unsafe evidence path`);
    else
      try {
        await access(resolve(root, path));
      } catch {
        errors.push(`${card.id}: missing evidence ${path}`);
      }
  }
}
const visiting = new Set(),
  visited = new Set();
function visit(card, path = []) {
  if (visiting.has(card.id)) {
    errors.push(`Dependency cycle: ${[...path, card.id].join(" → ")}`);
    return;
  }
  if (visited.has(card.id)) return;
  visiting.add(card.id);
  for (const id of card.dependencies) {
    const dep = byId.get(id);
    if (!dep) errors.push(`${card.id}: unknown dependency ${id}`);
    else {
      if (["READY", "DONE"].includes(card.status) && dep.status !== "DONE")
        errors.push(
          `${card.id}: ${card.status} with dependency ${id}=${dep.status}`,
        );
      visit(dep, [...path, card.id]);
    }
  }
  visiting.delete(card.id);
  visited.add(card.id);
}
cards.forEach((c) => visit(c));
const counts = Object.fromEntries(
  ["BACKLOG", "READY", "IN_PROGRESS", "BLOCKED", "DONE"].map((status) => [
    status,
    cards.filter((c) => c.status === status).length,
  ]),
);
const lines = [
  "# Taskboard BipeSend — executável",
  "",
  `Versão ${data.version} · Revisão ${data.reviewedAt} · Base auditada \`${data.baseCommit.slice(0, 7)}\``,
  "",
  "**Fonte:** docs/taskboard.json. Não editar este Markdown diretamente; rode `pnpm taskboard:render` e `pnpm taskboard:check`.",
  "",
  `Total: ${cards.length} cards. ${Object.entries(counts)
    .map(([s, n]) => `${s}: ${n}`)
    .join(" · ")}.`,
  "",
  "DONE exige aceite integral, evidência e dependências concluídas. Código parcial não comprova integração. Áreas de código são alvos de trabalho, podendo incluir pastas a criar. “Testes” são instruções de execução; resultados realmente observados ficam nas evidências.",
  "",
  "## Próximo ciclo",
  "",
  "1. INF-001: preparar ambiente isolado com PostgreSQL/Redis/SMTP.",
  "2. AUTH-001: inventário e reconciliação do banco em clone, antes de rodar migrations.",
  "3. AUTH-004/005/014: integrar sessão/recovery/MFA com banco real.",
  "4. AUTH-002/003/006/007/008: cadastro verificado, onboarding, convites e autorização.",
  "5. AUTH-009/010/011/012/016: conectar shell ao tenant e validar as superfícies ponta a ponta.",
  "",
  "Não ativar CRM, mensageria, IA ou billing reais antes do gate AUTH-016; protótipos visuais podem ser revisados, identificados como exemplos.",
  "",
  "## Índice",
  "",
  "| ID | Estado | Tarefa | Dependências |",
  "| --- | --- | --- | --- |",
  ...cards.map(
    (c) =>
      `| [${c.id}](#${c.id.toLowerCase()}) | ${c.status} | ${c.title} | ${c.dependencies.join(", ") || "—"} |`,
  ),
  "",
  "## Execução dos cards",
  "",
];
for (const c of cards) {
  lines.push(
    `<a id="${c.id.toLowerCase()}"></a>`,
    `### ${c.id} — ${c.title}`,
    "",
    `**Estado:** ${c.status} · **Responsável:** ${c.owner} · ${c.milestone}`,
    "",
    `**Objetivo:** ${c.objective}`,
    "",
    `**Dependências:** ${c.dependencies.join(", ") || "Nenhuma."}`,
    "",
    "**Passos:**",
    "",
    ...c.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "**Áreas de código:** " +
      c.codeAreas.map((s) => "`" + s + "`").join(", ") +
      ".",
    "",
    "**Testes a executar:**",
    "",
    ...c.tests.map((s) => "- " + s),
    "",
    "**Aceite:**",
    "",
    ...c.acceptance.map((s) => "- " + s),
    "",
    "**Evidências:** " +
      (c.evidence.map((p) => `[${p}](../${p})`).join(", ") ||
        "Nenhuma execução registrada."),
    "",
    "**Bloqueios:** " +
      (c.blockers.join(" ") ||
        "Nenhum impedimento adicional registrado; respeitar dependências e estado."),
    "",
  );
}
const rendered = lines.join("\n").trimEnd() + "\n";
if (process.argv.includes("--render"))
  await writeFile(`${root}/docs/taskboard.md`, rendered);
else if ((await readFile(`${root}/docs/taskboard.md`, "utf8")) !== rendered)
  errors.push("taskboard.md is stale; run pnpm taskboard:render");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Taskboard OK: ${cards.length} cards, no dependency cycles. ${JSON.stringify(counts)}`,
);
