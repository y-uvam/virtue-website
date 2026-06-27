import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchCategoriesAndServices, addCategory, updateCategory, deleteCategory } from "../../store/slices/servicesSlice";
import { Card } from "../../components/common/Card";
import { Table, type TableColumn } from "../../components/common/Table";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Alert } from "../../components/common/Alert";
import { Badge } from "../../components/common/Badge";
import { useToast } from "../../components/common/Toast";
import { type MockCategory, dbGet } from "../../store/mockData";
import { STRINGS } from "../../constants/strings";

export const ManageCategories: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { categories, loading } = useAppSelector((state) => state.services);

  const [allCategories, setAllCategories] = useState<MockCategory[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCat, setSelectedCat] = useState<MockCategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("instagram");
  const [sortOrder, setSortOrder] = useState<number | "">("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    dispatch(fetchCategoriesAndServices());
  }, [dispatch]);

  // Load all categories including inactive ones
  useEffect(() => {
    const all = dbGet<MockCategory[]>("smm_categories");
    setAllCategories(all);
  }, [categories]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setSelectedCat(null);
    setName("");
    setIcon("instagram");
    setSortOrder(allCategories.length + 1);
    setStatus("active");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: MockCategory) => {
    setIsEditMode(true);
    setSelectedCat(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setSortOrder(cat.sort_order);
    setStatus(cat.status);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    setFormLoading(true);

    let result;
    if (isEditMode && selectedCat) {
      result = await dispatch(
        updateCategory({
          id: selectedCat.id,
          name,
          icon,
          sort_order: Number(sortOrder),
          status,
        } as MockCategory)
      );
    } else {
      result = await dispatch(addCategory(name));
    }

    setFormLoading(false);

    if (addCategory.fulfilled.match(result) || updateCategory.fulfilled.match(result)) {
      toast.success(`Category ${isEditMode ? "updated" : "created"} successfully.`);
      setIsModalOpen(false);

      setAllCategories(dbGet<MockCategory[]>("smm_categories"));
      dispatch(fetchCategoriesAndServices());
    } else {
      setFormError(result.payload as string || "Failed to save category.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this category? All associated services will also be removed permanently.")) {
      const result = await dispatch(deleteCategory(id));
      if (deleteCategory.fulfilled.match(result)) {
        toast.success("Category and its services removed successfully.");
        setAllCategories(dbGet<MockCategory[]>("smm_categories"));
        dispatch(fetchCategoriesAndServices());
      } else {
        toast.error("Failed to delete category.");
      }
    }
  };

  const catColumns: TableColumn<MockCategory>[] = [
    { key: "id", title: "Category ID", render: (row) => <span className="font-mono text-white text-xs">#{row.id}</span> },
    {
      key: "name",
      title: "Category Name",
      render: (row) => <span className="font-bold text-white">{row.name}</span>,
    },
    {
      key: "icon",
      title: "Platform Icon Key",
      render: (row) => <span className="font-mono text-xs text-textMuted">{row.icon}</span>,
    },
    { key: "sort_order", title: "Sort Position" },
    {
      key: "status",
      title: "Status",
      render: (row) => <Badge status={row.status === "active" ? "completed" : "cancelled"} />,
    },
    {
      key: "actions",
      title: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="secondary" size="sm" className="p-1.5" onClick={() => handleOpenEdit(row)}>
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
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.ADMIN.NAV_MANAGE_CATEGORIES}</h1>
          <p className="text-xs text-textSecondary">
            Manage platform categories that group your social media services for user navigation.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={<Plus size={13} />}>
          Add Category
        </Button>
      </div>

      <Card className="p-4 overflow-hidden">
        <Table
          columns={catColumns}
          data={allCategories}
          loading={loading}
          emptyState={
            <div className="py-8 text-center text-xs text-textMuted">
              No categories found. Add your first platform category above.
            </div>
          }
        />
      </Card>

      {/* Category CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Edit Platform Category" : "New Platform Category"}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} loading={formLoading}>
              Save Category
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert variant="error">{formError}</Alert>}

          <Input
            label="Category Name"
            id="catName"
            placeholder="e.g. Instagram Growth"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={formLoading}
          />

          <Select
            label="Platform Icon Key"
            options={[
              { value: "instagram", label: "Instagram" },
              { value: "youtube", label: "YouTube" },
              { value: "tiktok", label: "TikTok" },
              { value: "facebook", label: "Facebook" },
              { value: "twitter", label: "Twitter / X" },
              { value: "telegram", label: "Telegram" },
              { value: "spotify", label: "Spotify" },
              { value: "linkedin", label: "LinkedIn" },
              { value: "globe", label: "General / Website" },
            ]}
            value={icon}
            onChange={(v) => setIcon(String(v))}
          />

          <Input
            label="Sort Position Order"
            id="sortOrder"
            type="number"
            placeholder="1"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={formLoading}
          />

          <Select
            label="Category Status"
            options={[
              { value: "active", label: "Active (Public)" },
              { value: "inactive", label: "Inactive (Hidden)" },
            ]}
            value={status}
            onChange={(v) => setStatus(v as any)}
          />
        </form>
      </Modal>
    </div>
  );
};
export default ManageCategories;
