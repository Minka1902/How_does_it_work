import en from "./en";
import he from "./he";

export const LANGUAGES = { en: { dir: "ltr" }, he: { dir: "rtl" } };
export const DICTIONARIES = { en, he };
export const FALLBACK = "en";

export function translate(language, key, vars) {
  const text = DICTIONARIES[language]?.[key] ?? DICTIONARIES[FALLBACK][key] ?? key;
  return vars ? text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match)) : text;
}
