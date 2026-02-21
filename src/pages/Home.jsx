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
  const [activeType, setActiveType] = useState(TYPE_BUTTONS[0].id);

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

  const activeIndex = TYPE_BUTTONS.findIndex((type) => type.id === activeType);
  const activeCategories = categoriesByType.get(activeType) || [];
  const mediaPosts = activeCategories.flatMap((category) =>
    (postsByCategory.get(category.id) || []).filter((post) => post.attachment_url)
  );

  const titleItems = activeCategories.map((category) => category.title).filter(Boolean);
  const descItems = activeCategories.map((category) => category.description || "").filter(Boolean);

  const rows = ["title", "media", "desc"];
  if (activeIndex === 0) {
    rows[0] = "media";
    rows[1] = "title";
    rows[2] = "desc";
  } else if (activeIndex === 1) {
    rows[0] = "title";
    rows[1] = "media";
    rows[2] = "desc";
  } else if (activeIndex === 2) {
    rows[0] = "title";
    rows[1] = "desc";
    rows[2] = "media";
  }

  const renderRow = (rowType) => {
    if (rowType === "media") {
      return (
        <div className="row-media">
          {mediaPosts.length ? (
            mediaPosts.map((post) => (
              <div key={post.id} className="media-item">
                {renderMedia(post)}
              </div>
            ))
          ) : (
            <div className="placeholder">No media.</div>
          )}
        </div>
      );
    }

    if (rowType === "title") {
      return (
        <div className="row-text">
          {titleItems.length ? titleItems.map((item, idx) => <p key={idx}>{item}</p>) : null}
        </div>
      );
    }

    return (
      <div className="row-text">
        {descItems.length ? descItems.map((item, idx) => <p key={idx}>{item}</p>) : null}
      </div>
    );
  };

  return (
    <div className="page home-page">
      {error ? <p className="error">{error}</p> : null}
      <section className="front-shell">
        <div className="button-column">
          {TYPE_BUTTONS.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`type-button${activeType === type.id ? " is-active" : ""}`}
              onClick={() => setActiveType(type.id)}
              aria-label={type.label}
            >
              <img src={type.image} alt={type.label} />
            </button>
          ))}
        </div>

        <div className="content-column">
          {rows.map((row, idx) => (
            <div key={`${row}-${idx}`} className="content-row">
              {renderRow(row)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
