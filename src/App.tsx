import React, { Suspense, lazy, useState, useEffect } from "react";
import { supabase } from "./utils/supabase";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store, useAppDispatch } from "./store";
import { setSessionUser, mapProfileToUser } from "./store/slices/authSlice";
import { type MockUser } from "./store/mockData";
import { ToastProvider } from "./components/common/Toast";
import { ROUTES } from "./constants/routes";

// Layouts
import { PublicLayout } from "./components/layouts/PublicLayout";
import { DashboardLayout } from "./components/layouts/DashboardLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";

// Route guards
import { ProtectedRoute } from "./components/layouts/ProtectedRoute";
import { AdminRoute } from "./components/layouts/AdminRoute";

// Spinner for lazy-loaded pages
import { Spinner } from "./components/common/Spinner";

// Public pages
const LandingPage = lazy(() => import("./features/public/LandingPage").then((m) => ({ default: m.LandingPage })));
const TermsPage = lazy(() => import("./features/public/TermsPage").then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import("./features/public/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));

// Auth pages
const LoginPage = lazy(() => import("./features/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./features/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("./features/auth/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("./features/auth/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import("./features/auth/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage })));

// Dashboard pages
const DashboardHome = lazy(() => import("./features/dashboard/DashboardHome").then((m) => ({ default: m.DashboardHome })));
const NewOrderPage = lazy(() => import("./features/dashboard/NewOrderPage").then((m) => ({ default: m.NewOrderPage })));
const OrdersPage = lazy(() => import("./features/dashboard/OrdersPage").then((m) => ({ default: m.OrdersPage })));
const ServicesPage = lazy(() => import("./features/dashboard/ServicesPage").then((m) => ({ default: m.ServicesPage })));
const AddFundsPage = lazy(() => import("./features/dashboard/AddFundsPage").then((m) => ({ default: m.AddFundsPage })));
const TransactionsPage = lazy(() => import("./features/dashboard/TransactionsPage").then((m) => ({ default: m.TransactionsPage })));
const ProfilePage = lazy(() => import("./features/dashboard/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const SupportPage = lazy(() => import("./features/dashboard/SupportPage").then((m) => ({ default: m.SupportPage })));
const ApiDocsPage = lazy(() => import("./features/dashboard/ApiDocsPage").then((m) => ({ default: m.ApiDocsPage })));
const AffiliatePage = lazy(() => import("./features/dashboard/AffiliatePage").then((m) => ({ default: m.AffiliatePage })));

// Admin pages
const AdminDashboard = lazy(() => import("./features/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const ManageUsers = lazy(() => import("./features/admin/ManageUsers").then((m) => ({ default: m.ManageUsers })));
const ManageOrders = lazy(() => import("./features/admin/ManageOrders").then((m) => ({ default: m.ManageOrders })));
const ManageServices = lazy(() => import("./features/admin/ManageServices").then((m) => ({ default: m.ManageServices })));
const ManageCategories = lazy(() => import("./features/admin/ManageCategories").then((m) => ({ default: m.ManageCategories })));
const ManagePayments = lazy(() => import("./features/admin/ManagePayments").then((m) => ({ default: m.ManagePayments })));
const ManageTickets = lazy(() => import("./features/admin/ManageTickets").then((m) => ({ default: m.ManageTickets })));
const SiteSettings = lazy(() => import("./features/admin/SiteSettings").then((m) => ({ default: m.SiteSettings })));

// Full-page loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-bgBase">
    <div className="flex flex-col items-center gap-4">
      <Spinner size={40} />
      <p className="text-xs text-textMuted font-medium uppercase tracking-widest animate-pulse">Loading…</p>
    </div>
  </div>
);

// Inner app with routing
const AppRoutes: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ─── PUBLIC ─── */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<LandingPage />} />
        <Route path={ROUTES.TERMS} element={<TermsPage />} />
        <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
      </Route>

      {/* ─── AUTH ─── */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />

      {/* ─── DASHBOARD (Protected) ─── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardHome />} />
          <Route path={ROUTES.NEW_ORDER} element={<NewOrderPage />} />
          <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
          <Route path={ROUTES.SERVICES} element={<ServicesPage />} />
          <Route path={ROUTES.ADD_FUNDS} element={<AddFundsPage />} />
          <Route path={ROUTES.TRANSACTIONS} element={<TransactionsPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.SUPPORT} element={<SupportPage />} />
          <Route path={ROUTES.API_DOCS} element={<ApiDocsPage />} />
          <Route path={ROUTES.AFFILIATE} element={<AffiliatePage />} />
        </Route>
      </Route>

      {/* ─── ADMIN (Admin-only) ─── */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN_USERS} element={<ManageUsers />} />
          <Route path={ROUTES.ADMIN_ORDERS} element={<ManageOrders />} />
          <Route path={ROUTES.ADMIN_SERVICES} element={<ManageServices />} />
          <Route path={ROUTES.ADMIN_CATEGORIES} element={<ManageCategories />} />
          <Route path={ROUTES.ADMIN_PAYMENTS} element={<ManagePayments />} />
          <Route path={ROUTES.ADMIN_TICKETS} element={<ManageTickets />} />
          <Route path={ROUTES.ADMIN_SETTINGS} element={<SiteSettings />} />
        </Route>
      </Route>

      {/* ─── Fallback ─── */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  </Suspense>
);

// Auth Initializer to sync session updates with Redux
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 1. Initial check for an active user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              dispatch(setSessionUser(mapProfileToUser(data, !!session.user.email_confirmed_at)));
            } else {
              // Fallback if profiles table is caching/missing
              dispatch(setSessionUser({
                id: session.user.id,
                name: session.user.user_metadata?.full_name || "User",
                username: session.user.user_metadata?.username || "user_" + session.user.id.substring(0, 6),
                email: session.user.email || "",
                role: "user",
                balance: 0.00,
                api_key: "",
                referral_code: "",
                status: "active",
                email_verified: !!session.user.email_confirmed_at,
                created_at: session.user.created_at,
              } as MockUser));
            }
          });
      } else {
        dispatch(setSessionUser(null));
      }
    });

    // 2. Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              dispatch(setSessionUser(mapProfileToUser(data, !!session.user.email_confirmed_at)));
            } else {
              // Fallback if profiles table is caching/missing
              dispatch(setSessionUser({
                id: session.user.id,
                name: session.user.user_metadata?.full_name || "User",
                username: session.user.user_metadata?.username || "user_" + session.user.id.substring(0, 6),
                email: session.user.email || "",
                role: "user",
                balance: 0.00,
                api_key: "",
                referral_code: "",
                status: "active",
                email_verified: !!session.user.email_confirmed_at,
                created_at: session.user.created_at,
              } as MockUser));
            }
          });
      } else {
        dispatch(setSessionUser(null));
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
};

// Root App — wrap with Redux Store + Session Sync + Toast + Router
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthInitializer>
    </Provider>
  );
};

export default App;
