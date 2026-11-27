import * as k from "../../anatomy/iso-kit.mjs";

export function alongAxis(P, axis, dx, dy) {
  const origin = k.iso([0, 0, 0], P);
  const tip = k.iso(axis, P);
  const ex = tip[0] - origin[0];
  const ey = tip[1] - origin[1];
  return (dx * ex + dy * ey) / (ex * ex + ey * ey);
}

export function angleAround(P, centre, point) {
  const [cx, cy] = k.iso(centre, P);
  return Math.atan2(point[1] - cy, point[0] - cx);
}

export const unwrap = (angle, previous) => previous + Math.atan2(Math.sin(angle - previous), Math.cos(angle - previous));

export const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
