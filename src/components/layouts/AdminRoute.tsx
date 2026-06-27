import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store";
import { ROUTES } from "../../constants/routes";
import { Spinner } from "../common/Spinner";

/**
 * AdminRoute — allows only users whose role is "admin".
 * Non-admins are redirected to the user dashboard.
 * Unauthenticated users are redirected to login.
 */
export const AdminRoute: React.FC = () => {
  const { user, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgBase">
        <Spinner size={36} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};
