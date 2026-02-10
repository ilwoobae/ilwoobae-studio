import { useEffect, useMemo, useState } from "react";

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || "Request failed");
  }
  return data?.data ?? data;
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchJson("/api/public/categories"), fetchJson("/api/public/posts")])
      .then(([categoryData, postData]) => {
        setCategories(categoryData || []);
        setPosts(postData || []);
      })
      .catch(() => setError("콘텐츠를 불러오지 못했습니다."));
  }, []);

  const orderedCategories = useMemo(() => {
    const artwork = categories.filter((category) => category.group_id === "artwork");
    const text = categories.filter((category) => category.group_id === "text");
    return [...artwork, ...text];
  }, [categories]);

  return (
    <div className="page home-page">
      {error ? <p className="error">{error}</p> : null}
      <div className="home-scroll">
        <section className="intro-card">
          <div className="intro-characters">
            <span className="intro-char intro-char-top">一宇</span>
            <span className="intro-char intro-char-bottom">裵</span>
          </div>
          <div className="intro-triangles">
            {Array.from({ length: 8 }).map((_, idx) => (
              <svg
                key={idx}
                className={`triangle t-${idx + 1}`}
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <polygon points="100,0 0,50 100,100" fill="#ffffff" stroke="#111111" strokeWidth="1" />
              </svg>
            ))}
          </div>
        </section>
        {orderedCategories.map((category, index) => {
          const categoryPosts = posts.filter((post) => post.category_id === category.id);
          const mediaPosts = categoryPosts.filter((post) => post.attachment_url);

          const renderMedia = (post) => {
            if (!post?.attachment_url) return null;
            if (post.attachment_type === "image") {
              return <img src={post.attachment_url} alt={post.title} />;
            }
            if (post.attachment_type === "video") {
              return (
                <video
                  src={post.attachment_url}
                  muted
                  playsInline
                  autoPlay
                  loop
                />
              );
            }
            return (
              <a href={post.attachment_url} target="_blank" rel="noreferrer">
                View PDF
              </a>
            );
          };

          if (category.group_id === "artwork") {
            return (
              <section className="artwork-card" key={category.id}>
                <div className="artwork-title">
                  <span className="index">#{index + 1}</span>
                  <span>{category.title}</span>
                </div>
                <div className="artwork-right">
                  <div className="artwork-desc-wrap">
                    <div className="artwork-desc">{category.description || ""}</div>
                  </div>
                  <div className="artwork-images">
                    {mediaPosts.length ? (
                      mediaPosts.map((post) => (
                        <div key={post.id} className="media-tile">
                          {renderMedia(post)}
                          <div className="media-caption">{post.title}</div>
                        </div>
                      ))
                    ) : (
                      <div className="placeholder">No media yet.</div>
                    )}
                  </div>
                </div>
              </section>
            );
          }

          return (
            <section className="text-card" key={category.id}>
              <div className="text-head">
                <span className="index">#{index + 1}</span>
                <h2>{category.title}</h2>
              </div>
              {category.description ? <p className="lead">{category.description}</p> : null}
              <div className="text-posts">
                {categoryPosts.length ? (
                  categoryPosts.map((post) => (
                    <div key={post.id} className="text-post">
                      <h3>{post.title}</h3>
                      {post.description ? <p>{post.description}</p> : null}
                    </div>
                  ))
                ) : (
                  <div className="placeholder">No posts yet.</div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
