import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Zap,
  Sparkles,
} from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchCategoriesAndServices } from "../../store/slices/servicesSlice";
import { fetchUserOrders } from "../../store/slices/ordersSlice";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { PlatformIcon } from "../../components/common/PlatformIcon";
import { Table, type TableColumn } from "../../components/common/Table";
import type { MockOrder } from "../../store/mockData";

export const DashboardHome: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { services } = useAppSelector((state) => state.services);
  const { orders, loading: ordersLoading } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchCategoriesAndServices());
    if (user?.id) {
      dispatch(fetchUserOrders(user.id));
    }
  }, [dispatch, user?.id]);

  // Stats Calculations
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;
  const completedOrdersCount = orders.filter((o) => o.status === "completed").length;

  const statsList = [
    { label: STRINGS.DASHBOARD.STATS_TOTAL_ORDERS, value: String(totalOrdersCount), icon: <ShoppingBag className="text-info" />, color: "border-info/20 bg-info/5" },
    { label: STRINGS.DASHBOARD.STATS_PENDING, value: String(pendingOrdersCount), icon: <Clock className="text-amber-500" />, color: "border-amber-500/20 bg-amber-500/5" },
    { label: STRINGS.DASHBOARD.STATS_COMPLETED, value: String(completedOrdersCount), icon: <CheckCircle className="text-success" />, color: "border-success/20 bg-success/5" },
  ];

  // Shortcut tabs selection redirects to New Order
  const handleShortcutClick = () => {
    navigate(ROUTES.NEW_ORDER);
  };

  const recentOrders = orders.slice(0, 10);

  const orderColumns: TableColumn<MockOrder>[] = [
    { key: "id", title: "Order ID", render: (row) => <span className="font-mono text-white">#{row.id}</span> },
    {
      key: "service",
      title: "Service",
      render: (row) => {
        const s = services.find((srv) => srv.id === row.service_id);
        return <span className="truncate max-w-[300px] block">{s ? s.name : "Social Service"}</span>;
      },
    },
    { key: "link", title: "Link", className: "max-w-[200px] truncate" },
    { key: "quantity", title: "Qty" },
    { key: "status", title: "Status", render: (row) => <Badge status={row.status} /> },
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
            Manage your social growth campaigns from your control console.
          </p>
        </div>
        <Link to={ROUTES.NEW_ORDER}>
          <Button size="sm" icon={<Zap size={14} />}>
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          {["Instagram", "YouTube"].map((plat) => (
            <button
              key={plat}
              onClick={handleShortcutClick}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-bgCard hover:bg-bgCardHover text-textSecondary hover:text-white flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-95"
            >
              <PlatformIcon platform={plat} size={14} />
              <span>{plat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Orders */}
      <div className="space-y-3 pt-2">
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
            <div className="py-8 text-center text-xs text-textMuted bg-bgCard rounded-xl border border-border">
              No orders placed yet. Place your first campaign order from the navigation sidebar!
            </div>
          }
        />
      </div>
    </div>
  );
};

export default DashboardHome;
