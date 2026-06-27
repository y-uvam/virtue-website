import React from "react";

interface BadgeProps {
  status: string;
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ status, children, className = "" }) => {
  const normStatus = status.toLowerCase().trim().replace(/_/g, " ");

  let colorClasses = "bg-gray-800/80 text-gray-300 border-gray-700/55";

  if (normStatus === "pending") {
    colorClasses = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  } else if (normStatus === "in progress" || normStatus === "processing") {
    colorClasses = "bg-blue-500/10 text-blue-400 border-blue-500/20";
  } else if (normStatus === "completed" || normStatus === "active") {
    colorClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  } else if (normStatus === "cancelled" || normStatus === "canceled" || normStatus === "banned") {
    colorClasses = "bg-red-500/10 text-red-400 border-red-500/20";
  } else if (normStatus === "partial") {
    colorClasses = "bg-orange-500/10 text-orange-400 border-orange-500/20";
  } else if (normStatus === "refunded") {
    colorClasses = "bg-purple-500/10 text-purple-400 border-purple-500/20";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {children || normStatus}
    </span>
  );
};
