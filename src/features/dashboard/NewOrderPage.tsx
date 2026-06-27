import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, HelpCircle, Info, ShieldCheck } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchCategoriesAndServices } from "../../store/slices/servicesSlice";
import { placeOrder } from "../../store/slices/ordersSlice";
import { Card } from "../../components/common/Card";
import { Select } from "../../components/common/Select";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { PlatformIcon } from "../../components/common/PlatformIcon";
import { Alert } from "../../components/common/Alert";
import { Modal } from "../../components/common/Modal";
import { useToast } from "../../components/common/Toast";

export const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { user } = useAppSelector((state) => state.auth);
  const { categories, services } = useAppSelector((state) => state.services);

  // Form parameters
  const [selectedCatId, setSelectedCatId] = useState<string | number>("");
  const [selectedSrvId, setSelectedSrvId] = useState<string | number>("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    dispatch(fetchCategoriesAndServices());
  }, [dispatch]);

  // Default values
  useEffect(() => {
    if (categories.length > 0 && !selectedCatId) {
      setSelectedCatId(categories[0].id);
    }
  }, [categories, selectedCatId]);

  const filteredServices = services.filter((s) => s.category_id === selectedCatId);

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

  const price = activeService
    ? Number(((quantity / 1000) * activeService.rate).toFixed(2))
    : 0;

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedSrvId) {
      setFormError("Please select a service.");
      return;
    }
    if (!link.trim()) {
      setFormError("Target link / URL is required.");
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
    if (user && user.balance < price) {
      setFormError("Insufficient wallet balance. Please add funds.");
      return;
    }

    setShowConfirmModal(true);
  };

  const handlePlaceOrder = async () => {
    if (!user || !activeService) return;
    setShowConfirmModal(false);
    setLoading(true);

    const resultAction = await dispatch(
      placeOrder({
        userId: user.id,
        serviceId: activeService.id,
        link,
        quantity,
      })
    );
    setLoading(false);

    if (placeOrder.fulfilled.match(resultAction)) {
      toast.success("Order placed successfully!");
      setLink("");
      setQuantity(activeService.min_qty);
      navigate(ROUTES.ORDERS);
    } else {
      const errMsg = resultAction.payload as string || "Failed to place order.";
      setFormError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.DASHBOARD.NEW_ORDER_TITLE}</h1>
        <p className="text-xs text-textSecondary">
          Launch a new social campaign. Real-time delivery and metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form panel */}
        <Card className="p-6 md:col-span-2 space-y-4">
          {formError && <Alert variant="error">{formError}</Alert>}

          <form onSubmit={handleOpenConfirm} className="space-y-5">
            <Select
              label="Platform Category"
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
                icon: <PlatformIcon platform={c.icon} size={14} />,
              }))}
              value={selectedCatId}
              onChange={setSelectedCatId}
            />

            <Select
              label="Select Service"
              options={filteredServices.map((s) => ({
                value: s.id,
                label: s.name,
                subLabel: `Rate: ₹${s.rate.toFixed(2)} per 1K — Min ${s.min_qty}`,
              }))}
              value={selectedSrvId}
              onChange={setSelectedSrvId}
            />

            <Input
              label={STRINGS.DASHBOARD.TARGET_URL_LABEL}
              id="link"
              placeholder={STRINGS.DASHBOARD.TARGET_URL_PLACEHOLDER}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={loading}
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
                disabled={loading}
              />
              {activeService && (
                <div className="flex items-center justify-between text-[10px] text-textMuted px-1">
                  <span>Min Quantity: {activeService.min_qty}</span>
                  <span>Max Quantity: {activeService.max_qty}</span>
                </div>
              )}
            </div>

            {activeService && (
              <div className="p-4 rounded-lg bg-bgDark border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-textSecondary block">Total Price</span>
                  <span className="text-[10px] text-textMuted">Quantity × Rate / 1000</span>
                </div>
                <span className="text-base font-black text-white">
                  ₹{price.toFixed(2)}
                </span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              icon={<Zap size={14} />}
            >
              {STRINGS.DASHBOARD.PLACE_ORDER_BTN}
            </Button>
          </form>
        </Card>

        {/* Info panel */}
        <div className="space-y-6 md:col-span-1">
          {activeService ? (
            <Card className="p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border pb-2 flex items-center gap-1.5">
                <Info size={14} className="text-primary-light" />
                {STRINGS.DASHBOARD.SERVICE_DETAILS}
              </h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-textMuted block uppercase font-bold text-[9px] tracking-wider">Service Name</span>
                  <span className="text-textPrimary font-semibold">{activeService.name}</span>
                </div>

                <div>
                  <span className="text-textMuted block uppercase font-bold text-[9px] tracking-wider">Rate per 1,000</span>
                  <span className="text-primary-light font-bold text-sm">₹{activeService.rate.toFixed(2)}</span>
                </div>

                <div>
                  <span className="text-textMuted block uppercase font-bold text-[9px] tracking-wider">Average Start Time</span>
                  <span className="text-white font-semibold">{activeService.avg_time}</span>
                </div>

                <div>
                  <span className="text-textMuted block uppercase font-bold text-[9px] tracking-wider">Description</span>
                  <p className="text-textSecondary leading-relaxed">{activeService.description}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  <span className="text-textMuted text-[9px] font-bold uppercase tracking-wider">Guaranteed:</span>
                  {activeService.refill_available ? (
                    <Badge status="completed" className="text-[9px] !py-0">30 Days Refill</Badge>
                  ) : (
                    <Badge status="cancelled" className="text-[9px] !py-0">No Refill</Badge>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-5 text-center py-10 text-textMuted text-xs flex flex-col items-center justify-center gap-2">
              <HelpCircle size={28} />
              <span>Select a category and service to view specifications</span>
            </Card>
          )}

          <Card variant="bordered" className="p-5 border-dashed border-primary/20 bg-primary/5 text-xs text-textSecondary leading-relaxed space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1">
              <ShieldCheck size={14} className="text-primary-light" />
              SMM Panel Guidelines
            </h4>
            <p>1. Please ensure your target profile or video link is public. Private links cannot receive growth and are unrefundable.</p>
            <p>2. Do not place duplicate orders for the same link while the first order is in progress.</p>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {activeService && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title={STRINGS.DASHBOARD.ORDER_CONFIRM_TITLE}
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setShowConfirmModal(false)}>
                Go Back
              </Button>
              <Button variant="primary" size="sm" onClick={handlePlaceOrder}>
                Confirm Order
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-textSecondary leading-relaxed">
              You are placing a social growth campaign order. Review the campaign specifics before checking out:
            </p>
            <div className="p-4 rounded-lg bg-bgDark border border-border space-y-2.5">
              <div className="flex justify-between">
                <span className="text-textMuted">Service:</span>
                <span className="font-semibold text-white truncate max-w-xs">{activeService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted">Target Link:</span>
                <span className="font-semibold text-white truncate max-w-xs">{link}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted">Quantity:</span>
                <span className="font-semibold text-white">{quantity}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/40 font-bold">
                <span className="text-textSecondary">Deducted Price:</span>
                <span className="text-primary-light text-base">₹{price.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-[11px] text-textMuted leading-normal">
              Warning: Placed campaigns start automatically and cannot be canceled once delivery starts.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default NewOrderPage;
