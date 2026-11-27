import { ScrollyLesson } from "../../lesson-kit/ScrollyLesson";
import { RifleFigure } from "./components/RifleFigure";

export default function Lesson({ text }) {
  return <ScrollyLesson steps={text.steps} renderStage={(step, goTo) => <RifleFigure text={text.figure} step={step} goTo={goTo} />} />;
}
