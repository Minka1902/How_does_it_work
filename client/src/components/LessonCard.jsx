import { Link } from "react-router-dom";
import { textOf } from "../lib/lessonRegistry";
import { usePreferences } from "../hooks/usePreferences";
import { LessonBadges } from "./LessonBadges";
import { LessonPreview } from "./LessonPreview";

export function LessonCard({ lesson, showPreview = true }) {
  const { language } = usePreferences();
  const text = textOf(lesson, language);

  return (
    <Link to={`/lesson/${lesson.slug}`} className="lesson-card">
      {showPreview ? <LessonPreview lesson={lesson} /> : null}
      <div className="lesson-card-body">
        <LessonBadges lesson={lesson} />
        <h2>{text.title}</h2>
        <p>{text.summary}</p>
      </div>
    </Link>
  );
}
