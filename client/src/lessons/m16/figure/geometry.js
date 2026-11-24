import * as k from "../../../anatomy/iso-kit.mjs";
import * as G from "../../../anatomy/lathe.mjs";
import { orderScene } from "../../../lesson-kit/anatomy/order.js";
import { createScene } from "../../../lesson-kit/anatomy/scene.js";
import ORDER from "./order.js";

export const WIDTH = 600;
export const HEIGHT = 330;
const AZIMUTH = 66;
const ELEVATION = 24;

const ZB = 80;
const BASE = { x: -140, y: -34, w: 310, d: 84, r: 8 };
const BOLT_FACE = 32;
const CARRIER = { from: -24, to: 24, r: 6 };
const BOLT_R = 4.5;
const EXTENSION = { from: BOLT_FACE, to: 44, r: 8 };
const NUT = { from: 44, to: 50, r: 10 };
const BARREL = { from: 50, to: 150, r: 5 };
const GAS_BLOCK = { x: 112, w: 12 };
const GAS_Z = ZB + 11.5;
const KEY = { x: 4, w: 14, z0: ZB + 5.4, z1: ZB + 13.5 };
const WALL_Y = -10;
const LOWER_TOP = ZB - 14;
const MAG = { x: 3, y: -5, w: 14, d: 10, r: 1.2 };
const MAG_CENTRE = MAG.x + MAG.w / 2;
const CHANNEL = { from: -112, to: -30 };
const BUFFER = { from: -48, to: -24, r: 5.4 };
const PIN = { x: 12, r: 1.5, out: 9.5 };
const CASE = 27;
const ROUND = 34;
const CASE_R = 2.9;
export const ROUND_LOW = LOWER_TOP + 2.75;
const GAS_R = 0.9;

export const P = k.fitProjection([...k.boxCorners(BASE, -14, 0), ...k.boxCorners({ x: -116, y: -10, w: 316, d: 50, r: 0 }, 0, ZB + 15)], WIDTH, HEIGHT, { pad: 16, azimuth: AZIMUTH, elevation: ELEVATION });

const at = (point) => k.iso(point, P);
const along = (name, from, to, r, style) => ({ name, origin: [from, 0, ZB], profile: [[0, r], [to - from, r]], style });

const CASE_PROFILE = [[0, CASE_R], [0.8, CASE_R], [0.8, 2.3], [1.7, 2.3], [2, 2.75], [22.4, 2.6], [24.4, 1.75, 1], [CASE, 1.7]];
const BULLET_PROFILE = [[0, 1.7], [3, 1.67, 1], [5, 1.3, 1], [6.4, 0.55, 1], [7, 0]];

function stand(scene) {
  scene.layer(0);
  scene.halo(BASE, -14, 14);
  for (const [x, y] of k.corners(BASE, 12)) {
    scene.post("stand.flange", [x, y], 7.5, -14, 1.6, { tone: "lo" });
    scene.post("stand.foot", [x, y], 5.6, -12.4, 4.4, { tone: "mid" });
  }
  const screws = k.corners(BASE, 8);
  scene
    .slab("stand.base", BASE, -8, 8, { steps: 8, bevel: 1.6 })
    .line(k.planOutline(k.insetPlan(BASE, 5), 0, P))
    .line(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""))
    .dots(screws.map(([x, y]) => at([x, y, 0])));
  const plate = { x: 60, y: 30, w: 60, d: 11, r: 2 };
  scene
    .slab("stand.label", plate, 0, 0.8, { tone: "lo", crease: "none" })
    .line(k.planOutline(k.insetPlan(plate, 1.6), 0.8, P), { tone: "faint" })
    .line([0, 1, 2].map((row) => k.lineOnTop([plate.x + 8, plate.y + 3 + row * 2.4], [plate.x + (row === 1 ? 32 : 46), plate.y + 3 + row * 2.4], 0.8, P)).join(""), { free: true })
    .dots([at([plate.x + 3.5, plate.y + plate.d / 2, 0.8]), at([plate.x + plate.w - 3.5, plate.y + plate.d / 2, 0.8])], { size: 0.45 });
  scene.slab("stand.post", { x: 131, y: -6, w: 10, d: 12, r: 1 }, 0, ZB - BARREL.r, { tone: "mid", bevel: 0.5 });
  scene.slab("stand.post", { x: -96, y: -8, w: 12, d: 16, r: 1 }, 0, ZB - 12, { tone: "mid", bevel: 0.5 });
  scene.slab("stand.pad", { x: MAG.x - 3, y: -8, w: MAG.w + 6, d: 16, r: 1.5 }, 0, 3, { tone: "lo", bevel: 0.4 });
}

function receiver(scene) {
  scene.layer(1);
  scene.slab("receiver.wall", { x: CHANNEL.to, y: WALL_Y, w: NUT.from - CHANNEL.to, d: 2, r: 0.5 }, LOWER_TOP, ZB + 14 - LOWER_TOP, { tone: "lo", seams: [ZB - 4] });
  scene.slab("receiver.extension", { x: CHANNEL.from, y: WALL_Y, w: CHANNEL.to - CHANNEL.from, d: 2, r: 0.5 }, ZB - 10, 20, { tone: "lo" });
  scene.slab("receiver.extension", { x: CHANNEL.from, y: WALL_Y + 2, w: CHANNEL.to - CHANNEL.from, d: 18, r: 0.5 }, ZB - 12, 2, { tone: "lo" });
  scene.slab("receiver.extension", { x: CHANNEL.from - 4, y: WALL_Y, w: 4, d: 20, r: 0.6 }, ZB - 12, 22, { tone: "mid", bevel: 0.4 });
  scene.slab("receiver.lower", { x: -30, y: -9, w: MAG.x - 1 + 30, d: 18, r: 1 }, ZB - 26, 12, { tone: "mid", bevel: 0.6 });
  scene.slab("receiver.lower", { x: MAG.x + MAG.w + 1, y: -9, w: 34 - MAG.x - MAG.w - 1, d: 18, r: 1 }, ZB - 26, 12, { tone: "mid", bevel: 0.6 });
  scene
    .slab("magazine.body", MAG, 3, LOWER_TOP - 3, { tone: "mid", focus: "magazine", seams: [12, LOWER_TOP - 6] })
    .line([0.3, 0.5, 0.7].map((share) => k.pathOf([at([MAG.x + 3, MAG.y + MAG.d, 12 + share * (LOWER_TOP - 18)]), at([MAG.x + MAG.w - 3, MAG.y + MAG.d, 12 + share * (LOWER_TOP - 18)])])).join(""), { tone: "faint", free: true });
  scene.turned("magazine.round", [MAG_CENTRE - ROUND / 2, 0, ROUND_LOW], [1, 0, 0], [...CASE_PROFILE, ...BULLET_PROFILE.map(([s, r, smooth]) => (smooth ? [CASE + s, r, 1] : [CASE + s, r]))], { tone: "hi", focus: "magazine" });
}

function barrel(scene) {
  scene.layer(1);
  const { name, origin, profile } = along("barrel.extension", EXTENSION.from, EXTENSION.to, EXTENSION.r);
  scene.turned(name, origin, [1, 0, 0], profile, { tone: "mid", focus: "barrel" });
  scene.turned("barrel.nut", [NUT.from, 0, ZB], [1, 0, 0], [[0, NUT.r], [NUT.to - NUT.from, NUT.r]], { tone: "mid", focus: "barrel", seams: [[3, NUT.r]] });
  const F = G.frameAlong([BARREL.from, 0, ZB], [1, 0, 0]);
  scene.turned("barrel.tube", [BARREL.from, 0, ZB], [1, 0, 0], [[0, BARREL.r], [GAS_BLOCK.x - BARREL.from, BARREL.r]], { tone: "hi", focus: "barrel" });
  scene
    .turned("barrel.tube", [GAS_BLOCK.x + GAS_BLOCK.w, 0, ZB], [1, 0, 0], [[0, BARREL.r], [BARREL.to - GAS_BLOCK.x - GAS_BLOCK.w, BARREL.r]], { tone: "hi", focus: "barrel" })
    .line(G.circleOf(F, BARREL.to - BARREL.from, 1.65, P), { tone: "lo" });
  scene.slab("gas.block", { x: GAS_BLOCK.x, y: -6, w: GAS_BLOCK.w, d: 12, r: 1.2 }, ZB - 6, GAS_Z + 3 - (ZB - 6), { tone: "mid", bevel: 0.5, focus: "gas" }).dots([at([GAS_BLOCK.x + 3, 6, GAS_Z]), at([GAS_BLOCK.x + 9, 6, ZB - 3])], { size: 0.45 });
  scene.pipe("gas.tube", [[GAS_BLOCK.x, 0, GAS_Z], [KEY.x + KEY.w, 0, GAS_Z]], GAS_R, { raw: true, focus: "gas", flow: "red", tone: "mid", maxLength: 30 });
}

function carrier(scene) {
  scene.layer(1);
  scene.group("carrier");
  scene.turned("carrier.body", [CARRIER.from, 0, ZB], [1, 0, 0], [[0, CARRIER.r - 0.8], [0.8, CARRIER.r], [CARRIER.to - CARRIER.from, CARRIER.r]], { tone: "hi", focus: "bolt", seams: [[14, CARRIER.r], [36, CARRIER.r]] });
  scene.turned("carrier.bolt", [CARRIER.to, 0, ZB], [1, 0, 0], [[0, BOLT_R], [BOLT_FACE - CARRIER.to, BOLT_R]], { tone: "mid", focus: "bolt" });
  scene.slab("carrier.key", { x: KEY.x, y: -2.2, w: KEY.w, d: 4.4, r: 0.6 }, KEY.z0, KEY.z1 - KEY.z0, { tone: "mid", bevel: 0.3, focus: "gas" }).dots([at([KEY.x + 3.5, 0, KEY.z1]), at([KEY.x + KEY.w - 3.5, 0, KEY.z1])], { size: 0.4 });
  scene.turned("carrier.buffer", [BUFFER.from, 0, ZB], [1, 0, 0], [[0, BUFFER.r - 1], [1, BUFFER.r], [BUFFER.to - BUFFER.from, BUFFER.r]], { tone: "mid", focus: "buffer", seams: [[8, BUFFER.r]] });
  scene.group("pin");
  scene.turned("carrier.pin", [PIN.x, CARRIER.r - 1, ZB], [0, 1, 0], [[0, PIN.r], [PIN.out - CARRIER.r + 1, PIN.r]], { tone: "hi", focus: "bolt" });
  scene.group(null);
}

function buildRifle() {
  const scene = createScene(P);
  stand(scene);
  receiver(scene);
  barrel(scene);
  carrier(scene);
  return scene.items;
}

export const SCENE = { P, items: buildRifle() };
export const ITEMS = orderScene(SCENE.items, ORDER);

export const shift = (dx, dy = 0, dz = 0) => k.translateAlong(P, [dx, dy, dz]);

export function pinShift(carrierX, degrees) {
  const angle = (degrees * Math.PI) / 180;
  const r = PIN.out - 2;
  return shift(-carrierX, r * (Math.cos(angle) - 1), r * Math.sin(angle));
}

export function springPaths(carrierX) {
  return k.coil(CHANNEL.from, BUFFER.from - carrierX, [0, ZB], 4.4, 9, "x", P);
}

const roundFrame = G.frameAlong([0, 0, 0], [1, 0, 0]);
export const SPENT = G.solidOf(CASE_PROFILE, { ...roundFrame, o: [BOLT_FACE, 0, ZB] }, P);
export const LIVE = G.solidOf([...CASE_PROFILE, ...BULLET_PROFILE.map(([s, r, smooth]) => (smooth ? [CASE + s, r, 1] : [CASE + s, r]))], { ...roundFrame, o: [MAG_CENTRE - ROUND / 2, 0, ROUND_LOW] }, P);
export const BULLET = G.solidOf(BULLET_PROFILE, { ...roundFrame, o: [BARREL.to - 7, 0, ZB] }, P);

export function spentShift(extracted, eject) {
  return shift(-extracted - eject * 10, eject * 72, eject * 22);
}

export function liveShift(forward, rise) {
  const rear = BOLT_FACE - forward;
  return shift(rear - (MAG_CENTRE - ROUND / 2), 0, rise * (ZB - ROUND_LOW));
}

export const bulletShift = (share) => shift(share * 46);

const halfSpace = (x, toward) => {
  const corners = [];
  for (const cx of [x, x + toward * 400]) for (const y of [-60, 80]) for (const z of [-40, 200]) corners.push(at([cx, y, z]));
  return k.pathOf(G.hullOf(corners), true);
};

export const CHAMBER_CLIP = halfSpace(BOLT_FACE, -1);
export const MUZZLE_CLIP = halfSpace(BARREL.to, 1);
