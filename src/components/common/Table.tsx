import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface TableColumn<T> {
  key: string;
  title: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  rowKey?: (row: T, index: number) => string | number;
}

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyState,
  sortKey,
  sortOrder,
  onSort,
  rowKey,
}: TableProps<T>) {
  const getSortIcon = (col: TableColumn<T>) => {
    if (!col.sortable || !onSort) return null;
    if (sortKey !== col.key) {
      return <ArrowUpDown size={14} className="text-textMuted inline ml-1 opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="text-primary-light inline ml-1" />
    ) : (
      <ArrowDown size={14} className="text-primary-light inline ml-1" />
    );
  };

  const getRowKey = (row: T, index: number) => {
    if (rowKey) return rowKey(row, index);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = row as any;
    return r.id || r.key || index;
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-bgCard/30">
      <table className="w-full border-collapse text-left text-sm text-textSecondary">
        <thead>
          <tr className="border-b border-border bg-bgDark/40">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3.5 px-4 font-semibold text-textPrimary tracking-wide text-xs uppercase select-none ${
                  col.sortable && onSort ? "cursor-pointer hover:text-primary-light" : ""
                } ${col.className || ""}`}
                onClick={() => col.sortable && onSort && onSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.title}
                  {getSortIcon(col)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {loading ? (
            // Skeleton Loader Rows
            Array.from({ length: 5 }).map((_, rIdx) => (
              <tr key={rIdx} className="hover:bg-bgCardHover/10">
                {columns.map((col) => (
                  <td key={col.key} className="py-4 px-4">
                    <div className="h-4 bg-border/40 rounded animate-pulse w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length > 0 ? (
            data.map((row, rIdx) => (
              <tr
                key={getRowKey(row, rIdx)}
                className="hover:bg-bgCardHover/20 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-4 px-4 whitespace-nowrap text-xs sm:text-sm ${col.className || ""}`}>
                    {col.render ? col.render(row, rIdx) : String((row as any)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            // Empty State
            <tr>
              <td colSpan={columns.length} className="py-12 px-4 text-center">
                {emptyState || (
                  <div className="text-textMuted flex flex-col items-center justify-center gap-2">
                    <span className="text-sm">No data available</span>
                  </div>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
