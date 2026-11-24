import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { textOf } from "../lib/lessonRegistry";
import { useLessonSearch } from "../hooks/useLessonSearch";
import { usePreferences } from "../hooks/usePreferences";
import { useT } from "../hooks/useT";

export function CommandPalette({ open, onClose }) {
  const t = useT();
  const navigate = useNavigate();
  const { language } = usePreferences();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const input = useRef(null);
  const results = useLessonSearch(query);

  const go = (lesson) => {
    onClose();
    navigate(`/lesson/${lesson.slug}`);
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") onClose();
    else if (event.key === "ArrowDown") setSelected((index) => Math.min(index + 1, results.length - 1));
    else if (event.key === "ArrowUp") setSelected((index) => Math.max(index - 1, 0));
    else if (event.key === "Enter" && results[selected]) go(results[selected]);
    else return;
    event.preventDefault();
  };

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelected(0);
    input.current?.focus();
  }, [open]);

  useEffect(() => setSelected(0), [query]);

  if (!open) return null;

  return (
    <div className="palette-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label={t("search.palette.title")} onKeyDown={onKeyDown}>
        <input
          ref={input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search.placeholder")}
          aria-label={t("search.label")}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-results"
          aria-activedescendant={results[selected] ? `palette-${results[selected].slug}` : undefined}
        />
        <ul id="palette-results" role="listbox">
          {results.map((lesson, index) => (
            <li key={lesson.slug} role="presentation">
              <Link id={`palette-${lesson.slug}`} role="option" aria-selected={index === selected} to={`/lesson/${lesson.slug}`} onClick={onClose} onMouseEnter={() => setSelected(index)}>
                <span>{textOf(lesson, language).title}</span>
                <small>{t(`category.${lesson.category}`)}</small>
              </Link>
            </li>
          ))}
        </ul>
        <p className="palette-hint">{results.length ? t("search.palette.hint") : t("search.empty.title", { query })}</p>
      </div>
    </div>
  );
}
