import { usePreferences } from "../hooks/usePreferences";
import { useT } from "../hooks/useT";

export function LessonBadges({ lesson, stepCount }) {
  const t = useT();
  const { showBadges } = usePreferences();
  if (!showBadges) return null;

  return (
    <div className="badges">
      <span className="badge">{t(`category.${lesson.category}`)}</span>
      <span className="badge" data-tone="plain">
        {t(`difficulty.${lesson.difficulty}`)}
      </span>
      <span className="badge" data-tone="plain">
        {t("lesson.minutes", { count: lesson.readMinutes })}
      </span>
      {stepCount ? (
        <span className="badge" data-tone="plain">
          {t("lesson.steps", { count: stepCount })}
        </span>
      ) : null}
    </div>
  );
}
