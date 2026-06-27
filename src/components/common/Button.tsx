import React from "react";
import { Spinner } from "./Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  className = "",
  type = "button",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-primary to-info text-white hover:brightness-110 shadow-lg shadow-primary/25 border border-transparent",
    secondary:
      "bg-bgCard hover:bg-bgCardHover text-textSecondary hover:text-white border border-border",
    danger:
      "bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/25",
    ghost:
      "bg-transparent hover:bg-white/5 text-textSecondary hover:text-white border border-transparent",
    outline:
      "bg-transparent hover:bg-primary/5 text-primary hover:text-primary-light border border-primary/40",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2 border-current" />}
      {!loading && icon && iconPosition === "left" && (
        <span className="mr-2 inline-flex">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === "right" && (
        <span className="ml-2 inline-flex">{icon}</span>
      )}
    </button>
  );
};
