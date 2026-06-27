import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store";
import { ROUTES } from "../../constants/routes";
import { Spinner } from "../common/Spinner";

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Renders a spinner while auth state is being restored from storage.
 */
export const ProtectedRoute: React.FC = () => {
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

  return <Outlet />;
};
