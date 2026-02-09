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
    } catch (err) {
      setError("첨부 파일 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
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
        <label>
          Attachment File
          <input type="file" onChange={handleFile} />
        </label>
        {uploading ? <p className="meta">Uploading file...</p> : null}
        {renderAttachmentPreview(attachmentType, attachmentUrl)}
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
    </div>
  );
}
