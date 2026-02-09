import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { blogGroups, blogPosts } from "../data/blog";
import { getText } from "../utils/text";

export default function BlogGroup() {
  const { groupId } = useParams();
  const { i18n } = useTranslation();
  const group = blogGroups.find((item) => item.id === groupId);
  const posts = blogPosts.filter((post) => post.groupId === groupId);

  if (!group) {
    return (
      <div className="page">
        <h1>Group not found</h1>
        <Link to="/blog" className="link">Back to blog</Link>
      </div>
    );
  }

  return (
    <div className="page blog-detail">
      <div className="page-head">
        <h1>{getText(group.title, i18n.language)}</h1>
        <p className="lead">{getText(group.description, i18n.language)}</p>
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
