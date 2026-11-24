export const KNOB_MIN = 1;
export const KNOB_MAX = 7;
export const HYSTERESIS = 1.5;
export const SPEED = 60;
export const ROOM = 22;
export const EVAPORATOR = -20;

const COOLING = 0.5 / 60;
const LEAK_CLOSED = 0.2 / 60;
const LEAK_OPEN = 3 / 60;

export const setpointOf = (knob) => 9 - knob;

export const STEP_FOCUS = {
  problem: "cabinet",
  boiling: "evaporator",
  evaporator: "evaporator",
  compressor: "compressor",
  condenser: "condenser",
  capillary: "capillary",
  thermostat: "thermostat",
};

export const initialState = (knob = 4) => ({ inside: setpointOf(knob) + HYSTERESIS * 0.6, running: true, seconds: 0 });

export function stepFridge(state, { knob, lidOpen }, dt) {
  const simulated = dt * SPEED;
  const set = setpointOf(knob);
  const leak = (lidOpen ? LEAK_OPEN : LEAK_CLOSED) * Math.max(0, (ROOM - state.inside) / ROOM) * 1.6;
  const running = state.running ? state.inside > set - HYSTERESIS : state.inside > set + HYSTERESIS;
  const inside = state.inside + (leak - (running ? COOLING : 0)) * simulated;
  return { inside: Math.min(ROOM, inside), running, seconds: state.seconds + simulated };
}

export const formatTemperature = (value) => `${value < 0 ? "−" : ""}${Math.abs(value).toFixed(1)} °C`;
