import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TYPES } from "../data/types";
import "../admin.css";

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    const message = data?.error || response.statusText || "Request failed";
    throw new Error(message);
  }
  return data?.data ?? data;
}

export default function AdminCategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "new" || !id;
  const [groupId, setGroupId] = useState(TYPES[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetchJson(`/api/categories/${id}`)
      .then((data) => {
        setGroupId(data?.group_id || TYPES[0]?.id || "");
        setTitle(data?.title || "");
        setDescription(data?.description || "");
      })
      .catch(() => setError("카테고리 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const payload = {
        group_id: groupId,
        title: title.trim(),
        description: description.trim() || null,
      };
      if (isNew) {
        await fetchJson("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJson(`/api/categories/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      navigate("/admin", { replace: true });
    } catch (err) {
      setError("저장에 실패했습니다.");
    }
  };

  return (
    <div className="page admin-form">
      <div className="admin-head">
        <h1>{isNew ? "Add Category" : "Edit Category"}</h1>
        <Link className="btn ghost" to="/admin">
          Back
        </Link>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Type
          <select value={groupId} onChange={(event) => setGroupId(event.target.value)} required>
            {TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Category title"
            required
            disabled={loading}
          />
        </label>
        <label>
          Description
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Category description"
          />
        </label>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Loading..." : "Save"}
        </button>
      </form>
    </div>
  );
}
