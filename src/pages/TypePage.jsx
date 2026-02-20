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

export default function TypePage() {
  const { typeId } = useParams();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJson("/api/public/categories")
      .then((data) => setCategories(data || []))
      .catch(() => setError("콘텐츠를 불러오지 못했습니다."));
  }, []);

  const list = useMemo(
    () => categories.filter((category) => category.group_id === typeId),
    [categories, typeId]
  );

  const label = typeLabelById(typeId) || TYPES.find((t) => t.id === typeId)?.label || typeId;

  return (
    <div className="page">
      <div style={{ marginBottom: 16 }}>
        <Link to="/">Back</Link>
      </div>
      <h1>{label}</h1>
      {error ? <p className="error">{error}</p> : null}
      <ul>
        {list.map((category) => (
          <li key={category.id}>{category.title}</li>
        ))}
      </ul>
    </div>
  );
}
