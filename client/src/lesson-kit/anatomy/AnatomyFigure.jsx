import { usePreferences } from "../../hooks/usePreferences";

export function AnatomyFigure({ children, controls, footer, className = "" }) {
  const { resolvedTheme } = usePreferences();

  return (
    <div className={`iso hiiw-figure ${className}`.trim()} data-theme={resolvedTheme}>
      {children}
      {controls ? <div className="controls">{controls}</div> : null}
      {footer}
    </div>
  );
}
