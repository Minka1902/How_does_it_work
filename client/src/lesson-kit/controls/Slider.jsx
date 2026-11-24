import { useId } from "react";
import { isolate } from "../format";

export function Slider({ label, value, min, max, step = 1, onChange, format = String, className = "control" }) {
  const id = useId();

  return (
    <span className={className}>
      <label className="control-label" htmlFor={id}>
        {label}
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} aria-valuetext={format(value)} />
      <output className="control-value" htmlFor={id}>
        {isolate(format(value))}
      </output>
    </span>
  );
}
