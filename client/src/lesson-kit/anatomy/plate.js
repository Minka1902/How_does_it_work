import * as k from "../../anatomy/iso-kit.mjs";
import * as G from "../../anatomy/lathe.mjs";

const EPSILON = 1e-9;
const OVERLAP = 1e-6;

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

const emptyLayer = () => ({ fill: [], shades: ["", "", "", ""], top: "", crease: [], outline: [], bevel: "" });

const joined = (layer) => ({ ...layer, fill: layer.fill.join(""), crease: layer.crease.join(""), outline: layer.outline.join("") });

function layersOf(ring, sides, V, F) {
  const across = [G.dot3(F.u, V), G.dot3(F.v, V)];
  const sideways = [-across[1], across[0]];
  const along = ([u, v]) => u * across[0] + v * across[1];
  const wide = ([u, v]) => u * sideways[0] + v * sideways[1];
  const count = ring.length;
  const seen = sides.map((side, index) => ({ index, side })).filter(({ side }) => side.seen);
  seen.forEach((entry) => {
    const a = ring[entry.index];
    const b = ring[(entry.index + 1) % count];
    entry.depth = (along(a) + along(b)) / 2;
    entry.span = [Math.min(wide(a), wide(b)), Math.max(wide(a), wide(b))];
  });
  seen.sort((a, b) => a.depth - b.depth);
  const layerOf = new Array(count).fill(-1);
  seen.forEach((entry, at) => {
    let layer = 0;
    for (let before = 0; before < at; before++) {
      const other = seen[before];
      if (other.span[1] > entry.span[0] + OVERLAP && entry.span[1] > other.span[0] + OVERLAP) layer = Math.max(layer, layerOf[other.index] + 1);
    }
    layerOf[entry.index] = layer;
  });
  return layerOf;
}

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

  const layerOf = layersOf(ring, sides, V, F);
  const walls = Math.max(-1, ...layerOf) + 1;
  const capLayer = caps.some((cap) => cap.seen) ? walls : walls - 1;
  const layers = Array.from({ length: capLayer + 1 }, emptyLayer);
  const whole = emptyLayer();

  sides.forEach((side, index) => {
    if (!side.seen) return;
    const d = facePath(side.points, P);
    const tone = Math.min(3, G.toneOf(side.normal, P));
    for (const target of [layers[layerOf[index]], whole]) {
      target.fill.push(d);
      target.shades[tone] += d;
    }
  });
  for (const cap of caps) {
    if (!cap.seen) continue;
    const d = facePath(cap.points, P);
    for (const target of [layers[capLayer], whole]) {
      target.fill.push(d);
      target.top += d;
    }
  }

  const put = (layer, kind, d) => {
    layers[layer][kind].push(d);
    whole[kind].push(d);
  };
  for (const cap of caps)
    for (let index = 0; index < count; index++) {
      const edge = () => edgePath(cap.points[index], cap.points[(index + 1) % count], P);
      if (cap.seen) put(capLayer, sides[index].seen ? "crease" : "outline", edge());
      else if (sides[index].seen) put(layerOf[index], "outline", edge());
    }
  for (let index = 0; index < count; index++) {
    const previous = (index - 1 + count) % count;
    if (sides[previous].seen !== sides[index].seen) put(Math.max(layerOf[previous], layerOf[index]), "outline", edgePath(low[index], high[index], P));
  }

  return { ...joined(whole), layers: layers.length > 1 ? layers.map(joined) : null };
}

export const centreOf = (F, polygon, s0, s1) => {
  const [u, v] = polygon.reduce(([su, sv], [pu, pv]) => [su + pu / polygon.length, sv + pv / polygon.length], [0, 0]);
  return pointOf(F, (s0 + s1) / 2, [u, v]);
};
