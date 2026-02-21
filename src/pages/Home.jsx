import { useEffect, useMemo, useState } from "react";

const TYPE_BUTTONS = [
  { id: "sculpture", label: "조각", image: "/images/buttons/1.png" },
  { id: "non-sculpture", label: "非조각", image: "/images/buttons/2.png" },
  { id: "text", label: "글", image: "/images/buttons/3.png" },
];

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || "Request failed");
  }
  return data?.data ?? data;
}

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

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [activeType, setActiveType] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [mediaIndex, setMediaIndex] = useState(0);

  useEffect(() => {
    Promise.all([fetchJson("/api/public/categories"), fetchJson("/api/public/posts")])
      .then(([categoryData, postData]) => {
        setCategories(categoryData || []);
        setPosts(postData || []);
      })
      .catch(() => setError("콘텐츠를 불러오지 못했습니다."));
  }, []);

  const categoriesByType = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      if (!map.has(category.group_id)) map.set(category.group_id, []);
      map.get(category.group_id).push(category);
    });
    return map;
  }, [categories]);

  const postsByCategory = useMemo(() => {
    const map = new Map();
    posts.forEach((post) => {
      if (!map.has(post.category_id)) map.set(post.category_id, []);
      map.get(post.category_id).push(post);
    });
    return map;
  }, [posts]);

  const activeCategories = activeType ? categoriesByType.get(activeType) || [] : [];
  const activeCategory =
    activeCategories.find((category) => category.id === activeCategoryId) ||
    activeCategories[0] ||
    null;
  const activePosts = activeCategory ? postsByCategory.get(activeCategory.id) || [] : [];
  const mediaPosts = activePosts.filter((post) => post.attachment_url);
  const activeMedia = mediaPosts.length ? mediaPosts[mediaIndex % mediaPosts.length] : null;

  useEffect(() => {
    if (!activeType) return;
    if (!activeCategoryId && activeCategories[0]) {
      setActiveCategoryId(activeCategories[0].id);
      setMediaIndex(0);
    }
  }, [activeType, activeCategories, activeCategoryId]);

  const handleTypeClick = (typeId) => {
    setActiveType((prev) => (prev === typeId ? null : typeId));
    setActiveCategoryId(null);
    setMediaIndex(0);
  };

  const handleCategoryClick = (categoryId) => {
    setActiveCategoryId(categoryId);
    setMediaIndex(0);
  };

  const handleNextMedia = () => {
    if (!mediaPosts.length) return;
    setMediaIndex((prev) => (prev + 1) % mediaPosts.length);
  };

  const handleMediaWheel = (event) => {
    if (Math.abs(event.deltaY) < 4) return;
    handleNextMedia();
  };

  const showButtonsOnly = activeType === null;
  const activeButton = TYPE_BUTTONS.find((type) => type.id === activeType) || null;

  return (
    <div className="page home-page">
      {error ? <p className="error">{error}</p> : null}
      <section className="front-shell">
        <div className="button-stack">
          {showButtonsOnly ? (
            TYPE_BUTTONS.map((type) => (
              <button
                key={type.id}
                type="button"
                className="type-button"
                onClick={() => handleTypeClick(type.id)}
                aria-label={type.label}
              >
                <img src={type.image} alt={type.label} />
              </button>
            ))
          ) : (
            <>
              <div className="slot slot-top">
                <div className="slot-text">
                  {activeCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`category-title${category.id === activeCategory?.id ? " is-active" : ""}`}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="type-button slot slot-middle"
                onClick={() => handleTypeClick(activeButton?.id)}
              >
                {activeButton ? <img src={activeButton.image} alt={activeButton.label} /> : null}
              </button>
              <div className="slot slot-bottom">
                <div
                  className="media-viewer"
                  onClick={handleNextMedia}
                  onWheel={handleMediaWheel}
                  role="button"
                  tabIndex={0}
                >
                  {activeMedia ? renderMedia(activeMedia) : <div className="placeholder">No media.</div>}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
