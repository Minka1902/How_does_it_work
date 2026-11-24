import { sortScene } from "./scene.js";

export function signatureOf(items) {
  let hash = 0;
  for (const item of items) for (const char of `${item.name}|${item.layer}|${item.group ?? ""};`) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  return `${items.length}:${hash >>> 0}`;
}

export function orderScene(items, saved) {
  if (!saved || saved.signature !== signatureOf(items)) return sortScene(items);
  return saved.order.map((index) => items[index]);
}
