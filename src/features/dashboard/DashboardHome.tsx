import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  ShoppingBag,
  Clock,
  CheckCircle,
  Zap,
  
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchCategoriesAndServices } from "../../store/slices/servicesSlice";
import { fetchUserOrders, placeOrder } from "../../store/slices/ordersSlice";
import { fetchTransactions } from "../../store/slices/walletSlice";
import { Card } from "../../components/common/Card";
import { Select, type SelectOption } from "../../components/common/Select";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { PlatformIcon } from "../../components/common/PlatformIcon";
import { Alert } from "../../components/common/Alert";
import { useToast } from "../../components/common/Toast";
import { Table, type TableColumn } from "../../components/common/Table";
import type { MockOrder, MockTransaction } from "../../store/mockData";

export const DashboardHome: React.FC = () => {
    const dispatch = useAppDispatch();
  const toast = useToast();

  const { user } = useAppSelector((state) => state.auth);
  const { categories, services, loading: _servicesLoading } = useAppSelector((state) => state.services);
  const { orders, loading: ordersLoading } = useAppSelector((state) => state.orders);
  const { transactions, loading: txLoading } = useAppSelector((state) => state.wallet);

  // Form States
  const [selectedCatId, setSelectedCatId] = useState<string | number>("");
  const [selectedSrvId, setSelectedSrvId] = useState<string | number>("");
  const [targetLink, setTargetLink] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [orderLoading, setOrderLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchCategoriesAndServices());
    if (user?.id) {
      dispatch(fetchUserOrders(user.id));
      dispatch(fetchTransactions(user.id));
    }
  }, [dispatch, user?.id]);

  // Set default category when loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCatId) {
      setSelectedCatId(categories[0].id);
    }
  }, [categories, selectedCatId]);

  // Filter services by category
  const filteredServices = services.filter((s) => s.category_id === selectedCatId);

  // Set default service when category changes
  useEffect(() => {
    if (filteredServices.length > 0) {
      setSelectedSrvId(filteredServices[0].id);
      setQuantity(filteredServices[0].min_qty);
    } else {
      setSelectedSrvId("");
      setQuantity(0);
    }
  }, [selectedCatId, services]);

  const activeService = services.find((s) => s.id === selectedSrvId);

  // Calculations
  const totalPrice = activeService
    ? Number(((quantity / 1000) * activeService.rate).toFixed(2))
    : 0;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!user) return;
    if (!selectedSrvId) {
      setFormError("Please select a service.");
      return;
    }
    if (!targetLink.trim()) {
      setFormError("Target link / username is required.");
      return;
    }
    if (!activeService) return;
    if (quantity < activeService.min_qty) {
      setFormError(`Minimum quantity is ${activeService.min_qty}.`);
      return;
    }
    if (quantity > activeService.max_qty) {
      setFormError(`Maximum quantity is ${activeService.max_qty}.`);
      return;
    }

    setOrderLoading(true);
    const resultAction = await dispatch(
      placeOrder({
        userId: user.id,
        serviceId: String(selectedSrvId),
        link: targetLink,
        quantity,
      })
    );
    setOrderLoading(false);

    if (placeOrder.fulfilled.match(resultAction)) {
      toast.success("🎉 Order placed successfully! Check progress in My Orders.");
      setTargetLink("");
      if (activeService) setQuantity(activeService.min_qty);
      // Refresh order list and transactions
      dispatch(fetchUserOrders(user.id));
      dispatch(fetchTransactions(user.id));
    } else {
      const errMsg = resultAction.payload as string || "Failed to place order.";
      setFormError(errMsg);
      toast.error(errMsg);
    }
  };

  // Stats Calculations
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;
  const completedOrdersCount = orders.filter((o) => o.status === "completed").length;

  const statsList = [
    { label: STRINGS.DASHBOARD.STATS_BALANCE, value: `₹${Number(user?.balance ?? 0).toFixed(2)}`, icon: <Wallet className="text-primary-light" />, color: "border-primary/20 bg-primary/5" },
    { label: STRINGS.DASHBOARD.STATS_TOTAL_ORDERS, value: String(totalOrdersCount), icon: <ShoppingBag className="text-info" />, color: "border-info/20 bg-info/5" },
    { label: STRINGS.DASHBOARD.STATS_PENDING, value: String(pendingOrdersCount), icon: <Clock className="text-amber-500" />, color: "border-amber-500/20 bg-amber-500/5" },
    { label: STRINGS.DASHBOARD.STATS_COMPLETED, value: String(completedOrdersCount), icon: <CheckCircle className="text-success" />, color: "border-success/20 bg-success/5" },
  ];

  // Shortcut tabs selection triggers category update
  const handleShortcutClick = (platName: string) => {
    const match = categories.find((c) => c.name.toLowerCase().includes(platName.toLowerCase()));
    if (match) {
      setSelectedCatId(match.id);
      toast.info(`Switched category to ${match.name}`);
    }
  };

  const recentOrders = orders.slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);

  const orderColumns: TableColumn<MockOrder>[] = [
    { key: "id", title: "Order ID", render: (row) => <span className="font-mono text-white">#{row.id}</span> },
    {
      key: "service",
      title: "Service",
      render: (row) => {
        const s = services.find((srv) => srv.id === row.service_id);
        return <span className="truncate max-w-[200px] block">{s ? s.name : "Social Service"}</span>;
      },
    },
    { key: "link", title: "Link", className: "max-w-[150px] truncate" },
    { key: "quantity", title: "Qty" },
    { key: "status", title: "Status", render: (row) => <Badge status={row.status} /> },
  ];

  const txColumns: TableColumn<MockTransaction>[] = [
    { key: "id", title: "Tx ID", render: (row) => <span className="font-mono text-white">#{row.id}</span> },
    { key: "description", title: "Description", className: "max-w-[150px] truncate" },
    {
      key: "amount",
      title: "Amount",
      render: (row) => (
        <span className={row.type === "credit" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
          {row.type === "credit" ? "+" : "-"}₹{row.amount.toFixed(2)}
        </span>
      ),
    },
    { key: "created_at", title: "Date", render: (row) => new Date(row.created_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-info/5 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-28 h-28 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            Welcome back, {user?.name}!
            <Sparkles size={16} className="text-secondary animate-pulse" />
          </h2>
          <p className="text-xs text-textSecondary">
            Manage your social growth metrics from your control console. Uptime is stable.
          </p>
        </div>
        <Link to={ROUTES.NEW_ORDER}>
          <Button size="sm" icon={<Zap size={14} />}>
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((stat, idx) => (
          <Card key={idx} variant="stat" className={`p-4 flex items-center gap-3.5 border ${stat.color}`}>
            <div className="p-2.5 rounded-lg bg-bgDark border border-border shrink-0">
              {stat.icon}
            </div>
            <div>
              <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">{stat.label}</span>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Platform Shortcuts */}
      <section className="space-y-3">
        <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
          {STRINGS.DASHBOARD.SHORTCUTS_TITLE}
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {["Instagram", "YouTube", "TikTok", "Facebook", "Twitter", "Telegram"].map((plat) => (
            <button
              key={plat}
              onClick={() => handleShortcutClick(plat)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-bgCard hover:bg-bgCardHover text-textSecondary hover:text-white flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-95"
            >
              <PlatformIcon platform={plat} size={14} />
              <span>{plat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Quick Order & Recent Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Order Form */}
        <Card className="p-6 lg:col-span-1 flex flex-col justify-between self-start">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Zap size={16} className="text-primary-light" />
              {STRINGS.DASHBOARD.QUICK_ORDER_TITLE}
            </h3>

            {formError && <Alert variant="error">{formError}</Alert>}

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <Select
                label="Category"
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                  icon: <PlatformIcon platform={c.icon} size={14} />,
                }))}
                value={selectedCatId}
                onChange={setSelectedCatId}
              />

              <Select
                label="Service Offering"
                options={filteredServices.map((s) => ({
                  value: s.id,
                  label: s.name,
                  subLabel: `₹${s.rate.toFixed(2)} per 1000 — Min ${s.min_qty}`,
                }))}
                value={selectedSrvId}
                onChange={setSelectedSrvId}
              />

              {activeService && (
                <div className="p-3 bg-bgDark/45 rounded-lg border border-border text-xs text-textSecondary space-y-1 bg-gradient-to-br from-bgDark/50 to-bgCard/10 animate-fade-in">
                  <p className="font-medium text-white">Service description:</p>
                  <p className="leading-relaxed opacity-90">{activeService.description}</p>
                  <div className="flex justify-between font-bold text-primary-light pt-2 text-[10px] uppercase">
                    <span>Rate: ₹{activeService.rate}/1k</span>
                    <span>Avg Start: {activeService.avg_time}</span>
                  </div>
                </div>
              )}

              <Input
                label={STRINGS.DASHBOARD.TARGET_URL_LABEL}
                id="targetLink"
                placeholder={STRINGS.DASHBOARD.TARGET_URL_PLACEHOLDER}
                value={targetLink}
                onChange={(e) => setTargetLink(e.target.value)}
                disabled={orderLoading}
              />

              <div className="space-y-1.5">
                <Input
                  label={STRINGS.DASHBOARD.QUANTITY_LABEL}
                  id="quantity"
                  type="number"
                  placeholder={
                    activeService
                      ? `Min: ${activeService.min_qty} - Max: ${activeService.max_qty}`
                      : ""
                  }
                  value={quantity || ""}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={orderLoading}
                />
                {activeService && (
                  <div className="flex items-center justify-between text-[11px] text-textMuted px-1">
                    <span>Min: {activeService.min_qty}</span>
                    <span>Max: {activeService.max_qty}</span>
                  </div>
                )}
              </div>

              {activeService && (
                <div className="p-3 border border-border bg-bgDark/25 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-textSecondary">Total Est Price:</span>
                  <span className="text-sm font-black text-white">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={orderLoading}
                icon={<ArrowRight size={14} />}
              >
                {STRINGS.DASHBOARD.PLACE_ORDER_BTN}
              </Button>
            </form>
          </div>
        </Card>

        {/* Recent Activity lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
                {STRINGS.DASHBOARD.RECENT_ORDERS_TITLE}
              </h3>
              <Link to={ROUTES.ORDERS} className="text-xs text-primary-light hover:text-white transition-colors">
                View All
              </Link>
            </div>
            <Table
              columns={orderColumns}
              data={recentOrders}
              loading={ordersLoading}
              emptyState={
                <div className="py-4 text-center text-xs text-textMuted">
                  No orders placed yet. Add funds and place your first campaign order above!
                </div>
              }
            />
          </div>

          {/* Recent Transactions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
                {STRINGS.DASHBOARD.RECENT_TRANSACTIONS_TITLE}
              </h3>
              <Link to={ROUTES.TRANSACTIONS} className="text-xs text-primary-light hover:text-white transition-colors">
                View All
              </Link>
            </div>
            <Table
              columns={txColumns}
              data={recentTransactions}
              loading={txLoading}
              emptyState={
                <div className="py-4 text-center text-xs text-textMuted">
                  No deposit records available.
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardHome;
