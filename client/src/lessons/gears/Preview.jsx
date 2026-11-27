import en from "./text/en";
import { GearsFigure } from "./components/GearsFigure";

export default function Preview() {
  return <GearsFigure text={en.figure} still interactive={false} />;
}
