import React from "react";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "stat" | "glass" | "bordered";
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className = "",
  onClick,
  hoverable = false,
}) => {
  const baseClasses = "rounded-xl overflow-hidden transition-all duration-200";
  
  const variantClasses = {
    default: "bg-bgCard border border-border",
    bordered: "bg-transparent border border-border",
    stat: "bg-bgCard border border-border glass relative overflow-hidden",
    glass: "glass",
  };

  const hoverClasses = hoverable
    ? "hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/5 cursor-pointer border-primary/20 hover:border-primary/40"
    : "";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
