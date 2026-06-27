import React from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  className = "",
}) => {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-bgCard border-x-transparent border-b-transparent -mt-[1px]",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-bgCard border-x-transparent border-t-transparent -mb-[1px]",
    left: "left-full top-1/2 -translate-y-1/2 border-l-bgCard border-y-transparent border-r-transparent -ml-[1px]",
    right: "right-full top-1/2 -translate-y-1/2 border-r-bgCard border-y-transparent border-l-transparent -mr-[1px]",
  };

  return (
    <div className={`relative group inline-block ${className}`}>
      {children}
      <div
        className={`absolute hidden group-hover:block z-50 w-max max-w-xs bg-bgCard border border-border text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl shadow-black/40 pointer-events-none transition-opacity duration-200 animate-fade-in ${positionClasses[position]}`}
      >
        <span>{content}</span>
        {/* Tooltip Arrow */}
        <div
          className={`absolute border-4 ${arrowClasses[position]}`}
        />
      </div>
    </div>
  );
};
