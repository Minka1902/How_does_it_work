import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as A from "../.claude/skills/anatomy/kit/audit.mjs";
import { frameAlong, unit3 } from "../client/src/anatomy/lathe.mjs";
import { signatureOf } from "../client/src/lesson-kit/anatomy/order.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LESSONS = join(ROOT, "client/src/lessons");
const only = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));

const ownerOf = (name) => name.split(".")[0];

function shapeOf(shape, meta) {
  if (shape.type === "slab") return A.slab(shape.plan, shape.z, shape.h, meta, shape.steps);
  if (shape.type === "extruded") return A.extruded(shape.ring, shape.z, shape.h, meta);
  if (shape.type === "cylinder") return A.cylinder(shape.cx, shape.cy, shape.r, shape.z, shape.h, meta);
  if (shape.type === "solid") return A.solid(frameAlong(shape.origin, unit3(shape.axis)), shape.profile, meta);
  if (shape.type === "ball") return A.ball(shape.centre, shape.r, meta);
  if (shape.type === "prism") return A.prism(shape.F, shape.polygon, shape.s0, shape.s1, meta);
  return null;
}

async function auditLesson(slug) {
  const file = join(LESSONS, slug, "figure/geometry.js");
  if (!existsSync(file)) return null;
  const { SCENE, EXPLODE, AUDIT = {} } = await import(pathToFileURL(file).href);
  const { P, items } = SCENE;
  const R = A.recorder(P, EXPLODE ? { order: EXPLODE.order, spring: EXPLODE.spring } : {});

  const decor = items.filter((item) => item.draw.every((draw) => draw.type === "halo"));
  const drawn = items.filter((item) => !decor.includes(item));
  for (const item of drawn) {
    const meta = { name: item.name, owner: ownerOf(item.name), ...(item.name.startsWith("stand.") ? { ground: true } : {}), ...(item.seated ? { seated: true, cut: item.seated } : {}) };
    const motion = { piece: item.piece ?? "", move: item.move ?? [0, 0, 0] };
    const shapes = [];
    for (const shape of item.shapes) {
      if (shape.type === "route") R.route(shape.name, shape.route, shape.r, { limp: shape.limp, gaps: shape.gaps, touch: shape.touch, free: shape.free, owner: shape.name, ...motion });
      else shapes.push(R.solid(shapeOf(shape, meta)));
    }
    for (const draw of item.draw) if (draw.type === "tube") shapes.push(A.tube(draw.piece.points, draw.piece.radii, { ...meta, owner: item.name }));
    R.put({ name: `${item.name}@${item.order}`, key: item.depth, shapes, ...motion, ...(item.chunk === undefined ? {} : { route: item.name, chunk: item.chunk }) });
  }

  if (EXPLODE) A.settle(R, P);
  else A.settle(R, P, { states: [0] });
  const keys = new Array(items.length).fill(0);
  for (const item of decor) keys[item.order] = -1e6;
  R.settled.items.forEach((item, index) => (keys[drawn[index].order] = Math.round(item.key * 1000) / 1000));
  writeFileSync(join(LESSONS, slug, "figure/order.js"), `export default ${JSON.stringify({ signature: signatureOf(items), keys })};\n`);

  const result = A.audit(R, P, AUDIT);
  console.log(`\n## ${slug}\n${A.report(result)}`);
  const count = A.failures(result);
  console.log(count ? `${slug}: audit failed, ${count} problem${count === 1 ? "" : "s"}` : `${slug}: audit passed`);
  return count;
}

let failed = 0;
for (const slug of readdirSync(LESSONS)) if (!only.length || only.includes(slug)) failed += (await auditLesson(slug)) ?? 0;
process.exitCode = failed ? 1 : 0;
