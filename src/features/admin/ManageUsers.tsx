import React, { useEffect, useState } from "react";
import { Search, Edit, UserX, UserCheck, Trash, Shield, ArrowRight, Wallet, UserMinus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchAdminData, adminAdjustBalance, adminToggleBanUser } from "../../store/slices/adminSlice";
import { Card } from "../../components/common/Card";
import { Table, type TableColumn } from "../../components/common/Table";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Pagination } from "../../components/common/Pagination";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Alert } from "../../components/common/Alert";
import { useToast } from "../../components/common/Toast";
import { type MockUser, setActiveUser } from "../../store/mockData";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import { loginUser } from "../../store/slices/authSlice";

export const ManageUsers: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { users, loading } = useAppSelector((state) => state.admin);

  // Search/Filters
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Edit Balance modal states
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number | "">("");
  const [adjustType, setAdjustType] = useState<"add" | "deduct">("add");
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState("");

  useEffect(() => {
    dispatch(fetchAdminData());
  }, [dispatch]);

  // Filters
  const filteredUsers = users.filter((u) => {
    if (u.role === "admin") return false; // hide admins
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenBalanceModal = (u: MockUser) => {
    setSelectedUser(u);
    setAdjustAmount("");
    setAdjustType("add");
    setBalanceError("");
    setBalanceModalOpen(true);
  };

  const handleAdjustBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBalanceError("");

    if (!selectedUser || !adjustAmount || Number(adjustAmount) <= 0) {
      setBalanceError("Please enter a valid positive adjustment amount.");
      return;
    }

    setBalanceLoading(true);
    const result = await dispatch(
      adminAdjustBalance({
        userId: selectedUser.id,
        amount: Number(adjustAmount),
        type: adjustType,
      })
    );
    setBalanceLoading(false);

    if (adminAdjustBalance.fulfilled.match(result)) {
      toast.success(
        `Wallet balance adjusted successfully for @${selectedUser.username}`
      );
      setBalanceModalOpen(false);
      dispatch(fetchAdminData());
    } else {
      setBalanceError(result.payload as string || "Failed to adjust balance.");
    }
  };

  const handleToggleBan = async (u: MockUser) => {
    const actionText = u.status === "active" ? "ban" : "unban";
    if (window.confirm(`Are you sure you want to ${actionText} @${u.username}?`)) {
      const result = await dispatch(adminToggleBanUser(u.id));
      if (adminToggleBanUser.fulfilled.match(result)) {
        toast.success(`User @${u.username} has been ${actionText === "ban" ? "banned" : "unbanned"}.`);
        dispatch(fetchAdminData());
      } else {
        toast.error("Failed to update account ban status.");
      }
    }
  };

  const handleImpersonate = (u: MockUser) => {
    if (window.confirm(`Impersonate account @${u.username}? This will log you in as them. You can return back by logging out and signing into your admin credentials.`)) {
      // Simulate session replace
      setActiveUser(u);
      // Reload page to re-trigger route guards and redirect to user dashboard
      window.location.href = ROUTES.DASHBOARD;
    }
  };

  const userColumns: TableColumn<MockUser>[] = [
    { key: "id", title: "User ID", render: (row) => <span className="font-mono text-white text-xs">#{row.id}</span> },
    {
      key: "user",
      title: "User Profile",
      render: (row) => (
        <div>
          <span className="font-bold text-white block">{row.name}</span>
          <span className="text-[10px] text-textMuted font-mono">@{row.username}</span>
        </div>
      ),
    },
    { key: "email", title: "Email Address" },
    {
      key: "balance",
      title: "Wallet Balance",
      render: (row) => <span className="font-bold text-white">₹{row.balance.toFixed(2)}</span>,
    },
    {
      key: "status",
      title: "Account Status",
      render: (row) => <Badge status={row.status === "active" ? "completed" : "cancelled"} />,
    },
    {
      key: "created_at",
      title: "Joined On",
      render: (row) => <span className="text-textMuted text-xs">{new Date(row.created_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      title: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            className="p-1 h-8 w-8 !border-primary/20 hover:!border-primary/40 text-primary-light"
            onClick={() => handleOpenBalanceModal(row)}
            title="Adjust Wallet balance"
          >
            <Wallet size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleImpersonate(row)}
            title="Impersonate User"
          >
            Impersonate
          </Button>
          <Button
            variant={row.status === "active" ? "danger" : "outline"}
            size="sm"
            className="p-1 h-8 w-8"
            onClick={() => handleToggleBan(row)}
            title={row.status === "active" ? "Ban Account" : "Lift Ban"}
          >
            {row.status === "active" ? <UserX size={14} /> : <UserCheck size={14} className="text-success" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.ADMIN.NAV_MANAGE_USERS}</h1>
        <p className="text-xs text-textSecondary">
          Search registered users, modify balance sheets, suspend accounts, and impersonate sessions.
        </p>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-80 relative flex items-center">
          <Search size={14} className="absolute left-3 text-textMuted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bgCard border border-border text-xs text-textPrimary placeholder-textMuted outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Users table */}
      <Card className="p-4 overflow-hidden">
        <Table
          columns={userColumns}
          data={paginatedUsers}
          loading={loading}
          emptyState={
            <div className="py-8 text-center text-xs text-textMuted">
              No registered users found matching the search criteria.
            </div>
          }
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Adjust Balance Modal */}
      {selectedUser && (
        <Modal
          isOpen={balanceModalOpen}
          onClose={() => setBalanceModalOpen(false)}
          title={STRINGS.ADMIN.EDIT_BALANCE_TITLE}
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setBalanceModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAdjustBalanceSubmit} loading={balanceLoading}>
                Adjust Wallet
              </Button>
            </>
          }
        >
          <form onSubmit={handleAdjustBalanceSubmit} className="space-y-4 text-xs sm:text-sm">
            {balanceError && <Alert variant="error">{balanceError}</Alert>}

            <div className="p-3 bg-bgDark rounded-lg border border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-textMuted block font-bold uppercase tracking-wider">User profile</span>
                <span className="font-bold text-white">@{selectedUser.username}</span>
              </div>
              <div>
                <span className="text-[10px] text-textMuted block font-bold uppercase tracking-wider text-right">Current Balance</span>
                <span className="font-bold text-white">₹{selectedUser.balance.toFixed(2)}</span>
              </div>
            </div>

            {/* Adjustment direction type */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">Adjustment Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustType("add")}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5
                    ${
                      adjustType === "add"
                        ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-400"
                        : "border-border bg-bgDark text-textSecondary"
                    }
                  `}
                >
                  <Plus size={14} />
                  <span>Credit (Add Funds)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType("deduct")}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5
                    ${
                      adjustType === "deduct"
                        ? "border-red-500/35 bg-red-500/10 text-red-400"
                        : "border-border bg-bgDark text-textSecondary"
                    }
                  `}
                >
                  <UserMinus size={14} />
                  <span>Debit (Deduct Funds)</span>
                </button>
              </div>
            </div>

            <Input
              label="Transaction Amount (INR)"
              id="adjustAmount"
              type="number"
              placeholder="e.g. 500"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={balanceLoading}
            />
          </form>
        </Modal>
      )}
    </div>
  );
};
export default ManageUsers;
