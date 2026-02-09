import { useTranslation } from "react-i18next";

const labels = { ko: "한국어", en: "English" };

export default function LanguageToggle() {
  const { i18n, t } = useTranslation();

  const handleChange = (event) => {
    const next = event.target.value;
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  return (
    <label className="lang-toggle">
      <span>{t("language.label")}</span>
      <select value={i18n.language} onChange={handleChange}>
        {Object.entries(labels).map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
