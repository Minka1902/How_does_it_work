import { Icon } from "../../components/Icon";
import { useT } from "../../hooks/useT";

export function PlayPause({ playing, onChange, className = "icon-button" }) {
  const t = useT();
  const label = playing ? t("control.pause") : t("control.play");

  return (
    <button type="button" className={className} onClick={() => onChange(!playing)} aria-label={label} title={label}>
      <Icon name={playing ? "pause" : "play"} />
    </button>
  );
}
