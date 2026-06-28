// SMM Panel Mock Database & Persistence Layer using localStorage

export interface MockUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "user" | "admin";
  isAdmin?: boolean;
  balance: number;
  api_key: string;
  referral_code: string;
  referred_by?: string;
  email_verified: boolean;
  status: "active" | "banned";
  created_at: string;
}

export interface MockCategory {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  status: "active" | "inactive";
}

export interface MockService {
  id: string;
  category_id: string;
  name: string;
  description: string;
  rate: number; // rate per 1000
  min_qty: number;
  max_qty: number;
  avg_time: string;
  refill_available: boolean;
  status: "active" | "inactive";
  provider?: string;
}

export interface MockOrder {
  id: string;
  user_id: string;
  service_id: string;
  link: string;
  quantity: number;
  start_count: number;
  remains: number;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "partial" | "refunded";
  price: number;
  created_at: string;
  updated_at: string;
}

export interface MockTransaction {
  id: string;
  user_id: string;
  type: "credit" | "debit";
  amount: number;
  balance_after: number;
  description: string;
  reference_id: string;
  status: "success" | "pending" | "failed";
  created_at: string;
}

export interface MockTicketMessage {
  id: string;
  ticket_id: string;
  sender_type: "user" | "admin";
  sender_name: string;
  message: string;
  attachment_url?: string;
  created_at: string;
}

export interface MockTicket {
  id: string;
  user_id: string;
  subject: string;
  category: "order_issue" | "payment" | "general";
  status: "open" | "replied" | "closed";
  created_at: string;
  last_updated: string;
  messages: MockTicketMessage[];
}

export interface MockSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  whatsappLink: string;
  maintenanceMode: boolean;
  minOrderAmount: number;
  registrationOpen: boolean;
  announcementBanner: string;
  lowBalanceThreshold: number;
}

// Initial default mock data definitions
const INITIAL_USERS: MockUser[] = [
  {
    id: "u-1",
    name: "John Doe",
    email: "user@smm.com",
    username: "johndoe",
    role: "user",
    balance: 1450.50,
    api_key: "smm_live_4a717d0df44244b0b514e",
    referral_code: "REF1001",
    email_verified: true,
    status: "active",
    created_at: "2026-01-10T12:00:00Z",
  },
  {
    id: "u-admin",
    name: "Administrator",
    email: "admin@smm.com",
    username: "admin",
    role: "admin",
    balance: 99999.00,
    api_key: "smm_admin_sec_b514e56476165",
    referral_code: "REFADMIN",
    email_verified: true,
    status: "active",
    created_at: "2026-01-01T00:00:00Z",
  },
];

const INITIAL_CATEGORIES: MockCategory[] = [
  { id: "cat-ig-trending", name: "Instagram - Trending Services", icon: "instagram", sort_order: 1, status: "active" },
  { id: "cat-ig-reel-views", name: "Instagram - Reel Views", icon: "instagram", sort_order: 2, status: "active" },
  { id: "cat-ig-post-views", name: "Instagram - Post Views", icon: "instagram", sort_order: 3, status: "active" },
  { id: "cat-ig-followers", name: "Instagram - Followers", icon: "instagram", sort_order: 4, status: "active" },
  { id: "cat-ig-likes", name: "Instagram - Likes", icon: "instagram", sort_order: 5, status: "active" },
  { id: "cat-ig-comments", name: "Instagram - Comments", icon: "instagram", sort_order: 6, status: "active" },
  { id: "cat-ig-shares", name: "Instagram - Shares", icon: "instagram", sort_order: 7, status: "active" },
  { id: "cat-ig-saves", name: "Instagram - Saves", icon: "instagram", sort_order: 8, status: "active" },
  { id: "cat-ig-reposts", name: "Instagram - Reposts", icon: "instagram", sort_order: 9, status: "active" },
  { id: "cat-yt", name: "YouTube Traffic", icon: "youtube", sort_order: 10, status: "active" },
];

const INITIAL_SERVICES: MockService[] = [
  // Instagram Services
  {
    id: "1",
    category_id: "cat-ig-reel-views",
    name: "Instagram Reel Views - Used By Influencers",
    description: "High quality Instagram Reel views. Used by popular influencers.",
    rate: 0.53,
    min_qty: 100,
    max_qty: 2147483647,
    avg_time: "5 minutes",
    refill_available: true,
    status: "active",
  },
  {
    id: "19",
    category_id: "cat-ig-reel-views",
    name: "Instagram Reel Views - Used By Celebrities",
    description: "Celebrity level Instagram Reel views. Fast delivery.",
    rate: 0.61,
    min_qty: 100,
    max_qty: 2147483647,
    avg_time: "5 minutes",
    refill_available: true,
    status: "active",
  },
  {
    id: "24",
    category_id: "cat-ig-reel-views",
    name: "Indian Reel Views - Used By Celebrities",
    description: "Indian organic Reel views. Used by celebrities.",
    rate: 1.67,
    min_qty: 100,
    max_qty: 2147483647,
    avg_time: "10 minutes",
    refill_available: true,
    status: "active",
  },
  {
    id: "3",
    category_id: "cat-ig-likes",
    name: "Instagram Likes - Used By Influencers",
    description: "High quality Instagram Likes. Used by popular influencers.",
    rate: 26.04,
    min_qty: 100,
    max_qty: 2147483647,
    avg_time: "5 minutes",
    refill_available: true,
    status: "active",
  },
  {
    id: "20",
    category_id: "cat-ig-likes",
    name: "Instagram Likes - Used By Celebrities",
    description: "Celebrity level Instagram Likes. Instant delivery.",
    rate: 39.89,
    min_qty: 100,
    max_qty: 2147483647,
    avg_time: "5 minutes",
    refill_available: true,
    status: "active",
  },
  {
    id: "11",
    category_id: "cat-ig-likes",
    name: "Instagram Indian Likes - Used By Celebrities",
    description: "Indian organic Likes. Used by celebrities.",
    rate: 59.03,
    min_qty: 100,
    max_qty: 2147483647,
    avg_time: "10 minutes",
    refill_available: true,
    status: "active",
  },
  {
    id: "27",
    category_id: "cat-ig-comments",
    name: "Instagram Indian Comments - Used By Celebrities",
    description: "Indian organic Comments. Used by celebrities.",
    rate: 128.56,
    min_qty: 100,
    max_qty: 2147483647,
    avg_time: "15 minutes",
    refill_available: true,
    status: "active",
  },
  {
    id: "4",
    category_id: "cat-ig-followers",
    name: "Instagram Premium Followers - Used By Celebrities",
    description: "Premium level Instagram Followers. Used by celebrities.",
    rate: 148.47,
    min_qty: 100,
    max_qty: 2147483647,
    avg_time: "15 minutes",
    refill_available: true,
    status: "active",
  },
  // YouTube Services
  {
    id: "101",
    category_id: "cat-yt",
    name: "YouTube Subscribers [Non-Drop / Real Users / Lifetime Refill]",
    description: "Highly stable real YouTube users. Delivery rate: 100-200 subs per day to prevent algorithm flagging.",
    rate: 1450.00,
    min_qty: 50,
    max_qty: 10000,
    avg_time: "12 hours",
    refill_available: true,
    status: "active",
  },
  {
    id: "102",
    category_id: "cat-yt",
    name: "YouTube High Retention Views [Speed: 50K/Day / Organic Source]",
    description: "Viewer watch time: 3-5 minutes average. Greatly improves video SEO rankings. 100% safe.",
    rate: 220.00,
    min_qty: 1000,
    max_qty: 500000,
    avg_time: "2 hours",
    refill_available: true,
    status: "active",
  },
];

const INITIAL_ORDERS: MockOrder[] = [
  {
    id: "ord-1001",
    user_id: "u-1",
    service_id: "1",
    link: "https://www.instagram.com/johndoe_grow",
    quantity: 1000,
    start_count: 540,
    remains: 0,
    status: "completed",
    price: 0.53,
    created_at: "2026-06-20T10:00:00Z",
    updated_at: "2026-06-20T14:30:00Z",
  },
  {
    id: "ord-1002",
    user_id: "u-1",
    service_id: "102",
    link: "https://www.youtube.com/watch?v=demoVideo123",
    quantity: 2000,
    start_count: 12000,
    remains: 450,
    status: "in_progress",
    price: 440.00,
    created_at: "2026-06-25T08:15:00Z",
    updated_at: "2026-06-25T11:00:00Z",
  },
  {
    id: "ord-1003",
    user_id: "u-1",
    service_id: "3",
    link: "https://www.instagram.com/p/C_abc123xyz/",
    quantity: 500,
    start_count: 0,
    remains: 500,
    status: "pending",
    price: 13.02,
    created_at: "2026-06-25T22:00:00Z",
    updated_at: "2026-06-25T22:00:00Z",
  },
];

const INITIAL_TRANSACTIONS: MockTransaction[] = [
  {
    id: "tx-101",
    user_id: "u-1",
    type: "credit",
    amount: 2000.00,
    balance_after: 2000.00,
    description: "Wallet recharge via Razorpay Gateway",
    reference_id: "pay_Razorpay_10204",
    status: "success",
    created_at: "2026-06-19T09:00:00Z",
  },
  {
    id: "tx-102",
    user_id: "u-1",
    type: "debit",
    amount: 120.00,
    balance_after: 1880.00,
    description: "Paid for Order #ord-1001 (Instagram Followers)",
    reference_id: "ord-1001",
    status: "success",
    created_at: "2026-06-20T10:00:00Z",
  },
  {
    id: "tx-103",
    user_id: "u-1",
    type: "debit",
    amount: 440.00,
    balance_after: 1440.00,
    description: "Paid for Order #ord-1002 (YouTube HR Views)",
    reference_id: "ord-1002",
    status: "success",
    created_at: "2026-06-25T08:15:00Z",
  },
];

const INITIAL_TICKETS: MockTicket[] = [
  {
    id: "tkt-201",
    user_id: "u-1",
    subject: "Order #ord-1002 processing speed",
    category: "order_issue",
    status: "replied",
    created_at: "2026-06-25T09:00:00Z",
    last_updated: "2026-06-25T11:15:00Z",
    messages: [
      {
        id: "msg-1",
        ticket_id: "tkt-201",
        sender_type: "user",
        sender_name: "John Doe",
        message: "Hello, my order ord-1002 seems a bit slow. Can you please check if there is an issue?",
        created_at: "2026-06-25T09:00:00Z",
      },
      {
        id: "msg-2",
        ticket_id: "tkt-201",
        sender_type: "admin",
        sender_name: "Admin Support",
        message: "Hello John, the YouTube system is currently handling high volume, which delays starts. We checked and your order is actively running now. Please allow it another 6-12 hours.",
        created_at: "2026-06-25T11:15:00Z",
      },
    ],
  },
];

const DEFAULT_SETTINGS: MockSettings = {
  siteName: "Virtue",
  tagline: "Unbeatable Social Media Growth Supplier",
  contactEmail: "support@virtue.com",
  whatsappLink: "https://wa.me/1234567890",
  maintenanceMode: false,
  minOrderAmount: 100,
  registrationOpen: true,
  announcementBanner: "⚡ Mega Summer Sale: Get 10% bonus on all UPI/Crypto wallet deposits above ₹2000! ⚡",
  lowBalanceThreshold: 200,
};

// Database Initialization Helper
export const initMockDatabase = () => {
  // If stored categories contain legacy platforms or lack the new categories, trigger a cache reset
  const storedCats = localStorage.getItem("smm_categories");
  if (storedCats && (storedCats.includes("cat-tt") || storedCats.includes("cat-fb") || !storedCats.includes("Instagram - Trending Services"))) {
    localStorage.removeItem("smm_categories");
    localStorage.removeItem("smm_services");
    localStorage.removeItem("smm_orders");
  }

  if (!localStorage.getItem("smm_users")) {
    localStorage.setItem("smm_users", JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem("smm_categories")) {
    localStorage.setItem("smm_categories", JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem("smm_services")) {
    localStorage.setItem("smm_services", JSON.stringify(INITIAL_SERVICES));
  }
  if (!localStorage.getItem("smm_orders")) {
    localStorage.setItem("smm_orders", JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem("smm_transactions")) {
    localStorage.setItem("smm_transactions", JSON.stringify(INITIAL_TRANSACTIONS));
  }
  if (!localStorage.getItem("smm_tickets")) {
    localStorage.setItem("smm_tickets", JSON.stringify(INITIAL_TICKETS));
  }
  if (!localStorage.getItem("smm_settings")) {
    localStorage.setItem("smm_settings", JSON.stringify(DEFAULT_SETTINGS));
  }
};

// Read Helpers
export const dbGet = <T>(key: string): T => {
  initMockDatabase();
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : ([] as unknown as T);
};

// Write Helpers
export const dbSet = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};
export const getActiveUser = (): MockUser | null => {
  const current = localStorage.getItem("smm_current_user");
  if (!current) return null;
  // Read fresh from database in case balance changed
  const users = dbGet<MockUser[]>("smm_users");
  const parsed = JSON.parse(current) as MockUser;
  const fresh = users.find(u => u.id === parsed.id);
  return fresh || parsed;
};

export const setActiveUser = (user: MockUser | null) => {
  if (user) {
    localStorage.setItem("smm_current_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("smm_current_user");
  }
};
export const getSettings = (): MockSettings => {
  initMockDatabase();
  const settings = JSON.parse(localStorage.getItem("smm_settings")!) as MockSettings;
  if (settings && (settings.siteName.includes("SMM Panel") || settings.contactEmail.includes("smmpanel"))) {
    localStorage.setItem("smm_settings", JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  return settings;
};
