import { ScrollyLesson } from "../../lesson-kit/ScrollyLesson";
import { BatteryFigure } from "./components/BatteryFigure";

export default function Lesson({ text }) {
  return <ScrollyLesson steps={text.steps} renderStage={(step) => <BatteryFigure text={text.figure} step={step} />} />;
}
