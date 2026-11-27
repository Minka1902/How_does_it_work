import { useCallback, useRef, useState } from "react";

const DRAG_FROM = 3;

const svgOf = (root) => root?.querySelector("svg.iso-svg");

export function toSvgPoint(root, clientX, clientY) {
  const svg = svgOf(root);
  const matrix = svg?.getScreenCTM();
  if (!matrix) return [0, 0];
  const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  return [point.x, point.y];
}

export function partCentre(root, id) {
  const node = root?.querySelector(`[data-focus="${id}"]`);
  if (!node) return null;
  const box = node.getBoundingClientRect();
  const frame = root.getBoundingClientRect();
  return [box.left + box.width / 2 - frame.left, box.top + box.height / 2 - frame.top];
}

export function usePartPointer(rootRef, handles = {}) {
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState(null);
  const drag = useRef(null);

  const partAt = (target) => target.closest?.("[data-focus]")?.dataset.focus ?? null;
  const local = (event) => {
    const frame = rootRef.current.getBoundingClientRect();
    return [event.clientX - frame.left, event.clientY - frame.top];
  };

  const onPointerDown = useCallback(
    (event) => {
      const id = partAt(event.target);
      const handle = id && handles[id];
      if (!handle?.drag) return;
      const start = toSvgPoint(rootRef.current, event.clientX, event.clientY);
      drag.current = { id, handle, start, client: [event.clientX, event.clientY], moved: false, context: handle.begin?.() };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [handles, rootRef],
  );

  const onPointerMove = useCallback(
    (event) => {
      const active = drag.current;
      if (active) {
        if (!active.moved && Math.hypot(event.clientX - active.client[0], event.clientY - active.client[1]) < DRAG_FROM) return;
        active.moved = true;
        const point = toSvgPoint(rootRef.current, event.clientX, event.clientY);
        active.handle.drag({ dx: point[0] - active.start[0], dy: point[1] - active.start[1], point, context: active.context });
        return;
      }
      if (event.pointerType === "mouse") setHovered(partAt(event.target));
    },
    [rootRef],
  );

  const onPointerUp = useCallback((event) => {
    const active = drag.current;
    if (!active) return;
    drag.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (active.moved) {
      active.handle.end?.();
      event.preventDefault();
    } else if (active.handle.click) active.handle.click();
    else setPinned({ id: active.id, at: local(event) });
  }, []);

  const onClick = useCallback(
    (event) => {
      const id = partAt(event.target);
      if (id && handles[id]?.drag) return;
      if (id && handles[id]?.click) return handles[id].click();
      setPinned(id ? { id, at: local(event) } : null);
    },
    [handles],
  );

  const onPointerLeave = useCallback(() => setHovered(null), []);

  return { hovered, setHovered, pinned, setPinned, bind: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onClick, onPointerLeave } };
}
