import { useEffect, useRef, useState } from "react";
import { useLoop } from "../../anatomy/react/live";
import { createSprings, sharesOf, stepSprings, toggleSprings } from "./explode.js";

const NONE = { order: [], shifts: {}, spring: null };

function place(root, explode, shares) {
  for (const node of root.querySelectorAll("[data-piece]")) {
    const share = shares[node.dataset.piece] ?? 0;
    const shift = explode.shifts[node.dataset.piece];
    if (!shift || share === 0) node.removeAttribute("transform");
    else node.setAttribute("transform", `translate(${(shift[0] * share).toFixed(2)} ${(shift[1] * share).toFixed(2)})`);
  }
  const scene = root.querySelector("[data-scene]");
  if (!scene) return;
  const nodes = [...scene.children];
  const keyOf = (node) => Number(node.dataset.key) + Number(node.dataset.lift ?? 0) * (shares[node.dataset.piece] ?? 0);
  const sorted = nodes.map((node, index) => ({ node, index, key: keyOf(node), order: Number(node.dataset.item) })).sort((a, b) => a.key - b.key || a.order - b.order);
  if (sorted.every((entry, index) => entry.index === index)) return;
  const fragment = document.createDocumentFragment();
  for (const { node } of sorted) fragment.appendChild(node);
  scene.appendChild(fragment);
}

export function useExplode(rootRef, explode = NONE, apart = false, calm = false) {
  const state = useRef(createSprings(explode.order));
  const [moving, setMoving] = useState(false);
  const [assembled, setAssembled] = useState(true);

  useLoop((dt) => {
    const settled = stepSprings(state.current, dt, explode.spring, calm);
    const shares = sharesOf(state.current);
    if (rootRef.current) place(rootRef.current, explode, shares);
    if (settled) {
      setMoving(false);
      setAssembled(Object.values(shares).every((share) => share === 0));
    }
    return !settled;
  }, moving);

  useEffect(() => {
    if (!explode.order.length) return;
    toggleSprings(state.current, explode.order, apart, explode.spring);
    if (apart) setAssembled(false);
    setMoving(true);
  }, [apart, explode]);

  return { assembled, moving };
}
