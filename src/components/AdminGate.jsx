import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminGate({ children }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    fetch("/api/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!active) return;
        setStatus(data?.ok ? "authed" : "denied");
      })
      .catch(() => {
        if (!active) return;
        setStatus("denied");
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (status === "denied") {
      navigate("/admin/login", { replace: true });
    }
  }, [status, navigate]);

  if (status === "loading") {
    return (
      <div className="page">
        <h1>Checking access...</h1>
      </div>
    );
  }

  if (status === "authed") {
    return children;
  }

  return null;
}
