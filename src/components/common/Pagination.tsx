import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { STRINGS } from "../../constants/strings";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        end = 5;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-between py-4 ${className}`}>
      {/* Description */}
      <div className="text-xs text-textMuted hidden sm:block">
        Page <span className="font-semibold text-textSecondary">{currentPage}</span> of{" "}
        <span className="font-semibold text-textSecondary">{totalPages}</span>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-border bg-bgCard text-textSecondary hover:text-white hover:border-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-textSecondary disabled:cursor-not-allowed cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold border flex items-center justify-center cursor-pointer transition-colors duration-150
              ${
                num === currentPage
                  ? "bg-primary border-primary text-white"
                  : "border-border bg-bgCard text-textSecondary hover:text-white hover:border-textMuted"
              }
            `}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-border bg-bgCard text-textSecondary hover:text-white hover:border-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-textSecondary disabled:cursor-not-allowed cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
