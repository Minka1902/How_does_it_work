import { useT } from "../../hooks/useT";

const WIDTH = 240;

export function PartTip({ part, at, bounds, pinned, onGo, onClose, className = "part-tip" }) {
  const t = useT();
  if (!part || !at) return null;
  const left = Math.max(8, Math.min(at[0] + 14, bounds[0] - WIDTH - 8));
  const top = Math.max(8, Math.min(at[1] + 14, bounds[1] - 120));

  return (
    <div className={className} data-pinned={pinned ? "" : undefined} style={{ left, top, width: WIDTH }} role={pinned ? "dialog" : "tooltip"} aria-label={part.name}>
      <strong>{part.name}</strong>
      <p>{part.body}</p>
      {pinned ? (
        <div className="part-tip-actions">
          {part.step && onGo ? (
            <button type="button" className="pill-button" onClick={() => onGo(part.step)}>
              {t("parts.go")}
            </button>
          ) : null}
          <button type="button" className="pill-button" onClick={onClose}>
            {t("parts.close")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
