import * as k from "../../../anatomy/iso-kit.mjs";
import * as G from "../../../anatomy/lathe.mjs";
import { explodeOf } from "../../../lesson-kit/anatomy/explode.js";
import { orderScene } from "../../../lesson-kit/anatomy/order.js";
import { platePaths } from "../../../lesson-kit/anatomy/plate.js";
import { createScene } from "../../../lesson-kit/anatomy/scene.js";
import { POLES } from "./model.js";
import ORDER from "./order.js";

export const WIDTH = 600;
export const HEIGHT = 340;
const AZIMUTH = 68;
const ELEVATION = 30;

export const ZC = 44;
const BASE = { x: -66, y: -40, w: 160, d: 96, r: 8 };
const STACK = { y0: -10, y1: 10 };
const HUB = 6;
const ARM = 3.2;
const SHOE_IN = 13;
const SHOE_OUT = 18;
const SHOE_SPAN = (42 * Math.PI) / 180;
const COIL = { r0: 7.4, r1: 12.4, half: 5, y0: -12.5, y1: 12.5 };
const COMMUTATOR = { r0: 3.4, r1: 6.4, y0: 14, y1: 22, gap: (6 * Math.PI) / 180 };
const SHAFT_R = 2;
const MAGNET = { r0: 20, r1: 28, span: (50 * Math.PI) / 180, y0: -12, y1: 12 };
const BRUSH = { x0: COMMUTATOR.r1, x1: COMMUTATOR.r1 + 9, y0: 15, y1: 21, half: 3 };
const HOLDER = { x0: BRUSH.x1, x1: BRUSH.x1 + 5 };
const BACK_POST = { y0: -28, y1: -22 };
const FRONT_POST = { y0: 44, y1: 50 };
const BATTERY = { x: 52, y: -16, w: 28, d: 32, r: 2 };
const BATTERY_H = 20;
const WIRE_R = 0.8;
const MOVES = { front: [0, 28, 0], brush: [14, 0, 0], right: [30, 0, 0], left: [-30, 0, 0], rotor: [0, 0, 36] };

export const P = k.fitProjection([...k.boxCorners(BASE, -14, 0), ...k.boxCorners({ x: -MAGNET.r1 - 2, y: BACK_POST.y0, w: 2 * MAGNET.r1 + 4, d: FRONT_POST.y1 - BACK_POST.y0, r: 0 }, 0, ZC + MAGNET.r1)], WIDTH, HEIGHT, {
  pad: 12,
  azimuth: AZIMUTH,
  elevation: ELEVATION,
});

const at = (point) => k.iso(point, P);
const FACE = G.frameOf([0, 0, ZC], [0, 1, 0], [0, 0, 1], [1, 0, 0]);
const polar = (r, phi) => [r * Math.sin(phi), r * Math.cos(phi)];
const arc = (r, from, to, steps = 12) => Array.from({ length: steps + 1 }, (_, index) => polar(r, from + ((to - from) * index) / steps));
const local = (radial, side, theta) => [radial * Math.sin(theta) + side * Math.cos(theta), radial * Math.cos(theta) - side * Math.sin(theta)];
const LAMINATION_POST = Math.sqrt(SHOE_IN ** 2 - ARM ** 2);

function laminationOutline(angle) {
  const points = [];
  for (let index = 0; index < POLES; index++) {
    const theta = angle + (index * 2 * Math.PI) / POLES;
    const lead = Math.asin(ARM / HUB);
    const previous = theta - (2 * Math.PI) / POLES;
    points.push(...arc(HUB, previous + lead, theta - lead, 8).slice(1));
    points.push(local(LAMINATION_POST, -ARM, theta));
    points.push(...arc(SHOE_IN, theta - Math.asin(ARM / SHOE_IN), theta - SHOE_SPAN, 6).slice(1));
    points.push(...arc(SHOE_OUT, theta - SHOE_SPAN, theta + SHOE_SPAN, 16));
    points.push(...arc(SHOE_IN, theta + SHOE_SPAN, theta + Math.asin(ARM / SHOE_IN), 6).slice(0, -1));
    points.push(local(LAMINATION_POST, ARM, theta), local(Math.sqrt(HUB ** 2 - ARM ** 2), ARM, theta));
  }
  return points;
}

const coilOutline = (theta) => [local(COIL.r0, -COIL.half, theta), local(COIL.r1, -COIL.half, theta), local(COIL.r1, COIL.half, theta), local(COIL.r0, COIL.half, theta)];

function segmentOutline(angle, index) {
  const from = angle + (index * 2 * Math.PI) / POLES + COMMUTATOR.gap / 2;
  const to = from + (2 * Math.PI) / POLES - COMMUTATOR.gap;
  return [...arc(COMMUTATOR.r1, from, to, 14), ...arc(COMMUTATOR.r0, to, from, 10)];
}

export function rotorPaths(angle) {
  return {
    lamination: platePaths(FACE, laminationOutline(angle), STACK.y0, STACK.y1, P),
    coils: Array.from({ length: POLES }, (_, index) => platePaths(FACE, coilOutline(angle + (index * 2 * Math.PI) / POLES), COIL.y0, COIL.y1, P)),
    segments: Array.from({ length: POLES }, (_, index) => platePaths(FACE, segmentOutline(angle, index), COMMUTATOR.y0, COMMUTATOR.y1, P)),
    mark: k.pathOf([at([SHAFT_R * Math.cos(angle), STACK.y1, ZC + SHAFT_R * Math.sin(angle)]), at([HUB * Math.cos(angle), STACK.y1, ZC + HUB * Math.sin(angle)])]),
  };
}

const shaft = (y0, y1) => G.solidOf([[0, SHAFT_R], [y1 - y0, SHAFT_R]], G.frameAlong([0, y0, ZC], [0, 1, 0]), P);
export const SHAFT = { back: shaft(BACK_POST.y1, STACK.y0), middle: shaft(STACK.y1, COMMUTATOR.y0), front: shaft(COMMUTATOR.y1, FRONT_POST.y1 + 3) };

const magnetOutline = (side) => {
  const centre = side > 0 ? 0 : Math.PI;
  return [...arc(MAGNET.r1, centre - MAGNET.span, centre + MAGNET.span, 18), ...arc(MAGNET.r0, centre + MAGNET.span, centre - MAGNET.span, 14)];
};
const MAGNET_LOW = ZC - MAGNET.r1 * Math.sin(MAGNET.span);
const MAGNET_FOOT_X = MAGNET.r1 * Math.cos(MAGNET.span);
const poleBlock = (side) => ({ x: side > 0 ? MAGNET_FOOT_X - 4 : -MAGNET_FOOT_X - 8, y: MAGNET.y0 + 2, w: 12, d: MAGNET.y1 - MAGNET.y0 - 4, r: 1 });

export const RIGHT = {
  magnet: platePaths(FACE, magnetOutline(1), MAGNET.y0, MAGNET.y1, P),
  block: k.slabOf(poleBlock(1), 0, MAGNET_LOW, P, 4, 0.6),
  brush: k.slabOf({ x: BRUSH.x0, y: BRUSH.y0, w: BRUSH.x1 - BRUSH.x0, d: BRUSH.y1 - BRUSH.y0, r: 0.6 }, ZC - BRUSH.half, BRUSH.half * 2, P, 2, 0.3),
  holder: k.slabOf({ x: HOLDER.x0, y: BRUSH.y0 - 1, w: HOLDER.x1 - HOLDER.x0, d: BRUSH.y1 - BRUSH.y0 + 2, r: 0.6 }, ZC - BRUSH.half - 2, BRUSH.half * 2 + 4, P, 2, 0.3),
  frontPost: k.slabOf({ x: -4, y: FRONT_POST.y0, w: 8, d: FRONT_POST.y1 - FRONT_POST.y0, r: 1 }, 0, ZC - 5, P, 3, 0.4),
  frontBearing: G.solidOf([[0, 5], [FRONT_POST.y1 - FRONT_POST.y0, 5]], G.frameAlong([0, FRONT_POST.y0, ZC], [0, 1, 0]), P),
};

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
  const plate = { x: 52, y: 34, w: 34, d: 10, r: 2 };
  scene
    .slab("stand.label", plate, 0, 0.8, { tone: "lo", crease: "none" })
    .line(k.planOutline(k.insetPlan(plate, 1.6), 0.8, P), { tone: "faint" })
    .line([0, 1, 2].map((row) => k.lineOnTop([plate.x + 6, plate.y + 2.8 + row * 2.2], [plate.x + (row === 1 ? 20 : 28), plate.y + 2.8 + row * 2.2], 0.8, P)).join(""), { free: true });
  scene.slab("stand.post", { x: -4, y: BACK_POST.y0, w: 8, d: BACK_POST.y1 - BACK_POST.y0, r: 1 }, 0, ZC - 5, { tone: "mid", bevel: 0.4 });
  scene.turned("stand.bearing", [0, BACK_POST.y0, ZC], [0, 1, 0], [[0, 5], [BACK_POST.y1 - BACK_POST.y0, 5]], { tone: "mid", seams: [[3, 5]] });
}

function field(scene) {
  scene.layer(1);
  scene.assembly("left", MOVES.left);
  scene.slab("magnets.block", poleBlock(-1), 0, MAGNET_LOW, { tone: "lo", bevel: 0.6, focus: "magnets" });
  scene.plate("magnets.left", FACE, magnetOutline(-1), MAGNET.y0, MAGNET.y1, { tone: "hi", focus: "magnets" });
  scene.assembly(null);
  scene.slab("brushes.post", { x: -HOLDER.x1 + 0.5, y: BRUSH.y0, w: 4, d: BRUSH.y1 - BRUSH.y0, r: 0.6 }, 0, ZC - BRUSH.half - 2, { tone: "mid", focus: "brushes" });
  scene.slab("brushes.holder", { x: -HOLDER.x1, y: BRUSH.y0 - 1, w: HOLDER.x1 - HOLDER.x0, d: BRUSH.y1 - BRUSH.y0 + 2, r: 0.6 }, ZC - BRUSH.half - 2, BRUSH.half * 2 + 4, { tone: "mid", bevel: 0.3, focus: "brushes" });
  scene.slab("brushes.left", { x: -BRUSH.x1, y: BRUSH.y0, w: BRUSH.x1 - BRUSH.x0, d: BRUSH.y1 - BRUSH.y0, r: 0.6 }, ZC - BRUSH.half, BRUSH.half * 2, { tone: "lo", bevel: 0.3, focus: "brushes" });
  scene.slab("brushes.rightPost", { x: HOLDER.x1 - 4.5, y: BRUSH.y0, w: 4, d: BRUSH.y1 - BRUSH.y0, r: 0.6 }, 0, ZC - BRUSH.half - 2, { tone: "mid", focus: "brushes" });
}

function battery(scene) {
  scene.layer(1);
  scene
    .slab("battery.pack", BATTERY, 0, BATTERY_H, { tone: "mid", bevel: 0.8, focus: "battery", seams: [BATTERY_H - 4] })
    .line(k.planOutline(k.insetPlan(BATTERY, 4), BATTERY_H, P), { tone: "faint" });
  const terminals = [BATTERY.y + 8, BATTERY.y + BATTERY.d - 8];
  for (const y of terminals) scene.post("battery.terminal", [BATTERY.x + 6, y], 2.2, BATTERY_H, 3, { tone: "hi", focus: "battery" });
  const wire = (name, points, bend = 5) => scene.pipe(name, points, WIRE_R, { tone: "lo", limp: true, focus: "battery", flow: "lo", bend });
  const top = BATTERY_H + 3;
  const over = top + 3;
  const low = WIRE_R + 0.4;
  const edge = BATTERY.x - 6;
  wire("wire.right", [[BATTERY.x + 6, terminals[0], top], [BATTERY.x + 6, terminals[0], over], [edge, terminals[0], over], [edge, terminals[0], low], [26, 18, low], [HOLDER.x1 - 0.5, 18, low]]);
  wire("wire.left", [[BATTERY.x + 6, terminals[1], top], [BATTERY.x + 6, terminals[1], over], [edge, terminals[1], over], [edge, terminals[1], low], [30, 38, low], [-HOLDER.x1 + 2.5, 38, low], [-HOLDER.x1 + 2.5, BRUSH.y1, low]], 7);
}

function buildMotor() {
  const scene = createScene(P);
  stand(scene);
  field(scene);
  battery(scene);
  return scene.items;
}

export const SCENE = { P, items: buildMotor() };
export const ITEMS = orderScene(SCENE.items, ORDER);
export const EXPLODE = explodeOf(P, MOVES);
export const MAGNET_LABELS = { right: at([MAGNET.r1 + 1, MAGNET.y1, ZC]), left: at([-MAGNET.r1 - 1, MAGNET.y1, ZC]) };
