import { ScrollyLesson } from "../../lesson-kit/ScrollyLesson";
import { FridgeFigure } from "./components/FridgeFigure";

export default function Lesson({ text }) {
  return <ScrollyLesson steps={text.steps} renderStage={(step, goTo) => <FridgeFigure text={text.figure} step={step} goTo={goTo} />} />;
}
