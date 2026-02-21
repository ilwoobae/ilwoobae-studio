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

const renderParagraphs = (text) => {
  if (!text) return null;
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, idx) => <p key={idx}>{block}</p>);
};

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [activeType, setActiveType] = useState("sculpture");
  const [openPostId, setOpenPostId] = useState(null);

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

  const isText = activeType === "text";
  const activeCategories = categoriesByType.get(activeType) || [];

  return (
    <div className="page home-page">
      {error ? <p className="error">{error}</p> : null}
      <section className="front-shell">
        <div className="type-buttons">
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

        <div className="type-panel">
          <div className="type-panel-inner">
            {activeCategories.map((category) => {
              const categoryPosts = postsByCategory.get(category.id) || [];
              if (!isText) {
                return (
                  <div key={category.id} className="type-section">
                    {category.description ? <p>{category.description}</p> : null}
                    <div className="type-media">
                      {categoryPosts
                        .filter((post) => post.attachment_url)
                        .map((post) => (
                          <div key={post.id} className="media-tile">
                            {renderMedia(post)}
                          </div>
                        ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={category.id} className="type-section">
                  <div className="type-posts">
                    {categoryPosts.map((post) => {
                      const isOpen = openPostId === post.id;
                      return (
                        <div key={post.id} className="type-post">
                          <button
                            type="button"
                            className="type-post-title"
                            onClick={() => setOpenPostId(isOpen ? null : post.id)}
                          >
                            {post.title}
                          </button>
                          {isOpen ? (
                            <div className="type-post-body">
                              {renderParagraphs(post.description || "")}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
