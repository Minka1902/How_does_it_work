import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Solid } from "../../../anatomy/react/draw";
import { useInView, useLoop, useReadout } from "../../../anatomy/react/live";
import { alongAxis, clamp } from "../../../lesson-kit/anatomy/drag";
import { InteractiveFigure } from "../../../lesson-kit/anatomy/InteractiveFigure";
import { PlayPause } from "../../../lesson-kit/controls/PlayPause";
import { Slider } from "../../../lesson-kit/controls/Slider";
import { fill } from "../../../lesson-kit/format";
import { usePreferences } from "../../../hooks/usePreferences";
import { BULLET, CHAMBER_CLIP, EXPLODE, HEIGHT, ITEMS, LIVE, MUZZLE_CLIP, P, SPENT, WIDTH, bulletShift, liveShift, pinShift, shift, spentShift, springPaths } from "../figure/geometry";
import { DEMO_SECONDS, STEP_AT, STEP_FOCUS, TRAVEL, millisecondsOf, poseAt, travelMm } from "../figure/model";
import "./rifle.css";

const STILL_AT = 0.3;
const SLIDER_EVERY = 0.1;
const STROKE = Array.from({ length: 191 }, (_, index) => 0.06 + index * 0.002).map((t) => [t, poseAt(t).carrier]);

const cycleAtTravel = (x) => (STROKE.find(([, carrier]) => carrier >= x) ?? STROKE.at(-1))[0];

function readoutOf(text, pose) {
  return fill(text.readout, { phase: text.phases[pose.phase], mm: Math.round(travelMm(pose.carrier)), deg: pose.turn.toFixed(1), ms: millisecondsOf(pose.t).toFixed(0) });
}

const setShown = (node, shown, transform) => {
  if (!node) return;
  node.style.display = shown ? "" : "none";
  if (shown) node.setAttribute("transform", transform);
};

export function RifleFigure({ text, step = null, goTo, still = false, interactive = true }) {
  const { still: calmPreference } = usePreferences();
  const [playing, setPlaying] = useState(!still);
  const [cycle, setCycle] = useState(still ? STILL_AT : 0);
  const t = useRef(still ? STILL_AT : 0);
  const sinceSlider = useRef(0);
  const [whole, setWhole] = useState(true);
  const nodes = useRef({});
  const { anchor, say } = useReadout();
  const inView = useInView(anchor);
  const live = playing && whole && !still && !calmPreference && inView;

  const keep = (name) => (node) => (nodes.current[name] = node);

  const apply = useCallback(() => {
    const pose = poseAt(t.current);
    const root = anchor.current;
    if (!root) return;
    root.dataset.gas = pose.gas ? "on" : "off";
    root.dataset.phase = pose.phase;
    for (const group of root.querySelectorAll('[data-group="carrier"]')) group.setAttribute("transform", shift(-pose.carrier));
    for (const group of root.querySelectorAll('[data-group="pin"]')) group.setAttribute("transform", pinShift(pose.carrier, pose.turn));
    const spring = springPaths(pose.carrier);
    nodes.current.springBack?.setAttribute("d", spring.back);
    nodes.current.springFront?.setAttribute("d", spring.front);
    setShown(nodes.current.spent, Boolean(pose.spent), pose.spent ? spentShift(pose.spent.extracted, pose.spent.eject) : "");
    if (nodes.current.spent) nodes.current.spent.style.opacity = pose.spent ? String(1 - Math.max(0, pose.spent.eject - 0.6) / 0.4) : "1";
    setShown(nodes.current.live, Boolean(pose.round), pose.round ? liveShift(pose.round.forward, pose.round.rise) : "");
    setShown(nodes.current.bullet, pose.bullet !== null, pose.bullet !== null ? bulletShift(pose.bullet) : "");
    say(readoutOf(text, pose));
  }, [anchor, say, text]);

  const handles = useMemo(
    () => ({
      bolt: {
        begin: () => poseAt(t.current).carrier,
        drag: ({ dx, dy, context }) => {
          setPlaying(false);
          t.current = cycleAtTravel(clamp(context - alongAxis(P, [1, 0, 0], dx, dy), 0, TRAVEL));
          setCycle(t.current);
        },
        end: () => setPlaying(true),
      },
    }),
    [],
  );

  useLoop((dt) => {
    t.current = (t.current + dt / DEMO_SECONDS) % 1;
    sinceSlider.current += dt;
    if (sinceSlider.current >= SLIDER_EVERY) {
      sinceSlider.current = 0;
      setCycle(t.current);
    }
    apply();
    return true;
  }, live);

  useEffect(() => {
    if (!step || STEP_AT[step] === undefined) return;
    t.current = STEP_AT[step];
    setCycle(t.current);
    setPlaying(false);
  }, [step]);

  useEffect(apply, [apply, cycle]);

  const scrub = (value) => {
    setPlaying(false);
    t.current = value / 100;
    setCycle(t.current);
  };

  const focus = step ? STEP_FOCUS[step] : null;
  const spring = springPaths(poseAt(t.current).carrier);
  const controls = interactive ? (
    <>
      <PlayPause playing={playing} onChange={setPlaying} />
      <Slider label={text.cycle} value={Math.round(cycle * 100)} min={0} max={99} onChange={scrub} format={(value) => `${millisecondsOf(value / 100).toFixed(0)} ms`} />
    </>
  ) : null;

  return (
    <InteractiveFigure
      className="rifle"
      text={text}
      width={WIDTH}
      height={HEIGHT}
      items={ITEMS}
      explode={EXPLODE}
      stepFocus={focus}
      goTo={goTo}
      handles={interactive ? handles : undefined}
      controls={controls}
      readout={readoutOf(text, poseAt(t.current))}
      anchor={anchor}
      still={still}
      onAssembled={setWhole}
      defs={
        <>
          <clipPath id="rifle-chamber">
            <path d={CHAMBER_CLIP} />
          </clipPath>
          <clipPath id="rifle-muzzle">
            <path d={MUZZLE_CLIP} />
          </clipPath>
        </>
      }
    >
      <g data-piece="buffer">
        <path ref={keep("springBack")} className="iso-line" data-tone="lo" data-free="start" d={spring.back} />
        <path ref={keep("springFront")} className="iso-line" data-tone={focus === "buffer" ? "lit" : "mid"} data-free="start" d={spring.front} />
      </g>
      <g className="rifle-moving" clipPath="url(#rifle-chamber)">
        <g ref={keep("spent")}>
          <Solid paths={SPENT} tone="hi" lit={focus === "case"} />
        </g>
        <g ref={keep("live")}>
          <Solid paths={LIVE} tone="hi" lit={focus === "magazine"} />
        </g>
      </g>
      <g className="rifle-moving" clipPath="url(#rifle-muzzle)">
        <g ref={keep("bullet")}>
          <Solid paths={BULLET} tone="hi" />
        </g>
      </g>
    </InteractiveFigure>
  );
}
