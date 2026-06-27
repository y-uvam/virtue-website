import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  HelpCircle,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchAdminData } from "../../store/slices/adminSlice";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Table, type TableColumn } from "../../components/common/Table";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import type { MockOrder, MockUser } from "../../store/mockData";

export const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, orders, tickets, stats, loading } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminData());
  }, [dispatch]);

  const statsList = [
    { label: STRINGS.ADMIN.STATS_TOTAL_USERS, value: stats?.totalUsers ?? 0, icon: <Users className="text-primary-light" />, path: ROUTES.ADMIN_USERS },
    { label: STRINGS.ADMIN.STATS_REVENUE_TODAY, value: `₹${(stats?.revenueToday ?? 0).toFixed(2)}`, icon: <TrendingUp className="text-emerald-400" />, path: ROUTES.ADMIN_PAYMENTS },
    { label: STRINGS.ADMIN.STATS_ORDERS_TODAY, value: stats?.totalOrdersToday ?? 0, icon: <ShoppingBag className="text-info" />, path: ROUTES.ADMIN_ORDERS },
    { label: STRINGS.ADMIN.STATS_OPEN_TICKETS, value: stats?.openTickets ?? 0, icon: <HelpCircle className="text-amber-500" />, path: ROUTES.ADMIN_TICKETS },
  ];

  const recentRegistrants = users.filter(u => u.role !== "admin").slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  const regColumns: TableColumn<MockUser>[] = [
    { key: "username", title: "Username", render: (row) => <span className="font-bold text-white">@{row.username}</span> },
    { key: "name", title: "Full Name" },
    { key: "email", title: "Email Address" },
    { key: "joined", title: "Joined Date", render: (row) => new Date(row.created_at).toLocaleDateString() },
  ];

  const orderColumns: TableColumn<MockOrder>[] = [
    { key: "id", title: "Order ID", render: (row) => <span className="font-mono text-white">#{row.id}</span> },
    { key: "link", title: "Link", className: "max-w-[150px] truncate" },
    { key: "price", title: "Price Charged", render: (row) => <span className="font-bold text-white">₹{row.price.toFixed(2)}</span> },
    { key: "status", title: "Status", render: (row) => <Badge status={row.status} /> },
  ];

  return (
    <div className="space-y-8 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">Admin Dashboard</h1>
        <p className="text-xs text-textSecondary">
          Overall SMM Panel operations, business performance analytics, and support status.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((stat, idx) => (
          <Link key={idx} to={stat.path}>
            <Card variant="stat" className="p-5 flex items-center gap-4 border border-border hover:border-primary/30 hover:scale-[1.01] transition-all cursor-pointer">
              <div className="p-3 rounded-xl bg-bgDark border border-border shrink-0">
                {stat.icon}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider block truncate">{stat.label}</span>
                <h3 className="text-xl font-black text-white mt-1 truncate">{stat.value}</h3>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue SVG Line Chart */}
        <Card className="p-5 lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border pb-2.5">
            {STRINGS.ADMIN.REVENUE_CHART_TITLE}
          </h3>
          <div className="h-60 w-full bg-bgDark/45 rounded-lg border border-border/80 p-4 relative flex flex-col justify-between">
            {/* Simple clean visual representation of a chart line */}
            <div className="absolute inset-0 p-8 flex items-end">
              <svg className="w-full h-[80%] overflow-visible text-primary-light" fill="none" stroke="currentColor" strokeWidth="2.5">
                {/* Visual grid lines */}
                <line x1="0" y1="20%" x2="100%" y2="20%" stroke="rgba(42,42,69,0.3)" strokeDasharray="4 4" />
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(42,42,69,0.3)" strokeDasharray="4 4" />
                <line x1="0" y1="80%" x2="100%" y2="80%" stroke="rgba(42,42,69,0.3)" strokeDasharray="4 4" />
                {/* Styled Path */}
                <path
                  d="M 0 100 Q 15 20 30 80 T 60 40 T 90 20 T 120 70 T 150 90 T 180 50 T 210 20 T 240 60 T 270 30 T 300 10"
                  className="w-full"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            {/* Axis labels */}
            <div className="flex justify-between text-[9px] text-textMuted font-mono">
              <span>₹10,000 max</span>
              <span>₹5,000 mid</span>
              <span>₹0 min</span>
            </div>
            <div className="flex justify-between text-[9px] text-textMuted font-mono pt-4 border-t border-border/20">
              <span>June 1</span>
              <span>June 10</span>
              <span>June 20</span>
              <span>Today (June 25)</span>
            </div>
          </div>
        </Card>

        {/* Status Distribution */}
        <Card className="p-5 lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border pb-2.5">
            {STRINGS.ADMIN.ORDER_STATUS_DONUT_TITLE}
          </h3>
          <div className="h-60 bg-bgDark/45 rounded-lg border border-border/80 p-5 flex flex-col justify-between">
            <div className="space-y-3.5">
              {[
                { label: "Completed", count: 1420, percent: "72%", color: "bg-emerald-500" },
                { label: "Pending", count: 240, percent: "12%", color: "bg-amber-500" },
                { label: "In Progress", count: 180, percent: "9%", color: "bg-blue-500" },
                { label: "Cancelled", count: 140, percent: "7%", color: "bg-red-500" },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-textSecondary">{item.label} ({item.count})</span>
                    <span className="font-bold text-white">{item.percent}</span>
                  </div>
                  <div className="w-full h-2 bg-bgDark rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: item.percent }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent activity grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent registrations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
              {STRINGS.ADMIN.RECENT_REGISTRATIONS_TITLE}
            </h3>
            <Link to={ROUTES.ADMIN_USERS} className="text-xs text-primary-light hover:text-white transition-colors">
              Manage Users
            </Link>
          </div>
          <Card className="p-4 overflow-hidden">
            <Table columns={regColumns} data={recentRegistrants} loading={loading} />
          </Card>
        </div>

        {/* Recent orders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
              Recent Placed Orders
            </h3>
            <Link to={ROUTES.ADMIN_ORDERS} className="text-xs text-primary-light hover:text-white transition-colors">
              Manage Orders
            </Link>
          </div>
          <Card className="p-4 overflow-hidden">
            <Table columns={orderColumns} data={recentOrders} loading={loading} />
          </Card>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
