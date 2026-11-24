import Fuse from "fuse.js";

const KEYS = [
  { name: "title", weight: 3 },
  { name: "keywords", weight: 2 },
  { name: "summary", weight: 1 },
];

export function buildSearchIndex(lessons) {
  const records = lessons.flatMap((lesson) =>
    Object.values(lesson.text).map((text) => ({ slug: lesson.slug, title: text.title, summary: text.summary, keywords: [...lesson.tags, ...lesson.keywords, ...(text.keywords ?? [])] })),
  );
  return new Fuse(records, { keys: KEYS, threshold: 0.38, ignoreLocation: true, includeScore: true });
}

export function searchLessons(index, lessons, query) {
  const trimmed = query.trim();
  if (!trimmed) return lessons;
  const best = new Map();
  for (const { item, score } of index.search(trimmed)) if (!best.has(item.slug) || score < best.get(item.slug)) best.set(item.slug, score);
  return [...best.entries()].sort((a, b) => a[1] - b[1]).map(([slug]) => lessons.find((lesson) => lesson.slug === slug));
}
