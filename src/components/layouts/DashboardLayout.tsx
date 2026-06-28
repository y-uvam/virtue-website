import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  Layers,
  Wallet,
  History,
  HelpCircle,
  Terminal,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Shield,
  Zap,
} from "lucide-react";
import { VirtueLogo } from "../common/VirtueLogo";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import { useAppSelector, useAppDispatch } from "../../store";
import { logoutUser } from "../../store/slices/authSlice";
import { Avatar } from "../common/Avatar";
import { Button } from "../common/Button";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate(ROUTES.LOGIN);
  };

  const navItems = [
    { label: STRINGS.DASHBOARD.NAV_DASHBOARD, path: ROUTES.DASHBOARD, icon: <LayoutDashboard size={18} /> },
    { label: STRINGS.DASHBOARD.NAV_NEW_ORDER, path: ROUTES.NEW_ORDER, icon: <PlusCircle size={18} /> },
    { label: STRINGS.DASHBOARD.NAV_ORDERS, path: ROUTES.ORDERS, icon: <ShoppingBag size={18} /> },
    { label: STRINGS.DASHBOARD.NAV_SERVICES, path: ROUTES.SERVICES, icon: <Layers size={18} /> },
    { label: STRINGS.DASHBOARD.NAV_PROFILE, path: ROUTES.PROFILE, icon: <User size={18} /> },
    { label: STRINGS.DASHBOARD.NAV_CONTACT, path: ROUTES.CONTACT, icon: <HelpCircle size={18} /> },
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const match = navItems.find((item) => item.path === currentPath);
    if (match) return match.label;
    if (currentPath.includes("/dashboard/support/")) return "Ticket Conversation";
    return STRINGS.DASHBOARD.TITLE;
  };

  // Mock Notifications
  const mockNotifications = [
    { id: 1, text: "🎉 deposit of ₹1000 was approved successfully!", time: "2 hours ago" },
    { id: 2, text: "⚡ Order #ord-1001 status changed to Completed", time: "1 day ago" },
  ];

  return (
    <div className="min-h-screen bg-bgDark flex relative overflow-hidden">
      {/* Sidebar - Desktop Layout */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-bgCard/60 backdrop-blur-md shrink-0">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-border flex items-center">
          <VirtueLogo size={38} className="-mr-2" />
          <span className="text-base font-bold text-textPrimary">{STRINGS.APP.NAME}</span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer
                ${
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-info/10 text-primary-light border-l-2 border-primary"
                    : "text-textSecondary hover:text-textPrimary hover:bg-bgDark/60"
                }
              `
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Admin link overlay */}
          {user?.role === "admin" && (
            <Link
              to={ROUTES.ADMIN}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/5 transition-all duration-150 cursor-pointer mt-6 border border-dashed border-amber-500/20 bg-amber-500/5"
            >
              <Shield size={18} />
              <span>{STRINGS.DASHBOARD.NAV_ADMIN}</span>
            </Link>
          )}
        </nav>

        {/* Footer log out section */}
        <div className="p-4 border-t border-border bg-bgDark/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-textSecondary hover:bg-red-500/10 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>{STRINGS.DASHBOARD.NAV_LOGOUT}</span>
          </button>
        </div>
      </aside>

      {/* Sidebar Drawer - Mobile Layout */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />

          <aside className="relative flex flex-col w-64 bg-bgCard border-r border-border h-full z-10 animate-slide-in">
            <div className="h-16 px-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center">
                <VirtueLogo size={36} className="-mr-1.5" />
                <span className="text-sm font-bold text-textPrimary">{STRINGS.APP.NAME}</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-textMuted hover:text-textPrimary cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer
                    ${
                      isActive
                        ? "bg-gradient-to-r from-primary/20 to-info/10 text-primary-light border-l-2 border-primary"
                        : "text-textSecondary hover:text-textPrimary hover:bg-bgDark/60"
                    }
                  `
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}

              {user?.role === "admin" && (
                <Link
                  to={ROUTES.ADMIN}
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/5 transition-all duration-150 cursor-pointer mt-6 border border-dashed border-amber-500/20 bg-amber-500/5"
                >
                  <Shield size={18} />
                  <span>{STRINGS.DASHBOARD.NAV_ADMIN}</span>
                </Link>
              )}
            </nav>

            <div className="p-4 border-t border-border bg-bgDark/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-textSecondary hover:bg-red-500/10 hover:text-red-600 transition-colors cursor-pointer"
              >
                <LogOut size={18} />
                <span>{STRINGS.DASHBOARD.NAV_LOGOUT}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Navbar */}
        <header className="h-16 px-4 sm:px-6 border-b border-border bg-bgCard/30 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-textSecondary hover:text-textPrimary p-1 rounded hover:bg-bgDark cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-textPrimary truncate">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-lg border border-border bg-bgDark/20 text-textSecondary hover:text-textPrimary hover:bg-bgDark relative cursor-pointer"
              >
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-bgCard border border-border rounded-xl shadow-2xl shadow-black/10 z-50 py-2 animate-scale-up">
                  <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-bold text-textPrimary">Notifications Log</span>
                    <span className="text-[10px] text-primary-light font-semibold uppercase">New</span>
                  </div>
                  <div className="divide-y divide-border/40 max-h-60 overflow-y-auto">
                    {mockNotifications.map((notif) => (
                      <div key={notif.id} className="p-3 text-xs hover:bg-bgCardHover">
                        <p className="text-textSecondary leading-relaxed">{notif.text}</p>
                        <span className="text-[10px] text-textMuted mt-1 block">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
              >
                <Avatar name={user?.name ?? "User"} size="sm" />
                <ChevronDown size={14} className="text-textMuted hidden sm:inline" />
              </button>

              {isUserDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-bgCard border border-border rounded-xl shadow-2xl shadow-black/10 z-50 py-1.5 animate-scale-up">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs font-bold text-textPrimary truncate">{user?.name}</p>
                      <p className="text-[10px] text-textMuted truncate">@{user?.username}</p>
                    </div>
                    <Link
                      to={ROUTES.PROFILE}
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-textSecondary hover:text-textPrimary hover:bg-bgCardHover transition-colors duration-150"
                    >
                      <User size={14} />
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-danger hover:bg-red-500/10 transition-colors duration-150 cursor-pointer"
                    >
                      <LogOut size={14} />
                      {STRINGS.DASHBOARD.NAV_LOGOUT}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Layout Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in relative overflow-hidden">

          <div className="relative z-10">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
