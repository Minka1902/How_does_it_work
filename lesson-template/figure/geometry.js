import * as k from "../../../anatomy/iso-kit.mjs";
import { explodeOf } from "../../../lesson-kit/anatomy/explode.js";
import { orderScene } from "../../../lesson-kit/anatomy/order.js";
import { createScene } from "../../../lesson-kit/anatomy/scene.js";
import ORDER from "./order.js";

export const WIDTH = 600;
export const HEIGHT = 340;

const BASE = { x: -120, y: -60, w: 240, d: 120, r: 8 };
const MOVES = { part: [0, 0, 40] };

export const P = k.fitProjection(k.boxCorners(BASE, -14, 100), WIDTH, HEIGHT, { pad: 20 });

function buildScene() {
  const scene = createScene(P);
  scene.layer(0);
  scene.halo(BASE, -14, 14);
  for (const [x, y] of k.corners(BASE, 13)) scene.post("stand.foot", [x, y], 6, -14, 6, { tone: "mid" });
  scene.slab("stand.base", BASE, -8, 8, { steps: 8, bevel: 1.6, focus: "base" }).line(k.planOutline(k.insetPlan(BASE, 5), 0, P));
  scene.layer(1);
  scene.assembly("part", MOVES.part);
  scene.post("part.post", [0, 0], 14, 0, 50, { tone: "hi", focus: "part" });
  scene.assembly(null);
  return scene.items;
}

export const SCENE = { P, items: buildScene() };
export const ITEMS = orderScene(SCENE.items, ORDER);
export const EXPLODE = explodeOf(P, MOVES);
