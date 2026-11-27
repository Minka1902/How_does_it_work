import { COGS, RING } from "./model.js";

export const PITCH = 3.175;
export const LINKS = 92;
export const SPACING = 2.2;
export const AXLE = [0, 48];
export const SPINDLE = [72, 44];
export const CRANK = 26;
export const CAGE = 16;
export const ROLLER = 0.95;
export const JOCKEY = 11;

const GAP = 1.2;
const TAU = 2 * Math.PI;
const MIDDLE = (COGS.length - 1) / 2;
const CAGE_RANGE = [-0.8, 1.8];
const SOLVE_STEPS = 40;

export const pitchRadius = (teeth) => PITCH / (2 * Math.sin(Math.PI / teeth));
export const RING_R = pitchRadius(RING);
export const JOCKEY_R = pitchRadius(JOCKEY);

const wrap = (value, period) => ((value % period) + period) % period;
const perRadian = (r) => (PITCH * Math.PI) / (TAU * Math.asin(PITCH / (2 * r)));
const angleOf = (centre, point) => Math.atan2(point[1] - centre[1], point[0] - centre[0]);
const lerp = (a, b, t) => a + (b - a) * t;

export const cogY = (g) => (MIDDLE - g) * SPACING;
export const nearestCog = (g) => Math.round(Math.min(COGS.length - 1, Math.max(0, g)));

export function cogRadius(g) {
  const low = Math.max(0, Math.min(COGS.length - 1, Math.floor(g)));
  const high = Math.min(COGS.length - 1, low + 1);
  return lerp(pitchRadius(COGS[low]), pitchRadius(COGS[high]), g - low);
}

export function upperPulley(g) {
  const r = cogRadius(g);
  return [AXLE[0] - 0.25 * r - 1, AXLE[1] - (r + GAP + JOCKEY_R)];
}

export const lowerPulley = (upper, cage) => [upper[0] - CAGE * Math.sin(cage), upper[1] - CAGE * Math.cos(cage)];

function tangent(a, b) {
  const d = [b.c[0] - a.c[0], b.c[1] - a.c[1]];
  const phi = Math.atan2(d[1], d[0]) + Math.acos(-(b.s * b.r - a.s * a.r) / Math.hypot(d[0], d[1]));
  const n = [Math.cos(phi), Math.sin(phi)];
  return { from: [a.c[0] + a.s * a.r * n[0], a.c[1] + a.s * a.r * n[1]], to: [b.c[0] + b.s * b.r * n[0], b.c[1] + b.s * b.r * n[1]] };
}

function loopAt(g, cage) {
  const y = cogY(g);
  const upper = upperPulley(g);
  const circles = [
    { name: "ring", c: SPINDLE, r: RING_R, s: 1, y: 0 },
    { name: "lower", c: lowerPulley(upper, cage), r: JOCKEY_R, s: 1, y },
    { name: "upper", c: upper, r: JOCKEY_R, s: -1, y },
    { name: "cog", c: AXLE, r: cogRadius(g), s: 1, y },
  ];
  const runs = circles.map((circle, index) => tangent(circle, circles[(index + 1) % circles.length]));
  const segments = [];
  let length = 0;
  circles.forEach((circle, index) => {
    const start = angleOf(circle.c, runs[(index + circles.length - 1) % circles.length].to);
    const end = angleOf(circle.c, runs[index].from);
    const sweep = wrap(circle.s > 0 ? start - end : end - start, TAU);
    const scale = perRadian(circle.r);
    segments.push({ arc: circle, start, scale, from: length, length: scale * sweep });
    length += scale * sweep;
    const next = circles[(index + 1) % circles.length];
    const run = runs[index];
    const span = Math.hypot(run.to[0] - run.from[0], run.to[1] - run.from[1]);
    segments.push({ line: run, y0: circle.y, y1: next.y, from: length, length: span });
    length += span;
  });
  return { circles, segments, length };
}

export function cageAngle(g) {
  const target = LINKS * PITCH;
  let [low, high] = CAGE_RANGE;
  for (let step = 0; step < SOLVE_STEPS; step++) {
    const mid = (low + high) / 2;
    if (loopAt(g, mid).length < target) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

function pointOn(segment, s) {
  const t = s - segment.from;
  if (segment.arc) {
    const { c, r, s: sense, y } = segment.arc;
    const angle = segment.start - (sense * t) / segment.scale;
    return { x: c[0] + r * Math.cos(angle), y, z: c[1] + r * Math.sin(angle), on: segment.arc.name, angle };
  }
  const k = segment.length ? t / segment.length : 0;
  const { from, to } = segment.line;
  return { x: lerp(from[0], to[0], k), y: lerp(segment.y0, segment.y1, k), z: lerp(from[1], to[1], k), on: null };
}

export function chainAt(g, crank) {
  const cage = cageAngle(g);
  const loop = loopAt(g, cage);
  const ringStep = TAU / RING;
  const travelled = loop.segments[0].start + crank;
  const offset = perRadian(RING_R) * wrap(travelled, ringStep);
  const rollers = [];
  let at = 0;
  for (let index = 0; index < LINKS; index++) {
    const s = wrap(offset + index * PITCH, loop.length);
    if (s < loop.segments[at].from) at = 0;
    while (at < loop.segments.length - 1 && s >= loop.segments[at].from + loop.segments[at].length) at++;
    rollers.push(pointOn(loop.segments[at], s));
  }
  const phase = (name) => rollers.find((roller) => roller.on === name)?.angle ?? 0;
  return {
    rollers,
    parity: wrap(Math.floor(travelled / ringStep), 2),
    cage,
    upper: loop.circles[2].c,
    lower: loop.circles[1].c,
    y: cogY(g),
    phases: { cog: phase("cog"), upper: phase("upper"), lower: phase("lower") },
  };
}
