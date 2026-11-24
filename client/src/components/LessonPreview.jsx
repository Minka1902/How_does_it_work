import { Suspense, useRef } from "react";
import { useInView } from "../anatomy/react/live";

export function LessonPreview({ lesson, className = "lesson-card-preview" }) {
  const box = useRef(null);
  const seen = useInView(box);

  return (
    <div ref={box} className={className} aria-hidden="true">
      {lesson.Preview && seen ? (
        <Suspense fallback={null}>
          <lesson.Preview />
        </Suspense>
      ) : null}
    </div>
  );
}
