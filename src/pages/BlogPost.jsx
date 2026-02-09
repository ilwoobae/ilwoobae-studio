import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { blogPosts } from "../data/blog";
import { getText } from "../utils/text";

export default function BlogPost() {
  const { postId } = useParams();
  const { i18n } = useTranslation();
  const post = blogPosts.find((item) => item.id === postId);

  if (!post) {
    return (
      <div className="page">
        <h1>Post not found</h1>
        <Link to="/blog" className="link">Back to blog</Link>
      </div>
    );
  }

  return (
    <article className="page post">
      <Link to="/blog" className="link">← Blog</Link>
      <header className="post-head">
        <p className="meta">{post.date}</p>
        <h1>{getText(post.title, i18n.language)}</h1>
        <p className="lead">{getText(post.excerpt, i18n.language)}</p>
      </header>
      <div className="post-body">
        {getText(post.content, i18n.language).map((paragraph, index) => (
          <p key={`${post.id}-${index}`}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
