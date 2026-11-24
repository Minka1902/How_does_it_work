import * as k from "../../../anatomy/iso-kit.mjs";
import * as G from "../../../anatomy/lathe.mjs";
import { orderScene } from "../../../lesson-kit/anatomy/order.js";
import { createScene } from "../../../lesson-kit/anatomy/scene.js";
import ORDER from "./order.js";

export const WIDTH = 600;
export const HEIGHT = 400;
const AZIMUTH = 52;
const ELEVATION = 38;

const BASE = { x: -156, y: -90, w: 312, d: 160, r: 8 };
const CAB = { x: -140, y: -52, w: 116, d: 92, r: 1.5 };
const WALL = 6;
const PLINTH_TOP = 5;
const FLOOR_TOP = 11;
const RIM = 58;
const INNER_BACK = CAB.y + WALL;
const TUBE_Y = INNER_BACK + 1.6 + 2.2;
const NOTCH = { x0: -70, x1: -50, z: 42 };
const SUCTION_X = -63;
const CAPILLARY_X = -55;
const CX = 32;
const CY = 0;
const DOME_Z = 14;
const DOME_R = 22;
const PANEL_Y = -82;
const COND_Y = -71.5;
const COND_ROWS = [56, 42, 28, 14];
const COND_R = 1.8;
const EVAP_ROWS = [20, 27, 34, 41, 48];
const KNOB = [-49, 47, 35];
const KNOB_R = 6.5;
const KNOB_H = 5;
const LINE_R = 2.2;
const CAPILLARY_R = 0.9;
const CABLE_R = 0.6;
const TERMINAL_Y = Math.sqrt(DOME_R ** 2 - 6 ** 2);

export const P = k.fitProjection(
  [...k.boxCorners(BASE, -16, 0), ...k.boxCorners({ x: -140, y: -86, w: 286, d: 130, r: 0 }, 0, 76)],
  WIDTH,
  HEIGHT,
  { pad: 18, azimuth: AZIMUTH, elevation: ELEVATION },
);

const at = (point) => k.iso(point, P);
const path3 = (points) => k.pathOf(points.map(at));
const inside = (point) => point[1] > INNER_BACK && point[0] < CAB.x + CAB.w && point[2] < RIM + 4;

const serpentine = (rows, left, right, y, startLeft) =>
  rows.flatMap((z, index) => ((index % 2 === 0) === startLeft ? [[left, y, z], [right, y, z]] : [[right, y, z], [left, y, z]]));

export const KNOB_ANGLE = (knob) => (-135 + ((knob - 1) / 6) * 270) * (Math.PI / 180);

export function knobPointer(knob) {
  const angle = KNOB_ANGLE(knob);
  const face = KNOB[1] + KNOB_H;
  const point = (r) => [KNOB[0] + r * Math.sin(angle), face, KNOB[2] + r * Math.cos(angle)];
  return path3([point(0.8), point(KNOB_R - 1.4)]);
}

function base(scene) {
  scene.layer(0);
  scene.halo(BASE, -16, 16);
  for (const [x, y] of k.corners(BASE, 13)) {
    scene.post("stand.flange", [x, y], 8, -16, 1.6, { tone: "lo" });
    scene.post("stand.foot", [x, y], 6, -14.4, 4.4, { tone: "mid" });
  }
  const screws = k.corners(BASE, 9);
  scene
    .slab("stand.base", BASE, -10, 10, { steps: 8, bevel: 1.6 })
    .line(k.planOutline(k.insetPlan(BASE, 5), 0, P))
    .line(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""))
    .dots(screws.map(([x, y]) => at([x, y, 0])));
  const plate = { x: 70, y: 40, w: 60, d: 14, r: 2 };
  scene
    .slab("stand.label", plate, 0, 0.8, { tone: "lo", crease: "none" })
    .line(k.planOutline(k.insetPlan(plate, 1.6), 0.8, P), { tone: "faint" })
    .line([0, 1, 2].map((row) => k.lineOnTop([plate.x + 9, plate.y + 4 + row * 2.6], [plate.x + (row === 1 ? 36 : 48), plate.y + 4 + row * 2.6], 0.8, P)).join(""), { free: true })
    .dots([at([plate.x + 4, plate.y + plate.d / 2, 0.8]), at([plate.x + plate.w - 4, plate.y + plate.d / 2, 0.8])], { size: 0.45 });
}

function cabinet(scene) {
  scene.layer(1);
  scene.slab("cabinet.plinth", k.insetPlan(CAB, 5), 0, PLINTH_TOP, { tone: "lo", focus: "cabinet" });
  scene.slab("cabinet.floor", CAB, PLINTH_TOP, FLOOR_TOP - PLINTH_TOP, { focus: "cabinet" });
  const back = { y: CAB.y, d: WALL, r: 1 };
  scene.slab("cabinet.back", { ...back, x: CAB.x, w: NOTCH.x0 - CAB.x }, FLOOR_TOP, RIM - FLOOR_TOP, { focus: "cabinet", seams: [FLOOR_TOP + 10] });
  scene.slab("cabinet.back", { ...back, x: NOTCH.x0, w: NOTCH.x1 - NOTCH.x0, r: 0 }, FLOOR_TOP, NOTCH.z - FLOOR_TOP, { focus: "cabinet", seams: [FLOOR_TOP + 10] });
  scene.slab("cabinet.back", { ...back, x: NOTCH.x1, w: CAB.x + CAB.w - NOTCH.x1 }, FLOOR_TOP, RIM - FLOOR_TOP, { focus: "cabinet", seams: [FLOOR_TOP + 10] });
  scene.slab("cabinet.left", { x: CAB.x, y: CAB.y + WALL, w: WALL, d: CAB.d - WALL, r: 1 }, FLOOR_TOP, RIM - FLOOR_TOP, { focus: "cabinet" });
  for (const x of [-104, -40]) scene.slab("cabinet.hinge", { x, y: CAB.y - 3, w: 10, d: 3, r: 0.6 }, RIM - 10, 10, { tone: "lo" }).dots([at([x + 2.5, CAB.y - 3, RIM - 5]), at([x + 7.5, CAB.y - 3, RIM - 5])], { size: 0.4 });

  scene.layer(2);
  scene
    .slab("evaporator.plate", { x: -126, y: INNER_BACK, w: 54, d: 1.6, r: 0.4 }, 14, 40, { tone: "lo", focus: "evaporator", bias: -200 })
    .dots([[-122, 51], [-76, 51], [-122, 17], [-76, 17]].map(([x, z]) => at([x, INNER_BACK + 1.6, z])), { size: 0.45 });
  scene.slab("cabinet.carton", { x: -114, y: -36, w: 22, d: 16, r: 1 }, FLOOR_TOP, 30, { tone: "lo", bevel: 0.6 });
  for (const [x, y] of [[-80, -26], [-66, -31]]) {
    scene.turned("cabinet.bottle", [x, y, FLOOR_TOP], [0, 0, 1], [[0, 5.2], [20, 5.2], [24, 3.2, 1], [27, 2.1, 1], [31, 2.1]], { tone: "mid", seams: [[4, 5.2]] });
    scene.post("cabinet.cap", [x, y], 2.5, FLOOR_TOP + 31, 3, { tone: "lo" });
  }

  scene.layer(3);
  scene.slab("cabinet.front", { x: CAB.x + WALL, y: CAB.y + CAB.d - WALL, w: CAB.w - WALL, d: WALL, r: 1 }, FLOOR_TOP, RIM - FLOOR_TOP, { focus: "cabinet", seams: [FLOOR_TOP + 10] });
  scene.slab("cabinet.right", { x: CAB.x + CAB.w - WALL, y: CAB.y + WALL, w: WALL, d: CAB.d - WALL * 2, r: 1 }, FLOOR_TOP, RIM - FLOOR_TOP, { focus: "cabinet", seams: [FLOOR_TOP + 10] });
  scene.mark("cabinet.gasket", [CAB.x + CAB.w / 2, CAB.y + CAB.d / 2, RIM], { bias: 1e3, shape: { type: "slab", plan: k.insetPlan(CAB, 2.5), z: RIM, h: 0.05, steps: 4 } }).line(k.planOutline(k.insetPlan(CAB, 3), RIM, P), { tone: "faint" });

  scene.layer(5);
  scene.group("lid");
  scene.slab("cabinet.lid", { ...CAB, r: 2 }, RIM, 6, { bevel: 1 }).line(k.planOutline(k.insetPlan(CAB, 8), RIM + 6, P), { tone: "faint" });
  scene.slab("cabinet.handle", { x: -96, y: CAB.y + CAB.d - 9, w: 28, d: 5, r: 1.2 }, RIM + 6, 3, { tone: "mid" });
  scene.group(null);
}

function thermostat(scene) {
  scene.layer(4);
  const box = { x: -64, y: CAB.y + CAB.d, w: 30, d: 7, r: 1 };
  const face = box.y + box.d;
  const ticks = [];
  for (let knob = 1; knob <= 7; knob++) {
    const angle = KNOB_ANGLE(knob);
    const r0 = KNOB_R + 1.4;
    const r1 = KNOB_R + (knob % 3 === 1 ? 3.4 : 2.4);
    ticks.push(path3([[KNOB[0] + r0 * Math.sin(angle), face, KNOB[2] + r0 * Math.cos(angle)], [KNOB[0] + r1 * Math.sin(angle), face, KNOB[2] + r1 * Math.cos(angle)]]));
  }
  scene
    .slab("thermostat.box", box, 24, 22, { bevel: 0.6, focus: "thermostat" })
    .line(ticks.join(""), { free: "end" })
    .dots([[-61, 43], [-37, 43], [-61, 27], [-37, 27]].map(([x, z]) => at([x, face, z])), { size: 0.45 });
  const F = G.frameAlong([KNOB[0], face, KNOB[2]], [0, 1, 0]);
  const ribs = G.ribsOf(F, 0.6, KNOB_H - 0.6, KNOB_R, 28, P, { fade: [0.1, 0.55], seams: true });
  scene.turned("thermostat.knob", [KNOB[0], face, KNOB[2]], [0, 1, 0], [[0, KNOB_R], [KNOB_H, KNOB_R]], { tone: "hi", focus: "thermostat" }).faded(ribs);
}

function compressor(scene) {
  scene.layer(4);
  const plate = { x: CX - 30, y: CY - 25, w: 60, d: 50, r: 3 };
  scene.slab("compressor.plate", plate, 0, 4, { tone: "lo", bevel: 0.6 });
  const grommets = k.corners(plate, 6);
  for (const [x, y] of grommets) scene.post("compressor.grommet", [x, y], 4.2, 4, 6, { tone: "lo" });
  scene.slab("compressor.bracket", { x: CX - 28, y: CY - 23, w: 56, d: 46, r: 3 }, 10, 4, { tone: "mid", focus: "compressor" });
  for (const [x, y] of grommets) scene.post("compressor.bolt", [x, y], 1.9, DOME_Z, 2.2, { tone: "mid" });
  scene.turned("compressor.dome", [CX, CY, DOME_Z], [0, 0, 1], [[0, DOME_R - 2], [2, DOME_R], [26, DOME_R], [33, DOME_R - 3, 1], [39, DOME_R - 9, 1], [42.5, DOME_R - 15, 1], [44, 0]], {
    tone: "hi",
    focus: "compressor",
    seams: [[12, DOME_R]],
  });
  scene.post("compressor.process", [CX, CY], 1.2, DOME_Z + 43.7, 5, { tone: "mid" });
  scene.turned("compressor.terminal", [CX, CY + TERMINAL_Y, 28], [0, 1, 0], [[0, 6], [6, 6], [7.5, 4.6]], { tone: "mid" });
  scene.turned("compressor.discharge", [CX + 8, CY - DOME_R + 3, 38], [0, -1, 0], [[0, 2.8], [7, 2.8]], { tone: "mid", focus: "compressor" });
  scene.turned("compressor.suction", [CX - 8, CY - DOME_R + 3, 31], [0, -1, 0], [[0, 3.2], [7, 3.2]], { tone: "mid", focus: "compressor" });
}

function condenser(scene) {
  scene.layer(1);
  for (const x of [52, 136]) scene.slab("condenser.foot", { x, y: PANEL_Y - 4, w: 8, d: 10, r: 1 }, 0, 6, { tone: "lo" });
  scene.slab("condenser.panel", { x: 52, y: PANEL_Y, w: 92, d: 2.4, r: 0.5 }, 6, 60, { tone: "lo", focus: "condenser", bias: -300 });
  for (const x of [89, 106]) scene.slab("condenser.standoff", { x, y: PANEL_Y + 2.4, w: 3, d: COND_Y - COND_R - PANEL_Y - 2.4, r: 0.3 }, 8, 54, { tone: "lo", bias: -200 });
  const fins = [];
  for (let x = 70; x <= 128; x += 6) fins.push(path3([[x, COND_Y + COND_R, COND_ROWS.at(-1)], [x, COND_Y + COND_R, COND_ROWS[0]]]));
  scene.mark("condenser.fins", [99, COND_Y + COND_R + 0.5, 35], { bias: 200, shape: { type: "slab", plan: { x: 69, y: COND_Y + COND_R, w: 60, d: 0.2, r: 0 }, z: COND_ROWS.at(-1), h: COND_ROWS[0] - COND_ROWS.at(-1), steps: 2 } }).line(fins.join(""), { tone: "lo" });
}

function plumbing(scene) {
  const layerOf = (piece) => (inside(piece.points[Math.floor(piece.points.length / 2)]) ? 2 : 1);
  scene.layer(1);
  const discharge = [[CX + 8, CY - DOME_R - 4, 38], [CX + 8, COND_Y, 38], [CX + 8, COND_Y, COND_ROWS[0]], ...serpentine(COND_ROWS, 66, 130, COND_Y, true), [58, COND_Y, 14], [58, -58, 14], [50, -58, 14]];
  scene.pipe("discharge", discharge, COND_R, { focus: "condenser", flow: "red", layerOf, touch: ["condenser.standoff*", "condenser.fins*"] });
  scene.turned("drier", [50, -58, 14], [-1, 0, 0], [[0, 2.4], [2, 3.4, 1], [15, 3.4, 1], [16.6, 1.6], [18, 1.6]], { tone: "mid", focus: "capillary", seams: [[5, 3.4]] });
  scene.slab("drier.clip", { x: 38, y: -61, w: 6, d: 6, r: 1 }, 0, 14 - 3.4, { tone: "lo" });
  const low = FLOOR_TOP + 2.6;
  const capillary = [[32, -58, 14], [CAPILLARY_X, -58, 14], [CAPILLARY_X, -58, 50], [CAPILLARY_X, TUBE_Y, 50], [CAPILLARY_X, TUBE_Y, low], [-128, TUBE_Y, low], [-128, TUBE_Y, EVAP_ROWS[0]], [-121, TUBE_Y, EVAP_ROWS[0]]];
  scene.pipe("capillary", capillary, CAPILLARY_R, { focus: "capillary", flow: "lo", layerOf, maxLength: 24 });
  scene.layer(2);
  scene.turned("evaporator.coupling", [-121, TUBE_Y, EVAP_ROWS[0]], [1, 0, 0], [[0, 2.6], [3, 2.6]], { tone: "mid", focus: "capillary" });
  const suction = [[-118, TUBE_Y, EVAP_ROWS[0]], ...serpentine(EVAP_ROWS, -118, -78, TUBE_Y, true).slice(1, -1), [SUCTION_X, TUBE_Y, EVAP_ROWS.at(-1)], [SUCTION_X, -64, EVAP_ROWS.at(-1)], [SUCTION_X, -64, 31], [CX - 8, -64, 31], [CX - 8, CY - DOME_R - 4, 31]];
  scene.pipe("suction", suction, LINE_R, { focus: "evaporator", flow: "blue", layerOf, touch: ["evaporator.plate*"] });
  const floor = CABLE_R + 0.4;
  const cable = [[CX, CY + TERMINAL_Y + 7.5, 28], [CX, 44, 28], [CX, 44, floor], [KNOB[0], 44, floor], [KNOB[0], 44, 24]];
  scene.pipe("cable", cable, CABLE_R, { layer: 4, limp: true, tone: "lo" });
}

function buildFridge() {
  const scene = createScene(P);
  base(scene);
  cabinet(scene);
  condenser(scene);
  compressor(scene);
  thermostat(scene);
  plumbing(scene);
  return scene.items;
}

export const SCENE = { P, items: buildFridge() };
export const ITEMS = orderScene(SCENE.items, ORDER);
export const LED = at([-38, CAB.y + CAB.d + 7, 41]);
