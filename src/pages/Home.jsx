import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page home">
      <section className="hero">
        <div>
          <p className="eyebrow">Studio</p>
          <h1>Ilwoobae Studio</h1>
          <p className="subtitle">카테고리와 포스트로 정리된 프로젝트 아카이브.</p>
          <div className="cta-row">
            <Link className="btn primary" to="/blog">
              View Categories
            </Link>
            <a className="btn ghost" href="mailto:hello@example.com">
              Contact
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
