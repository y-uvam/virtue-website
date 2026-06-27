import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, PlusCircle, Users } from "lucide-react";

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
import { registerUser, clearAuthError } from "../../store/slices/authSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Alert } from "../../components/common/Alert";
import { Card } from "../../components/common/Card";

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{4,15}$/;

    if (!fullName.trim()) tempErrors.fullName = STRINGS.VALIDATION.REQUIRED;
    if (!email.trim()) {
      tempErrors.email = STRINGS.VALIDATION.REQUIRED;
    } else if (!emailRegex.test(email)) {
      tempErrors.email = STRINGS.VALIDATION.EMAIL_INVALID;
    }

    if (!username.trim()) {
      tempErrors.username = STRINGS.VALIDATION.REQUIRED;
    } else if (!usernameRegex.test(username)) {
      tempErrors.username = STRINGS.VALIDATION.USERNAME_INVALID;
    }

    if (!password) {
      tempErrors.password = STRINGS.VALIDATION.REQUIRED;
    } else if (password.length < 8) {
      tempErrors.password = STRINGS.VALIDATION.PASSWORD_SHORT;
    }

    if (!confirmPassword) {
      tempErrors.confirmPassword = STRINGS.VALIDATION.REQUIRED;
    } else if (password !== confirmPassword) {
      tempErrors.confirmPassword = STRINGS.VALIDATION.PASSWORD_MISMATCH;
    }

    if (!agreeTerms) {
      tempErrors.agreeTerms = STRINGS.VALIDATION.TERMS_REQUIRED;
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    dispatch(clearAuthError());

    if (!validate()) {
      setFormError("Please fix the validation errors below.");
      return;
    }

    const resultAction = await dispatch(
      registerUser({
        fullName,
        email,
        username,
        password,
        referredBy: referralCode,
      })
    );

    if (registerUser.fulfilled.match(resultAction)) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <Card className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">{STRINGS.AUTH.REGISTER_TITLE}</h1>
          <p className="text-xs text-textSecondary">{STRINGS.AUTH.REGISTER_SUBTITLE}</p>
        </div>

        {formError && <Alert variant="error">{formError}</Alert>}
        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={STRINGS.AUTH.FULL_NAME_LABEL}
            id="fullName"
            placeholder={STRINGS.AUTH.FULL_NAME_PLACEHOLDER}
            prefixIcon={<User size={16} />}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            disabled={loading}
          />

          <Input
            label={STRINGS.AUTH.EMAIL_LABEL}
            id="email"
            type="email"
            placeholder={STRINGS.AUTH.EMAIL_PLACEHOLDER}
            prefixIcon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={loading}
          />

          <Input
            label={STRINGS.AUTH.USERNAME_LABEL}
            id="username"
            placeholder={STRINGS.AUTH.USERNAME_PLACEHOLDER}
            prefixIcon={<User size={16} />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            disabled={loading}
          />

          <Input
            label={STRINGS.AUTH.PASSWORD_LABEL}
            id="password"
            type="password"
            placeholder={STRINGS.AUTH.PASSWORD_PLACEHOLDER}
            prefixIcon={<Lock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={loading}
          />

          <Input
            label={STRINGS.AUTH.CONFIRM_PASSWORD_LABEL}
            id="confirmPassword"
            type="password"
            placeholder={STRINGS.AUTH.PASSWORD_PLACEHOLDER}
            prefixIcon={<Lock size={16} />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            disabled={loading}
          />

          <Input
            label={STRINGS.AUTH.REFERRAL_CODE_LABEL}
            id="referralCode"
            placeholder={STRINGS.AUTH.REFERRAL_PLACEHOLDER}
            prefixIcon={<Users size={16} />}
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            disabled={loading || !!searchParams.get("ref")}
          />

          <div className="space-y-1 pt-1 text-left">
            <label className="flex items-start gap-2.5 text-xs text-textSecondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-border bg-bgDark text-primary focus:ring-primary/40 cursor-pointer shrink-0"
                disabled={loading}
              />
              <span>{STRINGS.AUTH.TERMS_AGREE}</span>
            </label>
            {errors.agreeTerms && (
              <span className="text-xs text-danger block mt-1">{errors.agreeTerms}</span>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-4"
            loading={loading}
            icon={<PlusCircle size={16} />}
          >
            {STRINGS.AUTH.REGISTER_BTN}
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
          onClick={() => {}}
          disabled={loading}
          icon={<Chrome size={16} />}
        >
          {STRINGS.AUTH.GOOGLE_OAUTH}
        </Button>

        <p className="text-center text-xs text-textSecondary pt-2">
          {STRINGS.AUTH.HAVE_ACCOUNT}{" "}
          <Link
            to={ROUTES.LOGIN}
            className="text-primary-light hover:text-white font-bold transition-colors"
          >
            {STRINGS.AUTH.LOGIN_TITLE}
          </Link>
        </p>
      </Card>
    </div>
  );
};
export default RegisterPage;
