import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MailCheck, ShieldAlert, Loader2 } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import { useAppDispatch } from "../../store";
import { verifyEmailToken } from "../../store/slices/authSlice";
import { Card } from "../../components/common/Card";
import { Alert } from "../../components/common/Alert";

export const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const runVerification = async () => {
      if (!token) {
        setVerifying(false);
        setErrorMsg("Invalid verification link.");
        return;
      }

      const resultAction = await dispatch(verifyEmailToken(token));
      
      if (!active) return;

      setVerifying(false);
      if (verifyEmailToken.fulfilled.match(resultAction)) {
        setSuccess(true);
        setTimeout(() => {
          navigate(ROUTES.LOGIN);
        }, 3000);
      } else {
        setErrorMsg(resultAction.payload as string || "Email verification failed.");
      }
    };

    runVerification();

    return () => {
      active = false;
    };
  }, [token, dispatch, navigate]);

  return (
    <div className="max-w-md mx-auto py-16">
      <Card className="p-8 text-center space-y-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="p-4 rounded-full bg-primary/10 border border-primary/20 text-primary-light flex items-center justify-center">
            {verifying ? (
              <Loader2 size={36} className="animate-spin" />
            ) : success ? (
              <MailCheck size={36} className="text-success animate-bounce" />
            ) : (
              <ShieldAlert size={36} className="text-danger" />
            )}
          </div>

          <h1 className="text-xl font-bold text-white">
            {verifying
              ? STRINGS.AUTH.VERIFY_EMAIL_TITLE
              : success
              ? "Email Verified!"
              : "Verification Failed"}
          </h1>
          <p className="text-xs text-textSecondary">
            {verifying
              ? STRINGS.AUTH.VERIFY_EMAIL_SUBTITLE
              : success
              ? "Thank you! Your email has been verified. Redirecting you..."
              : "Something went wrong during the email verification process."}
          </p>
        </div>

        {errorMsg && (
          <div className="space-y-4">
            <Alert variant="error">{errorMsg}</Alert>
            <div className="text-xs text-textSecondary pt-2">
              Go back to{" "}
              <Link to={ROUTES.LOGIN} className="text-primary-light hover:text-white font-bold transition-colors">
                Login Page
              </Link>
            </div>
          </div>
        )}

        {success && (
          <Alert variant="success">
            Redirecting you to login page. Please log in to your account.
          </Alert>
        )}
      </Card>
    </div>
  );
};
export default VerifyEmailPage;
