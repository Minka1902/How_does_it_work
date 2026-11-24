import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LessonBadges } from "../components/LessonBadges";
import { DEFAULT_PREFERENCES, PreferencesProvider } from "../context/PreferencesContext";
import { lessonBySlug } from "../lib/lessonRegistry";
import { Preferences } from "../pages/Preferences";

const renderWith = (ui, initial = DEFAULT_PREFERENCES) =>
  render(
    <MemoryRouter>
      <PreferencesProvider initial={initial}>{ui}</PreferencesProvider>
    </MemoryRouter>,
  );

describe("preferences", () => {
  it("switches the page to Hebrew, right to left", () => {
    renderWith(<Preferences />);
    fireEvent.click(screen.getByRole("button", { name: "עברית" }));
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("he");
    expect(screen.getByRole("heading", { name: "העדפות" })).toBeInTheDocument();
  });

  it("shows badges by default", () => {
    renderWith(<LessonBadges lesson={lessonBySlug("fridge")} />);
    expect(screen.getByText("Beginner")).toBeInTheDocument();
  });

  it("shows no badges when the preference is off", () => {
    renderWith(<LessonBadges lesson={lessonBySlug("fridge")} />, { ...DEFAULT_PREFERENCES, showBadges: false });
    expect(screen.queryByText("Beginner")).not.toBeInTheDocument();
  });

  it("applies the chosen theme to the document", () => {
    renderWith(<Preferences />, { ...DEFAULT_PREFERENCES, theme: "dark" });
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
