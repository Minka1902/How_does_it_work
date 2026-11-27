import * as k from "../../anatomy/iso-kit.mjs";
import * as G from "../../anatomy/lathe.mjs";
import { tubePieces } from "../../anatomy/tube.mjs";
import { centreOf, platePaths } from "./plate.js";

const BEND = 2.6;

function decorate(item) {
  item.line = (d, style = {}) => (d && item.draw.push({ type: "line", d, tone: "lo", ...style }), item);
  item.dots = (points, style = {}) => (points.length && item.draw.push({ type: "dots", points, size: 0.5, tone: "mid", ...style }), item);
  item.cavity = (front, back) => (item.draw.push({ type: "cavity", front, back }), item);
  item.faded = (list, style = {}) => (item.draw.push({ type: "faded", list: list.filter(({ alpha }) => alpha >= 0.02), tone: "lo", ...style }), item);
  return item;
}

export function createScene(P) {
  const items = [];
  const state = { layer: 0, group: null, piece: null, move: [0, 0, 0] };
  const V = G.viewOf(P);

  const add = (name, at, draw, shapes, style) => {
    const piece = style.piece === undefined ? state.piece : style.piece;
    const move = style.move ?? (piece === state.piece ? state.move : [0, 0, 0]);
    const item = decorate({
      name,
      layer: style.layer ?? state.layer,
      group: style.group ?? state.group,
      focus: style.focus ?? null,
      piece,
      move,
      lift: G.dot3(move, V),
      depth: G.dot3(at, V) + (style.bias ?? 0),
      draw,
      shapes,
      order: items.length,
    });
    items.push(item);
    return item;
  };

  const solidDraw = (paths, style, inner) => ({ type: "solid", paths, tone: style.tone ?? "mid", crease: style.crease ?? "faint", flat: style.flat ?? false, lit: style.lit ?? false, inner });

  return {
    P,
    items,
    layer(index) {
      state.layer = index;
    },
    group(name) {
      state.group = name;
    },
    assembly(name, move = [0, 0, 0]) {
      state.piece = name;
      state.move = move;
    },
    halo(plan, z, h) {
      return add("halo", [plan.x + plan.w / 2, plan.y + plan.d / 2, z - 1e3], [{ type: "halo", d: k.haloOf(plan, z, h, P) }], [], { layer: -1 });
    },
    slab(name, plan, z, h, style = {}) {
      const steps = style.steps ?? 4;
      const paths = k.slabOf(plan, z, h, P, steps, style.bevel ?? 0);
      const seams = (style.seams ?? []).map((sz) => ({ type: "line", d: k.sideSeam(plan, sz, P, steps), tone: "faint" }));
      return add(name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], [solidDraw(paths, style, seams)], [{ type: "slab", plan, z, h, steps }], style);
    },
    post(name, [cx, cy], r, z, h, style = {}) {
      const paths = k.cylinder(cx, cy, r, z, h, P, style.steps ?? G.stepsFor(r, 16, 72, G.scaleOf(P)), style.bevel ?? 0);
      return add(name, [cx, cy, z + h / 2], [solidDraw(paths, style)], [{ type: "cylinder", cx, cy, r, z, h }], style);
    },
    turned(name, origin, axis, profile, style = {}) {
      const F = G.frameAlong(origin, G.unit3(axis));
      const paths = G.solidOf(profile, F, P, style.options ?? {});
      const s = profile.map(([value]) => value);
      const mid = (Math.min(...s) + Math.max(...s)) / 2;
      const seams = (style.seams ?? []).map(([sAt, r]) => ({ type: "line", d: G.arcOf(F, sAt, r, P), tone: "faint" }));
      return add(name, G.add3(origin, G.mul3(F.a, mid)), [solidDraw(paths, style, seams)], [{ type: "solid", origin, axis, profile }], style);
    },
    plate(name, F, polygon, s0, s1, style = {}) {
      return add(name, centreOf(F, polygon, s0, s1), [solidDraw(platePaths(F, polygon, s0, s1, P), style)], [{ type: "prism", F, polygon, s0, s1 }], style);
    },
    ball(name, centre, r, style = {}) {
      return add(name, centre, [solidDraw(G.sphereOf(centre, r, P), style)], [{ type: "ball", centre, r }], style);
    },
    pipe(name, points, r, style = {}) {
      const route = style.raw ? points : G.fillet(points, style.bend ?? Math.max(3, BEND * r), 7, { P, tube: r });
      const pieces = tubePieces(route, r, P, { maxLength: style.maxLength ?? 18, gaps: style.gaps ?? [], caps: style.caps ?? true, stripes: style.stripes ?? "auto" });
      const shape = { type: "route", name, route, r, gaps: style.gaps ?? [], limp: style.limp ?? false, touch: style.touch ?? [], free: style.free ?? [false, false] };
      const made = pieces.map((piece, index) => {
        const draw = [{ type: "tube", piece, tone: style.tone ?? "mid" }];
        if (style.flow) draw.push({ type: "line", d: k.pathOf(piece.points.map((point) => k.iso(point, P))), tone: style.flow, flow: true, free: true });
        return Object.assign(add(name, piece.mid, draw, index ? [] : [shape], { ...style, layer: style.layerOf ? style.layerOf(piece) : style.layer }), { chunk: index });
      });
      return { route, pieces: made };
    },
    mark(name, at, style = {}) {
      return add(name, at, [], style.shapes ?? (style.shape ? [style.shape] : []), style);
    },
  };
}

export function sortScene(items) {
  return [...items].sort((a, b) => a.layer - b.layer || a.depth - b.depth || a.order - b.order);
}
