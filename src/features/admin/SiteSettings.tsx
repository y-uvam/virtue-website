import React, { useState } from "react";
import { Save, Globe, DollarSign, Mail, Zap, Bell } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { Alert } from "../../components/common/Alert";
import { useToast } from "../../components/common/Toast";
import { STRINGS } from "../../constants/strings";

interface SettingSection {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const SectionHeader: React.FC<SettingSection> = ({ icon, title, description, color }) => (
  <div className="flex items-start gap-3 pb-4 border-b border-border mb-4">
    <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
    <div>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <p className="text-xs text-textMuted mt-0.5">{description}</p>
    </div>
  </div>
);

export const SiteSettings: React.FC = () => {
  const toast = useToast();

  // General Settings
  const [siteName, setSiteName] = useState("Virtue");
  const [siteTagline, setSiteTagline] = useState("Grow Smarter. Grow Faster.");
  const [supportEmail, setSupportEmail] = useState("support@virtue.com");
  const [maintenanceMode, setMaintenanceMode] = useState("disabled");
  const [newUserBonus, setNewUserBonus] = useState("0");
  const [referralBonus, setReferralBonus] = useState("50");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [defaultCurrency, setDefaultCurrency] = useState("INR");

  // Min / Max Top-up
  const [minTopup, setMinTopup] = useState("50");
  const [maxTopup, setMaxTopup] = useState("100000");

  // Withdrawal
  const [minWithdrawal, setMinWithdrawal] = useState("100");
  const [maxWithdrawal, setMaxWithdrawal] = useState("50000");
  const [withdrawalFee, setWithdrawalFee] = useState("2");

  // Email / Notifications
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("noreply@smmpanel.pro");
  const [smtpPassword, setSmtpPassword] = useState("••••••••••••");

  // API Settings
  const [apiRateLimit, setApiRateLimit] = useState("60");
  const [apiEnabled, setApiEnabled] = useState("enabled");
  const [apiTokenExpiry, setApiTokenExpiry] = useState("30");

  // Ref rates
  const [refTier1, setRefTier1] = useState("3");
  const [refTier2, setRefTier2] = useState("1");

  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingBilling, setSavingBilling] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [savingApi, setSavingApi] = useState(false);
  const [savingAffiliate, setSavingAffiliate] = useState(false);

  const simulateSave = async (setter: (v: boolean) => void, section: string) => {
    setter(true);
    await new Promise((r) => setTimeout(r, 1100));
    setter(false);
    toast.success(`${section} settings saved successfully.`);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.ADMIN.NAV_SITE_SETTINGS}</h1>
        <p className="text-xs text-textSecondary">
          Configure global platform behavior, payment limits, email notifications, and API settings.
        </p>
      </div>

      {/* General Settings */}
      <Card className="p-6 space-y-4">
        <SectionHeader
          icon={<Globe size={16} className="text-indigo-400" />}
          title="General Platform Settings"
          description="Core identity and global platform configuration."
          color="bg-indigo-500/10"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Site Name" id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          <Input label="Tagline" id="siteTagline" value={siteTagline} onChange={(e) => setSiteTagline(e.target.value)} />
          <Input label="Support Email" id="supportEmail" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />

          <Select
            label="Maintenance Mode"
            options={[
              { value: "disabled", label: "Disabled (Live)" },
              { value: "enabled", label: "Enabled (Maintenance)" },
              { value: "partial", label: "Partial (Admins Only)" },
            ]}
            value={maintenanceMode}
            onChange={(v) => setMaintenanceMode(String(v))}
          />

          <Select
            label="Default Timezone"
            options={[
              { value: "Asia/Kolkata", label: "Asia/Kolkata (IST, UTC+5:30)" },
              { value: "America/New_York", label: "America/New York (EST)" },
              { value: "Europe/London", label: "Europe/London (GMT)" },
              { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
            ]}
            value={timezone}
            onChange={(v) => setTimezone(String(v))}
          />

          <Select
            label="Default Currency"
            options={[
              { value: "INR", label: "INR — Indian Rupee (₹)" },
              { value: "USD", label: "USD — US Dollar ($)" },
              { value: "EUR", label: "EUR — Euro (€)" },
              { value: "GBP", label: "GBP — British Pound (£)" },
            ]}
            value={defaultCurrency}
            onChange={(v) => setDefaultCurrency(String(v))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
          <Input label="New User Bonus Balance (₹)" id="newUserBonus" type="number" value={newUserBonus} onChange={(e) => setNewUserBonus(e.target.value)} />
          <Input label="Referral Signup Bonus (₹)" id="referralBonus" type="number" value={referralBonus} onChange={(e) => setReferralBonus(e.target.value)} />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => simulateSave(setSavingGeneral, "General")}
          loading={savingGeneral}
          icon={<Save size={13} />}
        >
          Save General Settings
        </Button>
      </Card>

      {/* Billing Settings */}
      <Card className="p-6 space-y-4">
        <SectionHeader
          icon={<DollarSign size={16} className="text-emerald-400" />}
          title="Billing & Transaction Limits"
          description="Set minimum/maximum deposit and withdrawal amounts."
          color="bg-emerald-500/10"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Min Top-up (₹)" id="minTopup" type="number" value={minTopup} onChange={(e) => setMinTopup(e.target.value)} />
          <Input label="Max Top-up (₹)" id="maxTopup" type="number" value={maxTopup} onChange={(e) => setMaxTopup(e.target.value)} />
          <Input label="Withdrawal Fee (%)" id="withdrawalFee" type="number" value={withdrawalFee} onChange={(e) => setWithdrawalFee(e.target.value)} />
          <Input label="Min Withdrawal (₹)" id="minWithdrawal" type="number" value={minWithdrawal} onChange={(e) => setMinWithdrawal(e.target.value)} />
          <Input label="Max Withdrawal (₹)" id="maxWithdrawal" type="number" value={maxWithdrawal} onChange={(e) => setMaxWithdrawal(e.target.value)} />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => simulateSave(setSavingBilling, "Billing")}
          loading={savingBilling}
          icon={<Save size={13} />}
        >
          Save Billing Settings
        </Button>
      </Card>

      {/* Email / SMTP */}
      <Card className="p-6 space-y-4">
        <SectionHeader
          icon={<Mail size={16} className="text-sky-400" />}
          title="Email & SMTP Configuration"
          description="Configure outgoing email for notifications, OTPs, and password resets."
          color="bg-sky-500/10"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="SMTP Host" id="smtpHost" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
          <Input label="SMTP Port" id="smtpPort" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
          <Input label="SMTP Username" id="smtpUser" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
          <Input label="SMTP Password" id="smtpPassword" type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => simulateSave(setSavingSmtp, "SMTP")}
          loading={savingSmtp}
          icon={<Save size={13} />}
        >
          Save SMTP Settings
        </Button>
      </Card>

      {/* API Settings */}
      <Card className="p-6 space-y-4">
        <SectionHeader
          icon={<Zap size={16} className="text-purple-400" />}
          title="Public API Settings"
          description="Manage API access for third-party resellers integrating via your panel API."
          color="bg-purple-500/10"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="API Access"
            options={[
              { value: "enabled", label: "Enabled (Resellers)" },
              { value: "disabled", label: "Disabled" },
            ]}
            value={apiEnabled}
            onChange={(v) => setApiEnabled(String(v))}
          />
          <Input label="Rate Limit (req/min)" id="apiRateLimit" type="number" value={apiRateLimit} onChange={(e) => setApiRateLimit(e.target.value)} />
          <Input label="Token Expiry (days)" id="apiTokenExpiry" type="number" value={apiTokenExpiry} onChange={(e) => setApiTokenExpiry(e.target.value)} />
        </div>

        <Alert variant="info">
          API keys are generated per user on the API Access page. They inherit the rate limit defined here.
        </Alert>

        <Button
          variant="primary"
          size="sm"
          onClick={() => simulateSave(setSavingApi, "API")}
          loading={savingApi}
          icon={<Save size={13} />}
        >
          Save API Settings
        </Button>
      </Card>

      {/* Affiliate */}
      <Card className="p-6 space-y-4">
        <SectionHeader
          icon={<Bell size={16} className="text-amber-400" />}
          title="Affiliate & Referral Program"
          description="Configure commission rates for multi-level referral rewards."
          color="bg-amber-500/10"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Tier 1 Commission (%)" id="refTier1" type="number" value={refTier1} onChange={(e) => setRefTier1(e.target.value)} />
          <Input label="Tier 2 Commission (%)" id="refTier2" type="number" value={refTier2} onChange={(e) => setRefTier2(e.target.value)} />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => simulateSave(setSavingAffiliate, "Affiliate")}
          loading={savingAffiliate}
          icon={<Save size={13} />}
        >
          Save Affiliate Settings
        </Button>
      </Card>
    </div>
  );
};
export default SiteSettings;
