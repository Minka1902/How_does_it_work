import { ScrollyLesson } from "../../lesson-kit/ScrollyLesson";
import { LockFigure } from "./components/LockFigure";

export default function Lesson({ text }) {
  return <ScrollyLesson steps={text.steps} renderStage={(step, goTo) => <LockFigure text={text.figure} step={step} goTo={goTo} />} />;
}
