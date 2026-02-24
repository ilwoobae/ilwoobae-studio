import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { typeLabelById } from "../data/types";
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [categoryData, postData] = await Promise.all([
        fetchJson("/api/categories"),
        fetchJson("/api/posts"),
      ]);
      setCategories(categoryData || []);
      setPosts(postData || []);
    } catch (err) {
      setError("데이터를 불러오지 못했습니다. 로그인 상태와 바인딩을 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    navigate("/admin/login", { replace: true });
  };

  const deleteCategory = async (categoryId) => {
    await fetchJson(`/api/categories/${categoryId}`, { method: "DELETE" });
    await loadAll();
  };

  const deletePost = async (postId) => {
    await fetchJson(`/api/posts/${postId}`, { method: "DELETE" });
    await loadAll();
  };

  return (
    <div className="page admin-dashboard">
      <div className="admin-head">
        <h1>Admin</h1>
        <div className="admin-actions">
          <button className="btn ghost" type="button" onClick={loadAll} disabled={loading}>
            {loading ? "Loading..." : "Reload"}
          </button>
          <button className="btn ghost" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="admin-columns">
        <section className="panel admin-col col-30">
          <div className="panel-head">
            <h2>Categories</h2>
            <Link className="btn primary" to="/admin/categories/new">
              Add
            </Link>
          </div>
          <div className="table">
            <div className="row header">
              <div>Type</div>
              <div>Title</div>
              <div>Actions</div>
            </div>
            {categories.map((category) => (
              <div className="row" key={category.id}>
                <div>{typeLabelById(category.group_id)}</div>
                <div>{category.title}</div>
                <div className="row-actions">
                  <Link className="btn ghost" to={`/admin/categories/${category.id}`}>
                    Edit
                  </Link>
                  <button
                    className="btn danger"
                    type="button"
                    onClick={() => deleteCategory(category.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel admin-col col-50">
          <div className="panel-head">
            <h2>Posts</h2>
            <Link className="btn primary" to="/admin/posts/new">
              Add
            </Link>
          </div>
          <div className="table">
            <div className="row header">
              <div>Category</div>
              <div>Title</div>
              <div>Actions</div>
            </div>
            {posts.map((post) => (
              <div className="row" key={post.id}>
                <div>
                  {categories.find((category) => category.id === post.category_id)?.title || "-"}
                </div>
                <div>{post.title}</div>
                <div className="row-actions">
                  <Link className="btn ghost" to={`/admin/posts/${post.id}`}>
                    Edit
                  </Link>
                  <button className="btn danger" type="button" onClick={() => deletePost(post.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
