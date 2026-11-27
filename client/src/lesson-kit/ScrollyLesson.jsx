import { useCallback, useMemo } from "react";
import { useActiveStep } from "../hooks/useActiveStep";
import { useT } from "../hooks/useT";
import { Step } from "./Step";

export function ScrollyLesson({ steps, renderStage, side = "end", stepsWidth = 380, className = "scrolly" }) {
  const t = useT();
  const ids = useMemo(() => steps.map((step) => step.id), [steps]);
  const { active, register } = useActiveStep(ids);
  const index = Math.max(0, ids.indexOf(active));

  const goTo = useCallback((id) => document.querySelector(`[data-step="${id}"]`)?.scrollIntoView({ block: "center", behavior: document.documentElement.dataset.motion === "reduce" ? "auto" : "smooth" }), []);

  return (
    <div className={className} data-side={side} style={{ "--steps": `${stepsWidth}px` }}>
      <div className="scrolly-steps">
        {steps.map((step, at) => (
          <Step key={step.id} step={step} index={at} count={steps.length} label={t("lesson.step", { index: at + 1, count: steps.length })} active={step.id === active} stepRef={register(step.id)} />
        ))}
      </div>
      <div className="scrolly-stage">{renderStage(ids[index], goTo)}</div>
    </div>
  );
}
