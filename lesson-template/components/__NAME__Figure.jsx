import { IsoFigure, Plate } from "../../../anatomy/react/draw";
import { AnatomyFigure } from "../../../lesson-kit/anatomy/AnatomyFigure";
import { SceneView } from "../../../lesson-kit/anatomy/SceneView";
import { HEIGHT, ITEMS, WIDTH } from "../figure/geometry";
import { STEP_FOCUS } from "../figure/model";

export function __NAME__Figure({ text, step = null, still = false }) {
  return (
    <AnatomyFigure>
      <Plate fig={text.fig} title={text.title} hint={text.hint} readout={text.readout} keys={still ? [] : text.keys} caption={still ? null : text.caption}>
        <IsoFigure width={WIDTH} height={HEIGHT} label={text.label}>
          <SceneView items={ITEMS} focus={step ? STEP_FOCUS[step] : null} />
        </IsoFigure>
      </Plate>
    </AnatomyFigure>
  );
}
