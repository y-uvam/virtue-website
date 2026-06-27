import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      prefixIcon,
      suffixIcon,
      type = "text",
      className = "",
      containerClassName = "",
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={`flex flex-col w-full text-left ${containerClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold text-textSecondary mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3 text-textMuted flex items-center pointer-events-none">
              {prefixIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            type={actualType}
            className={`w-full bg-bgDark border rounded-lg py-2.5 px-3 text-sm text-textPrimary placeholder-textMuted transition-all duration-200 outline-none
              ${prefixIcon ? "pl-10" : ""}
              ${suffixIcon || isPassword ? "pr-10" : ""}
              ${
                error
                  ? "border-danger focus:ring-1 focus:ring-danger"
                  : "border-border focus:border-primary focus:ring-1 focus:ring-primary/40"
              }
              ${className}
            `}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-textMuted hover:text-textSecondary focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : (
            suffixIcon && (
              <div className="absolute right-3 text-textMuted flex items-center pointer-events-none">
                {suffixIcon}
              </div>
            )
          )}
        </div>
        {error && <span className="text-xs text-danger mt-1.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
