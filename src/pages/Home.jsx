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
  const [introScale, setIntroScale] = useState(1);

  useEffect(() => {
    Promise.all([fetchJson("/api/public/categories"), fetchJson("/api/public/posts")])
      .then(([categoryData, postData]) => {
        setCategories(categoryData || []);
        setPosts(postData || []);
      })
      .catch(() => setError("콘텐츠를 불러오지 못했습니다."));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight || 1;
      const t = Math.min(Math.max(y / vh, 0), 1);
      setIntroScale(1 - t);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
      <section className="intro-section">
        <div className="intro-title" style={{ transform: `scaleY(${introScale})` }}>
          <span className="intro-text">裵一宇</span>
        </div>
      </section>

      <section className="content-section">
        {orderedCategories.map((category, index) => {
          const categoryPosts = posts.filter((post) => post.category_id === category.id);

          return (
            <section className="category-block" key={category.id}>
              <div className="category-head">
                <span className="category-index">#{index + 1}</span>
                <h2 className="category-title">{category.title}</h2>
              </div>

              {category.group_id === "artwork" ? (
                <div className="artwork-content">
                  <div className="artwork-desc">{category.description || ""}</div>
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
              ) : (
                <div className="text-content">
                  {categoryPosts.length ? (
                    categoryPosts.map((post) => (
                      <article key={post.id} className="text-post">
                        <h3>{post.title}</h3>
                        {post.description ? <p>{post.description}</p> : null}
                      </article>
                    ))
                  ) : (
                    <div className="placeholder">No posts yet.</div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </section>
    </div>
  );
}
