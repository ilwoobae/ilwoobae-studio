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

export default function BlogCategory() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!categoryId) return;
    setError("");
    Promise.all([
      fetchJson(`/api/public/categories/${categoryId}`),
      fetchJson(`/api/public/posts?category_id=${categoryId}`),
    ])
      .then(([categoryData, postData]) => {
        setCategory(categoryData);
        setPosts(postData || []);
      })
      .catch(() => setError("포스트를 불러오지 못했습니다."));
  }, [categoryId]);

  return (
    <div className="page blog">
      <div className="page-head">
        <h1>{category?.title || "Category"}</h1>
        {category?.description ? <p className="lead">{category.description}</p> : null}
      </div>

      {error ? <p className="error">{error}</p> : null}

      <section className="panel">
        <div className="list">
          {posts.map((post) => (
            <div key={post.id} className="list-item">
              <div>
                <h3>{post.title}</h3>
                {post.description ? <p>{post.description}</p> : null}
                {renderAttachment(post)}
                <div className="meta">
                  {post.info1 ? <span>{post.info1}</span> : null}
                  {post.info2 ? <span>{post.info2}</span> : null}
                  {post.info3 ? <span>{post.info3}</span> : null}
                </div>
              </div>
              <Link className="link" to={`/blog/post/${post.id}`}>
                View
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
