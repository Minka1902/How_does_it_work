export function BrandMark({ className = "brand-mark" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 3 28 10v12l-12 7L4 22V10z" />
      <path d="M4 10l12 7 12-7M16 17v12" />
      <circle cx="16" cy="17" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
