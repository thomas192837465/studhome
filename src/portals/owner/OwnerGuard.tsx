import { Navigate, Outlet } from "react-router-dom";
import { useOwner } from "../../context/OwnerContext";

export function OwnerGuard() {
  const { isOwnerAuthenticated } = useOwner();
  if (!isOwnerAuthenticated) return <Navigate to="/proprietaire/connexion" replace />;
  return <Outlet />;
}
