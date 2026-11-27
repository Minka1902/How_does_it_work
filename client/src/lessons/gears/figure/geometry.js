import * as k from "../../../anatomy/iso-kit.mjs";
import * as G from "../../../anatomy/lathe.mjs";
import { explodeOf } from "../../../lesson-kit/anatomy/explode.js";
import { orderScene } from "../../../lesson-kit/anatomy/order.js";
import { platePaths } from "../../../lesson-kit/anatomy/plate.js";
import { createScene } from "../../../lesson-kit/anatomy/scene.js";
import { AXLE, CRANK, JOCKEY, JOCKEY_R, RING_R, ROLLER, SPINDLE, cogY, pitchRadius } from "./drivetrain.js";
import { COGS, RING } from "./model.js";
import ORDER from "./order.js";

export const WIDTH = 600;
export const HEIGHT = 360;
const AZIMUTH = 62;
const ELEVATION = 24;

const TAU = 2 * Math.PI;
const BASE = { x: -34, y: -26, w: 146, d: 42, r: 8 };
const POST = { y: -22, d: 6 };
const COG_HALF = 0.25;
const RING_HALF = 0.4;
const JOCKEY_HALF = 0.35;
const TIP = 0.85;
const BOLT_RADIUS = 13.75;
const BOLTS = 5;
const ARM = { y0: 1.2, y1: 3, hub: 3.4, end: 2.2 };
const PEDAL = { y0: 5.2, y1: 13.2, half: 4.5, h: 2.6 };
const CAGE_PLATE = { r: 3, waist: 1.4, gap: 1.5, thick: 0.5 };
const HANGER = { y0: 7.4, y1: 8.2, knuckle: [-9, 9, AXLE[1] - 4] };
const LINK_R = 1;
const CHAIN = { plate: 2, pin: 0.5 };
const SPIDER = { reach: BOLT_RADIUS + 1.8, side: 0.17, waist: 6.2, root: 5.6, flare: 0.32 };
const CRANK_ZERO = 0;
const MOVES = { derailleur: [-16, 14, -8], cassette: [0, 30, 4], crank: [0, 32, 0] };

export const P = k.fitProjection(
  [
    ...k.boxCorners(BASE, -14, 0),
    ...k.boxCorners({ x: AXLE[0] - 24, y: -8, w: SPINDLE[0] + CRANK + 8 - AXLE[0] + 24, d: PEDAL.y1 + 8, r: 0 }, 0, SPINDLE[1] + CRANK + 4),
  ],
  WIDTH,
  HEIGHT,
  { pad: 10, azimuth: AZIMUTH, elevation: ELEVATION },
);

const UNIT = G.scaleOf(P);
const at = (point) => k.iso(point, P);
const frameAt = ([x, z]) => G.frameOf([x, 0, z], [0, 1, 0], [0, 0, 1], [1, 0, 0]);
const polar = (r, angle) => [r * Math.sin(angle), r * Math.cos(angle)];
const circle = (r, steps = 24) => Array.from({ length: steps }, (_, index) => polar(r, (index / steps) * TAU));
const ringLine = ([x, z], y, r, steps = 32) => k.pathOf(Array.from({ length: steps }, (_, index) => at([x + r * Math.cos((index / steps) * TAU), y, z + r * Math.sin((index / steps) * TAU)])), true);
const along = (origin, axis, profile) => G.solidOf(profile, G.frameAlong(origin, axis), P);
const alongY = ([x, z], y0, y1, r) => along([x, y0, z], [0, 1, 0], [[0, r], [y1 - y0, r]]);

const around = ([x, z], r) => circle(r, 28).map(([u, v]) => [u + z, v + x]);
const hull = (a, ra, b, rb) => G.hullOf([...around(a, ra), ...around(b, rb)]);
const arcOf = (cx, r, from, to, steps = 10) => Array.from({ length: steps + 1 }, (_, index) => {
  const angle = from + ((to - from) * index) / steps;
  return [cx + r * Math.cos(angle), r * Math.sin(angle)];
});

function dogBone([ax, az], [bx, bz], r, waist) {
  const angle = Math.atan2(bz - az, bx - ax);
  const length = Math.hypot(bx - ax, bz - az);
  const local = [
    ...arcOf(0, r, Math.PI / 2, (3 * Math.PI) / 2),
    [0.35 * length, -waist],
    [0.65 * length, -waist],
    ...arcOf(length, r, -Math.PI / 2, Math.PI / 2),
    [0.65 * length, waist],
    [0.35 * length, waist],
  ];
  return local.map(([lx, lz]) => [az + lx * Math.sin(angle) + lz * Math.cos(angle), ax + lx * Math.cos(angle) - lz * Math.sin(angle)]);
}

function spiderOutline(angle) {
  const points = [];
  for (let index = 0; index < BOLTS; index++) {
    const bolt = angle + Math.PI / BOLTS + (index * TAU) / BOLTS;
    const between = bolt + Math.PI / BOLTS;
    points.push(polar(SPIDER.reach, bolt - SPIDER.side), polar(SPIDER.reach, bolt + SPIDER.side), polar(SPIDER.waist, between - SPIDER.flare), polar(SPIDER.root, between), polar(SPIDER.waist, between + SPIDER.flare));
  }
  return points;
}

function toothed(teeth, valley, radius, tip) {
  const root = radius - ROLLER;
  const step = TAU / teeth;
  const points = [];
  for (let index = 0; index < teeth; index++) {
    const a = valley + index * step;
    points.push(polar(root, a - 0.21 * step), polar(root, a + 0.21 * step), polar(radius + tip, a + 0.39 * step), polar(radius + tip, a + 0.61 * step));
  }
  return points;
}

function rod(from, to, r = LINK_R) {
  const d = G.sub3(to, from);
  return along(from, G.unit3(d), [[0, r], [Math.hypot(...d), r]]);
}

const knuckle = ([x, y, z]) => k.slabOf({ x: x - 2.4, y: y - 1.8, w: 4.8, d: 3.6, r: 0.6 }, z - 2.8, 5.6, P, 2, 0.3);

function stand(scene) {
  scene.layer(0);
  scene.halo(BASE, -14, 14);
  for (const [x, y] of k.corners(BASE, 12)) {
    scene.post("stand.flange", [x, y], 7, -14, 1.6, { tone: "lo" });
    scene.post("stand.foot", [x, y], 5.2, -12.4, 4.4, { tone: "mid" });
  }
  const screws = k.corners(BASE, 8);
  scene
    .slab("stand.base", BASE, -8, 8, { steps: 8, bevel: 1.6 })
    .line(k.planOutline(k.insetPlan(BASE, 5), 0, P))
    .line(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(""))
    .dots(screws.map(([x, y]) => at([x, y, 0])));
  const plate = { x: 24, y: 6, w: 34, d: 10, r: 2 };
  scene
    .slab("stand.label", plate, 0, 0.8, { tone: "lo", crease: "none" })
    .line(k.planOutline(k.insetPlan(plate, 1.6), 0.8, P), { tone: "faint" })
    .line([0, 1, 2].map((row) => k.lineOnTop([plate.x + 6, plate.y + 2.8 + row * 2.2], [plate.x + (row === 1 ? 20 : 28), plate.y + 2.8 + row * 2.2], 0.8, P)).join(""), { free: true });
}

function mounts(scene) {
  scene.layer(1);
  const hubBack = POST.y + POST.d + 2;
  const hubFront = cogY(COGS.length - 1) - COG_HALF;
  scene.slab("stand.rear", { x: AXLE[0] - 4, y: POST.y, w: 8, d: POST.d, r: 1 }, 0, AXLE[1] - 5, { tone: "mid", bevel: 0.4 });
  scene.turned("stand.rearBearing", [AXLE[0], POST.y, AXLE[1]], [0, 1, 0], [[0, 5], [POST.d + 2, 5]], { tone: "mid", seams: [[POST.d, 5]] });
  scene.turned(
    "hub.shell",
    [AXLE[0], hubBack, AXLE[1]],
    [0, 1, 0],
    [[0, 3.4], [3, 3.4], [3, 7.6], [4, 7.6], [4, 3.6], [hubFront - hubBack, 3.6]],
    { tone: "hi" },
  );
  scene.slab("stand.front", { x: SPINDLE[0] - 4, y: POST.y, w: 8, d: POST.d, r: 1 }, 0, SPINDLE[1] - 5, { tone: "mid", bevel: 0.4 });
  scene.turned("bb.shell", [SPINDLE[0], POST.y, SPINDLE[1]], [0, 1, 0], [[0, 5], [POST.d + 2, 5], [POST.d + 2, 4.4], [-1.6 - POST.y, 4.4]], { tone: "hi", seams: [[POST.d + 2, 5]] });
}

function buildGears() {
  const scene = createScene(P);
  stand(scene);
  mounts(scene);
  return scene.items;
}

export const SCENE = { P, items: buildGears() };
export const ITEMS = orderScene(SCENE.items, ORDER);
export const EXPLODE = explodeOf(P, MOVES);

export function cogPaths(index, valley) {
  const y = cogY(index);
  return { y, paths: platePaths(frameAt(AXLE), toothed(COGS[index], valley, pitchRadius(COGS[index]), TIP), y - COG_HALF, y + COG_HALF, P) };
}

export const LOCKRING = alongY(AXLE, cogY(0) + COG_HALF, HANGER.y0 - 0.05, 3);
export const NUT = along([AXLE[0], HANGER.y1, AXLE[1]], [0, 1, 0], [[0, 2.6], [1.2, 2.6], [1.2, 1.4], [2.6, 1.4]]);
export const HANGER_PATHS = platePaths(frameAt([0, 0]), hull(AXLE, 2.8, [HANGER.knuckle[0], HANGER.knuckle[2]], 2.2), HANGER.y0, HANGER.y1, P);
export const B_KNUCKLE = knuckle(HANGER.knuckle);

export function crankPaths(crank) {
  const angle = CRANK_ZERO - crank;
  const end = [SPINDLE[0] + CRANK * Math.cos(angle), SPINDLE[1] + CRANK * Math.sin(angle)];
  const bolts = Array.from({ length: BOLTS }, (_, index) => angle + Math.PI / BOLTS + (index * TAU) / BOLTS);
  return {
    ring: platePaths(frameAt(SPINDLE), toothed(RING, -crank, RING_R, TIP), -RING_HALF, RING_HALF, P),
    ringFace: ringLine(SPINDLE, RING_HALF, RING_R - 5.4, 48),
    spider: platePaths(frameAt(SPINDLE), spiderOutline(angle), RING_HALF, RING_HALF + 0.8, P),
    bolts: bolts.map((bolt) => ringLine([SPINDLE[0] + BOLT_RADIUS * Math.cos(bolt), SPINDLE[1] + BOLT_RADIUS * Math.sin(bolt)], RING_HALF + 0.8, 0.9, 12)).join(""),
    arm: platePaths(frameAt([0, 0]), hull(SPINDLE, ARM.hub, end, ARM.end), ARM.y0, ARM.y1, P),
    cap: alongY(SPINDLE, ARM.y1, ARM.y1 + 0.8, 2.4),
    axle: alongY(end, ARM.y1, PEDAL.y0, 0.9),
    pedal: k.slabOf({ x: end[0] - PEDAL.half, y: PEDAL.y0, w: 2 * PEDAL.half, d: PEDAL.y1 - PEDAL.y0, r: 0.8 }, end[1] - PEDAL.h / 2, PEDAL.h, P, 2, 0.4),
    tread: k.planOutline(k.insetPlan({ x: end[0] - PEDAL.half, y: PEDAL.y0, w: 2 * PEDAL.half, d: PEDAL.y1 - PEDAL.y0, r: 0.8 }, 1.4), end[1] + PEDAL.h / 2, P),
    end,
  };
}

export function derailleurPaths(chain) {
  const { upper, lower, y, phases } = chain;
  const pivot = [upper[0], y + CAGE_PLATE.gap + CAGE_PLATE.thick, upper[1]];
  const moving = [upper[0] - 6, y + CAGE_PLATE.gap + 1.6, upper[1] + 2.5];
  const plate = dogBone(upper, lower, CAGE_PLATE.r, CAGE_PLATE.waist);
  const jockey = (centre, valley) => platePaths(frameAt(centre), toothed(JOCKEY, valley, JOCKEY_R, 0.7), y - JOCKEY_HALF, y + JOCKEY_HALF, P);
  return {
    inner: platePaths(frameAt([0, 0]), plate, y - CAGE_PLATE.gap - CAGE_PLATE.thick, y - CAGE_PLATE.gap, P),
    upper: jockey(upper, phases.upper),
    lower: jockey(lower, phases.lower),
    hubs: ringLine(upper, y + JOCKEY_HALF, 1.6, 16) + ringLine(lower, y + JOCKEY_HALF, 1.6, 16),
    outer: platePaths(frameAt([0, 0]), plate, y + CAGE_PLATE.gap, y + CAGE_PLATE.gap + CAGE_PLATE.thick, P),
    bolts: ringLine(upper, pivot[1], 1.2, 12) + ringLine(lower, pivot[1], 1.2, 12),
    pivot: alongY(upper, pivot[1], pivot[1] + 1.4, 1.7),
    links: [rod(G.add3(HANGER.knuckle, [0, 0, 1.4]), G.add3(moving, [0, 0, 1.4])), rod(G.add3(HANGER.knuckle, [0, 0, -1.4]), G.add3(moving, [0, 0, -1.4]))],
    knuckle: knuckle(moving),
    arm: rod(moving, [upper[0], pivot[1] + 0.7, upper[1]], 1.1),
  };
}

const capsule = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
const dot = ([x, y], r) => `M${(x - r).toFixed(2)} ${y.toFixed(2)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

export function chainPaths(chain) {
  const points = chain.rollers.map((roller) => at([roller.x, roller.y, roller.z]));
  const inner = [];
  const outer = [];
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    ((index + chain.parity) % 2 ? outer : inner).push(capsule(point, next));
  });
  const pin = CHAIN.pin * UNIT;
  return { inner: inner.join(""), outer: outer.join(""), pins: points.map((point) => dot(point, pin)).join(""), width: CHAIN.plate * UNIT };
}

export function planeOffset(centre, y, point) {
  const origin = at([centre[0], y, centre[1]]);
  const x1 = at([centre[0] + 1, y, centre[1]]);
  const z1 = at([centre[0], y, centre[1] + 1]);
  const ex = [x1[0] - origin[0], x1[1] - origin[1]];
  const ez = [z1[0] - origin[0], z1[1] - origin[1]];
  const dx = point[0] - origin[0];
  const dy = point[1] - origin[1];
  const det = ex[0] * ez[1] - ex[1] * ez[0];
  return [(dx * ez[1] - dy * ez[0]) / det, (ex[0] * dy - ex[1] * dx) / det];
}
