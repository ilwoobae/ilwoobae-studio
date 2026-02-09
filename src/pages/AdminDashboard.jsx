import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState("uploads");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) return;

    setStatus("loading");
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setResult(data);
      setStatus("success");
      setFile(null);
    } catch (err) {
      setStatus("error");
      setError("업로드에 실패했습니다. 인증 또는 버킷 설정을 확인하세요.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="page admin-dashboard">
      <div className="admin-head">
        <h1>Admin</h1>
        <button className="btn ghost" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <section className="panel">
        <h2>Upload to R2</h2>
        <form className="form-card" onSubmit={handleUpload}>
          <label>
            Folder
            <input
              type="text"
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              placeholder="uploads"
            />
          </label>
          <label>
            File
            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              required
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn primary" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Uploading..." : "Upload"}
          </button>
        </form>

        {result ? (
          <div className="result-card">
            <p>Key: {result.key}</p>
            {result.url ? (
              <p>
                URL: <a className="link" href={result.url}>{result.url}</a>
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
