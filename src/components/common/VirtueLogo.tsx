import React from "react";
import logoImg from "../../assets/virtue_logo.png";

interface VirtueLogoProps {
  size?: number;
  className?: string;
  variant?: "dark" | "light" | "default";
}

export const VirtueLogo: React.FC<VirtueLogoProps> = ({ size = 24, className = "", variant = "default" }) => {
  // Use CSS mask to color the white PNG graphic dynamically without boxes or filters
  let bgClass = "bg-primary"; // default to your premium brand blue!
  if (variant === "dark") {
    bgClass = "bg-textPrimary opacity-90";
  } else if (variant === "light") {
    bgClass = "bg-white";
  }

  return (
    <div
      className={`shrink-0 ${bgClass} ${className}`}
      style={{
        width: size,
        height: size,
        maskImage: `url(${logoImg})`,
        WebkitMaskImage: `url(${logoImg})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
};

export default VirtueLogo;
