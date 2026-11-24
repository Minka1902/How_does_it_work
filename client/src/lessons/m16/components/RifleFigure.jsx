import { useCallback, useEffect, useRef, useState } from "react";
import { IsoFigure, Plate, Solid } from "../../../anatomy/react/draw";
import { useInView, useLoop, useReadout } from "../../../anatomy/react/live";
import { AnatomyFigure } from "../../../lesson-kit/anatomy/AnatomyFigure";
import { SceneView } from "../../../lesson-kit/anatomy/SceneView";
import { PlayPause } from "../../../lesson-kit/controls/PlayPause";
import { Slider } from "../../../lesson-kit/controls/Slider";
import { fill } from "../../../lesson-kit/format";
import { usePreferences } from "../../../hooks/usePreferences";
import { BULLET, CHAMBER_CLIP, HEIGHT, ITEMS, LIVE, MUZZLE_CLIP, SPENT, WIDTH, bulletShift, liveShift, pinShift, shift, spentShift, springPaths } from "../figure/geometry";
import { DEMO_SECONDS, STEP_AT, STEP_FOCUS, millisecondsOf, poseAt, travelMm } from "../figure/model";
import "./rifle.css";

const STILL_AT = 0.3;
const SLIDER_EVERY = 0.1;

function readoutOf(text, pose) {
  return fill(text.readout, { phase: text.phases[pose.phase], mm: Math.round(travelMm(pose.carrier)), deg: pose.turn.toFixed(1), ms: millisecondsOf(pose.t).toFixed(0) });
}

const setShown = (node, shown, transform) => {
  if (!node) return;
  node.style.display = shown ? "" : "none";
  if (shown) node.setAttribute("transform", transform);
};

export function RifleFigure({ text, step = null, still = false, interactive = true }) {
  const { still: calmPreference } = usePreferences();
  const [playing, setPlaying] = useState(!still);
  const [cycle, setCycle] = useState(still ? STILL_AT : 0);
  const t = useRef(still ? STILL_AT : 0);
  const sinceSlider = useRef(0);
  const nodes = useRef({});
  const stage = useRef(null);
  const { anchor, say } = useReadout();
  const inView = useInView(stage);
  const live = playing && !still && !calmPreference && inView;

  const keep = (name) => (node) => (nodes.current[name] = node);

  const apply = useCallback(() => {
    const pose = poseAt(t.current);
    const root = stage.current;
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
  }, [say, text]);

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
    <AnatomyFigure className="rifle" controls={controls}>
      <div ref={stage}>
        <Plate fig={text.fig} title={text.title} hint={text.hint} readout={readoutOf(text, poseAt(t.current))} keys={still ? [] : text.keys} caption={still ? null : text.caption}>
          <div ref={anchor}>
            <IsoFigure width={WIDTH} height={HEIGHT} label={text.label}>
              <defs>
                <clipPath id="rifle-chamber">
                  <path d={CHAMBER_CLIP} />
                </clipPath>
                <clipPath id="rifle-muzzle">
                  <path d={MUZZLE_CLIP} />
                </clipPath>
              </defs>
              <SceneView items={ITEMS} focus={focus} />
              <path ref={keep("springBack")} className="iso-line" data-tone="lo" data-free="start" d={spring.back} />
              <path ref={keep("springFront")} className="iso-line" data-tone={focus === "buffer" ? "lit" : "mid"} data-free="start" d={spring.front} />
              <g clipPath="url(#rifle-chamber)">
                <g ref={keep("spent")}>
                  <Solid paths={SPENT} tone="hi" lit={focus === "case"} />
                </g>
                <g ref={keep("live")}>
                  <Solid paths={LIVE} tone="hi" lit={focus === "magazine"} />
                </g>
              </g>
              <g clipPath="url(#rifle-muzzle)">
                <g ref={keep("bullet")}>
                  <Solid paths={BULLET} tone="hi" />
                </g>
              </g>
            </IsoFigure>
          </div>
        </Plate>
      </div>
    </AnatomyFigure>
  );
}
