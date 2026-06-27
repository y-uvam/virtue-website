export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email/:token",
  DASHBOARD: "/dashboard",
  NEW_ORDER: "/dashboard/new-order",
  ORDERS: "/dashboard/orders",
  SERVICES: "/dashboard/services",
  WALLET: "/dashboard/wallet", // Add funds is nested or matching
  ADD_FUNDS: "/dashboard/add-funds",
  TRANSACTIONS: "/dashboard/transactions",
  PROFILE: "/dashboard/profile",
  SUPPORT: "/dashboard/support",
  API_DOCS: "/dashboard/api",
  AFFILIATE: "/dashboard/affiliate",
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_SERVICES: "/admin/services",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_PAYMENTS: "/admin/payments",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_TICKETS: "/admin/tickets",
  TERMS: "/terms",
  PRIVACY: "/privacy",
} as const;

export type RouteKeys = keyof typeof ROUTES;
export type RouteValues = typeof ROUTES[RouteKeys];
