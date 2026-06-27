import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, RefreshCw } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import { useAppDispatch } from "../../store";
import { resetPassword } from "../../store/slices/authSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Alert } from "../../components/common/Alert";
import { Card } from "../../components/common/Card";

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setErrorMsg("");

    if (!password) {
      setErrorMsg("Password is required.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg(STRINGS.VALIDATION.PASSWORD_SHORT);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(STRINGS.VALIDATION.PASSWORD_MISMATCH);
      return;
    }

    setLoading(true);
    const resultAction = await dispatch(
      resetPassword({ token: token || "valid", newPass: password })
    );
    setLoading(false);

    if (resetPassword.fulfilled.match(resultAction)) {
      setSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 3000);
    } else {
      setErrorMsg(resultAction.payload as string || "Failed to reset password.");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white font-mono">
            {STRINGS.AUTH.RESET_PASSWORD_TITLE}
          </h1>
          <p className="text-xs text-textSecondary font-sans">
            {STRINGS.AUTH.RESET_PASSWORD_SUBTITLE}
          </p>
        </div>

        {success ? (
          <Alert variant="success">
            Your password has been successfully reset! Redirecting you to the login page in 3 seconds...
          </Alert>
        ) : (
          <>
            {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Input
                label={STRINGS.AUTH.CONFIRM_PASSWORD_LABEL}
                id="confirmPassword"
                type="password"
                placeholder={STRINGS.AUTH.PASSWORD_PLACEHOLDER}
                prefixIcon={<Lock size={16} />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />

              <Button
                type="submit"
                className="w-full mt-4"
                loading={loading}
                icon={<RefreshCw size={16} />}
              >
                {STRINGS.AUTH.UPDATE_PASSWORD}
              </Button>
            </form>
          </>
        )}

        <div className="text-center pt-2">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-xs text-textSecondary hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            {STRINGS.AUTH.BACK_TO_LOGIN}
          </Link>
        </div>
      </Card>
    </div>
  );
};
export default ResetPasswordPage;
