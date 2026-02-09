import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { blogCategories, blogPosts } from "../data/blog";
import { getText } from "../utils/text";

export default function BlogCategory() {
  const { categoryId } = useParams();
  const { i18n } = useTranslation();
  const category = blogCategories.find((item) => item.id === categoryId);
  const posts = blogPosts.filter((post) => post.categoryId === categoryId);

  if (!category) {
    return (
      <div className="page">
        <h1>Category not found</h1>
        <Link to="/blog" className="link">Back to blog</Link>
      </div>
    );
  }

  return (
    <div className="page blog-detail">
      <div className="page-head">
        <h1>{getText(category.title, i18n.language)}</h1>
        <p className="lead">이 카테고리에 속한 포스트 목록.</p>
      </div>
      <div className="list">
        {posts.map((post) => (
          <Link key={post.id} className="list-item" to={`/blog/post/${post.id}`}>
            <div>
              <h3>{getText(post.title, i18n.language)}</h3>
              <p>{getText(post.excerpt, i18n.language)}</p>
            </div>
            <span className="meta">{post.date}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
