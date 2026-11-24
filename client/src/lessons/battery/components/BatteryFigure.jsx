import { useEffect, useRef, useState } from "react";
import { Dots, IsoFigure, Plate } from "../../../anatomy/react/draw";
import { follow, useInView, useLoop, useReadout } from "../../../anatomy/react/live";
import { AnatomyFigure } from "../../../lesson-kit/anatomy/AnatomyFigure";
import { SceneView } from "../../../lesson-kit/anatomy/SceneView";
import { SegmentedControl } from "../../../lesson-kit/controls/SegmentedControl";
import { Slider } from "../../../lesson-kit/controls/Slider";
import { fill } from "../../../lesson-kit/format";
import { usePreferences } from "../../../hooks/usePreferences";
import { BULB_SCREEN, CHARGER_LED, HEIGHT, ITEMS, SWITCH_SHIFT, WIDTH, ionSlots } from "../figure/geometry";
import { CURRENT_MAX, CURRENT_MIN, IONS, STEP_FOCUS, STEP_MODE, initialState, ionsInAnode, stepBattery } from "../figure/model";
import "./battery.css";

const SLOTS = ionSlots();
const ION_TRAVEL = 0.45;
const MODES = ["charge", "off", "discharge"];

function stateOf(model, mode) {
  if (model.current > 0) return "discharge";
  if (model.current < 0) return "charge";
  if (mode === "discharge") return "empty";
  if (mode === "charge") return "full";
  return "off";
}

function readoutOf(text, model, mode) {
  const state = stateOf(model, mode);
  return fill(text.readout, { volts: model.volts.toFixed(2), soc: Math.round(model.soc * 100), state: fill(text.states[state], { amps: Math.abs(model.current).toFixed(1) }) });
}

const ionPoint = (index, t) => [SLOTS.anode[index][0] + (SLOTS.cathode[index][0] - SLOTS.anode[index][0]) * t, SLOTS.anode[index][1] + (SLOTS.cathode[index][1] - SLOTS.anode[index][1]) * t];

export function BatteryFigure({ text, step = null, still = false, interactive = true }) {
  const { still: calmPreference } = usePreferences();
  const [mode, setMode] = useState("discharge");
  const [amps, setAmps] = useState(1.5);
  const [state, setState] = useState("discharge");
  const model = useRef(initialState());
  const ions = useRef(Array.from({ length: IONS }, (_, index) => (index < ionsInAnode(model.current.soc) ? 0 : 1)));
  const dots = useRef([]);
  const stage = useRef(null);
  const { anchor, say } = useReadout();
  const inView = useInView(stage);
  const live = !still && !calmPreference && inView;

  const place = () => {
    ions.current.forEach((t, index) => {
      const node = dots.current[index];
      if (!node) return;
      const [x, y] = ionPoint(index, t);
      node.setAttribute("cx", x.toFixed(1));
      node.setAttribute("cy", y.toFixed(1));
    });
  };

  useLoop((dt, calm) => {
    model.current = stepBattery(model.current, mode, amps, dt);
    const inAnode = ionsInAnode(model.current.soc);
    ions.current = ions.current.map((t, index) => follow(t, index < inAnode ? 0 : 1, dt, ION_TRAVEL, calm));
    place();
    const next = stateOf(model.current, mode);
    if (next !== state) setState(next);
    say(readoutOf(text, model.current, mode));
    return true;
  }, live);

  useEffect(() => {
    if (step && STEP_MODE[step]) setMode(STEP_MODE[step]);
  }, [step]);

  useEffect(() => {
    model.current = { ...model.current, current: 0 };
    setState(stateOf(model.current, mode));
    say(readoutOf(text, model.current, mode));
  }, [mode, text, say]);


  const controls = interactive ? (
    <>
      <SegmentedControl label={text.mode} value={mode} onChange={setMode} options={MODES.map((value) => ({ value, label: text.modes[value] }))} />
      <Slider label={text.current} value={amps} min={CURRENT_MIN} max={CURRENT_MAX} step={0.5} onChange={setAmps} format={(value) => `${value.toFixed(1)} A`} />
    </>
  ) : null;

  return (
    <AnatomyFigure className="battery" controls={controls}>
      <div ref={stage} data-current={state}>
        <Plate fig={text.fig} title={text.title} hint={text.hint} readout={readoutOf(text, model.current, mode)} keys={still ? [] : text.keys} caption={still ? null : text.caption}>
          <div ref={anchor}>
            <IsoFigure width={WIDTH} height={HEIGHT} label={text.label}>
              <defs>
                <radialGradient id="battery-glow">
                  <stop offset="0" className="battery-glow-core" />
                  <stop offset="1" className="battery-glow-edge" />
                </radialGradient>
              </defs>
              <SceneView items={ITEMS} focus={step ? STEP_FOCUS[step] : null} transforms={{ switch: SWITCH_SHIFT[mode] }} />
              <circle className="battery-glow" cx={BULB_SCREEN.centre[0]} cy={BULB_SCREEN.centre[1]} r={BULB_SCREEN.radius} fill="url(#battery-glow)" />
              <Dots points={[CHARGER_LED]} size={1} tone={state === "charge" ? "hi" : "faint"} />
              <g className="battery-ions">
                {SLOTS.anode.map((_, index) => (
                  <circle key={index} ref={(node) => (dots.current[index] = node)} r="1.25" cx={ionPoint(index, ions.current[index])[0]} cy={ionPoint(index, ions.current[index])[1]} />
                ))}
              </g>
            </IsoFigure>
          </div>
        </Plate>
      </div>
    </AnatomyFigure>
  );
}
