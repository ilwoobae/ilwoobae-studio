import { useEffect, useMemo, useRef, useState } from "react";

const TYPE_BUTTONS = [
  { id: "sculpture", label: "조각", subLabel: "sculpture" },
  { id: "text", label: "말과 글", subLabel: "text" },
  { id: "non-sculpture", label: "비조각", subLabel: "non" },
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
  const [textParagraphIndex, setTextParagraphIndex] = useState(0);
  const [reveal, setReveal] = useState({ x: 0, y: 0, open: false });
  const [detailVisible, setDetailVisible] = useState(false);
  const transitionRef = useRef(null);

  useEffect(() => {
    const pathMatch = window.location.pathname.match(/^\/type\/([^/]+)$/);
    if (!pathMatch) return;
    window.history.replaceState({}, "", "/");
    setDetailVisible(false);
    setActiveType(null);
    setActiveCategoryId(null);
    setMediaIndex(0);
    setTextPage(0);
    setActivePost(null);
    setReveal({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      open: false,
    });
  }, []);

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
  const textPostsAll = activeCategories.flatMap((category) =>
    (postsByCategory.get(category.id) || []).map((post) => ({
      ...post,
      __categoryTitle: category.title,
    }))
  );
  const allSculpturePosts = useMemo(() => {
    if (!categories.length || !posts.length) return [];
    const categoryMap = new Map(categories.map((category) => [category.id, category]));
    return posts.filter((post) => {
      const category = categoryMap.get(post.category_id);
      return category?.group_id === "sculpture";
    });
  }, [categories, posts]);
  const isSculptureType = activeType === "sculpture";
  const mediaSourcePosts = isSculptureType ? allSculpturePosts : activePosts;
  const mediaPosts = mediaSourcePosts.filter((post) => post.attachment_url);
  const activeMedia = mediaPosts.length ? mediaPosts[mediaIndex % mediaPosts.length] : null;
  const isTextType = activeType === "text";
  const postsPerPage = 6;
  const textSource = isTextType ? textPostsAll : activePosts;
  const totalTextPages = Math.max(1, Math.ceil(textSource.length / postsPerPage));
  const textPagePosts = textSource.slice(
    textPage * postsPerPage,
    textPage * postsPerPage + postsPerPage
  );
  const activePostParagraphs = useMemo(() => {
    if (!activePost?.description) return [];
    return activePost.description
      .split(/\n\s*\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }, [activePost]);
  const currentParagraph = activePostParagraphs[textParagraphIndex] || "";
  const hasNextParagraph = textParagraphIndex < activePostParagraphs.length - 1;

  useEffect(() => {
    if (!activeType) return;
    if (!activeCategoryId && activeCategories[0]) {
      setActiveCategoryId(activeCategories[0].id);
      setMediaIndex(0);
    }
  }, [activeType, activeCategories, activeCategoryId]);

  useEffect(() => {
    return () => {
      if (transitionRef.current) {
        clearTimeout(transitionRef.current);
      }
    };
  }, []);

  const openDetail = (typeId, event) => {
    if (transitionRef.current) {
      clearTimeout(transitionRef.current);
    }
    setActiveType(typeId);
    setActiveCategoryId(null);
    setMediaIndex(0);
    setTextPage(0);
    setActivePost(null);
    setDetailVisible(true);
    setReveal({ x: event.clientX, y: event.clientY, open: false });
    window.history.pushState(
      { activeType: typeId, x: event.clientX, y: event.clientY },
      "",
      `/type/${typeId}`
    );
    requestAnimationFrame(() => {
      setReveal((prev) => ({ ...prev, open: true }));
    });
  };

  const closeDetail = () => {
    if (transitionRef.current) {
      clearTimeout(transitionRef.current);
    }
    setReveal((prev) => ({ ...prev, open: false }));
    transitionRef.current = setTimeout(() => {
      setDetailVisible(false);
      setActiveType(null);
      setActiveCategoryId(null);
      setMediaIndex(0);
      setTextPage(0);
      setActivePost(null);
      window.history.pushState({}, "", "/");
    }, 650);
  };

  const handleTypeClick = (typeId, event) => {
    if (detailVisible) return;
    openDetail(typeId, event);
  };

  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state || {};
      if (state.activeType) {
        setDetailVisible(true);
        setActiveType(state.activeType);
        setActiveCategoryId(null);
        setMediaIndex(0);
        setTextPage(0);
        setActivePost(null);
        const fallbackX = window.innerWidth / 2;
        const fallbackY = window.innerHeight / 2;
        setReveal({
          x: state.x ?? fallbackX,
          y: state.y ?? fallbackY,
          open: true,
        });
      } else {
        setDetailVisible(false);
        setActiveType(null);
        setActiveCategoryId(null);
        setMediaIndex(0);
        setTextPage(0);
        setActivePost(null);
        setReveal((prev) => ({ ...prev, open: false }));
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleCategoryClick = (categoryId) => {
    setActiveCategoryId(categoryId);
    setMediaIndex(0);
    setTextPage(0);
    setActivePost(null);
    setTextParagraphIndex(0);
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

  const renderButton = (type) => (
    <button
      type="button"
      className="type-button"
      onClick={(event) => handleTypeClick(type.id, event)}
    >
      <span className="type-label">
        {type.label.split("").map((char, index) => (
          <span key={`${type.id}-${index}`} className="type-char">
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
      <span className="type-sublabel">{type.subLabel}</span>
    </button>
  );

  const renderSlot = (slotIndex) => {
    if (!activeType) {
      return renderButton(TYPE_BUTTONS[slotIndex]);
    }

    const activeIndex = TYPE_BUTTONS.findIndex((type) => type.id === activeType);
    const activeButton = TYPE_BUTTONS[activeIndex];
    if (slotIndex === activeIndex) {
      return renderButton(activeButton);
    }

    const otherSlots = [0, 1, 2].filter((idx) => idx !== activeIndex);
    const contentType = slotIndex === otherSlots[0] ? "categories" : "media";

    if (contentType === "categories") {
      if (isTextType || isSculptureType) {
        return <div className="slot-panel slot-panel-categories" />;
      }
      return (
        <div className="slot-panel slot-panel-categories">
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
      );
    }

    if (isTextType) {
      return (
        <div className="slot-panel slot-panel-text">
          <div
            className="text-viewer text-viewer-fixed"
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
                    setTextParagraphIndex(0);
                  }}
                >
                  <span className="text-title-lines text-title-line-main">
                    {post.__categoryTitle ? (
                      <span className="text-title-category">{post.__categoryTitle}: </span>
                    ) : null}
                    <span className="text-title-main">{post.title}</span>
                  </span>
                  <span className="text-title-meta text-title-line-meta">
                    {post.info1 ? `${post.info1}` : ""}
                    {post.info2 ? ` ${post.info2}` : ""}
                    {post.info3 ? ` ${post.info3}` : ""}
                  </span>
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

  const typeClass =
    activeType === "sculpture"
      ? "type-sculpture"
      : activeType === "non-sculpture"
      ? "type-non-sculpture"
      : "type-text";

  return (
    <div
      className={`page home-page${detailVisible ? ` type-page ${typeClass}` : ""}${
        reveal.open ? " is-open" : ""
      }`}
      style={detailVisible ? { "--x": `${reveal.x}px`, "--y": `${reveal.y}px` } : undefined}
    >
      {error ? <p className="error">{error}</p> : null}
      <section className="front-shell">
        {detailVisible ? (
          <div className="type-reveal">
            <div className="button-stack">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="slot">
                  {renderSlot(idx)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="button-stack">
            {TYPE_BUTTONS.map((type) => (
              <div key={type.id} className="slot">
                {renderButton(type)}
              </div>
            ))}
          </div>
        )}
      </section>
      {detailVisible ? (
        <button
          type="button"
          className="radial-marker"
          style={{ "--x": `${reveal.x}px`, "--y": `${reveal.y}px` }}
          onClick={closeDetail}
          aria-label="Back to home"
        />
      ) : null}
      {detailVisible && activeMedia ? (
        <div className="media-title">{activeMedia.title}</div>
      ) : null}
      {detailVisible && mediaPosts.length ? (
        <div className="media-indicator" aria-hidden="true">
          {mediaPosts.map((_, index) => (
            <div
              key={`media-indicator-${index}`}
              className={`media-indicator-item${
                index === (mediaIndex % mediaPosts.length) ? " is-active" : ""
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      ) : null}
      {activePost ? (
        <div className="text-modal" role="presentation" onClick={() => setActivePost(null)}>
          <div
            className="text-modal-content"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-modal-body">
              {currentParagraph ? <p>{currentParagraph}</p> : null}
            </div>
            {activePostParagraphs.length ? (
              <button
                type="button"
                className="text-modal-next"
                onClick={(event) => {
                  event.stopPropagation();
                  if (hasNextParagraph) {
                    setTextParagraphIndex((prev) => prev + 1);
                  } else {
                    setActivePost(null);
                  }
                }}
              >
                {hasNextParagraph ? "다음" : "닫기"}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
