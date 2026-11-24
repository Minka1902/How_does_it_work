import en from "./text/en";
import { RifleFigure } from "./components/RifleFigure";

export default function Preview() {
  return <RifleFigure text={en.figure} still interactive={false} />;
}
