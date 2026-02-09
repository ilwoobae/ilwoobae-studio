import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error("Invalid password");
      }

      setStatus("success");
      setPassword("");
      navigate("/admin", { replace: true });
    } catch (err) {
      setStatus("error");
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="page admin-login">
      <h1>Admin Login</h1>
      <p className="lead">관리자 비밀번호를 입력하세요.</p>
      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            required
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn primary" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
