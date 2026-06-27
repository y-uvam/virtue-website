import React, { useEffect, useState } from "react";
import { Search, CreditCard, Settings, CheckCircle, XCircle, Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchAdminData } from "../../store/slices/adminSlice";
import { Card } from "../../components/common/Card";
import { Table, type TableColumn } from "../../components/common/Table";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Pagination } from "../../components/common/Pagination";
import { Alert } from "../../components/common/Alert";
import { Input } from "../../components/common/Input";
import { useToast } from "../../components/common/Toast";
import type { MockTransaction } from "../../store/mockData";
import { STRINGS } from "../../constants/strings";

export const ManagePayments: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { transactions, users, loading } = useAppSelector((state) => state.admin);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState("rzp_live_XXXXXXXXXXXX");
  const [razorpaySecret, setRazorpaySecret] = useState("••••••••••••••••");
  const [cryptoAddress, setCryptoAddress] = useState("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchAdminData());
  }, [dispatch]);

  const filteredTx = transactions.filter((tx) => {
    const user = users.find((u) => u.id === tx.user_id);
    const userName = user ? user.username.toLowerCase() : "";

    const matchesSearch =
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      userName.includes(search.toLowerCase());

    const matchesType = filterType === "all" ? true : tx.type === filterType;

    return matchesSearch && matchesType;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTx.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTx = filteredTx.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveGatewayConfig = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Payment gateway configuration saved successfully!");
    setShowGatewayConfig(false);
  };

  const txColumns: TableColumn<MockTransaction>[] = [
    { key: "id", title: "Tx ID", render: (row) => <span className="font-mono text-white text-xs">#{row.id}</span> },
    {
      key: "user",
      title: "User Account",
      render: (row) => {
        const u = users.find((user) => user.id === row.user_id);
        return <span className="font-semibold text-white">@{u ? u.username : "unknown"}</span>;
      },
    },
    {
      key: "type",
      title: "Flow",
      render: (row) => (
        <span className={`text-xs font-bold capitalize ${row.type === "credit" ? "text-emerald-400" : "text-red-400"}`}>
          {row.type}
        </span>
      ),
    },
    {
      key: "amount",
      title: "Amount",
      render: (row) => (
        <span className={`font-bold ${row.type === "credit" ? "text-emerald-400" : "text-red-400"}`}>
          {row.type === "credit" ? "+" : "-"}₹{row.amount.toFixed(2)}
        </span>
      ),
    },
    { key: "description", title: "Details", className: "max-w-[200px] whitespace-normal" },
    {
      key: "status",
      title: "Status",
      render: (row) => <Badge status={row.status === "success" ? "completed" : row.status} />,
    },
    {
      key: "created_at",
      title: "Date",
      render: (row) => (
        <span className="text-textMuted text-xs">{new Date(row.created_at).toLocaleString()}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.ADMIN.NAV_MANAGE_PAYMENTS}</h1>
          <p className="text-xs text-textSecondary">
            Monitor all wallet transactions, deposits, and configure payment gateway credentials.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowGatewayConfig(!showGatewayConfig)}
          icon={<Settings size={13} />}
        >
          Gateway Config
        </Button>
      </div>

      {/* Gateway Config Panel */}
      {showGatewayConfig && (
        <Card className="p-6 space-y-4 animate-fade-in border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Settings size={16} className="text-amber-400" />
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Payment Gateway Keys</h3>
          </div>
          <Alert variant="warning">
            These keys are sensitive credentials. Keep them secure and never share with unauthorized parties.
          </Alert>
          <form onSubmit={handleSaveGatewayConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Razorpay Live Key ID"
                id="razorpayKey"
                value={razorpayKey}
                onChange={(e) => setRazorpayKey(e.target.value)}
              />
              <Input
                label="Razorpay Secret Key"
                id="razorpaySecret"
                type="password"
                value={razorpaySecret}
                onChange={(e) => setRazorpaySecret(e.target.value)}
              />
            </div>
            <Input
              label="Bitcoin / USDT Wallet Address"
              id="cryptoAddress"
              value={cryptoAddress}
              onChange={(e) => setCryptoAddress(e.target.value)}
            />
            <div className="flex gap-2 pt-2">
              <Button type="submit" size="sm">
                Save Gateway Config
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowGatewayConfig(false)}>
                Close Panel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-1 border border-border p-1 bg-bgCard/40 rounded-xl">
          {["all", "credit", "debit"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type);
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors capitalize
                ${filterType === type ? "bg-primary text-white" : "text-textSecondary hover:text-white"}
              `}
            >
              {type === "all" ? "All Transactions" : type === "credit" ? "Credits" : "Debits"}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-80 relative flex items-center">
          <Search size={14} className="absolute left-3 text-textMuted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by user, description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bgCard border border-border text-xs text-textPrimary placeholder-textMuted outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <Card className="p-4 overflow-hidden">
        <Table columns={txColumns} data={paginatedTx} loading={loading} />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>
    </div>
  );
};
export default ManagePayments;
