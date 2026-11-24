export function ChipGroup({ label, options, value, onChange, allLabel }) {
  return (
    <div className="chip-row" role="group" aria-label={label}>
      <span className="chip-row-label">{label}</span>
      {allLabel ? (
        <button type="button" className="chip" aria-pressed={value === null} onClick={() => onChange(null)}>
          {allLabel}
        </button>
      ) : null}
      {options.map((option) => (
        <button key={option.value} type="button" className="chip" aria-pressed={value === option.value} onClick={() => onChange(value === option.value ? null : option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}
