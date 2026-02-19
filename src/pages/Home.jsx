import { useEffect, useMemo, useRef, useState } from "react";

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
  const [fitScale, setFitScale] = useState({ x: 1, y: 1 });
  const introRef = useRef(null);
  const measureRef = useRef(null);

  useEffect(() => {
    Promise.all([fetchJson("/api/public/categories"), fetchJson("/api/public/posts")])
      .then(([categoryData, postData]) => {
        setCategories(categoryData || []);
        setPosts(postData || []);
      })
      .catch(() => setError("콘텐츠를 불러오지 못했습니다."));
  }, []);

  useEffect(() => {
    const introEl = introRef.current;
    const measureEl = measureRef.current;
    if (!introEl || !measureEl) return;

    const updateScale = () => {
      const { width: cw, height: ch } = introEl.getBoundingClientRect();
      const { width: tw, height: th } = measureEl.getBoundingClientRect();
      if (!tw || !th) return;
      setFitScale({ x: cw / tw, y: ch / th });
    };

    const ro = new ResizeObserver(updateScale);
    ro.observe(introEl);
    ro.observe(measureEl);
    updateScale();

    return () => ro.disconnect();
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
      <section className="intro-section" ref={introRef}>
        <div className="intro-title">
          <span
            className="intro-text"
            style={{ transform: `scale(${fitScale.x}, ${fitScale.y})` }}
          >
            裵一宇
          </span>
          <span className="intro-measure" ref={measureRef}>
            裵一宇
          </span>
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
