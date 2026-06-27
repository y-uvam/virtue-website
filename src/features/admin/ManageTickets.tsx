import React, { useEffect, useState } from "react";
import { Search, MessageSquare, CheckCircle, XCircle, Clock, Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchAdminData } from "../../store/slices/adminSlice";
import { fetchTickets, replyToTicket, resolveTicket } from "../../store/slices/supportSlice";
import { Card } from "../../components/common/Card";
import { Table, type TableColumn } from "../../components/common/Table";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { Pagination } from "../../components/common/Pagination";
import { useToast } from "../../components/common/Toast";
import { type MockTicket, dbGet } from "../../store/mockData";
import { STRINGS } from "../../constants/strings";

export const ManageTickets: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { tickets, loading } = useAppSelector((state) => state.support);
  const { user } = useAppSelector((state) => state.auth);
  const { users } = useAppSelector((state) => state.admin);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed" | "pending">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<MockTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    dispatch(fetchAdminData());
    dispatch(fetchTickets());
  }, [dispatch]);

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" ? true : t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSendingReply(true);
    const result = await dispatch(replyToTicket({ ticketId: selectedTicket.id, senderType: "admin", senderName: user?.name || "Admin", message: replyText }));
    setSendingReply(false);
    if (replyToTicket.fulfilled.match(result)) {
      toast.success("Reply sent to user.");
      setReplyText("");
      dispatch(fetchTickets());
      // Refresh selected ticket
      const all = dbGet<MockTicket[]>("smm_tickets");
      const updated = all.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    } else {
      toast.error("Failed to send reply.");
    }
  };

  const handleResolve = async (ticketId: string) => {
    const result = await dispatch(resolveTicket(ticketId));
    if (resolveTicket.fulfilled.match(result)) {
      toast.success("Ticket marked as resolved.");
      setSelectedTicket(null);
      dispatch(fetchTickets());
    } else {
      toast.error("Failed to resolve ticket.");
    }
  };

  const ticketColumns: TableColumn<MockTicket>[] = [
    { key: "id", title: "Ticket ID", render: (row) => <span className="font-mono text-white text-xs">#{row.id.slice(0, 8)}</span> },
    {
      key: "user",
      title: "User",
      render: (row) => {
        const u = users.find((user) => user.id === row.user_id);
        return <span className="font-semibold text-white text-xs">@{u ? u.username : "unknown"}</span>;
      },
    },
    { key: "subject", title: "Subject", render: (row) => <span className="text-white text-xs">{row.subject}</span> },
    {
      key: "category",
      title: "Category",
      render: (row) => (
        <span className="text-xs text-textSecondary capitalize">
          {row.category.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (row) => <Badge status={row.status === "closed" ? "completed" : row.status === "open" ? "pending" : "processing"} />,
    },
    {
      key: "created_at",
      title: "Created",
      render: (row) => (
        <span className="text-textMuted text-xs">{new Date(row.created_at).toLocaleDateString()}</span>
      ),
    },
    {
      key: "actions",
      title: "",
      className: "text-right",
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSelectedTicket(row)}
          icon={<MessageSquare size={12} />}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.ADMIN.NAV_MANAGE_TICKETS}</h1>
        <p className="text-xs text-textSecondary">
          Manage all user support tickets, send replies, and resolve issues.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-1 border border-border p-1 bg-bgCard/40 rounded-xl">
          {(["all", "open", "pending", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilterStatus(s);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors capitalize
                ${filterStatus === s ? "bg-primary text-white" : "text-textSecondary hover:text-white"}
              `}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-80 relative flex items-center">
          <Search size={14} className="absolute left-3 text-textMuted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ticket ID or subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bgCard border border-border text-xs text-textPrimary placeholder-textMuted outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      <Card className="p-4 overflow-hidden">
        <Table columns={ticketColumns} data={paginated} loading={loading} />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>

      {/* Ticket Detail Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket ? `Ticket: ${selectedTicket.subject}` : "Support Ticket"}
        size="xl"
        footer={
          <div className="flex gap-2 w-full">
            {selectedTicket?.status !== "closed" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                icon={<CheckCircle size={13} />}
                onClick={() => selectedTicket && handleResolve(selectedTicket.id)}
              >
                Resolve Ticket
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="secondary" size="sm" onClick={() => setSelectedTicket(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Status", value: selectedTicket.status.toUpperCase() },
                { label: "Category", value: selectedTicket.category.replace("_", " ").toUpperCase() },
                { label: "Messages", value: selectedTicket.messages.length },
                { label: "Opened", value: new Date(selectedTicket.created_at).toLocaleDateString() },
              ].map((item) => (
                <div key={item.label} className="bg-bgCard/40 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-textMuted mb-1">{item.label}</div>
                  <div className="text-xs font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Conversation */}
            <div className="bg-bgCard/40 rounded-xl p-4 max-h-64 overflow-y-auto space-y-3">
              {selectedTicket.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.sender_type === "admin" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                      ${msg.sender_type === "admin" ? "bg-primary/20 text-primary" : "bg-bgCard text-textSecondary border border-border"}`}
                  >
                    {msg.sender_type === "admin" ? "A" : "U"}
                  </div>
                  <div
                    className={`rounded-xl px-3 py-2 text-xs max-w-[80%]
                      ${msg.sender_type === "admin" ? "bg-primary/15 text-white" : "bg-bgCard text-textSecondary border border-border"}`}
                  >
                    <p className="leading-relaxed">{msg.message}</p>
                    <p className="text-[10px] text-textMuted mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            {selectedTicket.status !== "closed" && (
              <div className="flex gap-3 items-end">
                <textarea
                  rows={2}
                  placeholder="Type your reply to the user..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-bgCard border border-border rounded-xl px-3 py-2 text-xs text-textPrimary placeholder-textMuted outline-none focus:border-primary transition-all resize-none"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendReply}
                  loading={sendingReply}
                  icon={<Send size={13} />}
                  className="shrink-0"
                >
                  Send Reply
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
export default ManageTickets;
