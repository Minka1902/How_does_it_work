import * as k from "../../../anatomy/iso-kit.mjs";
import * as G from "../../../anatomy/lathe.mjs";
import { explodeOf } from "../../../lesson-kit/anatomy/explode.js";
import { orderScene } from "../../../lesson-kit/anatomy/order.js";
import { platePaths } from "../../../lesson-kit/anatomy/plate.js";
import { createScene } from "../../../lesson-kit/anatomy/scene.js";
import { CHAMBER_TOP, DRIVER, KEY_BOTTOM, KEY_OUT, KEY_TOP, PINS, PIN_X, SHEAR, keyPinLength, keyProfile } from "./model.js";
import ORDER from "./order.js";

export const WIDTH = 600;
export const HEIGHT = 300;
const AZIMUTH = 72;
const ELEVATION = 22;

const ZC = 46;
const PR = 13;
const L = 56;
const PIN_R = 2.9;
const KEY_HALF = 2.4;
const BIBLE_TOP = 83;
const SHELL_BOTTOM = 28;
const BACK = -13;
const BEZEL_R = 20;
const BASE = { x: -92, y: -30, w: 178, d: 48, r: 8 };
const CAM = { s0: L + 3, s1: L + 6, hub: 5, reach: 17, width: 4 };
const MOVES = { drivers: [0, 40, 0], plug: [0, 22, 0], cam: [16, 0, 0] };
const BOW = [[-24, 34], [-27, 38], [-27, 54], [-24, 58], [-6, 58], [-3, 55], [-3, 37], [-6, 34]];
const BOW_HOLE = [-16, 46];

export const P = k.fitProjection([...k.boxCorners(BASE, -14, 0), ...k.boxCorners({ x: KEY_OUT - 28, y: -BEZEL_R, w: L + 12 - KEY_OUT + 28, d: BEZEL_R + 2, r: 0 }, SHELL_BOTTOM, BIBLE_TOP + 2)], WIDTH, HEIGHT, {
  pad: 8,
  azimuth: AZIMUTH,
  elevation: ELEVATION,
});

const at = (point) => k.iso(point, P);
const AXIS_X = G.frameOf([0, 0, ZC], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const KEY_FRAME = G.frameOf([0, 0, 0], [0, 1, 0], [0, 0, 1], [1, 0, 0]);
const PIN_FRAME = (x) => G.frameOf([x, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);

const arc = (r, from, to, steps) => Array.from({ length: steps + 1 }, (_, index) => {
  const angle = from + ((to - from) * index) / steps;
  return [r * Math.cos(angle), r * Math.sin(angle)];
});
const HALF_DISC = (r) => arc(r, Math.PI / 2, (3 * Math.PI) / 2, 24);
const PIN_HALF = arc(PIN_R, Math.PI, 2 * Math.PI, 12);

const faceRect = (x0, x1, z0, z1, y = 0) => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];
const facePath = (points) => k.pathOf(points.map(at), true);

function cavity(x0, x1, z0, z1, depth) {
  return { front: facePath(faceRect(x0, x1, z0, z1)), back: facePath(faceRect(x0, x1, z0, z1, -depth)) };
}

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
  const plate = { x: -80, y: 4, w: 46, d: 10, r: 2 };
  scene
    .slab("stand.label", plate, 0, 0.8, { tone: "lo", crease: "none" })
    .line(k.planOutline(k.insetPlan(plate, 1.6), 0.8, P), { tone: "faint" })
    .line([0, 1, 2].map((row) => k.lineOnTop([plate.x + 7, plate.y + 3 + row * 2.4], [plate.x + (row === 1 ? 28 : 40), plate.y + 3 + row * 2.4], 0.8, P)).join(""), { free: true })
    .dots([at([plate.x + 3.5, plate.y + plate.d / 2, 0.8]), at([plate.x + plate.w - 3.5, plate.y + plate.d / 2, 0.8])], { size: 0.45 });
  scene.slab("stand.pedestal", { x: 6, y: BACK - 4, w: L - 12, d: 15, r: 1.5 }, 0, SHELL_BOTTOM, { tone: "mid", bevel: 0.6, seams: [4] });
}

function housing(scene) {
  scene.layer(1);
  const style = { tone: "mid", focus: "housing", steps: 2 };
  scene.slab("housing.back", { x: 0, y: BACK - 4, w: L, d: 4, r: 0 }, SHELL_BOTTOM, BIBLE_TOP - SHELL_BOTTOM, { ...style, seams: [ZC] });
  scene.slab("housing.bottom", { x: 0, y: BACK, w: L, d: -BACK, r: 0 }, SHELL_BOTTOM, ZC - PR - SHELL_BOTTOM, style);
  const bible = scene.slab("housing.bible", { x: 0, y: BACK, w: L, d: -BACK, r: 0 }, SHEAR, BIBLE_TOP - SHEAR, style);
  for (const x of PIN_X) {
    const chamber = cavity(x - PIN_R, x + PIN_R, SHEAR, CHAMBER_TOP, PIN_R);
    bible.cavity(chamber.front, chamber.back);
  }
  const ring = [...arc(BEZEL_R, Math.PI / 2, (3 * Math.PI) / 2, 28), ...arc(PR, (3 * Math.PI) / 2, Math.PI / 2, 20)];
  scene.plate("housing.bezel", G.frameOf([-3, 0, ZC], [1, 0, 0], [0, 1, 0], [0, 0, 1]), ring, 0, 3, { tone: "hi", focus: "housing" });
}

function plug(scene) {
  scene.layer(1);
  scene.assembly("plug", MOVES.plug);
  const body = scene.plate("plug.body", AXIS_X, HALF_DISC(PR), 0, L + 3, { tone: "hi", focus: "plug" });
  const keyway = cavity(0, L + 3, KEY_BOTTOM, KEY_TOP, KEY_HALF);
  body.cavity(keyway.front, keyway.back);
  for (const x of PIN_X) {
    const bore = cavity(x - PIN_R, x + PIN_R, KEY_TOP, SHEAR, PIN_R);
    body.cavity(bore.front, bore.back);
  }
  scene.assembly(null);
}

function buildLock() {
  const scene = createScene(P);
  stand(scene);
  housing(scene);
  plug(scene);
  return scene.items;
}

export const SCENE = { P, items: buildLock() };
export const ITEMS = orderScene(SCENE.items, ORDER);
export const EXPLODE = explodeOf(P, MOVES);

export const shift = (dx, dy = 0, dz = 0) => k.translateAlong(P, [dx, dy, dz]);

export function keyPaths(cuts) {
  const blade = keyProfile(cuts).map(([x, z]) => [z, x]);
  const bow = BOW.map(([x, z]) => [z, x]);
  return { blade: platePaths(KEY_FRAME, blade, -KEY_HALF, 0, P), bow: platePaths(KEY_FRAME, bow, -KEY_HALF - 1, 1, P), hole: k.pathOf(arc(3.2, 0, 2 * Math.PI, 20).map(([u, v]) => at([BOW_HOLE[0] + u, 1, BOW_HOLE[1] + v])), true) };
}

export const PIN_PATHS = PIN_X.map((x, index) => ({
  key: platePaths(PIN_FRAME(x), PIN_HALF, 0, keyPinLength(index), P),
  driver: platePaths(PIN_FRAME(x), PIN_HALF, 0, DRIVER, P),
}));

export function springPath(x, z0, z1, turns = 6) {
  const runs = [];
  let run = [];
  const steps = turns * 24;
  for (let step = 0; step <= steps; step++) {
    const angle = (step / 24) * 2 * Math.PI;
    const y = (PIN_R - 0.6) * Math.sin(angle);
    if (y > 0) {
      if (run.length > 1) runs.push(run);
      run = [];
      continue;
    }
    run.push(at([x + (PIN_R - 0.6) * Math.cos(angle), y, z0 + ((z1 - z0) * step) / steps]));
  }
  if (run.length > 1) runs.push(run);
  return runs.map((points) => k.pathOf(points)).join("");
}

export function camPaths(angle) {
  const hub = arc(CAM.hub, 0, 2 * Math.PI, 20).slice(0, -1);
  const tip = [[CAM.reach, -CAM.width / 2], [CAM.reach, CAM.width / 2]];
  const shape = G.hullOf([...hub, ...tip]).map(([u, v]) => [u * Math.cos(angle) - v * Math.sin(angle), u * Math.sin(angle) + v * Math.cos(angle)]);
  return platePaths(G.frameOf([0, 0, ZC], [1, 0, 0], [0, 0, -1], [0, 1, 0]), shape, CAM.s0, CAM.s1, P);
}

export const SHEAR_LINE = k.pathOf([at([0, 0, SHEAR]), at([L, 0, SHEAR])]);
export const PIN_COUNT = PINS;
