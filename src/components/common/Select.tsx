import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  searchable?: boolean;
  error?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchable = true,
  error,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(search.toLowerCase()))
      )
    : options;

  return (
    <div className={`flex flex-col w-full text-left relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-textSecondary mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-bgDark border rounded-lg py-2.5 px-3 text-sm text-textPrimary flex items-center justify-between transition-all duration-200 outline-none cursor-pointer
          ${isOpen ? "border-primary ring-1 ring-primary/45" : "border-border hover:border-textMuted"}
          ${error ? "border-danger focus:ring-1 focus:ring-danger" : ""}
        `}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption ? (
            <>
              {selectedOption.icon}
              <span className="font-medium">{selectedOption.label}</span>
              {selectedOption.subLabel && (
                <span className="text-xs text-textMuted font-normal truncate hidden sm:inline">
                  - {selectedOption.subLabel}
                </span>
              )}
            </>
          ) : (
            <span className="text-textMuted">{placeholder}</span>
          )}
        </span>
        <ChevronDown size={16} className={`text-textMuted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-bgCard border border-border rounded-lg shadow-xl shadow-black/60 z-50 max-h-60 flex flex-col overflow-hidden animate-fade-in bg-white">
          {searchable && (
            <div className="p-2 border-b border-border flex items-center gap-2 bg-bgDark/40">
              <Search size={14} className="text-textMuted" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-textPrimary outline-none border-none placeholder-textMuted"
              />
            </div>
          )}
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2.5 text-xs sm:text-sm hover:bg-bgCardHover flex flex-col transition-colors duration-150 border-b border-border/20 last:border-b-0 cursor-pointer
                    ${opt.value === value ? "bg-primary/10 text-primary-light font-medium" : "text-textSecondary"}
                  `}
                >
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    <span>{opt.label}</span>
                  </span>
                  {opt.subLabel && (
                    <span className="text-[11px] text-textMuted mt-0.5 ml-2 font-normal line-clamp-1">
                      {opt.subLabel}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="p-4 text-xs text-textMuted text-center">No options found</div>
            )}
          </div>
        </div>
      )}
      {error && <span className="text-xs text-danger mt-1.5">{error}</span>}
    </div>
  );
};
