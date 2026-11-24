import { lazy } from "react";

const SLUG = /\/lessons\/([^/]+)\//;
const LANGUAGE = /\/text\/(\w+)\.js$/;

const slugOf = (path) => path.match(SLUG)[1];
const lazyOf = (loader) => (loader ? lazy(() => loader().then((component) => ({ default: component }))) : null);

export function buildRegistry({ metas, texts, lessons, previews }) {
  const bySlug = new Map();
  for (const [path, meta] of Object.entries(metas)) {
    const slug = slugOf(path);
    if (meta.slug !== slug) throw new Error(`lessons/${slug}/meta.js has slug "${meta.slug}"`);
    bySlug.set(slug, { ...meta, text: {}, Body: lazyOf(lessons[path.replace("meta.js", "Lesson.jsx")]), Preview: lazyOf(previews[path.replace("meta.js", "Preview.jsx")]) });
  }
  for (const [path, text] of Object.entries(texts)) {
    const lesson = bySlug.get(slugOf(path));
    if (lesson) lesson.text[path.match(LANGUAGE)[1]] = text;
  }
  return [...bySlug.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug));
}

export const LESSONS = buildRegistry({
  metas: import.meta.glob("../lessons/*/meta.js", { eager: true, import: "default" }),
  texts: import.meta.glob("../lessons/*/text/*.js", { eager: true, import: "default" }),
  lessons: import.meta.glob("../lessons/*/Lesson.jsx", { import: "default" }),
  previews: import.meta.glob("../lessons/*/Preview.jsx", { import: "default" }),
});

export const lessonBySlug = (slug) => LESSONS.find((lesson) => lesson.slug === slug);

export const textOf = (lesson, language) => lesson.text[language] ?? lesson.text.en;
