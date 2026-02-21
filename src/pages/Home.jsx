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
  const [textPage, setTextPage] = useState(0);
  const [activePost, setActivePost] = useState(null);

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
  const isTextType = activeType === "text";
  const postsPerPage = 6;
  const totalTextPages = Math.max(1, Math.ceil(activePosts.length / postsPerPage));
  const textPagePosts = activePosts.slice(
    textPage * postsPerPage,
    textPage * postsPerPage + postsPerPage
  );

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
    setTextPage(0);
    setActivePost(null);
  };

  const handleCategoryClick = (categoryId) => {
    setActiveCategoryId(categoryId);
    setMediaIndex(0);
    setTextPage(0);
    setActivePost(null);
  };

  const handleNextMedia = () => {
    if (!mediaPosts.length) return;
    setMediaIndex((prev) => (prev + 1) % mediaPosts.length);
  };

  const handleMediaWheel = (event) => {
    if (Math.abs(event.deltaY) < 4) return;
    handleNextMedia();
  };

  const handleNextTextPage = () => {
    if (!activePosts.length) return;
    setTextPage((prev) => (prev + 1) % totalTextPages);
  };

  const handleHomeClick = () => {
    setActiveType(null);
    setActiveCategoryId(null);
    setMediaIndex(0);
    setTextPage(0);
    setActivePost(null);
  };

  const showButtonsOnly = activeType === null;
  const activeIndex = TYPE_BUTTONS.findIndex((type) => type.id === activeType);

  const renderSlot = (slotIndex) => {
    if (showButtonsOnly) {
      const type = TYPE_BUTTONS[slotIndex];
      return (
        <button
          type="button"
          className="type-button"
          onClick={() => handleTypeClick(type.id)}
          aria-label={type.label}
        >
          <img src={type.image} alt={type.label} />
        </button>
      );
    }

    const activeButton = TYPE_BUTTONS[activeIndex];
    if (slotIndex === activeIndex) {
      return (
        <button
          type="button"
          className="type-button"
          onClick={() => handleTypeClick(activeButton.id)}
          aria-label={activeButton.label}
        >
          <img src={activeButton.image} alt={activeButton.label} />
        </button>
      );
    }

    const otherSlots = [0, 1, 2].filter((idx) => idx !== activeIndex);
    const contentType = slotIndex === otherSlots[0] ? "categories" : "media";

    if (contentType === "categories") {
      return (
        <div className="slot-panel slot-panel-categories">
          <div className="slot-text">
            {activeCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`category-title${category.id === activeCategory?.id ? " is-active" : ""}`
                }
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (isTextType) {
      return (
        <div className="slot-panel slot-panel-text">
          <div
            className="text-viewer"
            onClick={handleNextTextPage}
            role="button"
            tabIndex={0}
          >
            {textPagePosts.length ? (
              textPagePosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  className="text-title"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActivePost(post);
                  }}
                >
                  {post.title}
                </button>
              ))
            ) : (
              <div className="placeholder">No posts.</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="slot-panel slot-panel-media">
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
    );
  };

  return (
    <div className="page home-page">
      {error ? <p className="error">{error}</p> : null}
      <button type="button" className="home-button" onClick={handleHomeClick}>
        ⌂
      </button>
      <section className="front-shell">
        <div className="button-stack">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="slot">
              {renderSlot(idx)}
            </div>
          ))}
        </div>
      </section>
      {activePost ? (
        <div className="text-modal" role="presentation" onClick={() => setActivePost(null)}>
          <div className="text-modal-content" role="dialog" aria-modal="true">
            <button type="button" className="text-modal-close" onClick={() => setActivePost(null)}>
              Close
            </button>
            <h2>{activePost.title}</h2>
            <div className="text-modal-body">
              {activePost.description ? <p>{activePost.description}</p> : null}
              {activePost.info1 ? <p>{activePost.info1}</p> : null}
              {activePost.info2 ? <p>{activePost.info2}</p> : null}
              {activePost.info3 ? <p>{activePost.info3}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
