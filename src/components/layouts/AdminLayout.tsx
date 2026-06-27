import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  ShieldAlert,
  Users,
  ShoppingBag,
  Layers,
  Grid,
  CreditCard,
  MessageSquare,
  Settings,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  User,
  Zap,
} from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import { useAppSelector, useAppDispatch } from "../../store";
import { logoutUser } from "../../store/slices/authSlice";
import { Avatar } from "../common/Avatar";
import { Badge } from "../common/Badge";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate(ROUTES.LOGIN);
  };

  const navItems = [
    { label: STRINGS.ADMIN.NAV_ADMIN_DASHBOARD, path: ROUTES.ADMIN, icon: <ShieldAlert size={18} /> },
    { label: STRINGS.ADMIN.NAV_MANAGE_USERS, path: ROUTES.ADMIN_USERS, icon: <Users size={18} /> },
    { label: STRINGS.ADMIN.NAV_MANAGE_ORDERS, path: ROUTES.ADMIN_ORDERS, icon: <ShoppingBag size={18} /> },
    { label: STRINGS.ADMIN.NAV_MANAGE_SERVICES, path: ROUTES.ADMIN_SERVICES, icon: <Layers size={18} /> },
    { label: STRINGS.ADMIN.NAV_MANAGE_CATEGORIES, path: ROUTES.ADMIN_CATEGORIES, icon: <Grid size={18} /> },
    { label: STRINGS.ADMIN.NAV_MANAGE_PAYMENTS, path: ROUTES.ADMIN_PAYMENTS, icon: <CreditCard size={18} /> },
    { label: STRINGS.ADMIN.NAV_MANAGE_TICKETS, path: ROUTES.ADMIN_TICKETS, icon: <MessageSquare size={18} /> },
    { label: STRINGS.ADMIN.NAV_SETTINGS, path: ROUTES.ADMIN_SETTINGS, icon: <Settings size={18} /> },
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const match = navItems.find((item) => item.path === currentPath);
    return match ? match.label : "Admin Dashboard";
  };

  return (
    <div className="min-h-screen bg-bgDark flex relative overflow-hidden">
      {/* Red accent glow for Admin mode warning */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar - Desktop Layout */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-bgCard/60 backdrop-blur-md shrink-0">
        <div className="h-16 px-6 border-b border-border flex items-center justify-between">
          <Link to={ROUTES.ADMIN} className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-amber-500 fill-amber-500/10" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">Admin Panel</span>
          </Link>
          <Badge status="banned" className="!bg-amber-500/10 !text-amber-400 !border-amber-500/20 text-[9px]">Live</Badge>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.ADMIN}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer
                ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500"
                    : "text-textSecondary hover:text-white hover:bg-white/5"
                }
              `
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* User Dashboard Back Link */}
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold text-primary-light hover:text-white hover:bg-primary/10 transition-all duration-150 cursor-pointer mt-6 border border-dashed border-primary/20 bg-primary/5"
          >
            <ArrowLeft size={18} />
            <span>Return to User Mode</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border bg-bgDark/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-textSecondary hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>{STRINGS.DASHBOARD.NAV_LOGOUT}</span>
          </button>
        </div>
      </aside>

      {/* Sidebar Drawer - Mobile Layout */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-bgCard border-r border-border h-full z-10 animate-slide-in">
            <div className="h-16 px-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-amber-500" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Admin Panel</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-textMuted hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === ROUTES.ADMIN}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer
                    ${
                      isActive
                        ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500"
                        : "text-textSecondary hover:text-white hover:bg-white/5"
                    }
                  `
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <Link
                to={ROUTES.DASHBOARD}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold text-primary-light hover:text-white hover:bg-primary/10 transition-all duration-150 cursor-pointer mt-6 border border-dashed border-primary/20 bg-primary/5"
              >
                <ArrowLeft size={18} />
                <span>Return to User Mode</span>
              </Link>
            </nav>

            <div className="p-4 border-t border-border bg-bgDark/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-textSecondary hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
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
        <header className="h-16 px-4 sm:px-6 border-b border-border bg-bgCard/30 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-textSecondary hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-textPrimary truncate">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex px-3 py-1 text-[11px] font-bold text-amber-400 border border-amber-500/30 bg-amber-500/5 rounded-lg uppercase tracking-wider">
              Control Panel Mode
            </div>

            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
              >
                <Avatar name={user?.name ?? "Admin"} size="sm" />
              </button>

              {isUserDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-bgCard border border-border rounded-xl shadow-2xl shadow-black/85 z-50 py-1.5 animate-scale-up">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs font-bold text-textPrimary truncate">{user?.name}</p>
                      <p className="text-[10px] text-amber-500 truncate font-semibold uppercase">Administrator</p>
                    </div>
                    <Link
                      to={ROUTES.DASHBOARD}
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-textSecondary hover:text-white hover:bg-white/5 transition-colors duration-150"
                    >
                      <ArrowLeft size={14} />
                      User Dashboard
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in relative">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
