import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || "Request failed");
  }
  return data?.data ?? data;
}

const renderAttachment = (post) => {
  if (!post?.attachment_url) return null;
  if (post.attachment_type === "image") {
    return <img src={post.attachment_url} alt={post.title} className="preview media" />;
  }
  if (post.attachment_type === "video") {
    return <video src={post.attachment_url} controls className="preview media" />;
  }
  return (
    <a className="link" href={post.attachment_url} target="_blank" rel="noreferrer">
      Open attachment
    </a>
  );
};

export default function BlogPost() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!postId) return;
    fetchJson(`/api/public/posts/${postId}`)
      .then((data) => setPost(data))
      .catch(() => setError("포스트를 불러오지 못했습니다."));
  }, [postId]);

  return (
    <div className="page blog">
      <div className="page-head">
        <h1>{post?.title || "Post"}</h1>
        <Link className="link" to={`/blog/category/${post?.category_id || ""}`}>
          Back to category
        </Link>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {post ? (
        <section className="panel">
          {post.description ? <p className="lead">{post.description}</p> : null}
          {renderAttachment(post)}
          <div className="meta">
            {post.info1 ? <span>{post.info1}</span> : null}
            {post.info2 ? <span>{post.info2}</span> : null}
            {post.info3 ? <span>{post.info3}</span> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
