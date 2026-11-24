import { useState } from "react";
import { ChipGroup } from "../components/ChipGroup";
import { LessonCard } from "../components/LessonCard";
import { SearchBar } from "../components/SearchBar";
import { LESSONS } from "../lib/lessonRegistry";
import { useLessonSearch } from "../hooks/useLessonSearch";
import { useT } from "../hooks/useT";

const CATEGORIES = [...new Set(LESSONS.map((lesson) => lesson.category))];
const DIFFICULTIES = [...new Set(LESSONS.map((lesson) => lesson.difficulty))].sort();

export function Home() {
  const t = useT();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const results = useLessonSearch(query, { category, difficulty });

  return (
    <div className="container">
      <section className="hero">
        <h1>{t("site.name")}</h1>
        <p>{t("site.tagline")}</p>
        <SearchBar value={query} onChange={setQuery} placeholder={t("search.placeholder")} label={t("search.label")} />
      </section>
      <div className="filters">
        <ChipGroup label={t("filter.category")} allLabel={t("filter.all")} value={category} onChange={setCategory} options={CATEGORIES.map((value) => ({ value, label: t(`category.${value}`) }))} />
        <ChipGroup label={t("filter.difficulty")} allLabel={t("filter.all")} value={difficulty} onChange={setDifficulty} options={DIFFICULTIES.map((value) => ({ value, label: t(`difficulty.${value}`) }))} />
      </div>
      <p className="result-count" aria-live="polite">
        {t(results.length === 1 ? "search.result" : "search.results", { count: results.length })}
      </p>
      {results.length ? (
        <div className="lesson-grid">
          {results.map((lesson) => (
            <LessonCard key={lesson.slug} lesson={lesson} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{t("search.empty.title", { query })}</h2>
          <p>{t("search.empty.body")}</p>
        </div>
      )}
    </div>
  );
}
