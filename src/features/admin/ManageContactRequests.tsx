import React, { useEffect, useState } from "react";
import { Search, AtSign, Image as ImageIcon, Trash2, Eye, Calendar, User, Mail, Download, ExternalLink } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Table, type TableColumn } from "../../components/common/Table";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { Pagination } from "../../components/common/Pagination";
import { useToast } from "../../components/common/Toast";
import { supabase } from "../../utils/supabase";

interface ContactRequest {
  id: string;
  user_id: string;
  description: string;
  instagram_username: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    name: string;
    username: string;
    email: string;
  } | null;
}

export const ManageContactRequests: React.FC = () => {
  const toast = useToast();

  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const itemsPerPage = 8;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_requests")
        .select(`
          *,
          profiles (
            name,
            username,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests((data as any) || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load contact requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this contact request?")) return;
    
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("contact_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Contact request deleted successfully.");
      setRequests((prev) => prev.filter((r) => r.id !== id));
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete request.");
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied "${text}" to clipboard!`);
  };

  // Filter requests by search query
  const filtered = requests.filter((r) => {
    const username = r.profiles?.username || "";
    const name = r.profiles?.name || "";
    const email = r.profiles?.email || "";
    const insta = r.instagram_username || "";
    const desc = r.description || "";
    const query = search.toLowerCase();

    return (
      username.toLowerCase().includes(query) ||
      name.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      insta.toLowerCase().includes(query) ||
      desc.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const columns: TableColumn<ContactRequest>[] = [
    {
      key: "user",
      title: "Submitter",
      render: (row) => (
        <div>
          <span className="font-semibold text-white block text-xs">
            {row.profiles?.name || "Unknown"}
          </span>
          <span className="text-[10px] text-textMuted block">
            @{row.profiles?.username || "unknown"}
          </span>
        </div>
      ),
    },
    {
      key: "instagram",
      title: "Instagram",
      render: (row) => (
        <a
          href={`https://instagram.com/${row.instagram_username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-primary-light hover:text-white transition-colors text-xs font-semibold"
        >
          <AtSign size={12} />
          @{row.instagram_username}
        </a>
      ),
    },
    {
      key: "description",
      title: "Issue Preview",
      render: (row) => (
        <span className="text-textSecondary truncate max-w-xs block text-xs">
          {row.description}
        </span>
      ),
    },
    {
      key: "image",
      title: "Attachment",
      render: (row) =>
        row.image_url ? (
          <Badge status="processing" className="!bg-blue-500/10 !text-blue-400 !border-blue-500/20 text-[9px] uppercase font-bold tracking-wider">
            Image Attached
          </Badge>
        ) : (
          <span className="text-textMuted text-[10px] font-semibold tracking-wider">NONE</span>
        ),
    },
    {
      key: "created_at",
      title: "Date",
      render: (row) => (
        <span className="text-textMuted text-xs">
          {new Date(row.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      title: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedRequest(row)}
            icon={<Eye size={12} />}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="!border-red-500/30 !text-red-400 hover:!bg-red-500 hover:!text-white"
            onClick={() => handleDeleteRequest(row.id)}
            loading={deletingId === row.id}
            icon={<Trash2 size={12} />}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">User Contact Requests</h1>
        <p className="text-xs text-textSecondary">
          Review all submitted contact forms, issues details, and image uploads from user accounts.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-bgCard/40 rounded-xl">
          <span className="text-xs font-semibold text-textSecondary">Total Requests:</span>
          <span className="text-xs font-bold text-white bg-primary/20 px-2 py-0.5 rounded-lg border border-primary/20">{filtered.length}</span>
        </div>

        <div className="w-full sm:w-80 relative flex items-center">
          <Search size={14} className="absolute left-3 text-textMuted pointer-events-none" />
          <input
            type="text"
            placeholder="Search username, description, IG handle..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bgCard border border-border text-xs text-textPrimary placeholder-textMuted outline-none focus:border-primary transition-all duration-200"
          />
        </div>
      </div>

      <Card className="p-4 overflow-hidden border border-border">
        <Table
          columns={columns}
          data={paginated}
          loading={loading}
          emptyState={
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="p-4 rounded-full bg-bgDark border border-border text-textMuted">
                <Search size={28} />
              </div>
              <p className="text-xs text-textMuted max-w-xs">
                No contact requests match your criteria or none have been submitted yet.
              </p>
            </div>
          }
        />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>

      {/* Contact Details Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Contact Request Details"
        size="lg"
        footer={
          <div className="flex gap-2 w-full justify-between items-center">
            {selectedRequest && (
              <Button
                variant="outline"
                size="sm"
                className="!border-red-500/30 !text-red-400 hover:!bg-red-500 hover:!text-white"
                onClick={() => selectedRequest && handleDeleteRequest(selectedRequest.id)}
                loading={deletingId === selectedRequest?.id}
                icon={<Trash2 size={13} />}
              >
                Delete Request
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setSelectedRequest(null)}>
              Close Details
            </Button>
          </div>
        }
      >
        {selectedRequest && (
          <div className="space-y-5 text-left text-xs sm:text-sm">
            {/* Split layout: Submitter and Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bgDark/40 border border-border/60 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] text-textMuted uppercase font-bold tracking-wider border-b border-border/40 pb-1.5 flex items-center gap-1.5">
                  <User size={12} className="text-primary-light" /> User Profile Info
                </h4>
                <div className="space-y-1.5">
                  <p className="text-white font-semibold text-xs sm:text-sm">
                    {selectedRequest.profiles?.name || "Unknown"}
                  </p>
                  <p className="text-textSecondary text-xs">
                    Username: <span className="text-white font-mono">@{selectedRequest.profiles?.username}</span>
                  </p>
                  <p className="text-textSecondary text-xs flex items-center gap-1 truncate">
                    <Mail size={11} className="text-textMuted" /> {selectedRequest.profiles?.email}
                  </p>
                </div>
              </div>

              <div className="bg-bgDark/40 border border-border/60 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] text-textMuted uppercase font-bold tracking-wider border-b border-border/40 pb-1.5 flex items-center gap-1.5">
                  <AtSign size={12} className="text-primary-light" /> Instagram Action Handle
                </h4>
                <div className="space-y-2">
                  <p className="text-white font-bold text-sm sm:text-base flex items-center gap-1.5">
                    @{selectedRequest.instagram_username}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="h-8 !py-1 text-[11px]"
                      onClick={() => copyToClipboard(selectedRequest.instagram_username)}
                    >
                      Copy Handle
                    </Button>
                    <a
                      href={`https://instagram.com/${selectedRequest.instagram_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 h-8 bg-bgDark border border-border hover:bg-bgCardHover rounded-lg text-[11px] text-white font-semibold transition-colors duration-150"
                    >
                      Visit Profile <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Submitted */}
            <div className="flex items-center gap-1.5 text-textMuted text-xs font-semibold px-1">
              <Calendar size={12} />
              <span>Submitted on: {new Date(selectedRequest.created_at).toLocaleString()}</span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-[10px] text-textMuted uppercase font-bold tracking-wider border-b border-border/40 pb-1.5">
                Issue Description
              </h4>
              <div className="bg-bgDark/40 border border-border/60 rounded-xl p-4 whitespace-pre-wrap leading-relaxed text-textSecondary text-xs">
                {selectedRequest.description}
              </div>
            </div>

            {/* Image */}
            {selectedRequest.image_url && (
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
                  <h4 className="text-[10px] text-textMuted uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={12} className="text-primary-light" /> Attached Screenshot
                  </h4>
                  <a
                    href={selectedRequest.image_url}
                    download={`issue_screenshot_${selectedRequest.id.slice(0,8)}.jpeg`}
                    className="flex items-center gap-1 text-[11px] text-primary-light hover:text-white transition-colors"
                  >
                    Download Image <Download size={11} />
                  </a>
                </div>
                <div className="border border-border/60 rounded-xl overflow-hidden bg-black/50 max-h-96 flex items-center justify-center p-2">
                  <img
                    src={selectedRequest.image_url}
                    alt="Issue Screenshot"
                    className="max-w-full max-h-80 object-contain rounded"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageContactRequests;
