import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TYPES, typeLabelById } from "../data/types";

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
    .map((block, idx) => (
      <p key={idx}>{block}</p>
    ));
};

export default function TypePage() {
  const { typeId } = useParams();
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [openPostId, setOpenPostId] = useState(null);

  useEffect(() => {
    Promise.all([fetchJson("/api/public/categories"), fetchJson("/api/public/posts")])
      .then(([categoryData, postData]) => {
        setCategories(categoryData || []);
        setPosts(postData || []);
      })
      .catch(() => setError("콘텐츠를 불러오지 못했습니다."));
  }, []);

  const list = useMemo(
    () => categories.filter((category) => category.group_id === typeId),
    [categories, typeId]
  );

  const label = typeLabelById(typeId) || TYPES.find((t) => t.id === typeId)?.label || typeId;

  const postsByCategory = useMemo(() => {
    const map = new Map();
    posts.forEach((post) => {
      if (!map.has(post.category_id)) map.set(post.category_id, []);
      map.get(post.category_id).push(post);
    });
    return map;
  }, [posts]);

  const isText = typeId === "text";

  return (
    <div className="page type-page">
      <div className="type-head">
        <Link to="/">Back</Link>
      </div>
      {error ? <p className="error">{error}</p> : null}

      <div className="type-content">
        {list.map((category) => {
          const categoryPosts = postsByCategory.get(category.id) || [];

          if (!isText) {
            const mediaPosts = categoryPosts.filter((post) => post.attachment_url);
            return (
              <section key={category.id} className="type-category">
                {category.description ? <p>{category.description}</p> : null}
                <div className="type-media">
                  {mediaPosts.map((post) => (
                    <div key={post.id} className="media-tile">
                      {renderMedia(post)}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          return (
            <section key={category.id} className="type-category">
              <h2>{category.title}</h2>
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
                        <div className="type-post-body">{renderParagraphs(post.description || "")}</div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
