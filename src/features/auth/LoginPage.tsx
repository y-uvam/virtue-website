import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";

const Chrome: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" y1="8" x2="12" y2="8" />
    <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
    <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
  </svg>
);
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import { useAppDispatch, useAppSelector } from "../../store";
import { loginUser, clearAuthError } from "../../store/slices/authSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Alert } from "../../components/common/Alert";
import { Card } from "../../components/common/Card";

export const LoginPage: React.FC = () => {
  const [emailOrUser, setEmailOrUser] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthError());
    setFormError("");
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    dispatch(clearAuthError());

    if (!emailOrUser.trim()) {
      setFormError("Email or Username is required.");
      return;
    }
    if (!password) {
      setFormError("Password is required.");
      return;
    }

    const resultAction = await dispatch(
      loginUser({ emailOrUsername: emailOrUser, password })
    );

    if (loginUser.fulfilled.match(resultAction)) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">{STRINGS.AUTH.LOGIN_TITLE}</h1>
          <p className="text-xs text-textSecondary">{STRINGS.AUTH.LOGIN_SUBTITLE}</p>
        </div>

        {formError && <Alert variant="error">{formError}</Alert>}
        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={STRINGS.AUTH.EMAIL_LABEL}
            id="emailOrUser"
            placeholder={STRINGS.AUTH.EMAIL_PLACEHOLDER}
            prefixIcon={<Mail size={16} />}
            value={emailOrUser}
            onChange={(e) => setEmailOrUser(e.target.value)}
            disabled={loading}
          />

          <div className="space-y-1">
            <Input
              label={STRINGS.AUTH.PASSWORD_LABEL}
              id="password"
              type="password"
              placeholder={STRINGS.AUTH.PASSWORD_PLACEHOLDER}
              prefixIcon={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-textSecondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border bg-bgDark text-primary focus:ring-primary/40 cursor-pointer"
                disabled={loading}
              />
              <span>{STRINGS.AUTH.REMEMBER_ME}</span>
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-primary-light hover:text-white transition-colors"
            >
              {STRINGS.AUTH.FORGOT_PASSWORD_LINK}
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full mt-4"
            loading={loading}
            icon={<LogIn size={16} />}
          >
            {STRINGS.AUTH.LOGIN_BTN}
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <span className="relative px-3 bg-bgCard text-[11px] text-textMuted font-semibold uppercase tracking-wider">
            Or
          </span>
        </div>

        <Button
          variant="secondary"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => {
            // Simulated OAuth trigger
          }}
          disabled={loading}
          icon={<Chrome size={16} />}
        >
          {STRINGS.AUTH.GOOGLE_OAUTH}
        </Button>

        <p className="text-center text-xs text-textSecondary pt-2">
          {STRINGS.AUTH.NO_ACCOUNT}{" "}
          <Link
            to={ROUTES.REGISTER}
            className="text-primary-light hover:text-white font-bold transition-colors"
          >
            {STRINGS.AUTH.REGISTER_TITLE}
          </Link>
        </p>
      </Card>
    </div>
  );
};
export default LoginPage;
