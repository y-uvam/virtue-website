import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  TrendingUp,
  Award,
  Users,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Star,
  Activity,
  Heart,
} from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { PlatformIcon } from "../../components/common/PlatformIcon";
import { Table, type TableColumn } from "../../components/common/Table";

interface PreviewService {
  id: string;
  platform: string;
  name: string;
  rate: number;
  min: number;
  max: number;
}

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = [
    { value: "4.8M+", label: STRINGS.LANDING.STATS_ORDERS, icon: <TrendingUp className="text-primary-light" size={24} /> },
    { value: "180K+", label: STRINGS.LANDING.STATS_USERS, icon: <Users className="text-info" size={24} /> },
    { value: "850+", label: STRINGS.LANDING.STATS_SERVICES, icon: <Zap className="text-secondary" size={24} /> },
    { value: "99.9%", label: STRINGS.LANDING.STATS_UPTIME, icon: <Activity className="text-success" size={24} /> },
  ];

  const steps = [
    { number: "01", title: STRINGS.LANDING.HOW_STEP_1_TITLE, desc: STRINGS.LANDING.HOW_STEP_1_DESC },
    { number: "02", title: STRINGS.LANDING.HOW_STEP_2_TITLE, desc: STRINGS.LANDING.HOW_STEP_2_DESC },
    { number: "03", title: STRINGS.LANDING.HOW_STEP_3_TITLE, desc: STRINGS.LANDING.HOW_STEP_3_DESC },
    { number: "04", title: STRINGS.LANDING.HOW_STEP_4_TITLE, desc: STRINGS.LANDING.HOW_STEP_4_DESC },
  ];

  const platforms = [
    { name: "Instagram", services: "120 Services", icon: "instagram" },
    { name: "YouTube", services: "95 Services", icon: "youtube" },
  ];

  const previewServices: PreviewService[] = [
    { id: "1", platform: "Instagram", name: "Instagram Followers [High Quality / Real / Instant]", rate: 120.00, min: 100, max: 50000 },
    { id: "2", platform: "Instagram", name: "Instagram Likes [Super Fast / Safe]", rate: 45.00, min: 50, max: 25000 },
    { id: "3", platform: "YouTube", name: "YouTube Subscribers [Non-Drop / Lifetime Refill]", rate: 1450.00, min: 50, max: 10000 },
    { id: "4", platform: "YouTube", name: "YouTube Organic High Retention Views", rate: 220.00, min: 1000, max: 500000 },
  ];

  const previewColumns: TableColumn<PreviewService>[] = [
    {
      key: "platform",
      title: "Platform",
      render: (row) => (
        <span className="flex items-center gap-2 font-medium text-white">
          <PlatformIcon platform={row.platform} size={16} />
          {row.platform}
        </span>
      ),
    },
    { key: "name", title: "Service Name", className: "whitespace-normal max-w-xs" },
    {
      key: "rate",
      title: `Rate Per 1K (${STRINGS.APP.CURRENCY_SYMBOL})`,
      render: (row) => <span className="font-bold text-primary-light">₹{row.rate.toFixed(2)}</span>,
    },
    { key: "min", title: "Min Qty" },
    { key: "max", title: "Max Qty" },
  ];

  const features = [
    { title: STRINGS.LANDING.FEAT_DELIVERY_TITLE, desc: STRINGS.LANDING.FEAT_DELIVERY_DESC, icon: <Clock size={20} className="text-primary-light" /> },
    { title: STRINGS.LANDING.FEAT_SUPPORT_TITLE, desc: STRINGS.LANDING.FEAT_SUPPORT_DESC, icon: <Users size={20} className="text-info" /> },
    { title: STRINGS.LANDING.FEAT_PRICING_TITLE, desc: STRINGS.LANDING.FEAT_PRICING_DESC, icon: <Award size={20} className="text-secondary" /> },
    { title: STRINGS.LANDING.FEAT_SECURE_TITLE, desc: STRINGS.LANDING.FEAT_SECURE_DESC, icon: <ShieldCheck size={20} className="text-success" /> },
    { title: STRINGS.LANDING.FEAT_REFILL_TITLE, desc: STRINGS.LANDING.FEAT_REFILL_DESC, icon: <Heart size={20} className="text-pink-500" /> },
  ];

  const testimonials = [
    { name: "Sarah Jenkins", role: "Digital Agency Director", text: "Best social growth platform by far! Order starts within minutes and customer support is incredibly responsive. Saved our client campaigns multiple times.", rating: 5 },
    { name: "David K.", role: "Social Media Influencer", text: "Extremely cheap rates and the views are very stable. The refill works flawlessly. My go-to platform for video boosts.", rating: 5 },
    { name: "Rahul Sharma", role: "Content Creator", text: "Our YouTube subscriber count and watch hours spiked within days of launching our campaign. Outstanding service quality and speed!", rating: 5 },
  ];

  const faqs = [
    { q: "What is an SMM Panel?", a: "An SMM (Social Media Marketing) Panel is an online store that sells social media growth services such as followers, likes, views, comments, and subscribers to help boost your online presence." },
    { q: "Are these services safe for my accounts?", a: "Yes, our methods are fully compliant with social media guidelines and we slowly drip-feed services when necessary to keep your accounts completely safe and free from flag risks." },
    { q: "How long does delivery take?", a: "Most services trigger instantly or within 10-30 minutes. Average completion speed is listed under each service description in the dashboard." },
    { q: "What is the 30-day drop refill guarantee?", a: "In case you notice any drops in followers or likes within 30 days of purchase, you can trigger a free refill request in the dashboard, and our systems will top it up to the ordered count." },
  ];

  return (
    <div className="space-y-24 py-10">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-16 pb-6 relative overflow-hidden">
        {/* Creative Glow Meshes */}
        <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-4 right-1/4 w-[300px] h-[300px] bg-secondary/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary shadow-sm relative z-10">
          <Zap size={12} className="animate-pulse text-secondary" />
          {STRINGS.APP.TAGLINE}
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-textPrimary relative z-10">
          Boost Your <span className="bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent">Social Media</span> Presence Today
        </h1>
        
        <p className="text-sm sm:text-base text-textSecondary leading-relaxed max-w-2xl mx-auto relative z-10 font-medium">
          {STRINGS.LANDING.HERO_SUBTITLE}
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 relative z-10">
          <Link to={ROUTES.REGISTER}>
            <Button size="lg" variant="primary" className="shadow-primary/20">
              {STRINGS.LANDING.CTA_GET_STARTED}
            </Button>
          </Link>
          <Link to={ROUTES.LOGIN}>
            <Button size="lg" variant="secondary">
              {STRINGS.LANDING.CTA_SERVICES}
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} variant="stat" className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-bgDark border border-border">
              {stat.icon}
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white">{stat.value}</h3>
              <p className="text-xs text-textSecondary font-semibold uppercase tracking-wider">{stat.label}</p>
            </div>
          </Card>
        ))}
      </section>

      {/* How It Works */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">{STRINGS.LANDING.HOW_IT_WORKS}</h2>
          <p className="text-xs sm:text-sm text-textSecondary max-w-md mx-auto">{STRINGS.LANDING.HOW_IT_WORKS_SUBTITLE}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <Card key={idx} className="p-6 relative overflow-hidden group">
              <div className="absolute top-[-20px] right-[-10px] text-7xl font-extrabold text-white/[0.02] group-hover:text-primary/[0.05] transition-colors select-none font-mono">
                {step.number}
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 text-primary-light flex items-center justify-center font-bold font-mono mb-4 text-sm">
                {step.number}
              </div>
              <h4 className="text-base font-bold text-white mb-2">{step.title}</h4>
              <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Platforms Grid */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">{STRINGS.LANDING.PLATFORMS_TITLE}</h2>
          <p className="text-xs sm:text-sm text-textSecondary max-w-md mx-auto">{STRINGS.LANDING.PLATFORMS_SUBTITLE}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {platforms.map((plat, idx) => (
            <Card key={idx} variant="bordered" className="p-5 flex flex-col items-center justify-center text-center gap-3 glass-hover hover:scale-[1.02] cursor-pointer">
              <PlatformIcon platform={plat.icon} size={28} />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">{plat.name}</h4>
                <span className="text-[10px] text-textMuted font-semibold uppercase mt-0.5 block">{plat.services}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Services Preview Table */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">{STRINGS.LANDING.SERVICES_PREVIEW_TITLE}</h2>
          <p className="text-xs sm:text-sm text-textSecondary max-w-md mx-auto">{STRINGS.LANDING.SERVICES_PREVIEW_SUBTITLE}</p>
        </div>
        <Table columns={previewColumns} data={previewServices} />
      </section>

      {/* Features Grid */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">{STRINGS.LANDING.FEATURES_TITLE}</h2>
          <p className="text-xs sm:text-sm text-textSecondary max-w-md mx-auto">{STRINGS.LANDING.FEATURES_SUBTITLE}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <Card key={idx} className="p-6 flex gap-4">
              <div className="p-2.5 rounded-xl bg-bgDark border border-border shrink-0 self-start">
                {feat.icon}
              </div>
              <div className="space-y-1 text-left">
                <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">{feat.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">{STRINGS.LANDING.TESTIMONIALS_TITLE}</h2>
          <p className="text-xs sm:text-sm text-textSecondary max-w-md mx-auto">{STRINGS.LANDING.TESTIMONIALS_SUBTITLE}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <Card key={idx} className="p-6 space-y-4 text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-textSecondary leading-relaxed italic">
                  "{test.text}"
                </p>
              </div>
              <div className="pt-4 border-t border-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                  {test.name[0]}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">{test.name}</h5>
                  <span className="text-[10px] text-textMuted font-medium">{test.role}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">{STRINGS.LANDING.FAQ_TITLE}</h2>
          <p className="text-xs sm:text-sm text-textSecondary max-w-md mx-auto">{STRINGS.LANDING.FAQ_SUBTITLE}</p>
        </div>
        <div className="space-y-4 text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <Card
                key={idx}
                variant="bordered"
                className="overflow-hidden cursor-pointer"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div className="p-5 flex items-center justify-between gap-4 select-none">
                  <h4 className="text-xs sm:text-sm font-bold text-white">{faq.q}</h4>
                  {isOpen ? <ChevronUp size={16} className="text-textMuted shrink-0" /> : <ChevronDown size={16} className="text-textMuted shrink-0" />}
                </div>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-textSecondary leading-relaxed border-t border-border/20 bg-bgDark/10 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
