import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  children,
  onDismiss,
  className = "",
}) => {
  const styles = {
    success: {
      bg: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
      icon: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
    },
    error: {
      bg: "bg-danger/10 border-danger/25 text-danger",
      icon: <AlertCircle size={18} className="text-danger shrink-0" />,
    },
    warning: {
      bg: "bg-amber-500/10 border-amber-500/25 text-amber-400",
      icon: <AlertCircle size={18} className="text-amber-400 shrink-0" />,
    },
    info: {
      bg: "bg-blue-500/10 border-blue-500/25 text-blue-400",
      icon: <Info size={18} className="text-blue-400 shrink-0" />,
    },
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${styles[variant].bg} ${className}`}
      role="alert"
    >
      {styles[variant].icon}
      <div className="flex-1 text-xs sm:text-sm">
        {title && <h5 className="font-bold mb-1 text-textPrimary">{title}</h5>}
        <div className="leading-relaxed opacity-95">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-0.5 rounded hover:bg-white/5 text-textMuted hover:text-textPrimary transition-colors duration-150 cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
