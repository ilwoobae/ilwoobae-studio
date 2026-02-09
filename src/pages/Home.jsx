import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLatestPosts } from "../data/blog";
import { getText } from "../utils/text";

export default function Home() {
  const { t, i18n } = useTranslation();
  const latest = getLatestPosts(3);
  const cards = t("home.cards", { returnObjects: true });

  return (
    <div className="page home">
      <section className="hero">
        <div>
          <p className="eyebrow">Frontend • Product • Craft</p>
          <h1>{t("home.title")}</h1>
          <p className="subtitle">{t("home.subtitle")}</p>
          <div className="cta-row">
            <Link className="btn primary" to="/blog">
              {t("home.ctaPrimary")}
            </Link>
            <a className="btn ghost" href="mailto:hello@example.com">
              {t("home.ctaSecondary")}
            </a>
          </div>
        </div>
        <div className="hero-card">
          <h3>{t("home.sections.now")}</h3>
          <p>{cards[0]}</p>
          <h3>{t("home.sections.projects")}</h3>
          <p>{cards[1]}</p>
          <h3>{t("home.sections.writing")}</h3>
          <p>{cards[2]}</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>{t("blog.latest")}</h2>
          <Link to="/blog" className="link">See all</Link>
        </div>
        <div className="card-grid">
          {latest.map((post) => (
            <Link key={post.id} className="post-card" to={`/blog/post/${post.id}`}>
              <div className="meta">{post.date}</div>
              <h3>{getText(post.title, i18n.language)}</h3>
              <p>{getText(post.excerpt, i18n.language)}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
