import { describe, expect, it } from "vitest";
import { LESSONS, lessonBySlug, textOf } from "../lib/lessonRegistry";
import { buildSearchIndex, searchLessons } from "../lib/searchIndex";

const INDEX = buildSearchIndex(LESSONS);
const top = (query) => searchLessons(INDEX, LESSONS, query)[0]?.slug;

describe("lesson registry", () => {
  it("finds every lesson folder with both languages and a lazy body", () => {
    expect(LESSONS.map((lesson) => lesson.slug).sort()).toEqual(["battery", "fridge", "gears", "lock", "m16", "motor"]);
    for (const lesson of LESSONS) {
      expect(Object.keys(lesson.text).sort()).toEqual(["en", "he"]);
      expect(lesson.Body).toBeTruthy();
      expect(lesson.Preview).toBeTruthy();
    }
  });

  it("falls back to English for a missing language", () => {
    expect(textOf(lessonBySlug("fridge"), "fr")).toBe(lessonBySlug("fridge").text.en);
  });
});

describe("search", () => {
  it.each([
    ["fridge", "fridge"],
    ["refrigerator", "fridge"],
    ["מקרר", "fridge"],
    ["battery", "battery"],
    ["סוללה", "battery"],
    ["lithium", "battery"],
    ["rifle", "m16"],
    ["m16", "m16"],
  ])("ranks %s first as %s", (query, slug) => expect(top(query)).toBe(slug));

  it("returns every lesson for an empty query and nothing for nonsense", () => {
    expect(searchLessons(INDEX, LESSONS, "  ")).toHaveLength(LESSONS.length);
    expect(searchLessons(INDEX, LESSONS, "zzqxj")).toHaveLength(0);
  });
});
