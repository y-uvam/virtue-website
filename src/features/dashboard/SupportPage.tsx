import React, { useEffect, useState } from "react";
import { Send, MessageSquare, ChevronLeft, ArrowRight, Shield } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchUserTickets, createTicket, replyToTicket, closeTicket, setCurrentTicket } from "../../store/slices/supportSlice";
import { Card } from "../../components/common/Card";
import { Table, type TableColumn } from "../../components/common/Table";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Alert } from "../../components/common/Alert";
import { useToast } from "../../components/common/Toast";
import type { MockTicket } from "../../store/mockData";
import { STRINGS } from "../../constants/strings";

export const SupportPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { user } = useAppSelector((state) => state.auth);
  const { tickets, currentTicket, loading } = useAppSelector((state) => state.support);

  // Form states (new ticket)
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<"order_issue" | "payment" | "general">("order_issue");
  const [message, setMessage] = useState("");
  const [ticketError, setTicketError] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);

  // Chat reply state
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserTickets(user.id));
    }
  }, [dispatch, user?.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError("");

    if (!user) return;
    if (!subject.trim()) {
      setTicketError("Please enter a subject.");
      return;
    }
    if (!message.trim()) {
      setTicketError("Please describe your ticket query.");
      return;
    }

    setTicketLoading(true);
    const result = await dispatch(
      createTicket({
        userId: user.id,
        userName: user.name,
        subject,
        category,
        message,
      })
    );
    setTicketLoading(false);

    if (createTicket.fulfilled.match(result)) {
      toast.success("🎉 Ticket created successfully! Our agents will respond shortly.");
      setSubject("");
      setMessage("");
      dispatch(fetchUserTickets(user.id));
    } else {
      setTicketError("Failed to create support ticket.");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !currentTicket || !user) return;

    setReplyLoading(true);
    const result = await dispatch(
      replyToTicket({
        ticketId: currentTicket.id,
        senderType: "user",
        senderName: user.name,
        message: reply,
      })
    );
    setReplyLoading(false);

    if (replyToTicket.fulfilled.match(result)) {
      setReply("");
      toast.success("Reply submitted successfully!");
      if (user?.id) dispatch(fetchUserTickets(user.id));
    } else {
      toast.error("Failed to submit reply.");
    }
  };

  const handleCloseTicket = async () => {
    if (!currentTicket) return;
    if (window.confirm("Are you sure you want to close this ticket thread?")) {
      const result = await dispatch(closeTicket(currentTicket.id));
      if (closeTicket.fulfilled.match(result)) {
        toast.success("Ticket closed successfully.");
        if (user?.id) dispatch(fetchUserTickets(user.id));
      } else {
        toast.error("Failed to close ticket.");
      }
    }
  };

  const handleOpenTicket = (t: MockTicket) => {
    dispatch(setCurrentTicket(t));
  };

  const ticketColumns: TableColumn<MockTicket>[] = [
    {
      key: "id",
      title: "Ticket ID",
      render: (row) => <span className="font-mono text-white">#{row.id}</span>,
    },
    {
      key: "subject",
      title: "Subject",
      render: (row) => (
        <div>
          <span className="font-bold text-white block">{row.subject}</span>
          <span className="text-[10px] text-textMuted uppercase font-semibold">Category: {row.category.replace(/_/g, " ")}</span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: "last_updated",
      title: "Last Update",
      render: (row) => (
        <span className="text-textMuted text-xs">
          {new Date(row.last_updated).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Action",
      className: "text-right",
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => handleOpenTicket(row)}>
          Open Thread
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.DASHBOARD.NAV_SUPPORT}</h1>
        <p className="text-xs text-textSecondary">
          Contact our customer support desk regarding orders, balance recharges, or custom queries.
        </p>
      </div>

      {currentTicket ? (
        // Ticket Thread View
        <div className="space-y-4 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <button
              onClick={() => dispatch(setCurrentTicket(null))}
              className="flex items-center gap-1 text-xs font-semibold text-textSecondary hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} /> Back to Ticket List
            </button>
            {currentTicket.status !== "closed" && (
              <Button
                variant="outline"
                size="sm"
                className="!border-red-500/30 !text-red-400 hover:!bg-red-500 hover:!text-white"
                onClick={handleCloseTicket}
              >
                Close Ticket
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Conversation Thread */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-4 bg-bgDark/25 border border-border">
                <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Ticket #{currentTicket.id} : {currentTicket.subject}
                  </h3>
                  <Badge status={currentTicket.status} />
                </div>

                {/* Messages Stack */}
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 mb-4">
                  {currentTicket.messages.map((msg) => {
                    const isAdmin = msg.sender_type === "admin";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] rounded-lg p-3 text-xs leading-normal
                          ${
                            isAdmin
                              ? "bg-primary/15 border border-primary/20 text-white self-start ml-2"
                              : "bg-bgDark border border-border text-textSecondary self-end mr-2"
                          }
                        `}
                      >
                        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] mb-1">
                          {isAdmin ? (
                            <>
                              <Shield size={10} className="text-amber-500" />
                              <span className="text-amber-500">{msg.sender_name} (Support)</span>
                            </>
                          ) : (
                            <span className="text-primary-light">{msg.sender_name}</span>
                          )}
                          <span className="text-textMuted font-normal lowercase">• {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed opacity-95">{msg.message}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Input box */}
                {currentTicket.status === "closed" ? (
                  <Alert variant="info" className="text-xs mt-2">
                    This support ticket has been closed. If you require further assistance, please open a new ticket thread.
                  </Alert>
                ) : (
                  <form onSubmit={handleSendReply} className="flex gap-2 border-t border-border/40 pt-4">
                    <input
                      type="text"
                      placeholder={STRINGS.DASHBOARD.TICKET_REPLY_PLACEHOLDER}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      className="flex-1 bg-bgDark border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-textMuted outline-none focus:border-primary"
                      disabled={replyLoading}
                    />
                    <Button type="submit" loading={replyLoading} icon={<Send size={12} />}>
                      Reply
                    </Button>
                  </form>
                )}
              </Card>
            </div>

            {/* Sidebar Ticket details */}
            <Card className="p-5 lg:col-span-1 space-y-4 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider border-b border-border pb-2">Ticket Details</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-textMuted block font-bold uppercase text-[9px] tracking-wider">Category</span>
                  <span className="text-white font-semibold capitalize">{currentTicket.category.replace(/_/g, " ")}</span>
                </div>
                <div>
                  <span className="text-textMuted block font-bold uppercase text-[9px] tracking-wider">Date Opened</span>
                  <span className="text-white font-semibold">{new Date(currentTicket.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-textMuted block font-bold uppercase text-[9px] tracking-wider">Last Activity</span>
                  <span className="text-white font-semibold">{new Date(currentTicket.last_updated).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        // Ticket List & Creation View
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="p-6 md:col-span-1 space-y-4 h-fit">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border pb-2.5">
              {STRINGS.DASHBOARD.CREATE_TICKET_TITLE}
            </h3>

            {ticketError && <Alert variant="error">{ticketError}</Alert>}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <Input
                label={STRINGS.DASHBOARD.TICKET_SUBJECT_LABEL}
                id="subject"
                placeholder={STRINGS.DASHBOARD.TICKET_SUBJECT_PLACEHOLDER}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={ticketLoading}
              />

              <Select
                label={STRINGS.DASHBOARD.TICKET_CAT_LABEL}
                options={[
                  { value: "order_issue", label: "Order Related Issue" },
                  { value: "payment", label: "Wallet & Recharge Issues" },
                  { value: "general", label: "General Feedback / Queries" },
                ]}
                value={category}
                onChange={(v) => setCategory(v as any)}
              />

              <div className="flex flex-col text-left">
                <label className="text-xs font-semibold text-textSecondary mb-1.5 uppercase tracking-wider">
                  {STRINGS.DASHBOARD.TICKET_MESSAGE_LABEL}
                </label>
                <textarea
                  placeholder={STRINGS.DASHBOARD.TICKET_MESSAGE_PLACEHOLDER}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={ticketLoading}
                  className="w-full bg-bgDark border border-border rounded-lg p-2.5 text-xs text-white placeholder-textMuted h-28 outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={ticketLoading}
                icon={<ArrowRight size={14} />}
              >
                {STRINGS.DASHBOARD.SUBMIT_TICKET_BTN}
              </Button>
            </form>
          </Card>

          {/* Ticket list Table */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
              {STRINGS.DASHBOARD.TICKET_LIST_TITLE}
            </h3>
            <Card className="p-4 overflow-hidden">
              <Table
                columns={ticketColumns}
                data={tickets}
                loading={loading}
                emptyState={
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="p-4 rounded-full bg-bgDark border border-border text-textMuted">
                      <MessageSquare size={28} />
                    </div>
                    <p className="text-xs text-textMuted max-w-xs">
                      You have no active support tickets. Use the form on the left to submit a query.
                    </p>
                  </div>
                }
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
export default SupportPage;
