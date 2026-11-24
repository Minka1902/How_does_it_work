export const TRAVEL = 53;
export const UNITS_PER_MM = 0.6;
export const ROTATION = 22.5;
export const CYCLE_MS = 70;
export const DEMO_SECONDS = 4;
export const FREE_TRAVEL = 2;
export const UNLOCKED_AT = 6;
export const EJECT_AT = 40;
export const PICKUP_AT = 39;
export const CHAMBER_AT = 12;

const PHASES = [
  { id: "fire", from: 0, to: 0.06, x: [0, 0], turn: [0, 0] },
  { id: "gas", from: 0.06, to: 0.12, x: [0, FREE_TRAVEL], turn: [0, 0] },
  { id: "unlock", from: 0.12, to: 0.18, x: [FREE_TRAVEL, UNLOCKED_AT], turn: [0, 1] },
  { id: "extract", from: 0.18, to: 0.36, x: [UNLOCKED_AT, EJECT_AT], turn: [1, 1] },
  { id: "eject", from: 0.36, to: 0.44, x: [EJECT_AT, TRAVEL], turn: [1, 1] },
  { id: "cock", from: 0.44, to: 0.52, x: [TRAVEL, TRAVEL], turn: [1, 1] },
  { id: "feed", from: 0.52, to: 0.8, x: [TRAVEL, UNLOCKED_AT], turn: [1, 1] },
  { id: "lock", from: 0.8, to: 0.9, x: [UNLOCKED_AT, 0], turn: [1, 0] },
  { id: "ready", from: 0.9, to: 1, x: [0, 0], turn: [0, 0] },
];

export const STEP_AT = Object.fromEntries(PHASES.map((phase) => [phase.id, phase.id === "cock" ? phase.from + 0.02 : (phase.from + phase.to) / 2]));

export const STEP_FOCUS = { fire: "barrel", gas: "gas", unlock: "bolt", extract: "case", eject: "case", cock: "buffer", feed: "magazine", lock: "bolt" };

const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.min(1, Math.max(0, t));

export function poseAt(cycle) {
  const t = ((cycle % 1) + 1) % 1;
  const phase = PHASES.find((entry) => t >= entry.from && t < entry.to) ?? PHASES.at(-1);
  const local = smooth(clamp01((t - phase.from) / (phase.to - phase.from)));
  const x = lerp(phase.x[0], phase.x[1], local);
  const turn = lerp(phase.turn[0], phase.turn[1], local);
  const returning = t >= 0.52;
  const caseOut = !returning && t >= 0.12;
  const ejecting = !returning && x >= EJECT_AT && t >= 0.36;
  const ejectShare = ejecting ? clamp01((t - 0.36) / 0.1) : 0;
  const fed = returning && x <= PICKUP_AT;
  const rise = fed ? smooth(clamp01((PICKUP_AT - x) / (PICKUP_AT - CHAMBER_AT))) : 0;
  return {
    t,
    phase: phase.id,
    carrier: x,
    turn: turn * ROTATION,
    gas: t >= 0.03 && t < 0.16,
    bullet: t < 0.08 ? clamp01((t - 0.01) / 0.06) : null,
    spent: t < 0.52 && !(ejecting && ejectShare >= 1) ? { extracted: caseOut ? Math.min(x, EJECT_AT) : 0, eject: ejectShare } : null,
    round: fed ? { forward: x, rise } : null,
  };
}

export const millisecondsOf = (t) => t * CYCLE_MS;
export const travelMm = (x) => x / UNITS_PER_MM;
