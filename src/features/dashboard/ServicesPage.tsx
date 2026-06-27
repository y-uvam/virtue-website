import React, { useEffect, useState } from "react";
import { Search, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchCategoriesAndServices } from "../../store/slices/servicesSlice";
import { Card } from "../../components/common/Card";
import { Table, type TableColumn } from "../../components/common/Table";
import { PlatformIcon } from "../../components/common/PlatformIcon";
import { Badge } from "../../components/common/Badge";
import { STRINGS } from "../../constants/strings";

export const ServicesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, services, loading } = useAppSelector((state) => state.services);

  // Search/Filters
  const [selectedCatId, setSelectedCatId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedSrvId, setExpandedSrvId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategoriesAndServices());
  }, [dispatch]);

  // Filtering Logic
  const filteredServices = services.filter((srv) => {
    const category = categories.find((c) => c.id === srv.category_id);
    const categoryName = category ? category.name.toLowerCase() : "";
    const matchesSearch =
      srv.id.toLowerCase().includes(search.toLowerCase()) ||
      srv.name.toLowerCase().includes(search.toLowerCase()) ||
      srv.description.toLowerCase().includes(search.toLowerCase()) ||
      categoryName.includes(search.toLowerCase());

    const matchesCategory = selectedCatId === "all" ? true : srv.category_id === selectedCatId;

    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedSrvId(expandedSrvId === id ? null : id);
  };

  const serviceColumns: TableColumn<typeof services[0]>[] = [
    {
      key: "id",
      title: "Service ID",
      render: (row) => <span className="font-mono text-white text-xs">#{row.id}</span>,
      className: "w-20",
    },
    {
      key: "name",
      title: "Service Description / Name",
      render: (row) => {
        const cat = categories.find((c) => c.id === row.category_id);
        const isOpen = expandedSrvId === row.id;

        return (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <PlatformIcon platform={cat ? cat.name : "globe"} size={13} />
              <span className="font-bold text-white leading-normal text-xs sm:text-sm">{row.name}</span>
            </div>
            {isOpen && (
              <p className="text-xs text-textSecondary bg-bgDark/45 p-3 rounded-lg border border-border/40 mt-2 max-w-xl leading-relaxed animate-fade-in">
                {row.description}
              </p>
            )}
            <button
              onClick={() => toggleExpand(row.id)}
              className="text-[10px] text-primary-light hover:text-white font-semibold transition-colors mt-1 block flex items-center gap-1 cursor-pointer"
            >
              {isOpen ? (
                <>
                  <ChevronUp size={12} /> Hide Description
                </>
              ) : (
                <>
                  <ChevronDown size={12} /> View Details &amp; Description
                </>
              )}
            </button>
          </div>
        );
      },
      className: "whitespace-normal min-w-[280px]",
    },
    {
      key: "rate",
      title: "Rate Per 1K",
      render: (row) => (
        <span className="font-black text-primary-light text-sm">
          ₹{row.rate.toFixed(2)}
        </span>
      ),
    },
    {
      key: "min_qty",
      title: "Min / Max Qty",
      render: (row) => (
        <span className="text-xs font-semibold text-textSecondary">
          {row.min_qty} / {row.max_qty}
        </span>
      ),
    },
    {
      key: "avg_time",
      title: "Avg Start Time",
      render: (row) => <span className="text-xs text-textSecondary">{row.avg_time}</span>,
    },
    {
      key: "refill",
      title: "Refill Guarantee",
      render: (row) =>
        row.refill_available ? (
          <Badge status="completed" className="text-[10px]">Yes</Badge>
        ) : (
          <Badge status="cancelled" className="text-[10px]">No</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.DASHBOARD.NAV_SERVICES}</h1>
        <p className="text-xs text-textSecondary">
          Browse our full, direct supplier social growth offerings. All rates per 1,000 requests.
        </p>
      </div>

      {/* Filter tabs list & search input */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 border border-border p-1 bg-bgCard/40 rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedCatId("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap
              ${
                selectedCatId === "all"
                  ? "bg-primary text-white"
                  : "text-textSecondary hover:text-white"
              }
            `}
          >
            All Platforms
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCatId(c.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5
                ${
                  selectedCatId === c.id
                    ? "bg-primary text-white"
                    : "text-textSecondary hover:text-white"
                }
              `}
            >
              <PlatformIcon platform={c.icon} size={12} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="w-full md:w-80 relative flex items-center">
          <Search size={14} className="absolute left-3 text-textMuted pointer-events-none" />
          <input
            type="text"
            placeholder="Search catalog offerings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bgCard border border-border text-xs text-textPrimary placeholder-textMuted outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Services Table */}
      <Card className="p-4 overflow-hidden">
        <Table
          columns={serviceColumns}
          data={filteredServices}
          loading={loading}
          emptyState={
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="p-4 rounded-full bg-bgDark border border-border text-textMuted">
                <Layers size={28} />
              </div>
              <p className="text-xs text-textMuted max-w-xs">
                No services found. Try typing a different platform keyword or category.
              </p>
            </div>
          }
        />
      </Card>
    </div>
  );
};
export default ServicesPage;
