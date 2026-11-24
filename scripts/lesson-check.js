import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import en from "../client/src/i18n/en.js";
import { signatureOf } from "../client/src/lesson-kit/anatomy/order.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LESSONS = join(ROOT, "client/src/lessons");
const CATEGORIES = Object.keys(en).filter((key) => key.startsWith("category.")).map((key) => key.slice(9));
const REQUIRED_FILES = ["meta.js", "Lesson.jsx", "Preview.jsx", "text/en.js", "figure/geometry.js", "figure/order.js"];
const META_KEYS = ["slug", "category", "tags", "keywords", "difficulty", "readMinutes", "languages", "publishedAt"];

const load = async (path) => (await import(pathToFileURL(path).href)).default;

async function checkLesson(slug) {
  const dir = join(LESSONS, slug);
  const problems = REQUIRED_FILES.filter((file) => !existsSync(join(dir, file))).map((file) => `missing ${file}`);
  if (problems.length) return problems;

  const meta = await load(join(dir, "meta.js"));
  for (const key of META_KEYS) if (meta[key] === undefined) problems.push(`meta.${key} is missing`);
  if (meta.slug !== slug) problems.push(`meta.slug "${meta.slug}" doesn't match the folder`);
  if (!CATEGORIES.includes(meta.category)) problems.push(`meta.category "${meta.category}" isn't one of ${CATEGORIES.join(", ")}`);
  if (![1, 2, 3].includes(meta.difficulty)) problems.push("meta.difficulty must be 1, 2 or 3");

  const base = await load(join(dir, "text/en.js"));
  const ids = base.steps.map((step) => step.id);
  if (new Set(ids).size !== ids.length) problems.push("text/en.js has duplicate step ids");
  for (const language of meta.languages) {
    const file = join(dir, `text/${language}.js`);
    if (!existsSync(file)) {
      problems.push(`meta.languages lists ${language} but text/${language}.js is missing`);
      continue;
    }
    const text = await load(file);
    for (const key of ["title", "summary", "steps", "figure"]) if (!text[key]) problems.push(`text/${language}.js has no ${key}`);
    const other = (text.steps ?? []).map((step) => step.id).join(",");
    if (other !== ids.join(",")) problems.push(`text/${language}.js step ids (${other}) differ from en (${ids.join(",")})`);
  }

  const { SCENE } = await import(pathToFileURL(join(dir, "figure/geometry.js")).href);
  const order = await load(join(dir, "figure/order.js"));
  if (!order || order.signature !== signatureOf(SCENE.items)) problems.push(`figure/order.js is stale: run npm run lesson:audit -- ${slug}`);
  return problems;
}

let failed = 0;
for (const slug of readdirSync(LESSONS)) {
  const problems = await checkLesson(slug);
  console.log(problems.length ? `✗ ${slug}\n  ${problems.join("\n  ")}` : `✓ ${slug}`);
  failed += problems.length;
}
process.exitCode = failed ? 1 : 0;
