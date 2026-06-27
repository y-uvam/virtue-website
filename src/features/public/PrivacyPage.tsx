import React from "react";
import { Card } from "../../components/common/Card";

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 text-left space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-textSecondary">Last updated: June 2026</p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
            We collect information you provide directly to us when you create an account, modify your profile, make payments, place orders, or contact customer support. This includes your name, email, username, payment gateway metadata, and transaction reference numbers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. How We Use Information</h2>
          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
            - To manage and secure your account access credentials.
            <br />
            - To process and fulfill your social media marketing orders.
            <br />
            - To coordinate wallet balance updates and transactions.
            <br />
            - To respond to support tickets and customer service queries.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Third Party Disclosures</h2>
          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
            We do not sell or lease your personal information to third parties. We share data only with verified payment gateways (Razorpay, merchant UPI providers) to authorize your fund deposits, and automated social APIs to deliver your followers or likes requests.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Cookies &amp; Tracking</h2>
          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
            We use secure cookies to keep you logged into your dashboard across sessions, remember your preferences, and protect user workflows from cross-site request forgery attacks.
          </p>
        </section>
      </Card>
    </div>
  );
};
export default PrivacyPage;
