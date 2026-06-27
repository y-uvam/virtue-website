import React from "react";
import { Card } from "../../components/common/Card";

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 text-left space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-textSecondary">Last updated: June 2026</p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Introduction</h2>
          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
            Welcome to Virtue. By accessing or using our services, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before registering or purchasing services on our platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Service Usage</h2>
          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
            - Virtue is only to be used to promote your social media profiles (followers, likes, views, etc.).
            <br />
            - We do not guarantee that your new followers will interact with your posts or content. We only guarantee the numbers that you pay for.
            <br />
            - You agree not to upload any content that contains nudity, hate speech, or material that violates local legislation or platform rules.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Payment &amp; Refund Policy</h2>
          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
            - All payments are final. Once funds are deposited to your wallet, they cannot be refunded to your original payment method (bank account, cards, crypto wallets). They must be consumed on our services.
            <br />
            - If an order is failed, cancelled, or partial, the amount will be credited back to your Virtue wallet balance automatically.
            <br />
            - You agree that you will not initiate a chargeback or dispute against us for any transaction. Doing so will result in immediate termination of your account and cancellation of all past or active orders.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Drop and Refill Policy</h2>
          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
            - Social media platforms frequently run cleanups and updates which can result in follower drops.
            <br />
            - If you purchased a service with a "Refill" guarantee, you can request a top-up via support ticket or refill button within the specified warranty period.
            <br />
            - We do not offer refills for services explicitly marked as "No Refill".
          </p>
        </section>
      </Card>
    </div>
  );
};
export default TermsPage;
