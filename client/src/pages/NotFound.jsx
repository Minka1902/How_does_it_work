import { Link } from "react-router-dom";
import { useT } from "../hooks/useT";

export function NotFound() {
  const t = useT();

  return (
    <div className="container not-found">
      <h1>{t("notFound.title")}</h1>
      <p>{t("notFound.body")}</p>
      <Link to="/" className="pill-button">
        {t("lesson.back")}
      </Link>
    </div>
  );
}
