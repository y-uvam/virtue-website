import React, { useState } from "react";
import { Send, AtSign, UploadCloud, Image as ImageIcon, X, HelpCircle, CheckCircle } from "lucide-react";
import { useAppSelector } from "../../store";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Alert } from "../../components/common/Alert";
import { useToast } from "../../components/common/Toast";
import { supabase } from "../../utils/supabase";
import { compressImage } from "../../utils/imageCompressor";

export const ContactUsPage: React.FC = () => {
  const toast = useToast();
  const { user } = useAppSelector((state) => state.auth);

  // Form state
  const [instagramUsername, setInstagramUsername] = useState("");
  const [description, setDescription] = useState("");
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  
  // UI UX state
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file.");
      return;
    }

    try {
      setCompressing(true);
      const compressed = await compressImage(file);
      setBase64Image(compressed);
      setImageName(file.name);
    } catch (err: any) {
      setErrorMsg("Failed to process the image. Please try another one.");
      console.error(err);
    } finally {
      setCompressing(false);
    }
  };

  const handleRemoveImage = () => {
    setBase64Image(null);
    setImageName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    if (!user) {
      setErrorMsg("You must be logged in to submit a request.");
      return;
    }

    if (!instagramUsername.trim()) {
      setErrorMsg("Please enter your Instagram username.");
      return;
    }

    if (!description.trim()) {
      setErrorMsg("Please describe your issue.");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("contact_requests").insert({
        user_id: user.id,
        description: description.trim(),
        instagram_username: instagramUsername.trim().replace(/^@/, ""), // Remove @ prefix if user added it
        image_url: base64Image, // Save the compressed base64 image data
      });

      if (error) throw error;

      toast.success("Contact request submitted successfully!");
      setSuccess(true);
      setDescription("");
      setInstagramUsername("");
      setBase64Image(null);
      setImageName(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to submit your request. Please try again.");
      toast.error("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">Contact Us / Issue Report</h1>
        <p className="text-xs text-textSecondary">
          Have an issue with your order, payment, or account? Get in touch directly with our administration team.
        </p>
      </div>

      <Alert variant="info" className="border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2">
          <AtSign size={16} className="text-primary-light shrink-0" />
          <span className="font-semibold text-white">Direct Support Channel:</span>
        </div>
        <p className="mt-1 text-xs text-textSecondary">
          Please provide a valid Instagram username. The admin will contact you if needed directly on the provided Instagram account.
        </p>
      </Alert>

      {success && (
        <Card className="p-6 border border-emerald-500/20 bg-emerald-500/5 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle size={28} />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Request Submitted Successfully</h3>
          <p className="text-xs text-textSecondary max-w-md mx-auto">
            Your support request and screenshot have been shared with the admin team. We will review your issue and reach out to you via your Instagram account if further information is needed.
          </p>
          <Button variant="outline" size="sm" onClick={() => setSuccess(false)}>
            Submit Another Request
          </Button>
        </Card>
      )}

      {!success && (
        <Card className="p-6 border border-border bg-bgCard/60 backdrop-blur-md">
          {errorMsg && (
            <Alert variant="error" className="mb-4">
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Instagram Username"
              id="instagram"
              placeholder="e.g. your.handle"
              value={instagramUsername}
              onChange={(e) => setInstagramUsername(e.target.value)}
              disabled={submitting}
              prefixIcon={<AtSign size={14} />}
              required
            />

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-textSecondary mb-1.5 uppercase tracking-wider">
                Issue Description
              </label>
              <textarea
                placeholder="Describe your issue or request in detail (e.g. transaction ID, order link, service details)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                className="w-full bg-bgDark border border-border rounded-lg p-3 text-sm text-textPrimary placeholder-textMuted h-32 outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 resize-none transition-all duration-200"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-textSecondary mb-1.5 uppercase tracking-wider">
                Screenshot / Image of Issue
              </label>

              {base64Image ? (
                <div className="relative border border-border rounded-lg p-3 bg-bgDark/40 flex items-center gap-3">
                  <div className="w-16 h-16 rounded overflow-hidden border border-border bg-black/40 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={base64Image}
                      alt="Upload Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{imageName}</p>
                    <p className="text-[10px] text-textMuted uppercase mt-0.5">Compressed Image Ready</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-full hover:bg-white/5 text-textMuted hover:text-danger transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="border border-dashed border-border hover:border-primary/50 hover:bg-white/[0.01] rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={submitting || compressing}
                  />
                  {compressing ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                      <span className="text-xs text-textMuted font-medium">Processing image...</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={28} className="text-textMuted" />
                      <div className="text-center">
                        <span className="text-xs text-primary-light font-semibold hover:underline">
                          Click to upload
                        </span>
                        <span className="text-xs text-textMuted"> or drag and drop</span>
                      </div>
                      <span className="text-[10px] text-textMuted">PNG, JPG, JPEG up to 10MB (will be auto-compressed)</span>
                    </>
                  )}
                </label>
              )}
            </div>

            <Button
              type="submit"
              className="w-full justify-center"
              loading={submitting}
              icon={<Send size={14} />}
            >
              Submit Issue to Admin
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ContactUsPage;
