import { useEffect, useRef, useState } from "react";
import { IsoFigure, Plate } from "../../anatomy/react/draw";
import { usePreferences } from "../../hooks/usePreferences";
import { AnatomyFigure } from "./AnatomyFigure";
import { PartsBar } from "./PartsBar";
import { PartTip } from "./PartTip";
import { SceneView } from "./SceneView";
import { partCentre, usePartPointer } from "./usePartPointer";
import { useExplode } from "./useExplode";

export function InteractiveFigure({
  text,
  width,
  height,
  items,
  explode,
  stepFocus = null,
  goTo,
  handles,
  controls,
  readout,
  anchor,
  still = false,
  className = "",
  data = {},
  transforms,
  defs,
  onAssembled,
  children,
}) {
  const { still: calmPreference } = usePreferences();
  const stage = useRef(null);
  const [apart, setApart] = useState(false);
  const [bounds, setBounds] = useState([0, 0]);
  const { hovered, setHovered, pinned, setPinned, bind } = usePartPointer(stage, still ? {} : handles);
  const { assembled, moving } = useExplode(stage, explode, apart, calmPreference);
  const parts = text.parts ?? {};
  const focus = hovered ?? pinned?.id ?? stepFocus;
  const tipId = hovered ?? pinned?.id;
  const tipPinned = Boolean(pinned) && pinned.id === tipId;

  const pick = (id) => {
    setPinned({ id, at: partCentre(stage.current, id) });
  };

  const go = (step) => {
    setPinned(null);
    goTo?.(step);
  };

  useEffect(() => {
    if (!stage.current) return;
    const observer = new ResizeObserver(([entry]) => setBounds([entry.contentRect.width, entry.contentRect.height]));
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    onAssembled?.(assembled && !moving);
  }, [assembled, moving, onAssembled]);

  useEffect(() => {
    if (!pinned) return;
    const onKey = (event) => event.key === "Escape" && setPinned(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pinned, setPinned]);

  useEffect(() => {
    if (!stage.current || still) return;
    for (const id of Object.keys(handles ?? {})) for (const node of stage.current.querySelectorAll(`[data-focus="${id}"]`)) node.dataset.handle = handles[id].drag ? "drag" : "click";
  }, [handles, still, items]);

  const bar = still ? null : (
    <PartsBar parts={parts} active={focus} onHover={setHovered} onPick={pick} canExplode={Boolean(explode?.order.length)} apart={apart} onToggleApart={() => setApart((value) => !value)} />
  );

  return (
    <AnatomyFigure className={className} controls={controls} footer={bar}>
      <div ref={stage} className="figure-stage" data-apart={apart || !assembled ? "" : undefined} {...data} {...(still ? {} : bind)}>
        <Plate fig={text.fig} title={text.title} hint={text.hint} readout={readout} keys={still ? [] : text.keys} caption={still ? null : text.caption}>
          <div ref={anchor}>
            <IsoFigure width={width} height={height} label={text.label}>
              {defs ? <defs>{defs}</defs> : null}
              <SceneView items={items} focus={focus} transforms={transforms} />
              {children}
            </IsoFigure>
          </div>
        </Plate>
        {still || !tipId ? null : (
          <PartTip part={parts[tipId]} at={tipPinned && pinned.at ? pinned.at : partCentre(stage.current, tipId)} bounds={bounds} pinned={tipPinned} onGo={goTo ? go : null} onClose={() => setPinned(null)} />
        )}
      </div>
    </AnatomyFigure>
  );
}
