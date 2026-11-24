import { useState } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { CommandPalette } from "../components/CommandPalette";
import { SiteHeader } from "../components/SiteHeader";
import { useHotkey } from "../hooks/useHotkey";
import { useT } from "../hooks/useT";

export function Layout() {
  const t = useT();
  const [searching, setSearching] = useState(false);

  useHotkey("k", () => setSearching((open) => !open));

  return (
    <>
      <a className="skip-link" href="#main">
        {t("nav.skip")}
      </a>
      <SiteHeader onSearch={() => setSearching(true)} />
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">{t("site.name")} · {t("site.tagline")}</div>
      </footer>
      <CommandPalette open={searching} onClose={() => setSearching(false)} />
      <ScrollRestoration />
    </>
  );
}
