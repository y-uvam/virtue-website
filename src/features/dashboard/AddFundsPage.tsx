import React, { useState } from "react";
import { CreditCard, Wallet, ShieldCheck, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { addFunds } from "../../store/slices/walletSlice";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Alert } from "../../components/common/Alert";
import { useToast } from "../../components/common/Toast";
import { STRINGS } from "../../constants/strings";
import { Table, type TableColumn } from "../../components/common/Table";
import type { MockTransaction } from "../../store/mockData";

export const AddFundsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { user } = useAppSelector((state) => state.auth);
  const { transactions, loading: txLoading } = useAppSelector((state) => state.wallet);

  const [method, setMethod] = useState("razorpay");
  const [amount, setAmount] = useState<number | "">("");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const presets = [100, 500, 1000, 2000, 5000];

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user) return;
    if (!amount || Number(amount) <= 0) {
      setErrorMsg("Please enter a valid deposit amount.");
      return;
    }
    if (Number(amount) < 100) {
      setErrorMsg(STRINGS.VALIDATION.AMOUNT_MIN);
      return;
    }
    if (Number(amount) > 50000) {
      setErrorMsg(STRINGS.VALIDATION.AMOUNT_MAX);
      return;
    }

    setLoading(true);
    
    // Simulate Razorpay Gateway Opening Overlay
    toast.info("Opening secure checkout gateway...");
    
    const resultAction = await dispatch(
      addFunds({
        userId: user.id,
        amount: Number(amount),
        method,
      })
    );
    
    setLoading(false);

    if (addFunds.fulfilled.match(resultAction)) {
      toast.success(`🎉 Deposit successful! ₹${Number(amount).toFixed(2)} added to wallet.`);
      setAmount("");
    } else {
      const errMsg = resultAction.payload as string || "Payment authorization failed.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupon.trim()) return;
    if (coupon.toUpperCase() === "FREE50") {
      toast.success("Coupon applied! ₹50 bonus will be credited on next deposit above ₹500.");
    } else {
      toast.error("Invalid coupon code.");
    }
  };

  const depositsOnly = transactions.filter((tx) => tx.type === "credit");

  const depositColumns: TableColumn<MockTransaction>[] = [
    { key: "id", title: "Ref ID", render: (row) => <span className="font-mono text-white">#{row.id}</span> },
    { key: "description", title: "Payment Method" },
    {
      key: "amount",
      title: "Amount Deposited",
      render: (row) => <span className="text-emerald-400 font-bold">₹{row.amount.toFixed(2)}</span>,
    },
    { key: "created_at", title: "Deposit Date", render: (row) => new Date(row.created_at).toLocaleString() },
    {
      key: "status",
      title: "Gateway Status",
      render: () => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Success
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left relative">
      {/* Loading Gateway Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="p-8 rounded-xl bg-bgCard border border-border text-center space-y-4 max-w-sm">
            <Loader2 size={48} className="animate-spin text-primary-light mx-auto" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Securing Razorpay Session</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Redirecting to encrypted payment vault. Please do not close or refresh this browser window.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.DASHBOARD.NAV_ADD_FUNDS}</h1>
        <p className="text-xs text-textSecondary">
          Deposit money into your SMM Panel wallet. Transactions are secured and processed instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Deposit panel */}
        <Card className="p-6 md:col-span-2 space-y-6">
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <form onSubmit={handleDeposit} className="space-y-5">
            {/* Method selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                {STRINGS.DASHBOARD.METHOD_SELECT_LABEL}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "razorpay", label: "Razorpay / Cards" },
                  { id: "upi", label: "UPI Auto-Pay" },
                  { id: "crypto", label: "USDT / Bitcoin" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`p-3 rounded-lg border text-xs font-bold transition-all duration-150 text-center cursor-pointer flex flex-col items-center gap-1.5 active:scale-98
                      ${
                        method === m.id
                          ? "border-primary bg-primary/10 text-white"
                          : "border-border bg-bgDark hover:border-textMuted text-textSecondary"
                      }
                    `}
                  >
                    <CreditCard size={16} className={method === m.id ? "text-primary-light" : "text-textMuted"} />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-2">
              <Input
                label={STRINGS.DASHBOARD.AMOUNT_LABEL}
                id="amount"
                type="number"
                placeholder={STRINGS.DASHBOARD.AMOUNT_PLACEHOLDER}
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={loading}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-bgDark border border-border text-textSecondary hover:text-white hover:border-textMuted transition-colors cursor-pointer"
                  >
                    +₹{val}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              loading={loading}
              icon={<Wallet size={16} />}
            >
              {STRINGS.DASHBOARD.PAY_NOW_BTN}
            </Button>
          </form>
        </Card>

        {/* Coupon & Info */}
        <div className="space-y-6 md:col-span-1">
          {/* Coupon Card */}
          <Card className="p-5 space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border pb-2">
              Promo Coupon Code
            </h4>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon (e.g. FREE50)"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="w-full bg-bgDark border border-border rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-textMuted outline-none focus:border-primary"
              />
              <Button type="submit" variant="secondary" size="sm">
                Apply
              </Button>
            </form>
          </Card>

          {/* Secure details */}
          <Card variant="bordered" className="p-5 border-dashed border-primary/20 bg-primary/5 text-xs text-textSecondary leading-relaxed space-y-2.5">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-primary-light" />
              Secure Checkout Guarantee
            </h4>
            <p>1. Payments are guarded under SSL standards. Card details are never stored on our servers.</p>
            <p>2. Razorpay provides absolute payment safety. Refund is credited instantly on failure.</p>
          </Card>
        </div>
      </div>

      {/* Recent Deposits logs */}
      <div className="space-y-3 pt-4">
        <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
          {STRINGS.DASHBOARD.PENDING_PAYMENTS_TITLE}
        </h4>
        <Card className="p-4 overflow-hidden">
          <Table
            columns={depositColumns}
            data={depositsOnly}
            loading={txLoading}
            emptyState={
              <div className="py-8 text-center text-xs text-textMuted">
                No deposit history logged. recharge your wallet to begin placing campaigns.
              </div>
            }
          />
        </Card>
      </div>
    </div>
  );
};
export default AddFundsPage;
