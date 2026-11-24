import { useEffect, useRef, useState } from "react";
import { Dots, IsoFigure, Line, Plate } from "../../../anatomy/react/draw";
import { useInView, useLoop, useReadout } from "../../../anatomy/react/live";
import { AnatomyFigure } from "../../../lesson-kit/anatomy/AnatomyFigure";
import { SceneView } from "../../../lesson-kit/anatomy/SceneView";
import { Slider } from "../../../lesson-kit/controls/Slider";
import { Toggle } from "../../../lesson-kit/controls/Toggle";
import { fill } from "../../../lesson-kit/format";
import { usePreferences } from "../../../hooks/usePreferences";
import { HEIGHT, ITEMS, LED, WIDTH, knobPointer } from "../figure/geometry";
import { EVAPORATOR, KNOB_MAX, KNOB_MIN, STEP_FOCUS, formatTemperature, initialState, setpointOf, stepFridge } from "../figure/model";
import "./fridge.css";

function readoutOf(text, state, knob) {
  return fill(text.readout, { inside: formatTemperature(state.inside), set: formatTemperature(setpointOf(knob)), evaporator: formatTemperature(EVAPORATOR), compressor: state.running ? text.on : text.off });
}

export function FridgeFigure({ text, step = null, still = false, interactive = true }) {
  const { still: calmPreference } = usePreferences();
  const [knob, setKnob] = useState(4);
  const [lidOn, setLidOn] = useState(false);
  const [running, setRunning] = useState(true);
  const model = useRef(initialState(4));
  const stage = useRef(null);
  const { anchor, say } = useReadout();
  const inView = useInView(stage);
  const live = !still && !calmPreference && inView;

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
    <AnatomyFigure className="fridge" controls={controls}>
      <div ref={stage} data-running={running ? "true" : "false"} data-lid={lidOn ? "on" : "off"}>
        <Plate fig={text.fig} title={text.title} hint={text.hint} readout={readoutOf(text, model.current, knob)} keys={still ? [] : text.keys} caption={still ? null : text.caption}>
          <div ref={anchor}>
            <IsoFigure width={WIDTH} height={HEIGHT} label={text.label}>
              <SceneView items={ITEMS} focus={step ? STEP_FOCUS[step] : null} />
              <Line d={knobPointer(knob)} tone="lit" free="end" />
              <Dots points={[LED]} size={1.1} tone={running ? "hi" : "faint"} />
            </IsoFigure>
          </div>
        </Plate>
      </div>
    </AnatomyFigure>
  );
}
