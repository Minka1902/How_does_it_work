import { describe, expect, it } from "vitest";
import { initialState as fridgeStart, setpointOf, stepFridge, HYSTERESIS } from "../lessons/fridge/figure/model";
import { initialState as batteryStart, openCircuit, stepBattery, FULL, EMPTY } from "../lessons/battery/figure/model";
import { poseAt, TRAVEL, ROTATION } from "../lessons/m16/figure/model";

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
