import { describe, expect, it } from "vitest";
import { initialState as fridgeStart, setpointOf, stepFridge, HYSTERESIS } from "../lessons/fridge/figure/model";
import { initialState as batteryStart, openCircuit, stepBattery, FULL, EMPTY } from "../lessons/battery/figure/model";
import { poseAt, TRAVEL, ROTATION } from "../lessons/m16/figure/model";
import { canTurn, combinations, pinsAt, KEY_OUT, KEYS, SHEAR } from "../lessons/lock/figure/model";
import { contacts, initialState as motorStart, noLoadRpm, rpmOf, spinByHand, stepMotor, torqueOf, K, RESISTANCE } from "../lessons/motor/figure/model";

const run = (step, state, seconds, ...args) => {
  let next = state;
  for (let t = 0; t < seconds; t += 0.05) next = step(next, ...args, 0.05);
  return next;
};

describe("fridge model", () => {
  it("keeps the inside within the thermostat band around the set point", () => {
    const set = setpointOf(4);
    let state = fridgeStart(4);
    for (let t = 0; t < 120; t += 0.05) {
      state = stepFridge(state, { knob: 4, lidOpen: false }, 0.05);
      expect(state.inside).toBeGreaterThan(set - HYSTERESIS - 0.1);
      expect(state.inside).toBeLessThan(set + HYSTERESIS + 0.1);
    }
  });

  it("warms past the band with the lid off", () => {
    const state = run((s, dt) => stepFridge(s, { knob: 4, lidOpen: true }, dt), fridgeStart(4), 30);
    expect(state.inside).toBeGreaterThan(setpointOf(4) + HYSTERESIS);
  });
});

describe("battery model", () => {
  it("spans 3.0 V empty to 4.2 V full", () => {
    expect(openCircuit(0)).toBeCloseTo(EMPTY);
    expect(openCircuit(1)).toBeCloseTo(FULL);
  });

  it("discharges to cut-off and charges to full", () => {
    const empty = run((s, dt) => stepBattery(s, "discharge", 3, dt), batteryStart(0.5), 60);
    expect(empty.current).toBe(0);
    expect(empty.volts).toBeGreaterThanOrEqual(EMPTY - 0.01);
    const full = run((s, dt) => stepBattery(s, "charge", 3, dt), batteryStart(0.2), 200);
    expect(full.soc).toBeCloseTo(1, 2);
  });
});

describe("m16 cycle", () => {
  it("starts and ends locked with the carrier home", () => {
    expect(poseAt(0)).toMatchObject({ carrier: 0, turn: 0 });
    expect(poseAt(0.95)).toMatchObject({ carrier: 0, turn: 0 });
  });

  it("reaches full travel unlocked at the buffer stop", () => {
    const pose = poseAt(0.48);
    expect(pose.carrier).toBeCloseTo(TRAVEL);
    expect(pose.turn).toBeCloseTo(ROTATION);
  });

  it("never jumps between samples", () => {
    for (let t = 0; t < 1; t += 0.002) expect(Math.abs(poseAt(t + 0.002).carrier - poseAt(t).carrier)).toBeLessThan(2);
  });
});

describe("lock model", () => {
  it("lifts every gap to the shear line only with the right key fully in", () => {
    const pins = pinsAt(KEYS.correct, 0);
    pins.forEach((pin) => expect(pin.top).toBeCloseTo(SHEAR));
    expect(canTurn(pins)).toBe(true);
  });

  it("binds with the wrong key or a key part-way in", () => {
    expect(canTurn(pinsAt(KEYS.wrong, 0))).toBe(false);
    expect(canTurn(pinsAt(KEYS.correct, -2))).toBe(false);
    expect(canTurn(pinsAt(KEYS.correct, KEY_OUT))).toBe(false);
  });

  it("counts 10^5 combinations", () => expect(combinations()).toBe(100000));
});

describe("motor model", () => {
  const settle = (volts, load = 0) => run((s, dt) => stepMotor(s, { volts, load }, dt), motorStart(), 2);

  it("settles where back-EMF nearly matches the supply", () => {
    const state = settle(12);
    expect(rpmOf(state.omega)).toBeGreaterThan(noLoadRpm(12) * 0.99);
    expect(rpmOf(state.omega)).toBeLessThanOrEqual(noLoadRpm(12));
    expect(state.current).toBeLessThan(0.05);
  });

  it("runs backwards on reversed supply", () => expect(rpmOf(settle(-12).omega)).toBeLessThan(-noLoadRpm(12) * 0.99));

  it("slows under the brake until its torque matches the load", () => {
    const state = settle(12, 60);
    expect(torqueOf(state.current)).toBeCloseTo(60, 0);
    expect(rpmOf(state.omega)).toBeLessThan(noLoadRpm(12) * 0.6);
  });

  it("stalls and draws V/R when the brake beats it", () => {
    const state = settle(12, 120);
    expect(state.omega).toBe(0);
    expect(state.current).toBeCloseTo(12 / RESISTANCE);
  });

  it("draws full current when held still by hand", () => {
    const held = spinByHand({ omega: 0, angle: 1 }, 1, 0.05, 12);
    expect(held.current).toBeCloseTo(12 / RESISTANCE);
    expect(spinByHand({ omega: 0, angle: 0 }, 0.05, 0.05, 0).current).toBeCloseTo((-K * 100) / RESISTANCE);
  });

  it("always feeds current to at least one coil and switches it as the rotor turns", () => {
    const lit = new Set();
    for (let angle = 0; angle < 2 * Math.PI; angle += 0.01) {
      const { coil } = contacts(angle);
      expect(coil.some((value) => value > 0) || coil.every((value) => value === 0)).toBe(true);
      lit.add(coil.indexOf(1));
    }
    expect([...lit].filter((index) => index >= 0).sort()).toEqual([0, 1, 2]);
  });
});
