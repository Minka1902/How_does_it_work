import * as k from "../../anatomy/iso-kit.mjs";

export const SPRING = { stagger: 0.035, stiffness: 64, damping: 16, substeps: 4 };
const SETTLE = 1e-3;

export function explodeOf(P, moves, spring = SPRING) {
  const origin = k.iso([0, 0, 0], P);
  const shifts = Object.fromEntries(Object.entries(moves).map(([piece, move]) => {
    const [x, y] = k.iso(move, P);
    return [piece, [x - origin[0], y - origin[1]]];
  }));
  return { order: Object.keys(moves), moves, shifts, spring };
}

export const createSprings = (order) => ({ clock: 0, springs: Object.fromEntries(order.map((id) => [id, { x: 0, v: 0, target: 0, pending: null }])) });

export function toggleSprings(state, order, apart, { stagger }) {
  const goal = apart ? 1 : 0;
  let index = 0;
  for (const id of apart ? order : [...order].reverse()) {
    const spring = state.springs[id];
    if (spring.target === goal) spring.pending = null;
    else spring.pending = { value: goal, at: state.clock + index++ * stagger };
  }
}

export function stepSprings(state, dt, { stiffness, damping, substeps }, calm = false) {
  state.clock += dt;
  let settled = true;
  for (const spring of Object.values(state.springs)) {
    if (spring.pending && (calm || state.clock >= spring.pending.at)) (spring.target = spring.pending.value), (spring.pending = null);
    if (calm) (spring.x = spring.target), (spring.v = 0);
    for (let index = 0; index < substeps && !calm; index++) {
      const h = dt / substeps;
      spring.v += ((spring.target - spring.x) * stiffness - spring.v * damping) * h;
      spring.x += spring.v * h;
    }
    if (!spring.pending && Math.abs(spring.x - spring.target) < SETTLE && Math.abs(spring.v) < SETTLE) (spring.x = spring.target), (spring.v = 0);
    else settled = false;
  }
  return settled;
}

export const sharesOf = (state) => Object.fromEntries(Object.entries(state.springs).map(([id, spring]) => [id, spring.x]));
