import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-bgCard hover:bg-bgCardHover text-textSecondary hover:text-white transition-all duration-150 text-xs font-semibold cursor-pointer ${className}`}
    >
      {copied ? (
        <>
          <Check size={13} className="text-success" />
          <span className="text-success">Copied!</span>
        </>
      ) : (
        <>
          <Copy size={13} className="text-textMuted" />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
};
