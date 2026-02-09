import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [uploadingPostId, setUploadingPostId] = useState("");
  const [uploadingNew, setUploadingNew] = useState(false);

  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [newCategory, setNewCategory] = useState({
    group_id: "",
    title: "",
    description: "",
  });
  const [newPost, setNewPost] = useState({
    category_id: "",
    title: "",
    description: "",
    attachment_type: "image",
    attachment_url: "",
    info1: "",
    info2: "",
    info3: "",
  });

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [groupData, categoryData, postData] = await Promise.all([
        fetchJson("/api/groups"),
        fetchJson("/api/categories"),
        fetchJson("/api/posts"),
      ]);
      setGroups(groupData || []);
      setCategories(categoryData || []);
      setPosts(postData || []);

      if (groupData?.length && !newCategory.group_id) {
        setNewCategory((prev) => ({ ...prev, group_id: groupData[0].id }));
      }
      if (categoryData?.length && !newPost.category_id) {
        setNewPost((prev) => ({ ...prev, category_id: categoryData[0].id }));
      }
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

  const inferAttachmentType = (file) => {
    const type = file?.type || "";
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type === "application/pdf") return "pdf";
    return "";
  };

  const uploadToR2 = async (file, folder = "posts") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const data = await fetchJson("/api/upload", { method: "POST", body: formData });
    return {
      url: data?.url || "",
      type: inferAttachmentType(file),
    };
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

  const handleUpload = async (event) => {
    event.preventDefault();
    const file = event.target.file?.files?.[0];
    const folder = event.target.folder?.value || "uploads";
    if (!file) return;

    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      await fetchJson("/api/upload", {
        method: "POST",
        body: formData,
      });

      event.target.reset();
    } catch (err) {
      setError("업로드에 실패했습니다. 인증 또는 버킷 설정을 확인하세요.");
    }
  };

  const handleNewPostFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setUploadingNew(true);
    try {
      const { url, type } = await uploadToR2(file, "posts");
      setNewPost((prev) => ({
        ...prev,
        attachment_url: url,
        attachment_type: type || prev.attachment_type,
      }));
    } catch (err) {
      setError("첨부 파일 업로드에 실패했습니다.");
    } finally {
      setUploadingNew(false);
    }
  };

  const handleExistingPostFile = async (postId, file) => {
    if (!file) return;
    setError("");
    setUploadingPostId(postId);
    try {
      const { url, type } = await uploadToR2(file, "posts");
      setPosts((prev) =>
        prev.map((item) =>
          item.id === postId
            ? { ...item, attachment_url: url, attachment_type: type || item.attachment_type }
            : item
        )
      );
    } catch (err) {
      setError("첨부 파일 업로드에 실패했습니다.");
    } finally {
      setUploadingPostId("");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    navigate("/admin/login", { replace: true });
  };

  const createGroup = async () => {
    if (!newGroupTitle.trim()) return;
    await fetchJson("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newGroupTitle.trim() }),
    });
    setNewGroupTitle("");
    await loadAll();
  };

  const saveGroup = async (group) => {
    await fetchJson(`/api/groups/${group.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: group.title }),
    });
    await loadAll();
  };

  const deleteGroup = async (groupId) => {
    await fetchJson(`/api/groups/${groupId}`, { method: "DELETE" });
    await loadAll();
  };

  const createCategory = async () => {
    if (!newCategory.group_id || !newCategory.title.trim()) return;
    await fetchJson("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id: newCategory.group_id,
        title: newCategory.title.trim(),
        description: newCategory.description || null,
      }),
    });
    setNewCategory((prev) => ({ ...prev, title: "", description: "" }));
    await loadAll();
  };

  const saveCategory = async (category) => {
    await fetchJson(`/api/categories/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id: category.group_id,
        title: category.title,
        description: category.description || null,
      }),
    });
    await loadAll();
  };

  const deleteCategory = async (categoryId) => {
    await fetchJson(`/api/categories/${categoryId}`, { method: "DELETE" });
    await loadAll();
  };

  const createPost = async () => {
    if (!newPost.category_id || !newPost.title.trim()) return;
    await fetchJson("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: newPost.category_id,
        title: newPost.title.trim(),
        description: newPost.description || null,
        attachment_type: newPost.attachment_type || null,
        attachment_url: newPost.attachment_url || null,
        info1: newPost.info1 || null,
        info2: newPost.info2 || null,
        info3: newPost.info3 || null,
      }),
    });
    setNewPost((prev) => ({
      ...prev,
      title: "",
      description: "",
      attachment_url: "",
      info1: "",
      info2: "",
      info3: "",
    }));
    await loadAll();
  };

  const savePost = async (post) => {
    await fetchJson(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: post.category_id,
        title: post.title,
        description: post.description || null,
        attachment_type: post.attachment_type || null,
        attachment_url: post.attachment_url || null,
        info1: post.info1 || null,
        info2: post.info2 || null,
        info3: post.info3 || null,
      }),
    });
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

      <section className="panel">
        <h2>Upload to R2</h2>
        <form className="form-card" onSubmit={handleUpload}>
          <label>
            Folder
            <input type="text" name="folder" placeholder="uploads" defaultValue="uploads" />
          </label>
          <label>
            File
            <input type="file" name="file" required />
          </label>
          <button className="btn primary" type="submit">
            Upload
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Groups</h2>
        <div className="form-card">
          <label>
            Title
            <input
              type="text"
              value={newGroupTitle}
              onChange={(event) => setNewGroupTitle(event.target.value)}
              placeholder="New group title"
            />
          </label>
          <button className="btn primary" type="button" onClick={createGroup}>
            Add Group
          </button>
        </div>

        <div className="table">
          <div className="row header">
            <div>ID</div>
            <div>Title</div>
            <div>Actions</div>
          </div>
          {groups.map((group) => (
            <div className="row" key={group.id}>
              <div className="mono small">{group.id}</div>
              <div>
                <input
                  type="text"
                  value={group.title || ""}
                  onChange={(event) =>
                    setGroups((prev) =>
                      prev.map((item) =>
                        item.id === group.id
                          ? { ...item, title: event.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>
              <div className="row-actions">
                <button className="btn ghost" type="button" onClick={() => saveGroup(group)}>
                  Save
                </button>
                <button className="btn danger" type="button" onClick={() => deleteGroup(group.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Categories</h2>
        <div className="form-card">
          <label>
            Group
            <select
              value={newCategory.group_id}
              onChange={(event) =>
                setNewCategory((prev) => ({ ...prev, group_id: event.target.value }))
              }
            >
              <option value="">Select group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input
              type="text"
              value={newCategory.title}
              onChange={(event) =>
                setNewCategory((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Category title"
            />
          </label>
          <label>
            Description
            <textarea
              rows={2}
              value={newCategory.description}
              onChange={(event) =>
                setNewCategory((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Category description"
            />
          </label>
          <button className="btn primary" type="button" onClick={createCategory}>
            Add Category
          </button>
        </div>

        <div className="table">
          <div className="row header">
            <div>ID</div>
            <div>Group</div>
            <div>Title</div>
            <div>Description</div>
            <div>Actions</div>
          </div>
          {categories.map((category) => (
            <div className="row" key={category.id}>
              <div className="mono small">{category.id}</div>
              <div>
                <select
                  value={category.group_id}
                  onChange={(event) =>
                    setCategories((prev) =>
                      prev.map((item) =>
                        item.id === category.id
                          ? { ...item, group_id: event.target.value }
                          : item
                      )
                    )
                  }
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="text"
                  value={category.title || ""}
                  onChange={(event) =>
                    setCategories((prev) =>
                      prev.map((item) =>
                        item.id === category.id
                          ? { ...item, title: event.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>
              <div>
                <textarea
                  rows={2}
                  value={category.description || ""}
                  onChange={(event) =>
                    setCategories((prev) =>
                      prev.map((item) =>
                        item.id === category.id
                          ? { ...item, description: event.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>
              <div className="row-actions">
                <button className="btn ghost" type="button" onClick={() => saveCategory(category)}>
                  Save
                </button>
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

      <section className="panel">
        <h2>Posts</h2>
        <div className="form-card">
          <label>
            Category
            <select
              value={newPost.category_id}
              onChange={(event) =>
                setNewPost((prev) => ({ ...prev, category_id: event.target.value }))
              }
            >
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
              value={newPost.title}
              onChange={(event) => setNewPost((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Post title"
            />
          </label>
          <label>
            Description
            <textarea
              rows={2}
              value={newPost.description}
              onChange={(event) =>
                setNewPost((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Post description"
            />
          </label>
          <label>
            Attachment Type
            <select
              value={newPost.attachment_type}
              onChange={(event) =>
                setNewPost((prev) => ({ ...prev, attachment_type: event.target.value }))
              }
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
              value={newPost.attachment_url}
              onChange={(event) =>
                setNewPost((prev) => ({ ...prev, attachment_url: event.target.value }))
              }
              placeholder="https://..."
            />
          </label>
          <label>
            Attachment File
            <input type="file" onChange={handleNewPostFile} />
          </label>
          {uploadingNew ? <p className="meta">Uploading file...</p> : null}
          {renderAttachmentPreview(newPost.attachment_type, newPost.attachment_url)}
          <label>
            Info 1
            <input
              type="text"
              value={newPost.info1}
              onChange={(event) => setNewPost((prev) => ({ ...prev, info1: event.target.value }))}
            />
          </label>
          <label>
            Info 2
            <input
              type="text"
              value={newPost.info2}
              onChange={(event) => setNewPost((prev) => ({ ...prev, info2: event.target.value }))}
            />
          </label>
          <label>
            Info 3
            <input
              type="text"
              value={newPost.info3}
              onChange={(event) => setNewPost((prev) => ({ ...prev, info3: event.target.value }))}
            />
          </label>
          <button className="btn primary" type="button" onClick={createPost}>
            Add Post
          </button>
        </div>

        <div className="table">
          <div className="row header">
            <div>ID</div>
            <div>Category</div>
            <div>Title</div>
            <div>Attachment</div>
            <div>Description</div>
            <div>Info 1</div>
            <div>Info 2</div>
            <div>Info 3</div>
            <div>Actions</div>
          </div>
          {posts.map((post) => (
            <div className="row" key={post.id}>
              <div className="mono small">{post.id}</div>
              <div>
                <select
                  value={post.category_id}
                  onChange={(event) =>
                    setPosts((prev) =>
                      prev.map((item) =>
                        item.id === post.id
                          ? { ...item, category_id: event.target.value }
                          : item
                      )
                    )
                  }
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="text"
                  value={post.title || ""}
                  onChange={(event) =>
                    setPosts((prev) =>
                      prev.map((item) =>
                        item.id === post.id
                          ? { ...item, title: event.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>
              <div>
                <select
                  value={post.attachment_type || "image"}
                  onChange={(event) =>
                    setPosts((prev) =>
                      prev.map((item) =>
                        item.id === post.id
                          ? { ...item, attachment_type: event.target.value }
                          : item
                      )
                    )
                  }
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                </select>
                <input
                  type="text"
                  value={post.attachment_url || ""}
                  onChange={(event) =>
                    setPosts((prev) =>
                      prev.map((item) =>
                        item.id === post.id
                          ? { ...item, attachment_url: event.target.value }
                          : item
                      )
                    )
                  }
                  placeholder="https://..."
                />
                <input
                  type="file"
                  onChange={(event) => handleExistingPostFile(post.id, event.target.files?.[0])}
                />
                {uploadingPostId === post.id ? <p className="meta">Uploading...</p> : null}
                {renderAttachmentPreview(post.attachment_type, post.attachment_url)}
              </div>
              <div>
                <textarea
                  rows={2}
                  value={post.description || ""}
                  onChange={(event) =>
                    setPosts((prev) =>
                      prev.map((item) =>
                        item.id === post.id
                          ? { ...item, description: event.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>
              <div>
                <input
                  type="text"
                  value={post.info1 || ""}
                  onChange={(event) =>
                    setPosts((prev) =>
                      prev.map((item) =>
                        item.id === post.id
                          ? { ...item, info1: event.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>
              <div>
                <input
                  type="text"
                  value={post.info2 || ""}
                  onChange={(event) =>
                    setPosts((prev) =>
                      prev.map((item) =>
                        item.id === post.id
                          ? { ...item, info2: event.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>
              <div>
                <input
                  type="text"
                  value={post.info3 || ""}
                  onChange={(event) =>
                    setPosts((prev) =>
                      prev.map((item) =>
                        item.id === post.id
                          ? { ...item, info3: event.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>
              <div className="row-actions">
                <button className="btn ghost" type="button" onClick={() => savePost(post)}>
                  Save
                </button>
                <button className="btn danger" type="button" onClick={() => deletePost(post.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
