const PATHS = {
  search: "M10.5 18a7.5 7.5 0 1 1 5.3-2.2L21 21",
  sun: "M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7 1.4-1.4M4.9 19.1l1.4-1.4m11.4 0 1.4 1.4M4.9 4.9l1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z",
  monitor: "M3 5h18v11H3zM8 20h8m-4-4v4",
  settings: "M4 7h10m4 0h2M4 17h4m4 0h8M14 4v6m-6 4v6",
  back: "M15 5l-7 7 7 7",
  play: "M7 5v14l12-7z",
  pause: "M8 5v14m8-14v14",
};

export function Icon({ name, size = 18, className, title }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}
