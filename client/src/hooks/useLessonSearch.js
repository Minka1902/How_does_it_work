import { useMemo } from "react";
import { LESSONS } from "../lib/lessonRegistry";
import { buildSearchIndex, searchLessons } from "../lib/searchIndex";

const INDEX = buildSearchIndex(LESSONS);

export function useLessonSearch(query, { category = null, difficulty = null } = {}, lessons = LESSONS, index = INDEX) {
  return useMemo(
    () => searchLessons(index, lessons, query).filter((lesson) => (!category || lesson.category === category) && (!difficulty || lesson.difficulty === difficulty)),
    [index, lessons, query, category, difficulty],
  );
}
