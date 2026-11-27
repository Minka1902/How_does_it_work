import en from "./text/en";
import { MotorFigure } from "./components/MotorFigure";

export default function Preview() {
  return <MotorFigure text={en.figure} still interactive={false} />;
}
