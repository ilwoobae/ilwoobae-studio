import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle";

export default function Layout() {
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">Baeil</div>
        <nav className="nav-links">
          <NavLink to="/" end>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/about">{t("nav.about")}</NavLink>
          <NavLink to="/blog">{t("nav.blog")}</NavLink>
        </nav>
        <LanguageToggle />
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>{t("footer.note")}</p>
      </footer>
    </div>
  );
}
