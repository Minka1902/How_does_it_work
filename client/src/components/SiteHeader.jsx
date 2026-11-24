import { Link } from "react-router-dom";
import { usePreferences } from "../hooks/usePreferences";
import { useT } from "../hooks/useT";
import { BrandMark } from "./BrandMark";
import { CycleButton } from "./CycleButton";
import { Icon } from "./Icon";

export function SiteHeader({ onSearch }) {
  const t = useT();
  const { theme, language, setPreference } = usePreferences();

  const themes = [
    { value: "system", label: t("theme.system"), icon: "monitor" },
    { value: "light", label: t("theme.light"), icon: "sun" },
    { value: "dark", label: t("theme.dark"), icon: "moon" },
  ];
  const languages = [
    { value: "en", label: t("language.en"), short: "EN" },
    { value: "he", label: t("language.he"), short: "עב" },
  ];

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link to="/" className="brand">
          <BrandMark />
          {t("site.name")}
        </Link>
        <button type="button" className="pill-button" onClick={onSearch} aria-label={t("search.open")} aria-keyshortcuts="Control+K Meta+K">
          <Icon name="search" />
          <span className="label">{t("search.open")}</span>
          <span className="kbd">{t("search.shortcut")}</span>
        </button>
        <CycleButton options={themes} value={theme} onChange={(value) => setPreference("theme", value)} label={t("theme.label")} />
        <CycleButton options={languages} value={language} onChange={(value) => setPreference("language", value)} label={t("language.label")} />
        <Link to="/preferences" className="icon-button" aria-label={t("nav.preferences")} title={t("nav.preferences")}>
          <Icon name="settings" />
        </Link>
      </div>
    </header>
  );
}
