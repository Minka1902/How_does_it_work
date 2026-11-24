export function SegmentedControl({ label, options, value, onChange, className = "control" }) {
  return (
    <span className={className}>
      {label ? <span className="control-label">{label}</span> : null}
      <span className="segmented" role="group" aria-label={label}>
        {options.map((option) => (
          <button key={option.value} type="button" aria-pressed={option.value === value} onClick={() => onChange(option.value)}>
            {option.label}
          </button>
        ))}
      </span>
    </span>
  );
}
