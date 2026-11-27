export const PINS = 5;
export const DEPTHS = 10;
export const PITCH = 7.92;
export const FIRST_PIN = 10;
export const PIN_X = Array.from({ length: PINS }, (_, index) => FIRST_PIN + index * PITCH);
export const DEPTH_STEP = 0.76;
export const KEY_TOP = 51;
export const KEY_BOTTOM = 37;
export const SHEAR = 59;
export const REST = 43;
export const DRIVER = 10;
export const CHAMBER_TOP = 81;
export const KEY_LENGTH = 54;
export const KEY_OUT = -58;
export const TOLERANCE = 0.3;
export const TURN = Math.PI / 2;

const FLAT = 1.2;
const TIP_RISE = 6;

export const KEYS = {
  correct: [3, 7, 2, 5, 4],
  wrong: [3, 2, 6, 5, 1],
};

export const STEP_FOCUS = { puzzle: "housing", plug: "plug", pins: "pins", key: "key", shear: "pins", wrong: "pins", combinations: "key" };
export const STEP_STATE = {
  puzzle: { key: "correct", inserted: false },
  plug: { key: "correct", inserted: false },
  pins: { key: "correct", inserted: false },
  key: { key: "correct", inserted: true },
  shear: { key: "correct", inserted: true, turn: true },
  wrong: { key: "wrong", inserted: true, turn: true },
  combinations: { key: "correct", inserted: true },
};

export const cutHeight = (depth) => KEY_TOP - depth * DEPTH_STEP;
export const keyPinLength = (index) => SHEAR - cutHeight(KEYS.correct[index]);

export function keyProfile(cuts) {
  const points = [[KEY_LENGTH, KEY_BOTTOM], [KEY_LENGTH, KEY_TOP - TIP_RISE]];
  for (let index = PINS - 1; index >= 0; index--) {
    const h = cutHeight(cuts[index]);
    points.push([PIN_X[index] + FLAT, h], [PIN_X[index] - FLAT, h]);
  }
  points.push([2, KEY_TOP], [-3, KEY_TOP], [-3, KEY_BOTTOM]);
  return points;
}

export function surfaceAt(profile, x) {
  const top = profile.slice(1, -1);
  if (x > top[0][0] || x < top.at(-1)[0]) return null;
  for (let index = 0; index < top.length - 1; index++) {
    const [x0, z0] = top[index];
    const [x1, z1] = top[index + 1];
    if (x <= x0 && x >= x1) return x0 === x1 ? Math.max(z0, z1) : z0 + ((x - x0) / (x1 - x0)) * (z1 - z0);
  }
  return null;
}

export function pinsAt(cuts, insertion) {
  const profile = keyProfile(cuts);
  return PIN_X.map((x, index) => {
    const surface = surfaceAt(profile, x - insertion);
    const bottom = surface === null ? REST : Math.max(REST, surface);
    const top = bottom + keyPinLength(index);
    return { bottom, top, aligned: Math.abs(insertion) < 0.05 && Math.abs(top - SHEAR) < TOLERANCE };
  });
}

export const canTurn = (pins) => pins.every((pin) => pin.aligned);

export const combinations = () => DEPTHS ** PINS;
