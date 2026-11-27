export const RING = 42;
export const COGS = [11, 13, 15, 17, 20, 24, 28];
export const WHEEL = 2.1;
export const CADENCE_MAX = 120;
export const SLOW = 4;

export const STEP_FOCUS = { drive: "chain", ratio: "ring", small: "cassette", big: "cassette", derailleur: "derailleur", cadence: "crank" };
export const STEP_STATE = {
  drive: { gear: 3, cadence: 60 },
  ratio: { gear: 3, cadence: 40 },
  small: { gear: 0, cadence: 60 },
  big: { gear: 6, cadence: 60 },
  derailleur: { gear: 4, cadence: 60 },
  cadence: { gear: 3, cadence: 80 },
};

export const ratioOf = (cog) => RING / cog;
export const metresPerTurn = (cog) => ratioOf(cog) * WHEEL;
export const speedOf = (cadence, cog) => (cadence * metresPerTurn(cog) * 60) / 1000;
export const cadenceOf = (radiansPerSecond) => (radiansPerSecond * 60) / (2 * Math.PI);
