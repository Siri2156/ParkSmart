import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { BASE_URL } from "@/api/apiConfig";

export default function AdminRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/auth/me`, { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(user => setAllowed(user?.role === "ADMIN"))
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === null) {
    return <div>Checking access…</div>;
  }
  return allowed ? children : <Navigate to="/login" replace />;
}
