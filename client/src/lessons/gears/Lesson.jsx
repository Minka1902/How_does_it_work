import { ScrollyLesson } from "../../lesson-kit/ScrollyLesson";
import { GearsFigure } from "./components/GearsFigure";

export default function Lesson({ text }) {
  return <ScrollyLesson steps={text.steps} renderStage={(step, goTo) => <GearsFigure text={text.figure} step={step} goTo={goTo} />} />;
}
