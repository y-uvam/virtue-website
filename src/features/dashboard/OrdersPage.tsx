import React, { useEffect, useState } from "react";
import { Search, ShoppingBag, Eye, RefreshCw, XCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchUserOrders, cancelPendingOrder, requestRefill } from "../../store/slices/ordersSlice";
import { fetchCategoriesAndServices } from "../../store/slices/servicesSlice";
import { Card } from "../../components/common/Card";
import { Table, type TableColumn } from "../../components/common/Table";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Pagination } from "../../components/common/Pagination";
import { Modal } from "../../components/common/Modal";
import { useToast } from "../../components/common/Toast";
import { STRINGS } from "../../constants/strings";
import type { MockOrder } from "../../store/mockData";

export const OrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { user } = useAppSelector((state) => state.auth);
  const { orders, loading } = useAppSelector((state) => state.orders);
  const { services } = useAppSelector((state) => state.services);

  // Filter/Search states
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    dispatch(fetchCategoriesAndServices());
    if (user?.id) {
      dispatch(fetchUserOrders(user.id));
    }
  }, [dispatch, user?.id]);

  const tabs = [
    { key: "all", label: "All Orders" },
    { key: "pending", label: "Pending" },
    { key: "in_progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "partial", label: "Partial" },
  ];

  // Filtering Logic
  const filteredOrders = orders.filter((o) => {
    const service = services.find((s) => s.id === o.service_id);
    const serviceName = service ? service.name.toLowerCase() : "";
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.link.toLowerCase().includes(search.toLowerCase()) ||
      serviceName.includes(search.toLowerCase());

    const matchesTab = activeTab === "all" ? true : o.status === activeTab;

    return matchesSearch && matchesTab;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm("Are you sure you want to cancel this pending order? You will receive a full refund in your wallet.")) {
      const result = await dispatch(cancelPendingOrder(orderId));
      if (cancelPendingOrder.fulfilled.match(result)) {
        toast.success("Order cancelled and refunded successfully!");
      } else {
        toast.error(result.payload as string || "Failed to cancel order.");
      }
    }
  };

  const handleRefillOrder = async (orderId: string) => {
    const result = await dispatch(requestRefill(orderId));
    if (requestRefill.fulfilled.match(result)) {
      toast.success("Refill request triggered successfully! Processing started.");
    } else {
      toast.error(result.payload as string || "Failed to trigger refill.");
    }
  };

  const handleOpenDetail = (order: MockOrder) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const orderColumns: TableColumn<MockOrder>[] = [
    {
      key: "id",
      title: "Order ID",
      render: (row) => <span className="font-mono font-semibold text-white">#{row.id}</span>,
    },
    {
      key: "service",
      title: "Service Offered",
      render: (row) => {
        const s = services.find((srv) => srv.id === row.service_id);
        return (
          <div className="max-w-[220px] truncate">
            <span className="block font-medium text-white truncate">{s ? s.name : "Social Service"}</span>
            <span className="text-[10px] text-textMuted font-mono">ID: {row.service_id}</span>
          </div>
        );
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
      title: "Price",
      render: (row) => <span className="font-bold text-white">₹{row.price.toFixed(2)}</span>,
    },
    {
      key: "status",
      title: "Status",
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: "created_at",
      title: "Date",
      render: (row) => (
        <span className="text-textMuted text-xs">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      className: "text-right",
      render: (row) => {
        const service = services.find((s) => s.id === row.service_id);
        const canCancel = row.status === "pending";
        const canRefill = row.status === "completed" && service?.refill_available;

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              className="p-1.5 h-8 w-8"
              onClick={() => handleOpenDetail(row)}
              title="View Campaign Details"
            >
              <Eye size={14} />
            </Button>
            {canCancel && (
              <Button
                variant="danger"
                size="sm"
                className="p-1.5 h-8 w-8 !bg-red-500/10 !text-red-400 border !border-red-500/25 hover:!bg-red-500 hover:!text-white"
                onClick={() => handleCancelOrder(row.id)}
                title="Cancel & Refund"
              >
                <XCircle size={14} />
              </Button>
            )}
            {canRefill && (
              <Button
                variant="outline"
                size="sm"
                className="p-1.5 h-8 w-8 !border-emerald-500/30 !text-emerald-400 hover:!bg-emerald-500 hover:!text-white"
                onClick={() => handleRefillOrder(row.id)}
                title="Trigger Guarantee Refill"
              >
                <RefreshCw size={14} className="animate-spin-slow" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.DASHBOARD.NAV_ORDERS}</h1>
        <p className="text-xs text-textSecondary">
          Monitor your social campaigns, start counts, and refill logs.
        </p>
      </div>

      {/* Tabs list & search input */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 border border-border p-1 bg-bgCard/40 rounded-xl w-full md:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors
                ${
                  activeTab === tab.key
                    ? "bg-primary text-white"
                    : "text-textSecondary hover:text-white"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Orders Table */}
      <Card className="p-4 overflow-hidden">
        <Table
          columns={orderColumns}
          data={paginatedOrders}
          loading={loading}
          emptyState={
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="p-4 rounded-full bg-bgDark border border-border text-textMuted">
                <ShoppingBag size={28} />
              </div>
              <p className="text-xs text-textMuted max-w-xs">
                No orders match your filter. Place new campaigns via the New Order tab.
              </p>
            </div>
          }
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Card>

      {/* Details modal dialog */}
      {selectedOrder && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Campaign Details #${selectedOrder.id}`}
          footer={
            <Button variant="secondary" size="sm" onClick={() => setDetailModalOpen(false)}>
              Dismiss Details
            </Button>
          }
        >
          {(() => {
            const srv = services.find((s) => s.id === selectedOrder.service_id);
            return (
              <div className="space-y-6 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-bgDark rounded-lg border border-border">
                    <span className="text-[10px] text-textMuted block uppercase font-bold tracking-wider">Start Counter</span>
                    <span className="text-base font-extrabold text-white">{selectedOrder.start_count}</span>
                  </div>
                  <div className="p-3 bg-bgDark rounded-lg border border-border">
                    <span className="text-[10px] text-textMuted block uppercase font-bold tracking-wider">Remaining Count</span>
                    <span className="text-base font-extrabold text-white">{selectedOrder.remains}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-bgDark border border-border space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-textMuted">Service Category:</span>
                    <span className="font-semibold text-white">{srv ? srv.name : "Social Offering"}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-textMuted">Target URL:</span>
                    <span className="font-semibold text-primary-light truncate max-w-xs break-all underline">
                      {selectedOrder.link}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textMuted">Target Quantity:</span>
                    <span className="font-semibold text-white">{selectedOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textMuted">Price Charged:</span>
                    <span className="font-bold text-white">₹{selectedOrder.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-textMuted">Delivery Status:</span>
                    <Badge status={selectedOrder.status} />
                  </div>
                </div>

                {/* Simulated Delivery Timeline */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Delivery Timeline Log</h4>
                  <div className="relative border-l border-border pl-4 space-y-4 ml-2">
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-success" />
                      <p className="text-xs font-bold text-white">Campaign Initiated</p>
                      <p className="text-[10px] text-textMuted">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                    {selectedOrder.status !== "pending" && (
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <p className="text-xs font-bold text-white">Processing API Handshake</p>
                        <p className="text-[10px] text-textMuted">Start Count synced: {selectedOrder.start_count}</p>
                      </div>
                    )}
                    {selectedOrder.status === "completed" && (
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-success" />
                        <p className="text-xs font-bold text-white">Fulfillment Successful</p>
                        <p className="text-[10px] text-textMuted">{new Date(selectedOrder.updated_at).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedOrder.status === "cancelled" && (
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-danger" />
                        <p className="text-xs font-bold text-danger">Cancelled &amp; Wallet Refunded</p>
                        <p className="text-[10px] text-textMuted">{new Date(selectedOrder.updated_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
export default OrdersPage;
