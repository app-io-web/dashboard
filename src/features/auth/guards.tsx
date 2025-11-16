import { Navigate, useLocation } from "react-router-dom";
import { getAccessToken } from "@/lib/auth";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const token = getAccessToken();
  const loc = useLocation();
  if (!token) return <Navigate to={`/login?from=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return children;
}

export function PublicOnly({ children }: { children: JSX.Element }) {
  const token = getAccessToken();
  const from = new URLSearchParams(location.search).get("from") || "/";
  if (token) return <Navigate to={from} replace />;
  return children;
}
