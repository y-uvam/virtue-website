import React, { useState } from "react";
import { Save } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { updateProfile } from "../../store/slices/authSlice";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Alert } from "../../components/common/Alert";
import { Avatar } from "../../components/common/Avatar";
import { useToast } from "../../components/common/Toast";
import { STRINGS } from "../../constants/strings";

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user, loading } = useAppSelector((state) => state.auth);

  // Profile Form States
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [infoError, setInfoError] = useState("");

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError("");

    if (!name.trim() || !username.trim()) {
      setInfoError("Full Name and Username are mandatory.");
      return;
    }

    const result = await dispatch(updateProfile({ name, email: user?.email ?? "", username }));
    if (updateProfile.fulfilled.match(result)) {
      toast.success("Profile information updated successfully!");
    } else {
      setInfoError(result.payload as string || "Failed to update profile.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      {/* <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.DASHBOARD.PROFILE_TITLE}</h1>
        <p className="text-xs text-textSecondary">
          Manage your account credentials and personal profile settings.
        </p>
      </div> */}


        <div className="space-y-6">
          {/* <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border pb-2.5">
            {STRINGS.DASHBOARD.PROFILE_TAB_INFO}
          </h3> */}
          {infoError && <Alert variant="error">{infoError}</Alert>}

          {/* Avatar visualizer */}
          <div className="flex items-center gap-4">
            <Avatar name={user?.name ?? "User"} size="lg" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Avatar Initials</h4>
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
              value={user?.email ?? ""}
              disabled={true}
              className="bg-bgDark/45 cursor-not-allowed opacity-75"
            />

            <Button type="submit" loading={loading} icon={<Save size={14} />}>
              Save Changes
            </Button>
          </form>
        </div>

    </div>
  );
};

export default ProfilePage;
