import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { BASE_URL } from "@/api/apiConfig";

export default function HomeRedirect() {
  const [path, setPath] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/auth/me`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(user => {
        if (user?.role === "ADMIN") setPath("/admin");
        else if (user?.role === "USER") setPath("/user-dashboard");
        else setPath("/login");
      })
      .catch(() => setPath("/login"));
  }, []);

  if (!path) return <div>Loading…</div>;

  return <Navigate to={path} replace />;
}
