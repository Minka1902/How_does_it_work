import { useEffect, useMemo, useRef, useState } from "react";
import { Line, Solid } from "../../../anatomy/react/draw";
import { useInView, useLoop, useReadout } from "../../../anatomy/react/live";
import { angleAround, unwrap } from "../../../lesson-kit/anatomy/drag";
import { InteractiveFigure } from "../../../lesson-kit/anatomy/InteractiveFigure";
import { LayeredSolid } from "../../../lesson-kit/anatomy/LayeredSolid";
import { Slider } from "../../../lesson-kit/controls/Slider";
import { fill } from "../../../lesson-kit/format";
import { usePreferences } from "../../../hooks/usePreferences";
import { EXPLODE, HEIGHT, ITEMS, MAGNET_LABELS, P, RIGHT, SHAFT, WIDTH, ZC, rotorPaths } from "../figure/geometry";
import { LOAD_MAX, STEP_FOCUS, STEP_STATE, VOLTS_MAX, backEmf, contacts, initialState, rpmOf, spinByHand, stepMotor, torqueOf } from "../figure/model";
import "./motor.css";

const ROTOR_CENTRE = [0, 10, ZC];

const fixed = (value, digits) => (Number(value.toFixed(digits)) || 0).toFixed(digits);

function readoutOf(text, model, volts) {
  const values = { volts: fixed(volts, 0), rpm: (Math.round(rpmOf(model.omega)) || 0).toLocaleString("en-US"), amps: fixed(model.current, 2), torque: fixed(torqueOf(model.current), 0), emf: fixed(backEmf(model.omega), 1) };
  return fill(volts === 0 && Math.abs(model.omega) > 1 ? text.generating : text.readout, values);
}

export function MotorFigure({ text, step = null, goTo, still = false, interactive = true }) {
  const { still: calmPreference } = usePreferences();
  const [volts, setVolts] = useState(still ? 0 : 6);
  const [load, setLoad] = useState(0);
  const [angle, setAngle] = useState(0.4);
  const [whole, setWhole] = useState(true);
  const model = useRef({ ...initialState(), angle: 0.4 });
  const hand = useRef(null);
  const { anchor, say } = useReadout();
  const inView = useInView(anchor);
  const live = !still && !calmPreference && inView && whole;
  const rotor = useMemo(() => rotorPaths(angle), [angle]);
  const energy = contacts(angle).coil;

  const handles = useMemo(
    () => ({
      rotor: {
        begin: () => ({ pointer: null, angle: model.current.angle }),
        drag: ({ point, context }) => {
          const screen = angleAround(P, ROTOR_CENTRE, point);
          context.pointer = context.pointer === null ? screen : unwrap(screen, context.pointer);
          context.start ??= context.pointer;
          hand.current = context.angle - (context.pointer - context.start);
        },
        end: () => (hand.current = null),
      },
      battery: { click: () => setVolts((value) => (value === 0 ? 6 : -value)) },
    }),
    [],
  );

  useLoop((dt) => {
    model.current = hand.current === null ? stepMotor(model.current, { volts, load }, dt) : spinByHand(model.current, hand.current, dt, volts);
    setAngle(model.current.angle);
    say(readoutOf(text, model.current, volts));
    return true;
  }, live);

  useEffect(() => {
    const state = step ? STEP_STATE[step] : null;
    if (state) setVolts(state.volts);
  }, [step]);

  useEffect(() => say(readoutOf(text, model.current, volts)), [text, volts, say]);

  const controls = interactive ? (
    <>
      <Slider label={text.volts} value={volts} min={-VOLTS_MAX} max={VOLTS_MAX} onChange={setVolts} format={(value) => `${value} V`} />
      <Slider label={text.load} value={load} min={0} max={LOAD_MAX} step={5} onChange={setLoad} format={(value) => `${value} mN·m`} />
    </>
  ) : null;

  return (
    <InteractiveFigure
      className="motor"
      text={text}
      width={WIDTH}
      height={HEIGHT}
      items={ITEMS}
      explode={EXPLODE}
      stepFocus={step ? STEP_FOCUS[step] : null}
      goTo={goTo}
      handles={interactive ? handles : undefined}
      controls={controls}
      readout={readoutOf(text, model.current, volts)}
      anchor={anchor}
      still={still}
      data={{ "data-reverse": volts < 0 ? "" : undefined }}
      onAssembled={setWhole}
    >
      {(focus) => (
        <>
          <text className="iso-face-text motor-pole" data-piece="left" x={MAGNET_LABELS.left[0] - 6} y={MAGNET_LABELS.left[1]} fontSize="7">
            S
          </text>
          <g data-piece="rotor">
            <Solid paths={SHAFT.back} tone="mid" />
            <g data-focus="rotor">
              <LayeredSolid className="motor-core" paths={rotor.lamination} tone="hi" lit={focus === "rotor"} inner={<Line d={rotor.mark} tone="lo" />} />
              {rotor.coils.map((paths, index) => (
                <g key={index} className="motor-coil" data-energy={energy[index] === 1 ? "full" : energy[index] > 0 ? "half" : undefined}>
                  <LayeredSolid paths={paths} tone="mid" lit={energy[index] === 1} />
                </g>
              ))}
            </g>
            <Solid paths={SHAFT.middle} tone="mid" />
            <g data-focus="commutator">
              {rotor.segments.map((paths, index) => (
                <LayeredSolid key={index} paths={paths} tone="hi" lit={focus === "commutator"} />
              ))}
            </g>
            <Solid paths={SHAFT.front} tone="mid" />
          </g>
          <g data-piece="brush" data-focus="brushes">
            <Solid paths={RIGHT.holder} tone="mid" lit={focus === "brushes"} />
            <Solid paths={RIGHT.brush} tone="lo" lit={focus === "brushes"} />
          </g>
          <g data-piece="right" data-focus="magnets">
            <Solid paths={RIGHT.block} tone="lo" />
            <LayeredSolid paths={RIGHT.magnet} tone="hi" lit={focus === "magnets"} />
            <text className="iso-face-text motor-pole" x={MAGNET_LABELS.right[0] + 2} y={MAGNET_LABELS.right[1]} fontSize="7">
              N
            </text>
          </g>
          <g data-piece="front">
            <Solid paths={RIGHT.frontPost} tone="mid" />
            <Solid paths={RIGHT.frontBearing} tone="mid" />
          </g>
        </>
      )}
    </InteractiveFigure>
  );
}
