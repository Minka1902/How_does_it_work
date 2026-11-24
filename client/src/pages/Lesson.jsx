import { Suspense, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { LessonBadges } from "../components/LessonBadges";
import { lessonBySlug, textOf } from "../lib/lessonRegistry";
import { usePreferences } from "../hooks/usePreferences";
import { useT } from "../hooks/useT";
import { NotFound } from "./NotFound";

export function Lesson() {
  const t = useT();
  const { slug } = useParams();
  const { language } = usePreferences();
  const lesson = lessonBySlug(slug);
  const text = lesson ? textOf(lesson, language) : null;

  useEffect(() => {
    if (text) document.title = `${text.title} · ${t("site.name")}`;
  }, [text, t]);

  if (!lesson) return <NotFound />;

  return (
    <article className="container">
      <header className="lesson-header">
        <Link to="/" className="back-link">
          <Icon name="back" />
          {t("lesson.back")}
        </Link>
        <h1>{text.title}</h1>
        <p>{text.summary}</p>
        <LessonBadges lesson={lesson} stepCount={text.steps.length} />
        {lesson.text[language] ? null : <p className="notice">{t("lesson.missingLanguage")}</p>}
      </header>
      <Suspense fallback={<p>{t("lesson.loading")}</p>}>
        <lesson.Body text={text} />
      </Suspense>
    </article>
  );
}
