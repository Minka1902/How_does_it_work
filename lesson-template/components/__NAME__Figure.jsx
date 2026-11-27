import { useState } from "react";
import { useReadout } from "../../../anatomy/react/live";
import { InteractiveFigure } from "../../../lesson-kit/anatomy/InteractiveFigure";
import { fill } from "../../../lesson-kit/format";
import { EXPLODE, HEIGHT, ITEMS, WIDTH } from "../figure/geometry";
import { STEP_FOCUS } from "../figure/model";

export function __NAME__Figure({ text, step = null, goTo, still = false, interactive = true }) {
  const [presses, setPresses] = useState(0);
  const { anchor } = useReadout();
  const handles = { part: { click: () => setPresses((value) => value + 1) } };

  return (
    <InteractiveFigure
      className="__SLUG__"
      text={text}
      width={WIDTH}
      height={HEIGHT}
      items={ITEMS}
      explode={EXPLODE}
      stepFocus={step ? STEP_FOCUS[step] : null}
      goTo={goTo}
      handles={interactive ? handles : undefined}
      readout={fill(text.readout, { value: presses })}
      anchor={anchor}
      still={still}
    />
  );
}
