import { copyFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const source = `${root}/packages/ui/assets/bipesend-logo.webp`;
for (const app of ["tenant-web", "superadmin-web"]) {
  const target = `${root}/apps/${app}/public/logo-bip-bgt-white-vertical.webp`;
  if (process.argv.includes("--check")) {
    if (!(await readFile(source)).equals(await readFile(target)))
      throw new Error(`Brand drift: ${app}`);
  } else await copyFile(source, target);
}
console.log("Brand assets synchronized");
