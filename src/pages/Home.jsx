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
  const [expandedPostId, setExpandedPostId] = useState(null);

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

  const renderMedia = (post) => {
    if (!post?.attachment_url) return null;
    if (post.attachment_type === "image") {
      return <img src={post.attachment_url} alt={post.title} />;
    }
    if (post.attachment_type === "video") {
      return <video src={post.attachment_url} muted playsInline autoPlay loop />;
    }
    return (
      <a href={post.attachment_url} target="_blank" rel="noreferrer">
        View PDF
      </a>
    );
  };

  return (
    <div className="page home-page">
      {error ? <p className="error">{error}</p> : null}
      <div className="home-scroll">
        <section className="intro-card">
          <h1 className="intro-title">裵一宇</h1>
        </section>

        {orderedCategories.map((category, index) => {
          const categoryPosts = posts.filter((post) => post.category_id === category.id);

          if (category.group_id === "artwork") {
            return (
              <section className="category-card artwork-card" key={category.id}>
                <div className="category-left">
                  <div className="category-index">#{index + 1}</div>
                  <div className="category-title">{category.title}</div>
                </div>
                <div className="category-right">
                  <div className="artwork-desc-wrap">
                    <div className="artwork-desc">{category.description || ""}</div>
                  </div>
                  <div className="artwork-media">
                    {categoryPosts.filter((post) => post.attachment_url).length ? (
                      categoryPosts
                        .filter((post) => post.attachment_url)
                        .map((post) => (
                          <div key={post.id} className="media-tile">
                            {renderMedia(post)}
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
            <section className="category-card text-card" key={category.id}>
              <div className="category-left">
                <div className="category-index">#{index + 1}</div>
                <div className="category-title">{category.title}</div>
              </div>
              <div className="category-right text-posts">
                {categoryPosts.length ? (
                  categoryPosts.map((post) => {
                    const isExpanded = expandedPostId === post.id;
                    return (
                      <article
                        key={post.id}
                        className={`text-post ${isExpanded ? "expanded" : ""}`}
                      >
                        <div className="text-post-title">{post.title}</div>
                        <div className="text-post-body">
                          {post.description || ""}
                        </div>
                        <button
                          className="text-post-toggle"
                          type="button"
                          onClick={() =>
                            setExpandedPostId(isExpanded ? null : post.id)
                          }
                        >
                          {isExpanded ? "Close" : "More"}
                        </button>
                      </article>
                    );
                  })
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
