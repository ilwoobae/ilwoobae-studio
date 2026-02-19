import { useEffect, useState } from "react";

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
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJson("/api/public/categories")
      .then((data) => setCategories(data || []))
      .catch(() => setError("콘텐츠를 불러오지 못했습니다."));
  }, []);

  return (
    <div className="page">
      {error ? <p className="error">{error}</p> : null}
      <h1>홈</h1>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>{category.title}</li>
        ))}
      </ul>
    </div>
  );
}
