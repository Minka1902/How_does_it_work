import { Icon } from "./Icon";

export function SearchBar({ value, onChange, placeholder, label, autoFocus = false, className = "search-bar" }) {
  return (
    <div className={className} role="search">
      <Icon name="search" />
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={label} autoFocus={autoFocus} />
    </div>
  );
}
