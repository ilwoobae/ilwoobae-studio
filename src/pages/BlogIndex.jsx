import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || "Request failed");
  }
  return data?.data ?? data;
}

export default function BlogIndex() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJson("/api/public/categories")
      .then((data) => setCategories(data || []))
      .catch(() => setError("카테고리를 불러오지 못했습니다."));
  }, []);

  return (
    <div className="page blog">
      <div className="page-head">
        <h1>Categories</h1>
        <p className="lead">카테고리를 선택하면 해당 포스트가 표시됩니다.</p>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <section className="panel">
        <div className="card-grid">
          {categories.map((category) => (
            <Link key={category.id} className="group-card" to={`/blog/category/${category.id}`}>
              <h3>{category.title}</h3>
              {category.description ? <p>{category.description}</p> : null}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
