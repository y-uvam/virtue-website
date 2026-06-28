import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 animate-fade-in"
        onClick={onClose}
        style={{
          background: "rgba(0, 0, 0, 0.72)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* Modal Dialog */}
      <div
        ref={dialogRef}
        className={`relative w-full ${sizeClasses[size]} flex flex-col overflow-hidden z-10`}
        style={{
          background: "linear-gradient(145deg, #1e2130, #151824)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "20px",
          boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
          animation: "modal-pop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Subtle top glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.5), transparent)",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", letterSpacing: "0.01em" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)";
              (e.currentTarget as HTMLButtonElement).style.color = "#f1f5f9";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            maxHeight: "calc(80vh - 140px)",
            color: "#94a3b8",
            fontSize: "14px",
            lineHeight: "1.65",
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
              padding: "14px 24px 20px 24px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modal-pop {
          from { transform: scale(0.93) translateY(12px); opacity: 0; }
          to   { transform: scale(1)    translateY(0px);  opacity: 1; }
        }
      `}</style>
    </div>
  );
};
