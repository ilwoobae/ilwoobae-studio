import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || "Request failed");
  }
  return data?.data ?? data;
}

const TYPE_BUTTONS = [
  { id: "sculpture", label: "조각", image: "/images/buttons/1.png" },
  { id: "non-sculpture", label: "非조각", image: "/images/buttons/2.png" },
  { id: "text", label: "글", image: "/images/buttons/3.png" },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJson("/api/public/categories")
      .then((data) => setCategories(data || []))
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

  return (
    <div className="page home-page">
      {error ? <p className="error">{error}</p> : null}
      <section className="intro-section">
        <div className="type-buttons">
          {TYPE_BUTTONS.map((type) => (
            <Link
              key={type.id}
              className="type-button"
              to={`/type/${type.id}`}
              aria-label={type.label}
            >
              <img src={type.image} alt={type.label} />
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section">
        {TYPE_BUTTONS.map((type) => {
          const list = categoriesByType.get(type.id) || [];
          return (
            <section className="category-block" key={type.id}>
              <h2 className="category-title">{type.label}</h2>
              <ul>
                {list.map((category) => (
                  <li key={category.id}>{category.title}</li>
                ))}
              </ul>
            </section>
          );
        })}
      </section>
    </div>
  );
}
