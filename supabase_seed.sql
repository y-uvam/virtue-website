-- ============================================================
-- SMMXPERT / Virtue - Supabase Seed Data
-- Run this AFTER supabase_schema.sql
-- Paste into: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- ─── CATEGORIES ─────────────────────────────────────────────
INSERT INTO public.categories (id, name, icon, sort_order, status) VALUES
  ('cat-ig-trending',  'Instagram - Trending Services', 'instagram', 1,  'active'),
  ('cat-ig-reel-views','Instagram - Reel Views',        'instagram', 2,  'active'),
  ('cat-ig-post-views','Instagram - Post Views',        'instagram', 3,  'active'),
  ('cat-ig-followers', 'Instagram - Followers',         'instagram', 4,  'active'),
  ('cat-ig-likes',     'Instagram - Likes',             'instagram', 5,  'active'),
  ('cat-ig-comments',  'Instagram - Comments',          'instagram', 6,  'active'),
  ('cat-ig-shares',    'Instagram - Shares',            'instagram', 7,  'active'),
  ('cat-ig-saves',     'Instagram - Saves',             'instagram', 8,  'active'),
  ('cat-ig-reposts',   'Instagram - Reposts',           'instagram', 9,  'active'),
  ('cat-yt',           'YouTube Traffic',               'youtube',   10, 'active')
ON CONFLICT (id) DO UPDATE SET
  name       = EXCLUDED.name,
  icon       = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  status     = EXCLUDED.status;

-- ─── SERVICES ───────────────────────────────────────────────
INSERT INTO public.services (id, category_id, name, description, rate, min_qty, max_qty, avg_time, refill_available, status) VALUES

  -- Instagram Reel Views
  ('1',  'cat-ig-reel-views', 'Instagram Reel Views - Used By Influencers',
   'High quality Instagram Reel views. Used by popular influencers.',
   0.53, 100, 2147483647, '5 minutes', true, 'active'),

  ('19', 'cat-ig-reel-views', 'Instagram Reel Views - Used By Celebrities',
   'Celebrity level Instagram Reel views. Fast delivery.',
   0.61, 100, 2147483647, '5 minutes', true, 'active'),

  ('24', 'cat-ig-reel-views', 'Indian Reel Views - Used By Celebrities',
   'Indian organic Reel views. Used by celebrities.',
   1.67, 100, 2147483647, '10 minutes', true, 'active'),

  -- Instagram Likes
  ('3',  'cat-ig-likes', 'Instagram Likes - Used By Influencers',
   'High quality Instagram Likes. Used by popular influencers.',
   26.04, 100, 2147483647, '5 minutes', true, 'active'),

  ('20', 'cat-ig-likes', 'Instagram Likes - Used By Celebrities',
   'Celebrity level Instagram Likes. Instant delivery.',
   39.89, 100, 2147483647, '5 minutes', true, 'active'),

  ('11', 'cat-ig-likes', 'Instagram Indian Likes - Used By Celebrities',
   'Indian organic Likes. Used by celebrities.',
   59.03, 100, 2147483647, '10 minutes', true, 'active'),

  -- Instagram Comments
  ('27', 'cat-ig-comments', 'Instagram Indian Comments - Used By Celebrities',
   'Indian organic Comments. Used by celebrities.',
   128.56, 100, 2147483647, '15 minutes', true, 'active'),

  -- Instagram Followers
  ('4',  'cat-ig-followers', 'Instagram Premium Followers - Used By Celebrities',
   'Premium level Instagram Followers. Used by celebrities.',
   148.47, 100, 2147483647, '15 minutes', true, 'active'),

  -- YouTube Services
  ('101', 'cat-yt', 'YouTube Subscribers [Non-Drop / Real Users / Lifetime Refill]',
   'Highly stable real YouTube users. Delivery rate: 100-200 subs per day to prevent algorithm flagging.',
   1450.00, 50, 10000, '12 hours', true, 'active'),

  ('102', 'cat-yt', 'YouTube High Retention Views [Speed: 50K/Day / Organic Source]',
   'Viewer watch time: 3-5 minutes average. Greatly improves video SEO rankings. 100% safe.',
   220.00, 1000, 500000, '2 hours', true, 'active')

ON CONFLICT (id) DO UPDATE SET
  category_id      = EXCLUDED.category_id,
  name             = EXCLUDED.name,
  description      = EXCLUDED.description,
  rate             = EXCLUDED.rate,
  min_qty          = EXCLUDED.min_qty,
  max_qty          = EXCLUDED.max_qty,
  avg_time         = EXCLUDED.avg_time,
  refill_available = EXCLUDED.refill_available,
  status           = EXCLUDED.status;

-- ─── SITE SETTINGS (default row) ────────────────────────────
INSERT INTO public.site_settings (
  id, site_name, tagline, contact_email, whatsapp_link,
  maintenance_mode, min_order_amount, registration_open,
  announcement_banner, low_balance_threshold
) VALUES (
  1,
  'SMMXPERT',
  'Unbeatable Social Media Growth Supplier',
  'support@smmxpert.com',
  'https://wa.me/1234567890',
  false,
  100.00,
  true,
  '⚡ Mega Summer Sale: Get 10% bonus on all UPI/Crypto wallet deposits above ₹2000! ⚡',
  200.00
) ON CONFLICT (id) DO UPDATE SET
  site_name             = EXCLUDED.site_name,
  tagline               = EXCLUDED.tagline,
  contact_email         = EXCLUDED.contact_email,
  whatsapp_link         = EXCLUDED.whatsapp_link,
  maintenance_mode      = EXCLUDED.maintenance_mode,
  min_order_amount      = EXCLUDED.min_order_amount,
  registration_open     = EXCLUDED.registration_open,
  announcement_banner   = EXCLUDED.announcement_banner,
  low_balance_threshold = EXCLUDED.low_balance_threshold;
