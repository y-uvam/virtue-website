import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | number;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const isNumber = typeof size === "number";
  
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const style = isNumber ? { width: size, height: size } : {};
  const borderClass = isNumber ? (size < 24 ? "border-2" : "border-3") : "";

  return (
    <div
      className={`animate-spin rounded-full border-t-transparent border-primary ${isNumber ? borderClass : sizeClasses[size]} ${className}`}
      style={style}
      role="status"
      aria-label="loading"
    />
  );
};
