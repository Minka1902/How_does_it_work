import { createContext, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { LANGUAGES } from "../i18n";
import { readJson, writeJson } from "../lib/storage";

const STORAGE_KEY = "hiiw.preferences";
const DARK_QUERY = "(prefers-color-scheme: dark)";
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const DEFAULT_PREFERENCES = { theme: "system", language: "en", reduceMotion: false, showBadges: true };

export const PreferencesContext = createContext(null);

const mediaStore = (query) => ({
  subscribe: (changed) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", changed);
    return () => list.removeEventListener("change", changed);
  },
  read: () => window.matchMedia(query).matches,
});

const DARK = mediaStore(DARK_QUERY);
const MOTION = mediaStore(MOTION_QUERY);

export function PreferencesProvider({ children, initial }) {
  const [preferences, setPreferences] = useState(() => initial ?? readJson(STORAGE_KEY, DEFAULT_PREFERENCES));
  const systemDark = useSyncExternalStore(DARK.subscribe, DARK.read, () => false);
  const systemStill = useSyncExternalStore(MOTION.subscribe, MOTION.read, () => false);

  const setPreference = useCallback((name, value) => setPreferences((current) => ({ ...current, [name]: value })), []);
  const resetPreferences = useCallback(() => setPreferences(DEFAULT_PREFERENCES), []);

  const theme = preferences.theme === "system" ? (systemDark ? "dark" : "light") : preferences.theme;
  const still = preferences.reduceMotion || systemStill;
  const dir = LANGUAGES[preferences.language]?.dir ?? "ltr";

  useEffect(() => writeJson(STORAGE_KEY, preferences), [preferences]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.motion = still ? "reduce" : "full";
    root.lang = preferences.language;
    root.dir = dir;
  }, [theme, still, preferences.language, dir]);

  const value = useMemo(
    () => ({ ...preferences, resolvedTheme: theme, still, dir, setPreference, resetPreferences }),
    [preferences, theme, still, dir, setPreference, resetPreferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
