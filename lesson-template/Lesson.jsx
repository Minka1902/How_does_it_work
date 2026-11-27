import { ScrollyLesson } from "../../lesson-kit/ScrollyLesson";
import { __NAME__Figure } from "./components/__NAME__Figure";

export default function Lesson({ text }) {
  return <ScrollyLesson steps={text.steps} renderStage={(step, goTo) => <__NAME__Figure text={text.figure} step={step} goTo={goTo} />} />;
}
