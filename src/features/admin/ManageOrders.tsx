import React, { useEffect, useState } from "react";
import { Search, Edit, Eye, Shield, CheckCircle, XCircle, ArrowUpRight, CheckSquare, Square } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchAdminData, adminUpdateOrderStatus, adminBulkUpdateOrders } from "../../store/slices/adminSlice";
import { fetchCategoriesAndServices } from "../../store/slices/servicesSlice";
import { Card } from "../../components/common/Card";
import { Table, type TableColumn } from "../../components/common/Table";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Pagination } from "../../components/common/Pagination";
import { Modal } from "../../components/common/Modal";
import { Alert } from "../../components/common/Alert";
import { useToast } from "../../components/common/Toast";
import { STRINGS } from "../../constants/strings";
import type { MockOrder } from "../../store/mockData";
import { Select } from "../../components/common/Select";

export const ManageOrders: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { orders, users, loading } = useAppSelector((state) => state.admin);
  const { services } = useAppSelector((state) => state.services);

  // Search/Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Single Order details/edit states
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);
  const [editStatus, setEditStatus] = useState<MockOrder["status"]>("pending");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminData());
    dispatch(fetchCategoriesAndServices());
  }, [dispatch]);

  // Filtering
  const filteredOrders = orders.filter((o) => {
    const srv = services.find((s) => s.id === o.service_id);
    const serviceName = srv ? srv.name.toLowerCase() : "";
    const user = users.find((u) => u.id === o.user_id);
    const userName = user ? user.username.toLowerCase() : "";

    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.link.toLowerCase().includes(search.toLowerCase()) ||
      serviceName.includes(search.toLowerCase()) ||
      userName.includes(search.toLowerCase());

    const matchesStatus = filterStatus === "all" ? true : o.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenDetailModal = (o: MockOrder) => {
    setSelectedOrder(o);
    setEditStatus(o.status);
    setDetailModalOpen(true);
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setEditLoading(true);
    const result = await dispatch(
      adminUpdateOrderStatus({ orderId: selectedOrder.id, status: editStatus })
    );
    setEditLoading(false);

    if (adminUpdateOrderStatus.fulfilled.match(result)) {
      toast.success(`Order #${selectedOrder.id} status updated to ${editStatus}.`);
      setDetailModalOpen(false);
      dispatch(fetchAdminData());
    } else {
      toast.error("Failed to update order status.");
    }
  };

  // Checkbox interactions
  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const pageIds = paginatedOrders.map((o) => o.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...Array.from(new Set([...prev, ...pageIds]))]);
    }
  };

  const handleBulkAction = async (status: MockOrder["status"]) => {
    if (selectedIds.length === 0) return;

    if (window.confirm(`Update status of ${selectedIds.length} selected orders to ${status}?`)) {
      setEditLoading(true);
      const result = await dispatch(adminBulkUpdateOrders({ orderIds: selectedIds, status }));
      setEditLoading(false);

      if (adminBulkUpdateOrders.fulfilled.match(result)) {
        toast.success(`Successfully updated ${selectedIds.length} orders.`);
        setSelectedIds([]);
        dispatch(fetchAdminData());
      } else {
        toast.error("Failed to process bulk status update.");
      }
    }
  };

  const orderColumns: TableColumn<MockOrder>[] = [
    {
      key: "select",
      title: "",
      render: (row) => {
        const isSelected = selectedIds.includes(row.id);
        return (
          <button
            type="button"
            onClick={() => handleSelectRow(row.id)}
            className="text-textMuted hover:text-white cursor-pointer"
          >
            {isSelected ? (
              <CheckSquare size={16} className="text-primary-light" />
            ) : (
              <Square size={16} />
            )}
          </button>
        );
      },
      className: "w-10",
    },
    {
      key: "id",
      title: "Order ID",
      render: (row) => <span className="font-mono text-white text-xs">#{row.id}</span>,
    },
    {
      key: "user",
      title: "User Account",
      render: (row) => {
        const u = users.find((user) => user.id === row.user_id);
        return <span className="font-semibold text-white">@{u ? u.username : "guest"}</span>;
      },
    },
    {
      key: "service",
      title: "Service Offered",
      render: (row) => {
        const s = services.find((srv) => srv.id === row.service_id);
        return <span className="truncate max-w-[180px] block">{s ? s.name : "Social Service"}</span>;
      },
    },
    {
      key: "link",
      title: "Link Target",
      render: (row) => (
        <a
          href={row.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-light hover:text-white transition-colors underline truncate max-w-[140px] block"
        >
          {row.link}
        </a>
      ),
    },
    { key: "quantity", title: "Qty" },
    {
      key: "price",
      title: "Cost",
      render: (row) => <span className="font-bold text-white">₹{row.price.toFixed(2)}</span>,
    },
    {
      key: "status",
      title: "Status",
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: "actions",
      title: "Edit",
      className: "text-right",
      render: (row) => (
        <Button variant="secondary" size="sm" onClick={() => handleOpenDetailModal(row)}>
          <Edit size={14} />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.ADMIN.NAV_MANAGE_ORDERS}</h1>
        <p className="text-xs text-textSecondary">
          Monitor all user growth campaigns, perform batch status updates, and manually adjust start counts.
        </p>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Status filters */}
        <div className="flex flex-wrap gap-1 border border-border p-1 bg-bgCard/40 rounded-xl w-full md:w-auto overflow-x-auto">
          {["all", "pending", "in_progress", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors capitalize
                ${
                  filterStatus === status
                    ? "bg-primary text-white"
                    : "text-textSecondary hover:text-white"
                }
              `}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-80 relative flex items-center">
          <Search size={14} className="absolute left-3 text-textMuted pointer-events-none" />
          <input
            type="text"
            placeholder="Search ID, link, or username..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bgCard border border-border text-xs text-textPrimary placeholder-textMuted outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Bulk actions and select all header */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <span className="text-xs text-textSecondary font-semibold">
            {selectedIds.length} orders selected. Choose bulk operation:
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleBulkAction("completed")} icon={<CheckCircle size={12} className="text-success" />}>
              Mark Completed
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction("in_progress")} icon={<ArrowUpRight size={12} className="text-info" />}>
              In Progress
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleBulkAction("cancelled")} icon={<XCircle size={12} />}>
              Cancel &amp; Refund
            </Button>
          </div>
        </div>
      )}

      {/* Orders table */}
      <Card className="p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={handleSelectAll}
            className="text-xs text-primary-light hover:text-white transition-colors font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            {paginatedOrders.map((o) => o.id).every((id) => selectedIds.includes(id)) ? (
              <>
                <CheckSquare size={14} /> Deselect Page
              </>
            ) : (
              <>
                <Square size={14} /> Select All on Page
              </>
            )}
          </button>
        </div>

        <Table
          columns={orderColumns}
          data={paginatedOrders}
          loading={loading}
          emptyState={
            <div className="py-8 text-center text-xs text-textMuted">
              No orders matched your search criteria.
            </div>
          }
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Edit Order Status Modal */}
      {selectedOrder && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Modify Order Status #${selectedOrder.id}`}
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setDetailModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdateStatusSubmit} loading={editLoading}>
                Update Order
              </Button>
            </>
          }
        >
          <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-lg bg-bgDark border border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-textMuted">Target Link:</span>
                <span className="font-semibold text-white truncate max-w-xs">{selectedOrder.link}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted">Order Quantity:</span>
                <span className="font-semibold text-white">{selectedOrder.quantity}</span>
              </div>
            </div>

            <Select
              label="Modify Status"
              options={[
                { value: "pending", label: "Pending" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled (Refunds Wallet)" },
                { value: "partial", label: "Partial Order" },
              ]}
              value={editStatus}
              onChange={(val) => setEditStatus(val as any)}
            />
          </form>
        </Modal>
      )}
    </div>
  );
};
export default ManageOrders;
