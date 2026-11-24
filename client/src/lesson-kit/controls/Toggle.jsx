import { useId } from "react";

export function Toggle({ label, checked, onChange, help, className = "toggle" }) {
  const id = useId();

  return (
    <span className={className}>
      <button id={id} type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} aria-describedby={help ? `${id}-help` : undefined} />
      <label htmlFor={id}>
        {label}
        {help ? <small id={`${id}-help`}>{help}</small> : null}
      </label>
    </span>
  );
}
