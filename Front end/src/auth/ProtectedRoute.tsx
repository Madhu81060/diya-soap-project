import { Navigate } from "react-router-dom";
import { adminAuth } from "./adminAuth";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  if (!adminAuth.isLoggedIn()) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
