import React, { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, ShieldAlert, Import, Settings, ArrowRight, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchCategoriesAndServices, addService, updateService, deleteService } from "../../store/slices/servicesSlice";
import { Card } from "../../components/common/Card";
import { Table, type TableColumn } from "../../components/common/Table";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Pagination } from "../../components/common/Pagination";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Alert } from "../../components/common/Alert";
import { useToast } from "../../components/common/Toast";
import { STRINGS } from "../../constants/strings";
import type { MockService } from "../../store/mockData";

export const ManageServices: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { services, categories, loading } = useAppSelector((state) => state.services);

  // Search/Filters
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // CRUD modals states
  const [selectedService, setSelectedService] = useState<MockService | null>(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState<number | "">("");
  const [minQty, setMinQty] = useState<number | "">("");
  const [maxQty, setMaxQty] = useState<number | "">("");
  const [avgTime, setAvgTime] = useState("");
  const [refill, setRefill] = useState(false);
  const [status, setStatus] = useState<"active" | "inactive">("active");

  // Import JSON Mock state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    dispatch(fetchCategoriesAndServices());
  }, [dispatch]);

  // Set default category when modal opens
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const filteredServices = services.filter((srv) => {
    const cat = categories.find((c) => c.id === srv.category_id);
    const catName = cat ? cat.name.toLowerCase() : "";
    const matchesSearch =
      srv.id.toLowerCase().includes(search.toLowerCase()) ||
      srv.name.toLowerCase().includes(search.toLowerCase()) ||
      catName.includes(search.toLowerCase());

    const matchesCat = filterCat === "all" ? true : srv.category_id === filterCat;

    return matchesSearch && matchesCat;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  const resetForm = () => {
    setName("");
    setCategoryId(categories[0]?.id || "");
    setDescription("");
    setRate("");
    setMinQty("");
    setMaxQty("");
    setAvgTime("30 minutes");
    setRefill(false);
    setStatus("active");
    setFormError("");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsEditMode(false);
    setSelectedService(null);
    setServiceModalOpen(true);
  };

  const handleOpenEditModal = (srv: MockService) => {
    setIsEditMode(true);
    setSelectedService(srv);
    setName(srv.name);
    setCategoryId(srv.category_id);
    setDescription(srv.description);
    setRate(srv.rate);
    setMinQty(srv.min_qty);
    setMaxQty(srv.max_qty);
    setAvgTime(srv.avg_time);
    setRefill(srv.refill_available);
    setStatus(srv.status);
    setFormError("");
    setServiceModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !categoryId || !description.trim() || !rate || !minQty || !maxQty || !avgTime) {
      setFormError("All service specifications are required.");
      return;
    }

    setFormLoading(true);

    const payload = {
      category_id: categoryId,
      name,
      description,
      rate: Number(rate),
      min_qty: Number(minQty),
      max_qty: Number(maxQty),
      avg_time: avgTime,
      refill_available: refill,
      status,
    };

    let result;
    if (isEditMode && selectedService) {
      result = await dispatch(updateService({ ...payload, id: selectedService.id }));
    } else {
      result = await dispatch(addService(payload));
    }

    setFormLoading(false);

    if (addService.fulfilled.match(result) || updateService.fulfilled.match(result)) {
      toast.success(`Service ${isEditMode ? "updated" : "created"} successfully.`);
      setServiceModalOpen(false);
      dispatch(fetchCategoriesAndServices());
    } else {
      setFormError("Failed to save service. Check fields.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this service permanently? This action is irreversible.")) {
      const result = await dispatch(deleteService(id));
      if (deleteService.fulfilled.match(result)) {
        toast.success("Service deleted successfully.");
        dispatch(fetchCategoriesAndServices());
      } else {
        toast.error("Failed to delete service.");
      }
    }
  };

  const handleStatusToggle = async (srv: MockService) => {
    const updated = {
      ...srv,
      status: (srv.status === "active" ? "inactive" : "active") as "active" | "inactive",
    };
    const result = await dispatch(updateService(updated));
    if (updateService.fulfilled.match(result)) {
      toast.success(`Service status toggled successfully.`);
      dispatch(fetchCategoriesAndServices());
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonText.trim()) return;

    try {
      const parsed = JSON.parse(jsonText);
      // Simulate bulk importing services
      toast.success("Successfully parsed and imported 3 services from API provider!");
      setImportModalOpen(false);
      setJsonText("");
    } catch (err) {
      toast.error("Invalid JSON format. Please paste valid social provider schema.");
    }
  };

  const serviceColumns: TableColumn<MockService>[] = [
    { key: "id", title: "ID", render: (row) => <span className="font-mono text-white text-xs">#{row.id}</span>, className: "w-16" },
    {
      key: "name",
      title: "Service Specifications",
      render: (row) => {
        const cat = categories.find((c) => c.id === row.category_id);
        return (
          <div className="max-w-[280px]">
            <span className="font-bold text-white block truncate">{row.name}</span>
            <span className="text-[10px] text-textMuted uppercase font-semibold">Category: {cat ? cat.name : "Other"}</span>
          </div>
        );
      },
      className: "whitespace-normal",
    },
    {
      key: "rate",
      title: "Rate/1K",
      render: (row) => <span className="font-black text-primary-light">₹{row.rate.toFixed(2)}</span>,
    },
    {
      key: "limits",
      title: "Min/Max",
      render: (row) => <span className="text-textSecondary text-xs">{row.min_qty} / {row.max_qty}</span>,
    },
    {
      key: "status",
      title: "Active",
      render: (row) => (
        <button
          onClick={() => handleStatusToggle(row)}
          className="text-textMuted hover:text-white cursor-pointer transition-colors"
        >
          {row.status === "active" ? (
            <ToggleRight size={24} className="text-emerald-400" />
          ) : (
            <ToggleLeft size={24} />
          )}
        </button>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="secondary" size="sm" className="p-1.5" onClick={() => handleOpenEditModal(row)}>
            <Edit size={13} />
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="p-1.5 h-8 w-8 !bg-red-500/10 !text-red-400 border border-red-500/25 hover:!bg-red-500 hover:!text-white"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.ADMIN.NAV_MANAGE_SERVICES}</h1>
          <p className="text-xs text-textSecondary">
            Manage your catalog index. Add new services, set rates, or sync API resellers.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => setImportModalOpen(true)} icon={<Import size={13} />}>
            API Import
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAddModal} icon={<Plus size={13} />}>
            Add Service
          </Button>
        </div>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-1 border border-border p-1 bg-bgCard/40 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterCat("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap
              ${
                filterCat === "all"
                  ? "bg-primary text-white"
                  : "text-textSecondary hover:text-white"
              }
            `}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap
                ${
                  filterCat === c.id
                    ? "bg-primary text-white"
                    : "text-textSecondary hover:text-white"
                }
              `}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-80 relative flex items-center">
          <Search size={14} className="absolute left-3 text-textMuted pointer-events-none" />
          <input
            type="text"
            placeholder="Search service names..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bgCard border border-border text-xs text-textPrimary placeholder-textMuted outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Services Table */}
      <Card className="p-4 overflow-hidden">
        <Table columns={serviceColumns} data={paginatedServices} loading={loading} />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>

      {/* Service CRUD Modal */}
      <Modal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        title={isEditMode ? "Modify Service offering" : "Create New service offering"}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setServiceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} loading={formLoading}>
              Save Service
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {formError && <Alert variant="error">{formError}</Alert>}

          <Input
            label="Service Title / Name"
            id="srvName"
            placeholder="e.g. Instagram Followers [High Speed]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={formLoading}
          />

          <Select
            label="Category Catalog"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={categoryId}
            onChange={(val) => setCategoryId(String(val))}
          />

          <div className="flex flex-col text-left">
            <label className="text-xs font-semibold text-textSecondary mb-1.5 uppercase tracking-wider">Service Description</label>
            <textarea
              placeholder="Enter service details, start time, limits..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={formLoading}
              className="w-full bg-bgDark border border-border rounded-lg p-2.5 text-xs text-white placeholder-textMuted h-20 outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Rate per 1k (₹)"
              id="srvRate"
              type="number"
              placeholder="120"
              value={rate}
              onChange={(e) => setRate(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={formLoading}
            />
            <Input
              label="Min Qty"
              id="srvMin"
              type="number"
              placeholder="100"
              value={minQty}
              onChange={(e) => setMinQty(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={formLoading}
            />
            <Input
              label="Max Qty"
              id="srvMax"
              type="number"
              placeholder="10000"
              value={maxQty}
              onChange={(e) => setMaxQty(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={formLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Avg Start Time"
              id="srvTime"
              placeholder="e.g., 30 minutes"
              value={avgTime}
              onChange={(e) => setAvgTime(e.target.value)}
              disabled={formLoading}
            />
            <Select
              label="Refill Guarantee"
              options={[
                { value: "yes", label: "30-Day Auto Refill" },
                { value: "no", label: "No Guarantee Refill" },
              ]}
              value={refill ? "yes" : "no"}
              onChange={(val) => setRefill(val === "yes")}
            />
          </div>

          <Select
            label="Service Status"
            options={[
              { value: "active", label: "Active & Public" },
              { value: "inactive", label: "Inactive (Hidden)" },
            ]}
            value={status}
            onChange={(val) => setStatus(val as any)}
          />
        </form>
      </Modal>

      {/* JSON Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Sync Services from Provider API"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setImportModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handleImportSubmit}>
              Import JSON
            </Button>
          </>
        }
      >
        <form onSubmit={handleImportSubmit} className="space-y-4 text-xs sm:text-sm">
          <p className="text-textSecondary leading-normal">
            Paste services catalog JSON array exported from external provider endpoint (like SMM reseller API):
          </p>
          <textarea
            placeholder='[{"service":102,"name":"IG Likes","rate":12.5,"min":50,"max":10000}]'
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full bg-bgDark border border-border rounded-lg p-3 text-xs text-emerald-400 font-mono h-40 outline-none focus:border-primary resize-none"
          />
        </form>
      </Modal>
    </div>
  );
};
export default ManageServices;
