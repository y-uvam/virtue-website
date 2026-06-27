import React from "react";
import { Inbox } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title?: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Data Found",
  description,
  icon,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-bgCard/10 ${className}`}
    >
      <div className="p-4 bg-bgCard border border-border rounded-full text-textMuted mb-4">
        {icon || <Inbox size={32} />}
      </div>
      <h4 className="text-sm font-bold text-textPrimary mb-1">{title}</h4>
      <p className="text-xs text-textMuted max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
