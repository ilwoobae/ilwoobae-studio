import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="page about">
      <h1>{t("about.title")}</h1>
      <p className="lead">{t("about.body")}</p>
      <div className="about-grid">
        <div>
          <h3>{t("about.focusTitle")}</h3>
          <p>{t("about.focusBody")}</p>
        </div>
        <div>
          <h3>{t("about.stackTitle")}</h3>
          <p>{t("about.stackBody")}</p>
        </div>
        <div>
          <h3>{t("about.nowTitle")}</h3>
          <p>{t("about.nowBody")}</p>
        </div>
      </div>
    </div>
  );
}
