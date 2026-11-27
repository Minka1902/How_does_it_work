import * as k from "../../../anatomy/iso-kit.mjs";
import * as G from "../../../anatomy/lathe.mjs";
import { orderScene } from "../../../lesson-kit/anatomy/order.js";
import { explodeOf } from "../../../lesson-kit/anatomy/explode.js";
import { createScene } from "../../../lesson-kit/anatomy/scene.js";
import { IONS } from "./model.js";
import ORDER from "./order.js";

export const WIDTH = 600;
export const HEIGHT = 340;
const AZIMUTH = 50;
const ELEVATION = 34;

const BASE = { x: -128, y: -66, w: 256, d: 128, r: 8 };
const TRAY = { x: -112, y: -40, w: 114, d: 30, r: 3 };
const TRAY_TOP = 6;
const CELL_R = 12.6;
const CELL_LENGTH = 89.4;
const CELL_Y = -25;
const CELL_Z = TRAY_TOP + CELL_R;
const PLUS = { x: -110, y: -38, w: 8, d: 26, r: 1 };
const MINUS = { x: -8, y: -38, w: 8, d: 26, r: 1 };
const BLOCK_TOP = 34;
const CONTACT = PLUS.x + PLUS.w;
const CELL_START = CONTACT + 0.6;
const CELL_END = CELL_START + CELL_LENGTH;
const SWITCH = { x: -110, y: 26, w: 28, d: 14, r: 2 };
const SWITCH_H = 9;
export const SWITCH_STOPS = { charge: -103, off: -96, discharge: -89 };
const LAMP = [-40, 33];
const SOCKET_R = 7;
const SOCKET_H = 10;
export const BULB = [LAMP[0], LAMP[1], 21];
const BULB_R = 8;
const CHARGER = { x: 10, y: 24, w: 32, d: 18, r: 2 };
const CHARGER_H = 12;
const PLUG = { x: 100, y: 28, w: 12, d: 10, r: 1.5 };
const STAND = [86, -30];
const STACK = { x: 54, y: -52, w: 62, d: 40, r: 0.6 };
export const LAYERS = [
  { name: "section.copper", z: 20, h: 1.5, tone: "mid" },
  { name: "section.anode", z: 21.5, h: 10.5, tone: "hi" },
  { name: "section.separator", z: 32, h: 2, tone: "lo" },
  { name: "section.cathode", z: 34, h: 10.5, tone: "hi" },
  { name: "section.aluminium", z: 44.5, h: 1.5, tone: "mid" },
];
const FACE_Y = STACK.y + STACK.d;
const WIRE_R = 0.8;
const WIRE_Z = 2;
const MOVES = { cell: [0, 0, 34], bulb: [0, 0, 22], knob: [0, 0, 10], aluminium: [0, 0, 40], cathode: [0, 0, 30], separator: [0, 0, 20], anode: [0, 0, 10] };

export const P = k.fitProjection([...k.boxCorners(BASE, -15, 0), ...k.boxCorners({ x: -112, y: -54, w: 230, d: 100, r: 0 }, 0, 48)], WIDTH, HEIGHT, { pad: 14, azimuth: AZIMUTH, elevation: ELEVATION });

const at = (point) => k.iso(point, P);

function base(scene) {
  scene.layer(0);
  scene.halo(BASE, -15, 15);
  for (const [x, y] of k.corners(BASE, 13)) {
    scene.post("stand.flange", [x, y], 8, -15, 1.6, { tone: "lo" });
    scene.post("stand.foot", [x, y], 6, -13.4, 4.4, { tone: "mid" });
  }
  const screws = k.corners(BASE, 9);
  scene
    .slab("stand.base", BASE, -9, 9, { steps: 8, bevel: 1.6 })
    .line(k.planOutline(k.insetPlan(BASE, 5), 0, P))
    .line(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""))
    .dots(screws.map(([x, y]) => at([x, y, 0])));
  const plate = { x: 56, y: 42, w: 54, d: 11, r: 2 };
  scene
    .slab("stand.label", plate, 0, 0.8, { tone: "lo", crease: "none" })
    .line(k.planOutline(k.insetPlan(plate, 1.6), 0.8, P), { tone: "faint" })
    .line([0, 1, 2].map((row) => k.lineOnTop([plate.x + 8, plate.y + 3 + row * 2.4], [plate.x + (row === 1 ? 30 : 42), plate.y + 3 + row * 2.4], 0.8, P)).join(""), { free: true })
    .dots([at([plate.x + 3.5, plate.y + plate.d / 2, 0.8]), at([plate.x + plate.w - 3.5, plate.y + plate.d / 2, 0.8])], { size: 0.45 });
}

function holder(scene) {
  scene.layer(1);
  scene.slab("holder.tray", TRAY, 0, TRAY_TOP, { tone: "lo", bevel: 0.6 }).dots(k.corners(TRAY, 4).map(([x, y]) => at([x, y, TRAY_TOP])), { size: 0.45 });
  for (const plan of [PLUS, MINUS])
    scene
      .slab("holder.block", plan, TRAY_TOP, BLOCK_TOP - TRAY_TOP, { tone: "mid", bevel: 0.5 })
      .dots([at([plan.x + plan.w / 2, plan.y + 5, BLOCK_TOP]), at([plan.x + plan.w / 2, plan.y + plan.d - 5, BLOCK_TOP])], { size: 0.5 });
  scene.turned("cell.contact", [CONTACT, CELL_Y, CELL_Z], [1, 0, 0], [[0, 4.2], [0.6, 4.2]], { tone: "mid", focus: "cell" });
  scene.assembly("cell", MOVES.cell);
  scene.turned(
    "cell.can",
    [CELL_START, CELL_Y, CELL_Z],
    [1, 0, 0],
    [[0, 5], [2.2, 5], [2.2, 10.6], [3.4, CELL_R - 0.4, 1], [4.4, CELL_R], [CELL_LENGTH - 1.2, CELL_R], [CELL_LENGTH, CELL_R - 1.2]],
    { tone: "hi", focus: "cell", seams: [[8, CELL_R], [CELL_LENGTH - 6, CELL_R]] },
  );
  scene.assembly(null);
  const spring = k.coil(CELL_END, MINUS.x, [CELL_Y, CELL_Z], 5.4, 3, "x", P);
  scene
    .mark("holder.spring", [CELL_END + 1.5, CELL_Y, CELL_Z], { shape: { type: "solid", origin: [CELL_END, CELL_Y, CELL_Z], axis: [1, 0, 0], profile: [[0, 5.8], [MINUS.x - CELL_END, 5.8]] } })
    .line(spring.back, { tone: "lo", free: true })
    .line(spring.front, { tone: "mid", free: true });
}

function circuit(scene) {
  scene.layer(1);
  scene
    .slab("switch.box", SWITCH, 0, SWITCH_H, { tone: "mid", bevel: 0.6, focus: "switch" })
    .line(k.planOutline({ x: SWITCH.x + 4, y: SWITCH.y + 5, w: SWITCH.w - 8, d: 4, r: 2 }, SWITCH_H, P), { tone: "lo" })
    .dots(k.corners(SWITCH, 2.6).map(([x, y]) => at([x, y, SWITCH_H])), { size: 0.4 });
  scene.group("switch");
  scene.assembly("knob", MOVES.knob);
  scene.slab("switch.knob", { x: SWITCH_STOPS.off - 3, y: SWITCH.y + 4.5, w: 6, d: 5, r: 1.2 }, SWITCH_H, 3.2, { tone: "hi", bevel: 0.4, focus: "switch" });
  scene.assembly(null);
  scene.group(null);

  scene.post("lamp.socket", LAMP, SOCKET_R, 0, SOCKET_H, { tone: "mid", focus: "lamp" });
  scene.post("lamp.neck", LAMP, 4, SOCKET_H, BULB[2] - Math.sqrt(BULB_R ** 2 - 16) - SOCKET_H, { tone: "lo", focus: "lamp", piece: "bulb", move: MOVES.bulb });
  scene.ball("lamp.bulb", BULB, BULB_R, { tone: "hi", focus: "lamp", piece: "bulb", move: MOVES.bulb });

  scene
    .slab("charger.box", CHARGER, 0, CHARGER_H, { tone: "mid", bevel: 0.8, focus: "charger" })
    .line([0, 1, 2, 3].map((index) => k.planOutline({ x: CHARGER.x + 14 + index * 4, y: CHARGER.y + 4, w: 2, d: 10, r: 1 }, CHARGER_H, P)).join(""), { tone: "lo" });
  scene.slab("charger.plug", PLUG, 0, 6, { tone: "mid", bevel: 0.4 });
  for (const y of [PLUG.y + 2.5, PLUG.y + PLUG.d - 3.5]) scene.slab("charger.prong", { x: PLUG.x + PLUG.w, y, w: 5, d: 1, r: 0.2 }, 2, 2.2, { tone: "lo" });

  const cable = (name, points, focus = "circuit") => scene.pipe(name, points, WIRE_R, { tone: "lo", limp: true, focus, flow: "lo", maxLength: 24, bend: 5.5 });
  cable("wire.plus", [[PLUS.x + 4, PLUS.y + PLUS.d, 12], [PLUS.x + 4, -4, 12], [PLUS.x + 4, -4, WIRE_Z], [PLUS.x + 4, SWITCH.y, WIRE_Z]]);
  cable("wire.lamp", [[SWITCH.x + SWITCH.w, LAMP[1], WIRE_Z], [LAMP[0] - SOCKET_R, LAMP[1], WIRE_Z]]);
  cable("wire.return", [[LAMP[0], LAMP[1] - SOCKET_R, WIRE_Z], [LAMP[0], -4, WIRE_Z], [MINUS.x + 4, -4, WIRE_Z], [MINUS.x + 4, -4, 12], [MINUS.x + 4, MINUS.y + MINUS.d, 12]]);
  cable("wire.charge", [[SWITCH_STOPS.charge, SWITCH.y + SWITCH.d, WIRE_Z], [SWITCH_STOPS.charge, 54, WIRE_Z], [CHARGER.x + 12, 54, WIRE_Z], [CHARGER.x + 12, CHARGER.y + CHARGER.d, WIRE_Z]], "charger");
  cable("wire.charger", [[CHARGER.x + 24, CHARGER.y, WIRE_Z], [CHARGER.x + 24, -17, WIRE_Z], [MINUS.x + MINUS.w + 12, -17, WIRE_Z], [MINUS.x + MINUS.w + 12, -17, 10], [MINUS.x + MINUS.w, -17, 10]], "charger");
  scene.pipe("charger.cord", [[CHARGER.x + CHARGER.w, LAMP[1], WIRE_Z], [PLUG.x, LAMP[1], WIRE_Z]], WIRE_R, { tone: "lo", limp: true, focus: "charger" });
}

function section(scene) {
  scene.layer(1);
  scene.post("section.foot", STAND, 14, 0, 3, { tone: "lo" });
  scene.post("section.post", STAND, 4, 3, 15, { tone: "mid" });
  const top = k.insetPlan(STACK, -2);
  scene.slab("section.stage", top, 18, 2, { tone: "mid", bevel: 0.5 }).dots(k.corners(top, 2.6).map(([x, y]) => at([x, y, 20])), { size: 0.45 });
  const face = (x, z) => at([x, FACE_Y, z]);
  const x0 = STACK.x;
  const x1 = STACK.x + STACK.w;
  const [copper, anode, separator, cathode, aluminium] = LAYERS;
  const sheets = [0.25, 0.5, 0.75].map((share) => k.sideSeam(STACK, anode.z + anode.h * share, P, 2)).join("");
  const grains = [];
  for (let column = 0; column < 15; column++) for (let row = 0; row < 3; row++) grains.push(face(x0 + 2.5 + column * 4.1 + (row % 2) * 2, cathode.z + 2 + row * 3.2));
  const pores = [];
  for (let column = 0; column < 30; column++) pores.push(face(x0 + 1.2 + column * 2.05, separator.z + separator.h / 2));
  scene.slab(copper.name, STACK, copper.z, copper.h, { tone: copper.tone, crease: "lo", focus: "section", steps: 2 });
  const layer = (piece) => ({ crease: "lo", focus: "section", steps: 2, piece, move: MOVES[piece] });
  scene.slab(anode.name, STACK, anode.z, anode.h, { tone: anode.tone, ...layer("anode") }).line(sheets, { tone: "faint" });
  scene.slab(separator.name, STACK, separator.z, separator.h, { tone: separator.tone, ...layer("separator") }).dots(pores, { size: 0.3, tone: "lo" });
  scene.slab(cathode.name, STACK, cathode.z, cathode.h, { tone: cathode.tone, ...layer("cathode") }).dots(grains, { size: 0.55, tone: "lo" });
  scene
    .slab(aluminium.name, STACK, aluminium.z, aluminium.h, { tone: aluminium.tone, ...layer("aluminium") })
    .line(k.planOutline(k.insetPlan(STACK, 3), aluminium.z + aluminium.h, P), { tone: "faint" });
  scene.slab("section.tab", { x: x0 - 8, y: STACK.y + 8, w: 8, d: 10, r: 0.4 }, copper.z, copper.h, { tone: "mid", focus: "section", steps: 2 });
  scene.slab("section.tab", { x: x1, y: STACK.y + 22, w: 8, d: 10, r: 0.4 }, aluminium.z, aluminium.h, { tone: "mid", ...layer("aluminium") });
}

export function ionSlots() {
  const columns = IONS / 2;
  const xOf = (column) => STACK.x + 7 + (column * (STACK.w - 14)) / (columns - 1);
  const anode = LAYERS[1];
  const cathode = LAYERS[3];
  const slots = (layer) => Array.from({ length: IONS }, (_, index) => [xOf(index % columns), FACE_Y, layer.z + (index < columns ? 3.2 : layer.h - 3.2)]);
  return { anode: slots(anode).map(at), cathode: slots(cathode).map(at) };
}

function buildBattery() {
  const scene = createScene(P);
  base(scene);
  holder(scene);
  circuit(scene);
  section(scene);
  return scene.items;
}

export const SCENE = { P, items: buildBattery() };
export const ITEMS = orderScene(SCENE.items, ORDER);
export const EXPLODE = explodeOf(P, MOVES);
export const SWITCH_SHIFT = Object.fromEntries(Object.entries(SWITCH_STOPS).map(([mode, x]) => [mode, k.translateAlong(P, [x - SWITCH_STOPS.off, 0, 0])]));
export const BULB_SCREEN = { centre: at(BULB), radius: G.scaleOf(P) * BULB_R * 2.4 };
export const CHARGER_LED = at([CHARGER.x + 6, CHARGER.y + 9, CHARGER_H]);
