import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import ko from "./locales/ko/translation.json";

const supported = ["en", "ko"];
const stored = localStorage.getItem("lang");
const browser = navigator.language?.slice(0, 2);
const initial = supported.includes(stored)
  ? stored
  : supported.includes(browser)
  ? browser
  : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
  },
  lng: initial,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
