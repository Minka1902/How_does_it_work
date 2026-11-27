import { sortScene } from "./scene.js";

export function signatureOf(items) {
  let hash = 0;
  for (const item of items) for (const char of `${item.name}|${item.layer}|${item.group ?? ""}|${item.piece ?? ""};`) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  return `${items.length}:${hash >>> 0}`;
}

export function orderScene(items, saved) {
  const valid = saved && saved.signature === signatureOf(items) && saved.keys?.length === items.length;
  const keyed = valid ? items.map((item) => ({ ...item, key: saved.keys[item.order] })) : sortScene(items).map((item, index) => ({ ...item, key: index }));
  return keyed.sort((a, b) => a.key - b.key || a.order - b.order);
}
