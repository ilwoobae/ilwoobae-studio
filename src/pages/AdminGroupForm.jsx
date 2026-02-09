import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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

export default function AdminGroupForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "new" || !id;
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetchJson(`/api/groups/${id}`)
      .then((data) => setTitle(data?.title || ""))
      .catch(() => setError("그룹 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (isNew) {
        await fetchJson("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim() }),
        });
      } else {
        await fetchJson(`/api/groups/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim() }),
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
        <h1>{isNew ? "Add Group" : "Edit Group"}</h1>
        <Link className="btn ghost" to="/admin">
          Back
        </Link>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Group title"
            required
            disabled={loading}
          />
        </label>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Loading..." : "Save"}
        </button>
      </form>
    </div>
  );
}
