import { useEffect, useMemo, useRef, useState } from "react";
import * as k from "../../../anatomy/iso-kit.mjs";
import { Line } from "../../../anatomy/react/draw";
import { follow, useLoop, useReadout } from "../../../anatomy/react/live";
import { alongAxis, clamp } from "../../../lesson-kit/anatomy/drag";
import { InteractiveFigure } from "../../../lesson-kit/anatomy/InteractiveFigure";
import { LayeredSolid } from "../../../lesson-kit/anatomy/LayeredSolid";
import { SegmentedControl } from "../../../lesson-kit/controls/SegmentedControl";
import { Slider } from "../../../lesson-kit/controls/Slider";
import { fill } from "../../../lesson-kit/format";
import { usePreferences } from "../../../hooks/usePreferences";
import { EXPLODE, HEIGHT, ITEMS, P, PIN_PATHS, SHEAR_LINE, WIDTH, camPaths, keyPaths, shift, springPath } from "../figure/geometry";
import { CHAMBER_TOP, DEPTHS, KEYS, KEY_OUT, KEY_TOP, PIN_X, STEP_FOCUS, STEP_STATE, TURN, canTurn, pinsAt } from "../figure/model";
import "./lock.css";

const SLIDE = 0.16;
const SPIN = 0.25;
const BIND_SECONDS = 0.7;
const BIND_ANGLE = 0.09;
const MODES = ["correct", "wrong", "custom"];

const stateOf = (pins, angle, binding) => (binding ? "binds" : angle > 0.01 ? "open" : canTurn(pins) ? "turns" : "locked");

function readoutOf(text, pins, insertion, angle, binding) {
  return fill(text.readout, {
    aligned: pins.filter((pin) => pin.aligned).length,
    inserted: Math.round((1 - insertion / KEY_OUT) * 100),
    state: text.states[stateOf(pins, angle, binding)],
  });
}

export function LockFigure({ text, step = null, goTo, still = false, interactive = true }) {
  const { still: calmPreference } = usePreferences();
  const [mode, setMode] = useState("correct");
  const [custom, setCustom] = useState(KEYS.correct);
  const [target, setTarget] = useState(still ? 0 : KEY_OUT);
  const [turned, setTurned] = useState(false);
  const [angle, setAngle] = useState(0);
  const [bind, setBind] = useState(0);
  const insertion = useRef(still ? 0 : KEY_OUT);
  const pendingTurn = useRef(false);
  const nodes = useRef({ key: null, keyPins: [], drivers: [], springs: [] });
  const { anchor, say } = useReadout();
  const cuts = mode === "custom" ? custom : KEYS[mode];
  const key = useMemo(() => keyPaths(cuts), [cuts]);
  const pins = pinsAt(cuts, insertion.current);

  const place = () => {
    const now = pinsAt(cuts, insertion.current);
    nodes.current.key?.setAttribute("transform", shift(insertion.current));
    now.forEach((pin, index) => {
      nodes.current.keyPins[index]?.setAttribute("transform", shift(0, 0, pin.bottom));
      nodes.current.drivers[index]?.setAttribute("transform", shift(0, 0, pin.top));
      nodes.current.springs[index]?.setAttribute("d", springPath(PIN_X[index], pin.top + 10, CHAMBER_TOP));
    });
    say(readoutOf(text, now, insertion.current, angle, bind > 0));
  };

  const attemptTurn = () => {
    if (turned) return setTurned(false);
    if (canTurn(pinsAt(cuts, insertion.current))) setTurned(true);
    else setBind(BIND_SECONDS);
  };

  const fileCut = ({ point }) => {
    const x = alongAxis(P, [1, 0, 0], point[0] - k.iso([0, 0, KEY_TOP], P)[0], point[1] - k.iso([0, 0, KEY_TOP], P)[1]) - insertion.current;
    const index = PIN_X.reduce((best, pinX, at) => (Math.abs(pinX - x) < Math.abs(PIN_X[best] - x) ? at : best), 0);
    setCustom(cuts.map((depth, at) => (at === index ? (depth + 1) % DEPTHS : depth)));
    setMode("custom");
  };

  const handles = useMemo(
    () => ({
      key: turned ? { click: fileCut } : { begin: () => insertion.current, drag: ({ dx, dy, context }) => setTarget(clamp(context + alongAxis(P, [1, 0, 0], dx, dy), KEY_OUT, 0)), click: fileCut },
      plug: { click: attemptTurn },
      cam: { click: attemptTurn },
    }),
    [turned, cuts],
  );

  const kick = useLoop((dt, calm) => {
    const calmNow = calm || calmPreference;
    insertion.current = follow(insertion.current, target, dt, SLIDE, calmNow);
    const goal = turned ? TURN : 0;
    const remaining = Math.max(0, bind - dt);
    const wiggle = remaining > 0 ? BIND_ANGLE * Math.sin((BIND_SECONDS - remaining) * 30) * (remaining / BIND_SECONDS) : 0;
    const next = turned ? follow(angle, goal, dt, SPIN, calmNow) : remaining > 0 ? wiggle : follow(angle, 0, dt, SPIN, calmNow);
    if (next !== angle) setAngle(next);
    if (remaining !== bind) setBind(remaining);
    place();
    if (pendingTurn.current && insertion.current === target) {
      pendingTurn.current = false;
      attemptTurn();
    }
    return insertion.current !== target || next !== goal || remaining > 0;
  }, !still);

  useEffect(() => {
    const state = step ? STEP_STATE[step] : null;
    if (!state) return;
    setMode(state.key);
    setTurned(false);
    setTarget(state.inserted ? 0 : KEY_OUT);
    pendingTurn.current = Boolean(state.turn);
    if (!still) kick();
  }, [step, kick, still]);

  useEffect(place);

  useEffect(() => {
    if (!still) kick();
  }, [kick, still, target, turned, bind]);

  const controls = interactive ? (
    <>
      <SegmentedControl label={text.key} value={mode} onChange={(value) => (setMode(value), setTurned(false))} options={MODES.map((value) => ({ value, label: text.keyNames[value] }))} />
      <Slider label={text.inserted} value={Math.round((1 - target / KEY_OUT) * 100)} min={0} max={100} onChange={(value) => !turned && setTarget(KEY_OUT * (1 - value / 100))} format={(value) => `${value}%`} />
      <button type="button" className="pill-button" onClick={attemptTurn}>
        {turned ? text.turnBack : text.turn}
      </button>
    </>
  ) : null;

  return (
    <InteractiveFigure
      className="lock"
      text={text}
      width={WIDTH}
      height={HEIGHT}
      items={ITEMS}
      explode={EXPLODE}
      stepFocus={step ? STEP_FOCUS[step] : null}
      goTo={goTo}
      handles={interactive ? handles : undefined}
      controls={controls}
      readout={readoutOf(text, pins, insertion.current, angle, bind > 0)}
      anchor={anchor}
      still={still}
      data={{ "data-binding": bind > 0 ? "" : undefined }}
    >
      {(focus) => (
        <>
          <Line d={SHEAR_LINE} tone={canTurn(pins) ? "lit" : "faint"} dashed={!canTurn(pins)} />
          <g data-piece="plug">
            <g data-focus="key" ref={(node) => (nodes.current.key = node)} transform={shift(insertion.current)}>
              <LayeredSolid paths={key.bow} tone="mid" lit={focus === "key"} inner={<Line d={key.hole} tone="lo" />} />
              <LayeredSolid paths={key.blade} tone="hi" lit={focus === "key"} />
            </g>
            {PIN_PATHS.map((paths, index) => (
              <g key={index} data-focus="pins" data-blocking={bind > 0 && !pins[index].aligned ? "" : undefined} ref={(node) => (nodes.current.keyPins[index] = node)} transform={shift(0, 0, pins[index].bottom)}>
                <LayeredSolid paths={paths.key} tone="hi" lit={focus === "pins"} />
              </g>
            ))}
          </g>
          <g data-piece="drivers">
            {PIN_PATHS.map((paths, index) => (
              <g key={index} data-focus="pins">
                <path className="iso-line" data-tone="lo" data-free="" ref={(node) => (nodes.current.springs[index] = node)} d={springPath(PIN_X[index], pins[index].top + 10, CHAMBER_TOP)} />
                <g data-blocking={bind > 0 && !pins[index].aligned ? "" : undefined} ref={(node) => (nodes.current.drivers[index] = node)} transform={shift(0, 0, pins[index].top)}>
                  <LayeredSolid paths={paths.driver} tone="mid" lit={focus === "pins"} />
                </g>
              </g>
            ))}
          </g>
          <g data-piece="cam" data-focus="cam">
            <LayeredSolid paths={camPaths(angle)} tone="hi" lit={focus === "cam"} />
          </g>
        </>
      )}
    </InteractiveFigure>
  );
}
