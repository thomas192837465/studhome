import { Navigate, Outlet } from "react-router-dom";
import { useOwner } from "../../context/OwnerContext";

export function OwnerGuard() {
  const { isOwnerAuthenticated, authLoading } = useOwner();
  if (authLoading) return null;
  if (!isOwnerAuthenticated) return <Navigate to="/proprietaire/connexion" replace />;
  return <Outlet />;
}
