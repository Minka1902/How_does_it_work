import en from "./text/en";
import { LockFigure } from "./components/LockFigure";

export default function Preview() {
  return <LockFigure text={en.figure} still interactive={false} />;
}
