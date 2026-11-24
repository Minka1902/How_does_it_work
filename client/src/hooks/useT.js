import { useCallback } from "react";
import { translate } from "../i18n";
import { usePreferences } from "./usePreferences";

export function useT() {
  const { language } = usePreferences();
  return useCallback((key, vars) => translate(language, key, vars), [language]);
}
