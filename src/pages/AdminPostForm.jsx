import { useEffect, useMemo, useState } from "react";
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

const inferAttachmentType = (file) => {
  const type = file?.type || "";
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type === "application/pdf") return "pdf";
  return "";
};

const renderAttachmentPreview = (type, url) => {
  if (!url) return null;
  if (type === "image") {
    return <img src={url} alt="attachment preview" className="preview media" />;
  }
  if (type === "video") {
    return <video src={url} controls className="preview media" />;
  }
  return (
    <a className="link" href={url} target="_blank" rel="noreferrer">
      Open attachment
    </a>
  );
};

export default function AdminPostForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "new" || !id;
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentType, setAttachmentType] = useState("image");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [info1, setInfo1] = useState("");
  const [info2, setInfo2] = useState("");
  const [info3, setInfo3] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [r2Items, setR2Items] = useState([]);
  const [r2Loading, setR2Loading] = useState(false);
  const [r2Query, setR2Query] = useState("");

  const filteredItems = useMemo(() => {
    if (!r2Query.trim()) return r2Items;
    const q = r2Query.toLowerCase();
    return r2Items.filter((item) => item.key.toLowerCase().includes(q));
  }, [r2Items, r2Query]);

  useEffect(() => {
    fetchJson("/api/categories")
      .then((data) => {
        setCategories(data || []);
        if (!categoryId && data?.length) setCategoryId(data[0].id);
      })
      .catch(() => setError("카테고리 목록을 불러오지 못했습니다."));
  }, [categoryId]);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetchJson(`/api/posts/${id}`)
      .then((data) => {
        setCategoryId(data?.category_id || "");
        setTitle(data?.title || "");
        setDescription(data?.description || "");
        setAttachmentType(data?.attachment_type || "image");
        setAttachmentUrl(data?.attachment_url || "");
        setInfo1(data?.info1 || "");
        setInfo2(data?.info2 || "");
        setInfo3(data?.info3 || "");
      })
      .catch(() => setError("포스트 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const loadR2 = async () => {
    setR2Loading(true);
    try {
      const data = await fetchJson("/api/r2/list?prefix=posts/");
      setR2Items(data?.items || []);
    } catch (err) {
      setError("R2 목록을 불러오지 못했습니다.");
    } finally {
      setR2Loading(false);
    }
  };

  useEffect(() => {
    loadR2();
  }, []);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "posts");
      const data = await fetchJson("/api/upload", { method: "POST", body: formData });
      setAttachmentUrl(data?.url || "");
      const type = inferAttachmentType(file);
      if (type) setAttachmentType(type);
      await loadR2();
    } catch (err) {
      setError("첨부 파일 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handlePick = (item) => {
    if (!item?.url) return;
    setAttachmentUrl(item.url);
    if (item.key.endsWith(".pdf")) setAttachmentType("pdf");
  };

  const handleDeleteR2 = async (item) => {
    if (!item?.key) return;
    if (!window.confirm("정말 삭제할까요?")) return;
    setError("");
    try {
      await fetchJson("/api/r2/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: item.key }),
      });
      await loadR2();
      if (attachmentUrl === item.url) setAttachmentUrl("");
    } catch (err) {
      setError("R2 파일 삭제에 실패했습니다.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const payload = {
        category_id: categoryId,
        title: title.trim(),
        description: description.trim() || null,
        attachment_type: attachmentType || null,
        attachment_url: attachmentUrl || null,
        info1: info1.trim() || null,
        info2: info2.trim() || null,
        info3: info3.trim() || null,
      };
      if (isNew) {
        await fetchJson("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJson(`/api/posts/${id}`, {
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
        <h1>{isNew ? "Add Post" : "Edit Post"}</h1>
        <Link className="btn ghost" to="/admin">
          Back
        </Link>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="admin-form-grid">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>
            Category
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
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
              placeholder="Post title"
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
              placeholder="Post description"
            />
          </label>
          <label>
            Attachment Type
            <select
              value={attachmentType}
              onChange={(event) => setAttachmentType(event.target.value)}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
            </select>
          </label>
          <label>
            Attachment URL
            <input
              type="text"
              value={attachmentUrl}
              onChange={(event) => setAttachmentUrl(event.target.value)}
              placeholder="https://..."
            />
          </label>
          {renderAttachmentPreview(attachmentType, attachmentUrl)}
          <label>
            Upload New File
            <input type="file" onChange={handleFile} />
          </label>
          {uploading ? <p className="meta">Uploading file...</p> : null}
          <label>
            Info 1
            <input type="text" value={info1} onChange={(event) => setInfo1(event.target.value)} />
          </label>
          <label>
            Info 2
            <input type="text" value={info2} onChange={(event) => setInfo2(event.target.value)} />
          </label>
          <label>
            Info 3
            <input type="text" value={info3} onChange={(event) => setInfo3(event.target.value)} />
          </label>
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Save"}
          </button>
        </form>

        <aside className="panel r2-panel">
          <div className="panel-head">
            <h2>R2 Files</h2>
            <button className="btn ghost" type="button" onClick={loadR2} disabled={r2Loading}>
              {r2Loading ? "Loading..." : "Refresh"}
            </button>
          </div>
          <label>
            Search
            <input
              type="text"
              value={r2Query}
              onChange={(event) => setR2Query(event.target.value)}
              placeholder="Search key"
            />
          </label>
          <div className="r2-list">
            {filteredItems.map((item) => (
              <div key={item.key} className="r2-item">
                <button className="r2-thumb" type="button" onClick={() => handlePick(item)}>
                  {item.url && item.key.match(/\.(png|jpg|jpeg|gif|webp)$/i) ? (
                    <img src={item.url} alt={item.key} />
                  ) : (
                    <span>{item.key.split("/").pop()}</span>
                  )}
                </button>
                <div className="r2-meta">
                  <div className="truncate">{item.key}</div>
                  <div className="r2-actions">
                    <button className="btn ghost" type="button" onClick={() => handlePick(item)}>
                      Use
                    </button>
                    <button className="btn danger" type="button" onClick={() => handleDeleteR2(item)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
