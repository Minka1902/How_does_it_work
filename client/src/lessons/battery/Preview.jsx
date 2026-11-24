import en from "./text/en";
import { BatteryFigure } from "./components/BatteryFigure";

export default function Preview() {
  return <BatteryFigure text={en.figure} still interactive={false} />;
}
