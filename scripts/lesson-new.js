import { cpSync, existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = join(ROOT, "lesson-template");
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const [slug, ...words] = process.argv.slice(2);
if (!slug || !SLUG.test(slug)) {
  console.error("usage: npm run lesson:new -- <kebab-slug> [Title words]");
  process.exit(1);
}

const target = join(ROOT, "client/src/lessons", slug);
if (existsSync(target)) {
  console.error(`client/src/lessons/${slug} already exists`);
  process.exit(1);
}

const title = words.join(" ") || slug.replace(/-/g, " ");
const name = slug.replace(/(^|-)(\w)/g, (match, dash, letter) => letter.toUpperCase());
const values = { __SLUG__: slug, __NAME__: name, __TITLE__: title, __DATE__: new Date().toISOString().slice(0, 10) };
const fill = (text) => text.replace(/__(SLUG|NAME|TITLE|DATE)__/g, (token) => values[token]);

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path);
    else writeFileSync(path, fill(readFileSync(path, "utf8")));
    if (entry.includes("__")) renameSync(path, join(dir, fill(entry)));
  }
}

cpSync(TEMPLATE, target, { recursive: true });
walk(target);
console.log(`created client/src/lessons/${slug}\nnext: write the figure, then run npm run lesson:audit -- ${slug} and npm run lesson:check`);
