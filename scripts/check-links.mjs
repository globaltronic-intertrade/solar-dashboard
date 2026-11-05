// Fails when any page references a local file (src/href/poster/url()) that does not exist.
// Keeps the static demo hub free of broken images, videos, fonts and links.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";

const IGNORE_DIRS = new Set([".git", "node_modules", ".claude", ".github"]);
const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (IGNORE_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".html") || p.endsWith(".css")) pages.push(p);
  }
})(".");

const REF = /(?:src|href|poster)="([^"]+)"|url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
const SKIP = /^(?:[a-z]+:|\/\/|#|\/api\/)/i;
let missing = 0;
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const m of html.matchAll(REF)) {
    const ref = (m[1] ?? m[2]).trim();
    if (!ref || SKIP.test(ref) || ref.includes("${")) continue;
    let target = decodeURIComponent(ref.split(/[?#]/)[0]);
    target = join(dirname(page), target);
    if (target.endsWith("/") || (existsSync(target) && statSync(target).isDirectory()))
      target = join(target, "index.html");
    if (!existsSync(target)) {
      console.error(`MISSING  ${page} -> ${ref}`);
      missing++;
    }
  }
}
if (missing) {
  console.error(`\n${missing} broken local reference(s).`);
  process.exit(1);
}
console.log(`check-links: ${pages.length} files, all local references resolve.`);
