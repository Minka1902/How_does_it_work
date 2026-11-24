import { useEffect, useRef, useState } from "react";

const BAND = "-45% 0px -45% 0px";

export function useActiveStep(ids) {
  const [active, setActive] = useState(ids[0]);
  const nodes = useRef(new Map());

  const register = (id) => (node) => {
    if (node) nodes.current.set(id, node);
    else nodes.current.delete(id);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((entry) => entry.isIntersecting).at(-1);
        if (hit) setActive(hit.target.dataset.step);
      },
      { rootMargin: BAND },
    );
    for (const node of nodes.current.values()) observer.observe(node);
    return () => observer.disconnect();
  }, [ids]);

  return { active, setActive, register };
}
