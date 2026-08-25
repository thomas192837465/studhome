import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminPortal } from "../../context/AdminPortalContext";

export function AdminGuard() {
  const { session, authLoading } = useAdminPortal();
  const isSuperPath = useLocation().pathname.startsWith("/superadmin");
  const requiredRole = isSuperPath ? "Super Admin" : "Admin";

  if (authLoading) return null;
  if (!session || session.role !== requiredRole) {
    return <Navigate to={isSuperPath ? "/superadmin/connexion" : "/admin/connexion"} replace />;
  }
  return <Outlet />;
}
