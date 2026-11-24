import { useEffect, useRef } from "react";

export function useHotkey(key, handler, { meta = true } = {}) {
  const latest = useRef(handler);
  latest.current = handler;

  useEffect(() => {
    const onKey = (event) => {
      if (event.key.toLowerCase() !== key || (meta && !(event.ctrlKey || event.metaKey))) return;
      event.preventDefault();
      latest.current(event);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key, meta]);
}
