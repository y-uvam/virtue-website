import React from "react";
import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import { CreditCard, Shield, ShieldCheck, Zap } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import { useAppSelector, useAppDispatch } from "../../store";
import { logoutUser } from "../../store/slices/authSlice";
import { Button } from "../common/Button";

interface PublicLayoutProps {
  children?: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-bgDark flex flex-col relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-info/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-bgDark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-primary to-info flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Zap size={18} className="text-white fill-white/10" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-textSecondary bg-clip-text text-transparent">
              {STRINGS.APP.NAME}
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to={ROUTES.DASHBOARD}>
                  <Button variant="outline" size="sm">
                    {user?.role === "admin" ? STRINGS.DASHBOARD.NAV_ADMIN : STRINGS.DASHBOARD.NAV_DASHBOARD}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  {STRINGS.DASHBOARD.NAV_LOGOUT}
                </Button>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">
                    {STRINGS.AUTH.LOGIN_TITLE}
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm">
                    {STRINGS.AUTH.REGISTER_BTN}
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children || <Outlet />}
      </main>

      {/* Footer Block */}
      <footer className="w-full border-t border-border/80 bg-bgCard/30 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-info flex items-center justify-center">
                  <Zap size={16} className="text-white" />
                </div>
                <span className="text-base font-bold text-white">
                  {STRINGS.APP.NAME}
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-textSecondary leading-relaxed max-w-sm mb-4">
                {STRINGS.LANDING.FOOTER_TEXT}
              </p>
              <div className="flex gap-4 text-xs text-textMuted font-medium">
                <Link to={ROUTES.TERMS} className="hover:text-white transition-colors">Terms of Service</Link>
                <span>•</span>
                <Link to={ROUTES.PRIVACY} className="hover:text-white transition-colors">Privacy Policy</Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-textPrimary mb-4">
                {STRINGS.LANDING.FOOTER_LINKS_TITLE}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to={ROUTES.HOME} className="text-textSecondary hover:text-white transition-colors">
                    Home Page
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.LOGIN} className="text-textSecondary hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.REGISTER} className="text-textSecondary hover:text-white transition-colors">
                    Register
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-textPrimary mb-4">
                {STRINGS.LANDING.FOOTER_SUPPORT_TITLE}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to={ROUTES.SUPPORT} className="text-textSecondary hover:text-white transition-colors">
                    Support Tickets
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.API_DOCS} className="text-textSecondary hover:text-white transition-colors">
                    API Docs
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-textMuted">
              &copy; {new Date().getFullYear()} {STRINGS.APP.NAME}. All rights reserved.
            </span>
            {/* Payment Method Badges */}
            <div className="flex items-center gap-3 text-textMuted">
              <span className="text-xs font-medium mr-1">We Accept:</span>
              <div className="flex gap-2">
                <div className="p-1 rounded bg-bgCard border border-border text-xs font-bold flex items-center justify-center w-12 h-6 text-white cursor-help" title="UPI/Netbanking">
                  UPI
                </div>
                <div className="p-1 rounded bg-bgCard border border-border text-xs font-bold flex items-center justify-center w-12 h-6 text-white cursor-help" title="Razorpay Gateway Secured">
                  Card
                </div>
                <div className="p-1 rounded bg-bgCard border border-border text-xs font-bold flex items-center justify-center w-12 h-6 text-white cursor-help" title="Bitcoin / USDT / Cryptos">
                  Crypto
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
