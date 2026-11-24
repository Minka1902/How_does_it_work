import en from "./text/en";
import { FridgeFigure } from "./components/FridgeFigure";

export default function Preview() {
  return <FridgeFigure text={en.figure} still interactive={false} />;
}
