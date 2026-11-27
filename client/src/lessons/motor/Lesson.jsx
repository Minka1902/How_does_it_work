import { ScrollyLesson } from "../../lesson-kit/ScrollyLesson";
import { MotorFigure } from "./components/MotorFigure";

export default function Lesson({ text }) {
  return <ScrollyLesson steps={text.steps} renderStage={(step, goTo) => <MotorFigure text={text.figure} step={step} goTo={goTo} />} />;
}
