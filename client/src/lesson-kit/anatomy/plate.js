import * as k from "../../anatomy/iso-kit.mjs";
import * as G from "../../anatomy/lathe.mjs";

const EPSILON = 1e-9;

const areaOf = (points) => points.reduce((sum, [x, y], index) => {
  const [nx, ny] = points[(index + 1) % points.length];
  return sum + x * ny - nx * y;
}, 0);

const pointOf = (F, s, [u, v]) => G.add3(G.add3(G.add3(F.o, G.mul3(F.a, s)), G.mul3(F.u, u)), G.mul3(F.v, v));

function facePath(points, P) {
  const flat = points.map((point) => k.iso(point, P));
  return k.pathOf(areaOf(flat) < 0 ? flat.reverse() : flat, true);
}

const edgePath = (a, b, P) => k.pathOf([k.iso(a, P), k.iso(b, P)]);

export function platePaths(F, polygon, s0, s1, P) {
  const V = G.viewOf(P);
  const ring = areaOf(polygon) > 0 ? polygon : [...polygon].reverse();
  const count = ring.length;
  const low = ring.map((point) => pointOf(F, s0, point));
  const high = ring.map((point) => pointOf(F, s1, point));
  const sides = ring.map(([u0, v0], index) => {
    const [u1, v1] = ring[(index + 1) % count];
    const along = G.add3(G.mul3(F.u, u1 - u0), G.mul3(F.v, v1 - v0));
    const normal = G.unit3(G.cross3(along, F.a));
    return { normal, seen: G.dot3(normal, V) > EPSILON, points: [low[index], low[(index + 1) % count], high[(index + 1) % count], high[index]] };
  });
  const caps = [
    { points: high, seen: G.dot3(F.a, V) > EPSILON },
    { points: low, seen: -G.dot3(F.a, V) > EPSILON },
  ];

  const fill = [];
  const shades = ["", "", "", ""];
  for (const side of sides) {
    if (!side.seen) continue;
    const d = facePath(side.points, P);
    fill.push(d);
    shades[Math.min(3, G.toneOf(side.normal, P))] += d;
  }
  const top = caps.filter((cap) => cap.seen).map((cap) => facePath(cap.points, P)).join("");
  if (top) fill.push(top);

  const crease = [];
  const outline = [];
  for (const cap of caps)
    for (let index = 0; index < count; index++) {
      const edge = edgePath(cap.points[index], cap.points[(index + 1) % count], P);
      if (cap.seen && sides[index].seen) crease.push(edge);
      else if (cap.seen !== sides[index].seen) outline.push(edge);
    }
  for (let index = 0; index < count; index++) {
    const before = sides[(index - 1 + count) % count];
    if (before.seen !== sides[index].seen) outline.push(edgePath(low[index], high[index], P));
  }

  return { fill: fill.join(""), shades, top, crease: crease.join(""), outline: outline.join(""), bevel: "" };
}

export const centreOf = (F, polygon, s0, s1) => {
  const [u, v] = polygon.reduce(([su, sv], [pu, pv]) => [su + pu / polygon.length, sv + pv / polygon.length], [0, 0]);
  return pointOf(F, (s0 + s1) / 2, [u, v]);
};
