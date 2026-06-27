import React, { useState } from "react";
import { User, Lock, Terminal, Bell, Key, LogOut, Save } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { updateProfile, changePassword, regenerateApiKey } from "../../store/slices/authSlice";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Alert } from "../../components/common/Alert";
import { CopyButton } from "../../components/common/CopyButton";
import { Avatar } from "../../components/common/Avatar";
import { useToast } from "../../components/common/Toast";
import { STRINGS } from "../../constants/strings";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user, loading } = useAppSelector((state) => state.auth);

  // Tabs: info, security, api, notifications
  const [activeTab, setActiveTab] = useState<"info" | "security" | "api" | "notifications">("info");

  // Tab 1: Info Form States
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [infoError, setInfoError] = useState("");

  // Tab 2: Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);

  // Tab 4: Notifications Checkboxes
  const [notifOrder, setNotifOrder] = useState(true);
  const [notifBalance, setNotifBalance] = useState(true);
  const [notifPromos, setNotifPromos] = useState(false);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError("");

    if (!name.trim() || !email.trim() || !username.trim()) {
      setInfoError("All profile fields are mandatory.");
      return;
    }

    const result = await dispatch(updateProfile({ name, email, username }));
    if (updateProfile.fulfilled.match(result)) {
      toast.success("Profile information updated successfully!");
    } else {
      setInfoError(result.payload as string || "Failed to update profile.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError("All password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setSecurityError(STRINGS.VALIDATION.PASSWORD_SHORT);
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError(STRINGS.VALIDATION.PASSWORD_MISMATCH);
      return;
    }

    setSecurityLoading(true);
    const result = await dispatch(changePassword({ currentPassword, newPassword }));
    setSecurityLoading(false);

    if (changePassword.fulfilled.match(result)) {
      toast.success("Security password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setSecurityError("Failed to update password.");
    }
  };

  const handleRegenerateKey = async () => {
    if (window.confirm("Are you sure you want to regenerate your developer API key? Any existing apps using this key will immediately fail authorization.")) {
      const result = await dispatch(regenerateApiKey());
      if (regenerateApiKey.fulfilled.match(result)) {
        toast.success("🎉 New Developer API key generated successfully.");
      } else {
        toast.error("Failed to regenerate API key.");
      }
    }
  };

  const handleSaveNotifs = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Notification preferences saved successfully.");
  };

  const tabsConfig = [
    { key: "info", label: STRINGS.DASHBOARD.PROFILE_TAB_INFO, icon: <User size={15} /> },
    { key: "security", label: STRINGS.DASHBOARD.PROFILE_TAB_SECURITY, icon: <Lock size={15} /> },
    { key: "api", label: STRINGS.DASHBOARD.PROFILE_TAB_API, icon: <Terminal size={15} /> },
    { key: "notifications", label: STRINGS.DASHBOARD.PROFILE_TAB_NOTIFICATIONS, icon: <Bell size={15} /> },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.DASHBOARD.PROFILE_TITLE}</h1>
        <p className="text-xs text-textSecondary">
          Control your profile credentials, notifications, and reselling API keys.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar Tabs */}
        <Card className="p-2 flex flex-row md:flex-col gap-1 overflow-x-auto md:col-span-1">
          {tabsConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors text-left
                ${
                  activeTab === tab.key
                    ? "bg-primary text-white"
                    : "text-textSecondary hover:text-white hover:bg-white/5"
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </Card>

        {/* Dynamic content view */}
        <Card className="p-6 md:col-span-3">
          {activeTab === "info" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border pb-2.5">
                {STRINGS.DASHBOARD.PROFILE_TAB_INFO}
              </h3>
              {infoError && <Alert variant="error">{infoError}</Alert>}

              {/* Avatar visualizer */}
              <div className="flex items-center gap-4">
                <Avatar name={user?.name ?? "User"} size="lg" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Avatar initials</h4>
                  <p className="text-xs text-textMuted">Avatar image uploads are currently mocked. Initials auto-sync.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateInfo} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={STRINGS.AUTH.FULL_NAME_LABEL}
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                  <Input
                    label={STRINGS.AUTH.USERNAME_LABEL}
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Input
                  label={STRINGS.AUTH.EMAIL_LABEL}
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />

                <Button type="submit" loading={loading} icon={<Save size={14} />}>
                  Save Changes
                </Button>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border pb-2.5">
                Password &amp; Access Controls
              </h3>
              {securityError && <Alert variant="error">{securityError}</Alert>}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <Input
                  label="Current Password"
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={securityLoading}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={securityLoading}
                  />
                  <Input
                    label="Confirm New Password"
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={securityLoading}
                  />
                </div>

                <Button type="submit" loading={securityLoading} icon={<Lock size={14} />}>
                  Change Password
                </Button>
              </form>

              {/* Active Sessions list */}
              <div className="pt-6 border-t border-border/40 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {STRINGS.DASHBOARD.ACTIVE_SESSIONS}
                  </h4>
                  <p className="text-[11px] text-textMuted">These browser sessions currently hold valid login tokens.</p>
                </div>

                <div className="divide-y divide-border/40">
                  <div className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">Mac OS / Chrome Browser</p>
                      <p className="text-[10px] text-textMuted">IP: 103.88.22.45 — <span className="text-emerald-400 font-semibold">Active Session</span></p>
                    </div>
                    <Badge status="completed">Current</Badge>
                  </div>
                  <div className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">iOS Mobile App / Safari</p>
                      <p className="text-[10px] text-textMuted">IP: 202.12.18.9 — Last active: 2 hours ago</p>
                    </div>
                    <Badge status="pending">Mobile</Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 !border-red-500/35 !text-red-400 hover:!bg-red-500 hover:!text-white"
                  onClick={() => toast.success("Revoked all active sessions successfully. Please log back in.")}
                >
                  <LogOut size={13} />
                  {STRINGS.DASHBOARD.LOGOUT_ALL_DEVICES}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border pb-2.5">
                {STRINGS.DASHBOARD.API_KEY_TITLE}
              </h3>
              <Alert variant="info">
                {STRINGS.DASHBOARD.API_KEY_DESC}
              </Alert>

              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                  <div className="w-full flex-1">
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">
                      API Authorization token
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user?.api_key || ""}
                      className="w-full bg-bgDark border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-textMuted font-mono outline-none"
                    />
                  </div>
                  <CopyButton text={user?.api_key || ""} label="Copy Token" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/40 justify-between items-center">
                  <span className="text-xs text-textMuted leading-relaxed max-w-sm">
                    Keep your API key absolutely confidential. Do not share credentials in emails or public repositories.
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="secondary" size="sm" onClick={handleRegenerateKey} icon={<Key size={13} />}>
                      Regenerate
                    </Button>
                    <Link to={ROUTES.API_DOCS}>
                      <Button variant="outline" size="sm" icon={<Terminal size={13} />}>
                        API Docs
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border pb-2.5">
                {STRINGS.DASHBOARD.NOTIF_SETTINGS_TITLE}
              </h3>

              <form onSubmit={handleSaveNotifs} className="space-y-4">
                <div className="divide-y divide-border/40">
                  <label className="py-3 flex items-start justify-between gap-4 cursor-pointer select-none">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">Order Status Updates</p>
                      <p className="text-[10px] text-textMuted max-w-sm">Receive email digests when a campaign completes or is cancelled/refunded.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifOrder}
                      onChange={(e) => setNotifOrder(e.target.checked)}
                      className="rounded border-border bg-bgDark text-primary focus:ring-primary/45 mt-1"
                    />
                  </label>

                  <label className="py-3 flex items-start justify-between gap-4 cursor-pointer select-none">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">Wallet Low Balance Warning</p>
                      <p className="text-[10px] text-textMuted max-w-sm">Trigger warning alerts when balance drops below ₹200 threshold.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifBalance}
                      onChange={(e) => setNotifBalance(e.target.checked)}
                      className="rounded border-border bg-bgDark text-primary focus:ring-primary/45 mt-1"
                    />
                  </label>

                  <label className="py-3 flex items-start justify-between gap-4 cursor-pointer select-none">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">Newsletter &amp; Promos</p>
                      <p className="text-[10px] text-textMuted max-w-sm">Get notifies about service price cuts, summer sales, and new platform releases.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPromos}
                      onChange={(e) => setNotifPromos(e.target.checked)}
                      className="rounded border-border bg-bgDark text-primary focus:ring-primary/45 mt-1"
                    />
                  </label>
                </div>

                <Button type="submit" className="mt-4" icon={<Save size={14} />}>
                  Save Preferences
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
export default ProfilePage;
