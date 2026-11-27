export const K = 0.019;
export const RESISTANCE = 2;
export const INERTIA = 2e-6;
export const FRICTION = 2e-7;
export const SLOW = 100;
export const VOLTS_MAX = 12;
export const LOAD_MAX = 120;
export const POLES = 3;

const RPM = 60 / (2 * Math.PI);
const SUBSTEPS = 40;

export const STEP_FOCUS = { magnets: "magnets", coil: "rotor", commutator: "commutator", brushes: "brushes", speed: "battery", generator: "rotor" };
export const STEP_STATE = {
  magnets: { volts: 0 },
  coil: { volts: 3 },
  commutator: { volts: 3 },
  brushes: { volts: 6 },
  speed: { volts: 12 },
  generator: { volts: 0 },
};

export const initialState = () => ({ omega: 0, angle: 0, current: 0 });

export function currentOf(volts, omega) {
  return (volts - K * omega) / RESISTANCE;
}

export function stepMotor(state, { volts, load }, dt) {
  let { omega, angle } = state;
  const loadTorque = load / 1000;
  const h = dt / SUBSTEPS;
  for (let step = 0; step < SUBSTEPS; step++) {
    const drive = K * currentOf(volts, omega) - FRICTION * omega;
    if (omega === 0 && Math.abs(drive) <= loadTorque) continue;
    const resist = loadTorque * Math.sign(omega || drive);
    const next = omega + ((drive - resist) / INERTIA) * h;
    omega = omega !== 0 && Math.sign(next) !== Math.sign(omega) ? 0 : next;
  }
  angle += (omega / SLOW) * dt;
  return { omega, angle, current: currentOf(volts, omega) };
}

export function spinByHand(state, angle, dt, volts) {
  const omega = dt > 0 ? ((angle - state.angle) / dt) * SLOW : state.omega;
  return { omega, angle, current: currentOf(volts, omega) };
}

export const rpmOf = (omega) => omega * RPM;
export const torqueOf = (current) => K * current * 1000;
export const backEmf = (omega) => K * omega;
export const noLoadRpm = (volts) => rpmOf(volts / K);

export function contacts(angle) {
  const segment = (brush) => {
    const relative = (((brush - angle) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return Math.floor(relative / ((2 * Math.PI) / POLES)) % POLES;
  };
  const a = segment(Math.PI);
  const b = segment(0);
  const bridges = (coil) => [coil, (coil + 1) % POLES].includes(a) && [coil, (coil + 1) % POLES].includes(b);
  return { a, b, coil: Array.from({ length: POLES }, (_, coil) => (a === b ? 0 : bridges(coil) ? 1 : 0.5)) };
}
