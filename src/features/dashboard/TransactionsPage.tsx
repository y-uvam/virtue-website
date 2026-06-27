import React, { useEffect, useState } from "react";
import { Search, History, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchTransactions } from "../../store/slices/walletSlice";
import { Card } from "../../components/common/Card";
import { Table, type TableColumn } from "../../components/common/Table";
import { Pagination } from "../../components/common/Pagination";
import { STRINGS } from "../../constants/strings";
import type { MockTransaction } from "../../store/mockData";

export const TransactionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { transactions, loading } = useAppSelector((state) => state.wallet);

  // Filters
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTransactions(user.id));
    }
  }, [dispatch, user?.id]);

  // Filtering
  const filteredTx = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      (tx.reference_id && tx.reference_id.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === "all" ? true : tx.type === filterType;

    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTx.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTx = filteredTx.slice(startIndex, startIndex + itemsPerPage);

  const txColumns: TableColumn<MockTransaction>[] = [
    {
      key: "id",
      title: "Transaction ID",
      render: (row) => <span className="font-mono text-white">#{row.id}</span>,
    },
    {
      key: "type",
      title: "Flow",
      render: (row) =>
        row.type === "credit" ? (
          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
            <ArrowDownLeft size={12} /> Credit
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
            <ArrowUpRight size={12} /> Debit
          </span>
        ),
    },
    {
      key: "amount",
      title: "Amount",
      render: (row) => (
        <span className={row.type === "credit" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
          {row.type === "credit" ? "+" : "-"}₹{row.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "balance_after",
      title: "Closing Balance",
      render: (row) => <span className="text-textSecondary">₹{row.balance_after.toFixed(2)}</span>,
    },
    { key: "description", title: "Description", className: "whitespace-normal max-w-xs" },
    {
      key: "reference_id",
      title: "Reference ID / Link",
      render: (row) => <span className="font-mono text-textMuted text-[10px]">{row.reference_id}</span>,
    },
    {
      key: "created_at",
      title: "Date",
      render: (row) => (
        <span className="text-textMuted text-xs">
          {new Date(row.created_at).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.DASHBOARD.NAV_TRANSACTIONS}</h1>
        <p className="text-xs text-textSecondary">
          View full wallet statement logs, orders charged, and deposits made.
        </p>
      </div>

      {/* Tabs and search bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Type tabs */}
        <div className="flex gap-1 border border-border p-1 bg-bgCard/40 rounded-xl w-full md:w-auto">
          {[
            { key: "all", label: STRINGS.DASHBOARD.TRANSACTIONS_FILTER_ALL },
            { key: "credit", label: STRINGS.DASHBOARD.TRANSACTIONS_FILTER_CREDIT },
            { key: "debit", label: STRINGS.DASHBOARD.TRANSACTIONS_FILTER_DEBIT },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setFilterType(tab.key as any);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors
                ${
                  filterType === tab.key
                    ? "bg-primary text-white"
                    : "text-textSecondary hover:text-white"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-80 relative flex items-center">
          <Search size={14} className="absolute left-3 text-textMuted pointer-events-none" />
          <input
            type="text"
            placeholder="Search reference or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bgCard border border-border text-xs text-textPrimary placeholder-textMuted outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Table grid */}
      <Card className="p-4 overflow-hidden">
        <Table
          columns={txColumns}
          data={paginatedTx}
          loading={loading}
          emptyState={
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="p-4 rounded-full bg-bgDark border border-border text-textMuted">
                <History size={28} />
              </div>
              <p className="text-xs text-textMuted max-w-xs">
                No ledger transactions found matching your criteria.
              </p>
            </div>
          }
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
};
export default TransactionsPage;
