import React, { useState } from "react";
import { Users, DollarSign, Wallet, Gift, Sparkles, Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { syncUserBalance } from "../../store/slices/authSlice";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { CopyButton } from "../../components/common/CopyButton";
import { Table, type TableColumn } from "../../components/common/Table";
import { useToast } from "../../components/common/Toast";
import { STRINGS } from "../../constants/strings";
import { dbGet, dbSet, type MockUser, type MockTransaction } from "../../store/mockData";

interface ReferredUser {
  id: string;
  username: string;
  joined: string;
  commission: number;
}

export const AffiliatePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.auth);

  // Simulated Affiliate State
  const [commissionBalance, setCommissionBalance] = useState(250.00);
  const [totalEarned] = useState(480.00);
  const [totalReferred] = useState(6);
  const [loading, setLoading] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code || "REF1001"}`;

  const handleWithdraw = async () => {
    if (commissionBalance <= 0) {
      toast.error("You have no pending commission earnings to withdraw.");
      return;
    }

    if (!user) return;

    setLoading(true);
    // Simulate API request delay
    await new Promise((res) => setTimeout(res, 800));
    setLoading(false);

    // Read fresh user state
    const users = dbGet<MockUser[]>("smm_users");
    const uIdx = users.findIndex((u) => u.id === user.id);
    if (uIdx !== -1) {
      const addedBal = commissionBalance;
      const newBal = Number((users[uIdx].balance + addedBal).toFixed(2));
      users[uIdx].balance = newBal;
      dbSet("smm_users", users);

      // Create credit transaction
      const transactions = dbGet<MockTransaction[]>("smm_transactions");
      const newTx: MockTransaction = {
        id: `tx-${Math.floor(100 + Math.random() * 900)}`,
        user_id: user.id,
        type: "credit",
        amount: addedBal,
        balance_after: newBal,
        description: "Affiliate referral commission withdrawal",
        reference_id: "aff_withdraw",
        status: "success",
        created_at: new Date().toISOString(),
      };
      transactions.unshift(newTx);
      dbSet("smm_transactions", transactions);

      dispatch(syncUserBalance(newBal));
      setCommissionBalance(0.00);
      toast.success(`🎉 Withdrew ₹${addedBal.toFixed(2)} to your main wallet balance!`);
    } else {
      toast.error("User not found.");
    }
  };

  const referredUsers: ReferredUser[] = [
    { id: "1", username: "mark_growth", joined: "2026-05-12T10:00:00Z", commission: 120.50 },
    { id: "2", username: "agency_boost", joined: "2026-05-18T14:30:00Z", commission: 250.00 },
    { id: "3", username: "influencer_hq", joined: "2026-06-01T08:15:00Z", commission: 45.00 },
    { id: "4", username: "jess_social", joined: "2026-06-15T11:00:00Z", commission: 64.50 },
    { id: "5", username: "sam_seo", joined: "2026-06-20T22:00:00Z", commission: 0.00 },
    { id: "6", username: "david_clicks", joined: "2026-06-25T09:00:00Z", commission: 0.00 },
  ];

  const refColumns: TableColumn<ReferredUser>[] = [
    { key: "id", title: "ID", render: (row) => <span className="font-mono text-white">#{row.id}</span> },
    { key: "username", title: "Username", render: (row) => <span className="font-medium text-white">@{row.username}</span> },
    { key: "joined", title: "Joined Date", render: (row) => new Date(row.joined).toLocaleDateString() },
    {
      key: "commission",
      title: "Earned Commission",
      render: (row) => (
        <span className="text-emerald-400 font-bold">
          ₹{row.commission.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.DASHBOARD.NAV_AFFILIATE}</h1>
        <p className="text-xs text-textSecondary">
          Invite friends, influencers, or digital agencies and earn 5% recurring payouts on every wallet top-up they initiate.
        </p>
      </div>

      {/* Gift promo banner */}
      <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-info/5 flex items-start sm:items-center justify-between gap-4 overflow-hidden relative">
        <div className="absolute top-[-30px] right-[-30px] w-28 h-28 bg-info/20 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Gift size={16} className="text-pink-500 animate-bounce" />
            Share &amp; Earn recurring commissions!
          </h4>
          <p className="text-xs text-textSecondary max-w-xl leading-relaxed">
            Your referrals get a secure portal for high speed growth. You get a direct share of payments instantly credited to your wallet balance.
          </p>
        </div>
        <div className="p-3 bg-bgDark border border-border rounded-xl text-primary-light shrink-0">
          <Sparkles size={20} />
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="stat" className="p-4 flex items-center gap-3.5 border border-primary/20 bg-primary/5">
          <div className="p-2.5 rounded-lg bg-bgDark border border-border text-primary-light">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">
              {STRINGS.DASHBOARD.AFFILIATE_STATS_REFERRED}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">{totalReferred}</h3>
          </div>
        </Card>

        <Card variant="stat" className="p-4 flex items-center gap-3.5 border border-info/20 bg-info/5">
          <div className="p-2.5 rounded-lg bg-bgDark border border-border text-info">
            <DollarSign size={18} />
          </div>
          <div>
            <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">
              {STRINGS.DASHBOARD.AFFILIATE_STATS_EARNED}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">₹{totalEarned.toFixed(2)}</h3>
          </div>
        </Card>

        <Card variant="stat" className="p-4 flex items-center gap-3.5 border border-success/20 bg-success/5">
          <div className="p-2.5 rounded-lg bg-bgDark border border-border text-success">
            <Wallet size={18} />
          </div>
          <div>
            <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">
              {STRINGS.DASHBOARD.AFFILIATE_STATS_PENDING}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">₹{commissionBalance.toFixed(2)}</h3>
          </div>
        </Card>
      </div>

      {/* Referral Link & Withdraw box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Referral link box */}
        <Card className="p-6 md:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border pb-2">
            {STRINGS.DASHBOARD.REFERRAL_LINK_LABEL}
          </h3>
          <p className="text-xs text-textSecondary leading-relaxed">
            Distribute this referral link to invite resellers. Your tracking cookie is stored for 90 days.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 bg-bgDark border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-textMuted font-mono outline-none"
            />
            <CopyButton text={referralLink} label="Copy Referral Link" />
          </div>
        </Card>

        {/* Withdraw Panel */}
        <Card className="p-6 md:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border pb-2">
            Withdraw Commission
          </h3>
          <div className="space-y-1">
            <span className="text-xs text-textSecondary block">Withdrawable Balance</span>
            <span className="text-lg font-black text-white">₹{commissionBalance.toFixed(2)}</span>
          </div>

          <Button
            onClick={handleWithdraw}
            disabled={commissionBalance <= 0 || loading}
            loading={loading}
            className="w-full"
            icon={<Send size={12} />}
          >
            {STRINGS.DASHBOARD.WITHDRAW_COMMISSION_BTN}
          </Button>
        </Card>
      </div>

      {/* Referred Users Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider">Referred Signups Log</h4>
        <Card className="p-4 overflow-hidden">
          <Table
            columns={refColumns}
            data={referredUsers}
            emptyState={
              <div className="py-8 text-center text-xs text-textMuted">
                You have not referred any users yet. Share your referral link to begin earning commissions.
              </div>
            }
          />
        </Card>
      </div>
    </div>
  );
};
export default AffiliatePage;
