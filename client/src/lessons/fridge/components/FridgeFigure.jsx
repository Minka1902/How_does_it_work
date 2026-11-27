import { useEffect, useMemo, useRef, useState } from "react";
import { Dots, Line } from "../../../anatomy/react/draw";
import { useInView, useLoop, useReadout } from "../../../anatomy/react/live";
import { clamp } from "../../../lesson-kit/anatomy/drag";
import { InteractiveFigure } from "../../../lesson-kit/anatomy/InteractiveFigure";
import { Slider } from "../../../lesson-kit/controls/Slider";
import { Toggle } from "../../../lesson-kit/controls/Toggle";
import { fill } from "../../../lesson-kit/format";
import { usePreferences } from "../../../hooks/usePreferences";
import { EXPLODE, HEIGHT, ITEMS, LED, WIDTH, knobPointer } from "../figure/geometry";
import { EVAPORATOR, KNOB_MAX, KNOB_MIN, STEP_FOCUS, formatTemperature, initialState, setpointOf, stepFridge } from "../figure/model";
import "./fridge.css";

const KNOB_DRAG = 10;

function readoutOf(text, state, knob) {
  return fill(text.readout, { inside: formatTemperature(state.inside), set: formatTemperature(setpointOf(knob)), evaporator: formatTemperature(EVAPORATOR), compressor: state.running ? text.on : text.off });
}

export function FridgeFigure({ text, step = null, goTo, still = false, interactive = true }) {
  const { still: calmPreference } = usePreferences();
  const [knob, setKnob] = useState(4);
  const [lidOn, setLidOn] = useState(false);
  const [running, setRunning] = useState(true);
  const [whole, setWhole] = useState(true);
  const model = useRef(initialState(4));
  const { anchor, say } = useReadout();
  const inView = useInView(anchor);
  const live = !still && !calmPreference && inView && whole;

  const handles = useMemo(
    () => ({
      thermostat: { begin: () => knob, drag: ({ dx, context }) => setKnob(clamp(Math.round(context + dx / KNOB_DRAG), KNOB_MIN, KNOB_MAX)) },
      lid: { click: () => setLidOn((on) => !on) },
    }),
    [knob],
  );

  useLoop((dt) => {
    model.current = stepFridge(model.current, { knob, lidOpen: !lidOn }, dt);
    if (model.current.running !== running) setRunning(model.current.running);
    say(readoutOf(text, model.current, knob));
    return true;
  }, live);

  useEffect(() => say(readoutOf(text, model.current, knob)), [text, knob, say]);

  const controls = interactive ? (
    <>
      <Slider label={text.knob} value={knob} min={KNOB_MIN} max={KNOB_MAX} onChange={setKnob} format={(value) => `${value} · ${formatTemperature(setpointOf(value))}`} />
      <Toggle label={text.lid} checked={lidOn} onChange={setLidOn} />
    </>
  ) : null;

  return (
    <InteractiveFigure
      className="fridge"
      text={text}
      width={WIDTH}
      height={HEIGHT}
      items={ITEMS}
      explode={EXPLODE}
      stepFocus={step ? STEP_FOCUS[step] : null}
      goTo={goTo}
      handles={interactive ? handles : undefined}
      controls={controls}
      readout={readoutOf(text, model.current, knob)}
      anchor={anchor}
      still={still}
      data={{ "data-running": running ? "true" : "false", "data-lid": lidOn ? "on" : "off" }}
      onAssembled={setWhole}
    >
      <g data-piece="front">
        <Line d={knobPointer(knob)} tone="lit" free="end" />
        <Dots points={[LED]} size={1.1} tone={running ? "hi" : "faint"} />
      </g>
    </InteractiveFigure>
  );
}
