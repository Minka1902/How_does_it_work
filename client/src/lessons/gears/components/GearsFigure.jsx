import { useEffect, useMemo, useRef, useState } from "react";
import { Line, Solid } from "../../../anatomy/react/draw";
import { follow, useInView, useLoop, useReadout } from "../../../anatomy/react/live";
import { alongAxis, angleAround, clamp, unwrap } from "../../../lesson-kit/anatomy/drag";
import { InteractiveFigure } from "../../../lesson-kit/anatomy/InteractiveFigure";
import { LayeredSolid } from "../../../lesson-kit/anatomy/LayeredSolid";
import { SegmentedControl } from "../../../lesson-kit/controls/SegmentedControl";
import { Slider } from "../../../lesson-kit/controls/Slider";
import { fill } from "../../../lesson-kit/format";
import { usePreferences } from "../../../hooks/usePreferences";
import { AXLE, SPACING, SPINDLE, chainAt, cogY, nearestCog, pitchRadius } from "../figure/drivetrain";
import { B_KNUCKLE, EXPLODE, HANGER_PATHS, HEIGHT, ITEMS, LOCKRING, NUT, P, WIDTH, chainPaths, cogPaths, crankPaths, derailleurPaths, planeOffset } from "../figure/geometry";
import { CADENCE_MAX, COGS, RING, SLOW, STEP_FOCUS, STEP_STATE, cadenceOf, ratioOf, speedOf } from "../figure/model";
import "./gears.css";

const TAU = 2 * Math.PI;
const SHIFT = 0.18;
const START = { crank: 0.35, gear: 3 };
const CENTRE = [SPINDLE[0], 0, SPINDLE[1]];
const REACH = 0.85;
const GEARS = COGS.map((teeth, index) => ({ value: index, label: String(teeth) }));

const nearestTurn = (value, step) => value - step * Math.round(value / step);

function poseOf(crank, gear, previous) {
  const chain = chainAt(gear, crank);
  const step = TAU / COGS[nearestCog(gear)];
  const cassette = previous === undefined ? chain.phases.cog : previous + nearestTurn(chain.phases.cog - previous, step);
  return { crank, gear, cassette, chain };
}

function cogAt(point) {
  for (let index = 0; index < COGS.length; index++) {
    const [x, z] = planeOffset(AXLE, cogY(index), point);
    if (Math.hypot(x, z) <= pitchRadius(COGS[index]) + REACH) return index;
  }
  return COGS.length - 1;
}

function readoutOf(text, gear, cadence) {
  const cog = COGS[nearestCog(gear)];
  return fill(text.readout, { ring: RING, cog, ratio: ratioOf(cog).toFixed(2), speed: speedOf(cadence, cog).toFixed(0), cadence: Math.round(cadence) });
}

export function GearsFigure({ text, step = null, goTo, still = false, interactive = true }) {
  const { still: calmPreference } = usePreferences();
  const [cadence, setCadence] = useState(still ? 0 : STEP_STATE.drive.cadence);
  const [target, setTarget] = useState(START.gear);
  const [pose, setPose] = useState(() => poseOf(START.crank, START.gear));
  const [whole, setWhole] = useState(true);
  const model = useRef(pose);
  const hand = useRef(null);
  const shifter = useRef(null);
  const handCadence = useRef(null);
  const { anchor, say } = useReadout();
  const inView = useInView(anchor);
  const live = !still && !calmPreference && inView && whole;
  const on = nearestCog(pose.gear);
  const crank = useMemo(() => crankPaths(pose.crank), [pose.crank]);
  const derailleur = useMemo(() => derailleurPaths(pose.chain), [pose.chain]);
  const links = useMemo(() => chainPaths(pose.chain), [pose.chain]);
  const cogs = useMemo(() => COGS.map((_, index) => cogPaths(index, pose.cassette)), [pose.cassette]);
  const behind = cogs.slice(on).reverse();
  const ahead = cogs.slice(0, on).reverse();

  const kick = useLoop((dt, calm) => {
    if (!whole) return false;
    const now = model.current;
    const pedalling = live && cadence > 0;
    const crankNext = hand.current ?? (pedalling ? now.crank + (cadence * TAU * dt) / (60 * SLOW) : now.crank);
    const gearNext = shifter.current ?? follow(now.gear, target, dt, SHIFT, calm || calmPreference);
    handCadence.current = hand.current !== null && dt > 0 ? Math.abs(cadenceOf(((crankNext - now.crank) / dt) * SLOW)) : null;
    model.current = poseOf(crankNext, gearNext, now.cassette);
    setPose(model.current);
    say(readoutOf(text, gearNext, handCadence.current ?? cadence));
    return pedalling || hand.current !== null || shifter.current !== null || gearNext !== target;
  }, live);

  const handles = useMemo(
    () => ({
      crank: {
        begin: () => ({ pointer: null, crank: model.current.crank }),
        drag: ({ point, context }) => {
          const screen = angleAround(P, CENTRE, point);
          context.pointer = context.pointer === null ? screen : unwrap(screen, context.pointer);
          context.start ??= context.pointer;
          hand.current = context.crank + (context.pointer - context.start);
          kick();
        },
        end: () => (hand.current = null),
      },
      cassette: { click: ({ point }) => setTarget(cogAt(point)) },
      derailleur: {
        begin: () => model.current.gear,
        drag: ({ dx, dy, context }) => {
          shifter.current = clamp(context - alongAxis(P, [0, 1, 0], dx, dy) / SPACING, 0, COGS.length - 1);
          kick();
        },
        end: () => {
          setTarget(nearestCog(shifter.current ?? model.current.gear));
          shifter.current = null;
        },
      },
    }),
    [kick],
  );

  useEffect(() => {
    const state = step ? STEP_STATE[step] : null;
    if (!state || still) return;
    setTarget(state.gear);
    setCadence(state.cadence);
  }, [step, still]);

  useEffect(() => {
    if (!still) kick();
  }, [kick, still, target, cadence]);

  useEffect(() => say(readoutOf(text, model.current.gear, cadence)), [text, cadence, say]);

  const controls = interactive ? (
    <>
      <SegmentedControl label={text.gear} value={target} onChange={setTarget} options={GEARS} />
      <Slider label={text.cadence} value={cadence} min={0} max={CADENCE_MAX} step={5} onChange={setCadence} format={(value) => `${value} rpm`} />
    </>
  ) : null;

  return (
    <InteractiveFigure
      className="gears"
      text={text}
      width={WIDTH}
      height={HEIGHT}
      items={ITEMS}
      explode={EXPLODE}
      stepFocus={step ? STEP_FOCUS[step] : null}
      goTo={goTo}
      handles={interactive ? handles : undefined}
      controls={controls}
      readout={readoutOf(text, pose.gear, cadence)}
      anchor={anchor}
      still={still}
      onAssembled={setWhole}
    >
      {(focus) => (
        <>
          <g data-piece="cassette" data-focus="cassette">
            {behind.map(({ y, paths }) => (
              <LayeredSolid key={y} className="gears-cog" paths={paths} tone="mid" lit={focus === "cassette"} />
            ))}
          </g>
          <g data-piece="derailleur" data-focus="derailleur">
            <LayeredSolid paths={derailleur.inner} tone="mid" lit={focus === "derailleur"} />
            <LayeredSolid className="gears-pulley" paths={derailleur.upper} tone="mid" lit={focus === "derailleur"} />
            <LayeredSolid className="gears-pulley" paths={derailleur.lower} tone="mid" lit={focus === "derailleur"} />
            <Line d={derailleur.hubs} tone="lo" />
          </g>
          <g data-piece="crank" data-focus="ring">
            <LayeredSolid paths={crank.ring} tone="mid" lit={focus === "ring"} inner={<Line d={crank.ringFace} tone="faint" />} />
          </g>
          <g className="gears-chain" data-focus="chain" data-lit={focus === "chain" ? "" : undefined}>
            <path className="gears-link-edge" d={links.inner} strokeWidth={links.width + 0.9} />
            <path className="gears-link-inner" d={links.inner} strokeWidth={links.width} />
            <path className="gears-link-edge" d={links.outer} strokeWidth={links.width + 0.9} />
            <path className="gears-link-outer" d={links.outer} strokeWidth={links.width} />
            <path className="gears-pin" d={links.pins} />
          </g>
          <g data-piece="cassette" data-focus="cassette">
            {ahead.map(({ y, paths }) => (
              <LayeredSolid key={y} className="gears-cog" paths={paths} tone="mid" lit={focus === "cassette"} />
            ))}
            <Solid paths={LOCKRING} tone="mid" lit={focus === "cassette"} />
          </g>
          <g data-piece="derailleur" data-focus="derailleur">
            <LayeredSolid paths={derailleur.outer} tone="mid" lit={focus === "derailleur"} inner={<Line d={derailleur.bolts} tone="lo" />} />
            <Solid paths={derailleur.pivot} tone="mid" lit={focus === "derailleur"} />
            <LayeredSolid paths={HANGER_PATHS} tone="mid" lit={focus === "derailleur"} />
            <Solid paths={NUT} tone="mid" />
            <Solid paths={B_KNUCKLE} tone="mid" lit={focus === "derailleur"} />
            {derailleur.links.map((paths, index) => (
              <Solid key={index} paths={paths} tone="mid" lit={focus === "derailleur"} />
            ))}
            <Solid paths={derailleur.arm} tone="mid" lit={focus === "derailleur"} />
            <Solid paths={derailleur.knuckle} tone="mid" lit={focus === "derailleur"} />
          </g>
          <g data-piece="crank" data-focus="crank">
            <LayeredSolid paths={crank.spider} tone="mid" lit={focus === "crank"} inner={<Line d={crank.bolts} tone="lo" />} />
            <LayeredSolid paths={crank.arm} tone="mid" lit={focus === "crank"} />
            <Solid paths={crank.cap} tone="mid" lit={focus === "crank"} />
            <Solid paths={crank.axle} tone="mid" lit={focus === "crank"} />
            <Solid paths={crank.pedal} tone="mid" lit={focus === "crank"} inner={<Line d={crank.tread} tone="faint" />} />
          </g>
        </>
      )}
    </InteractiveFigure>
  );
}
