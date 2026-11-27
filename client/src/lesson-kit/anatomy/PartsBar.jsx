import { useT } from "../../hooks/useT";

export function PartsBar({ parts, active, onHover, onPick, canExplode, apart, onToggleApart, className = "parts-bar" }) {
  const t = useT();
  const ids = Object.keys(parts ?? {});
  if (!ids.length && !canExplode) return null;

  return (
    <div className={className}>
      {canExplode ? (
        <button type="button" className="pill-button parts-apart" aria-pressed={apart} onClick={onToggleApart}>
          {apart ? t("parts.together") : t("parts.apart")}
        </button>
      ) : null}
      <span className="parts-label">{t("parts.label")}</span>
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          className="chip"
          aria-pressed={active === id}
          onMouseEnter={() => onHover(id)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(id)}
          onBlur={() => onHover(null)}
          onClick={() => onPick(id)}
        >
          {parts[id].name}
        </button>
      ))}
    </div>
  );
}
