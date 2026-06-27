import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import { useAppDispatch } from "../../store";
import { forgotPassword } from "../../store/slices/authSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Alert } from "../../components/common/Alert";
import { Card } from "../../components/common/Card";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Email address is required.");
      return;
    }

    setLoading(true);
    const resultAction = await dispatch(forgotPassword(email));
    setLoading(false);

    if (forgotPassword.fulfilled.match(resultAction)) {
      setSuccess(true);
    } else {
      setErrorMsg(resultAction.payload as string || "An error occurred.");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">
            {STRINGS.AUTH.FORGOT_PASSWORD_TITLE}
          </h1>
          <p className="text-xs text-textSecondary">
            {STRINGS.AUTH.FORGOT_PASSWORD_SUBTITLE}
          </p>
        </div>

        {success && (
          <Alert variant="success">
            Success! We have sent a simulated password reset link to your email address:{" "}
            <strong>{email}</strong>. Check your inbox and follow the steps.
          </Alert>
        )}

        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={STRINGS.AUTH.EMAIL_LABEL}
            id="email"
            type="email"
            placeholder={STRINGS.AUTH.EMAIL_PLACEHOLDER}
            prefixIcon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || success}
          />

          <Button
            type="submit"
            className="w-full mt-4"
            loading={loading}
            disabled={success}
            icon={<Send size={16} />}
          >
            {STRINGS.AUTH.SEND_RESET_LINK}
          </Button>
        </form>

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
export default ForgotPasswordPage;
