import { createRequire, isBuiltin } from "node:module";
import { resolve, relative } from "node:path";
const requireContracts = createRequire(new URL("../packages/contracts/package.json", import.meta.url));
const ts = requireContracts("typescript");
const serverPackages = /^(?:@bipesend\/(?:auth|db|security|config|events|logger)(?:\/|$)|next(?:\/|$)|server-only$|react-dom\/server$)/;
const allowed = {
  contracts: [],
  "web-builder-core": ["contracts"],
  "web-renderer": ["contracts"],
  "web-builder-ui": ["ui"],
  "web-builder": ["contracts", "web-builder-core", "web-builder-ui", "web-renderer"],
};
const portable = new Set(["ui", ...Object.keys(allowed)]);

/** AST catches side-effect imports, exports, require and literal dynamic imports. */
export function inspectSource(path, source, root) {
  const errors = [];
  const normalized = relative(root, path).replaceAll("\\", "/");
  const packageName = normalized.split("/")[1];
  const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const imports = [];
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) imports.push(node.moduleSpecifier.text);
    if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference) && node.moduleReference.expression && ts.isStringLiteral(node.moduleReference.expression)) imports.push(node.moduleReference.expression.text);
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
      const argument = node.arguments[0];
      if (argument && ts.isStringLiteralLike(argument)) imports.push(argument.text);
      else if (portable.has(packageName)) errors.push(`Computed import forbidden: ${normalized}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  for (const specifier of imports) {
    const target = specifier.startsWith(".") ? relative(root, resolve(path, "..", specifier)).replaceAll("\\", "/") : specifier;
    if (/^(?:apps\/|@bipesend\/(?:api|tenant-web|superadmin-web|marketing-web)(?:\/|$))/.test(target)) errors.push(`Package imports app: ${normalized}`);
    const internal = /^@bipesend\/([^/]+)/.exec(specifier)?.[1] ?? /^packages\/([^/]+)/.exec(target)?.[1];
    if (allowed[packageName] && internal && internal !== packageName && !allowed[packageName].includes(internal)) errors.push(`Forbidden dependency ${internal}: ${normalized}`);
    if (portable.has(packageName) && (isBuiltin(specifier) || serverPackages.test(specifier))) errors.push(`Portable package imports server: ${normalized}`);
    if (["contracts", "web-builder-core", "web-renderer"].includes(packageName) && /^(?:react(?:-dom)?(?:\/|$)|next(?:\/|$))/.test(specifier)) errors.push(`Pure package imports framework: ${normalized}`);
    if (packageName === "web-builder-ui" && specifier.startsWith("@bipesend/ui") && specifier !== "@bipesend/ui/tokens.css") errors.push(`Builder UI must keep its own components: ${normalized}`);
  }
  if (portable.has(packageName) && /\bprocess\s*(?:\.\s*env|\[\s*["']env["']\s*\])/.test(source)) errors.push(`Portable package reads environment: ${normalized}`);
  return errors;
}

export function dependencyCycles(packages) {
  const graph = new Map(packages.map((pkg) => [pkg.name, Object.keys(pkg.dependencies ?? {})]));
  const active = new Set(), complete = new Set(), errors = [];
  function visit(name, trail) {
    if (active.has(name)) { errors.push(`Dependency cycle: ${[...trail, name].join(" -> ")}`); return; }
    if (complete.has(name) || !graph.has(name)) return;
    active.add(name);
    for (const next of graph.get(name)) visit(next, [...trail, name]);
    active.delete(name); complete.add(name);
  }
  for (const name of graph.keys()) visit(name, []);
  return errors;
}
