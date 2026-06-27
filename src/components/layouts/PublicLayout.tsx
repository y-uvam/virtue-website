import React from "react";
import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import { CreditCard, Shield, ShieldCheck, Zap } from "lucide-react";
import { VirtueLogo } from "../common/VirtueLogo";
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

      {/* Abstract geometric background patterns */}
      <svg className="absolute top-0 right-0 w-[550px] h-[550px] text-primary/10 pointer-events-none z-0" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.3">
        <circle cx="100" cy="0" r="30" />
        <circle cx="100" cy="0" r="50" />
        <circle cx="100" cy="0" r="70" />
        <circle cx="100" cy="0" r="90" />
        <circle cx="100" cy="0" r="110" />
        <circle cx="100" cy="0" r="130" />
        <circle cx="100" cy="0" r="150" />
      </svg>

      <svg className="absolute bottom-0 left-0 w-[450px] h-[450px] text-primary/8 pointer-events-none z-0" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.3">
        <path d="M-10,110 L110,-10 M-10,90 L90,-10 M-10,70 L70,-10 M-10,50 L50,-10 M-10,30 L30,-10" />
        <polygon points="10,90 30,70 50,90" strokeDasharray="1,1" />
        <polygon points="30,70 60,40 40,30" strokeDasharray="1,1" />
      </svg>

      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-bgDark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
            <VirtueLogo size={38} className="transition-transform group-hover:scale-105" />
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
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
                <VirtueLogo size={36} />
                <span className="text-base font-bold text-textPrimary">
                  {STRINGS.APP.NAME}
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-textSecondary leading-relaxed max-w-sm mb-4">
                {STRINGS.LANDING.FOOTER_TEXT}
              </p>
              <div className="flex gap-4 text-xs text-textMuted font-medium">
                <Link to={ROUTES.TERMS} className="hover:text-primary transition-colors">Terms of Service</Link>
                <span>•</span>
                <Link to={ROUTES.PRIVACY} className="hover:text-primary transition-colors">Privacy Policy</Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-textPrimary mb-4">
                {STRINGS.LANDING.FOOTER_LINKS_TITLE}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to={ROUTES.HOME} className="text-textSecondary hover:text-primary transition-colors">
                    Home Page
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.LOGIN} className="text-textSecondary hover:text-primary transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.REGISTER} className="text-textSecondary hover:text-primary transition-colors">
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
                  <Link to={ROUTES.SUPPORT} className="text-textSecondary hover:text-primary transition-colors">
                    Support Tickets
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.API_DOCS} className="text-textSecondary hover:text-primary transition-colors">
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
