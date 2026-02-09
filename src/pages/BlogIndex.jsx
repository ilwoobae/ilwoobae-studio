import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { blogGroups, blogCategories, blogPosts } from "../data/blog";
import { getText } from "../utils/text";

export default function BlogIndex() {
  const { t, i18n } = useTranslation();

  return (
    <div className="page blog">
      <div className="page-head">
        <h1>{t("blog.title")}</h1>
        <p className="lead">그룹 → 카테고리 → 포스트로 이어지는 구조.</p>
      </div>

      <section className="panel">
        <h2>{t("blog.groups")}</h2>
        <div className="card-grid">
          {blogGroups.map((group) => (
            <Link key={group.id} className="group-card" to={`/blog/group/${group.id}`}>
              <h3>{getText(group.title, i18n.language)}</h3>
              <p>{getText(group.description, i18n.language)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>{t("blog.categories")}</h2>
        <div className="chip-row">
          {blogCategories.map((category) => (
            <Link key={category.id} className="chip" to={`/blog/category/${category.id}`}>
              {getText(category.title, i18n.language)}
            </Link>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>{t("blog.posts")}</h2>
        <div className="list">
          {blogPosts.map((post) => (
            <Link key={post.id} className="list-item" to={`/blog/post/${post.id}`}>
              <div>
                <h3>{getText(post.title, i18n.language)}</h3>
                <p>{getText(post.excerpt, i18n.language)}</p>
              </div>
              <span className="meta">{post.date}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
