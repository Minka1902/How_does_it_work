import { Callout } from "./Callout";

export function Step({ step, index, count, label, active, stepRef }) {
  const paragraphs = Array.isArray(step.body) ? step.body : [step.body];

  return (
    <section ref={stepRef} className="step" data-step={step.id} data-active={active ? "" : undefined} aria-current={active ? "step" : undefined}>
      <p className="step-index">{label ?? `${index + 1} / ${count}`}</p>
      <h2>{step.heading}</h2>
      {paragraphs.map((paragraph, at) => (
        <p key={at}>{paragraph}</p>
      ))}
      {step.callout ? <Callout>{step.callout}</Callout> : null}
    </section>
  );
}
