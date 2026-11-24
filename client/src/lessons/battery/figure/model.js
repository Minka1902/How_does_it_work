export const CAPACITY = 3;
export const RESISTANCE = 0.05;
export const FULL = 4.2;
export const EMPTY = 3.0;
export const SPEED = 600;
export const IONS = 12;
export const CURRENT_MIN = 0.5;
export const CURRENT_MAX = 3;

const OCV = [
  [0, 3.0],
  [0.05, 3.4],
  [0.1, 3.5],
  [0.2, 3.6],
  [0.4, 3.68],
  [0.6, 3.78],
  [0.8, 3.95],
  [0.9, 4.05],
  [1, 4.2],
];
const TAPER_FROM = 0.85;

export const STEP_FOCUS = {
  stored: "cell",
  inside: "section",
  ions: "section",
  electrons: "circuit",
  charge: "charger",
  voltage: "cell",
};

export const STEP_MODE = { ions: "discharge", electrons: "discharge", charge: "charge" };

export function openCircuit(soc) {
  const clamped = Math.min(1, Math.max(0, soc));
  const upper = OCV.findIndex(([at]) => at >= clamped);
  if (upper <= 0) return OCV[0][1];
  const [s0, v0] = OCV[upper - 1];
  const [s1, v1] = OCV[upper];
  return v0 + ((clamped - s0) / (s1 - s0)) * (v1 - v0);
}

export function currentOf(state, mode, amps) {
  if (mode === "discharge") return state.soc > 0 && openCircuit(state.soc) - amps * RESISTANCE > EMPTY ? amps : 0;
  if (mode === "charge") return state.soc >= 1 ? 0 : -amps * (state.soc < TAPER_FROM ? 1 : Math.max(0.05, (1 - state.soc) / (1 - TAPER_FROM)));
  return 0;
}

export function stepBattery(state, mode, amps, dt) {
  const current = currentOf(state, mode, amps);
  const soc = Math.min(1, Math.max(0, state.soc - (current * dt * SPEED) / (3600 * CAPACITY)));
  return { soc, current, volts: openCircuit(soc) - current * RESISTANCE };
}

export const initialState = (soc = 0.62) => ({ soc, current: 0, volts: openCircuit(soc) });

export const ionsInAnode = (soc) => Math.round(soc * IONS);
