import { Icon } from "./Icon";

export function CycleButton({ options, value, onChange, label, className = "icon-button" }) {
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const current = options[index];
  const next = options[(index + 1) % options.length];

  return (
    <button type="button" className={className} onClick={() => onChange(next.value)} aria-label={`${label}: ${current.label}`} title={`${label}: ${current.label}`}>
      {current.icon ? <Icon name={current.icon} /> : current.short ?? current.label}
    </button>
  );
}
