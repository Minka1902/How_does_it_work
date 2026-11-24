import { SegmentedControl } from "../lesson-kit/controls/SegmentedControl";
import { Toggle } from "../lesson-kit/controls/Toggle";
import { usePreferences } from "../hooks/usePreferences";
import { useT } from "../hooks/useT";

export function Preferences() {
  const t = useT();
  const { theme, language, reduceMotion, showBadges, setPreference, resetPreferences } = usePreferences();

  return (
    <div className="container prefs">
      <h1>{t("prefs.title")}</h1>
      <p>{t("prefs.intro")}</p>
      <div className="pref-row">
        <span>{t("theme.label")}</span>
        <SegmentedControl
          label={t("theme.label")}
          value={theme}
          onChange={(value) => setPreference("theme", value)}
          options={["system", "light", "dark"].map((value) => ({ value, label: t(`theme.${value}`) }))}
        />
      </div>
      <div className="pref-row">
        <span>{t("language.label")}</span>
        <SegmentedControl label={t("language.label")} value={language} onChange={(value) => setPreference("language", value)} options={["en", "he"].map((value) => ({ value, label: t(`language.${value}`) }))} />
      </div>
      <div className="pref-row">
        <Toggle label={t("prefs.reduceMotion")} help={t("prefs.reduceMotion.help")} checked={reduceMotion} onChange={(value) => setPreference("reduceMotion", value)} />
      </div>
      <div className="pref-row">
        <Toggle label={t("prefs.showBadges")} help={t("prefs.showBadges.help")} checked={showBadges} onChange={(value) => setPreference("showBadges", value)} />
      </div>
      <div className="pref-row">
        <button type="button" className="pill-button" onClick={resetPreferences}>
          {t("prefs.reset")}
        </button>
      </div>
    </div>
  );
}
