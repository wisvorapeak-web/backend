/* 
  WISVORA SCIENTIFIC SUMMIT 2026 - FINAL MASTER SCHEMA
  Last Updated: 2026-03-23
  Features: Unified Speaker Registry, Global Sponsorship Hub, Dynamic Schedule, Multi-submission indexing
*/

-- 1. PROFILES (Security & Identity)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, 
  role TEXT DEFAULT 'Admin' CHECK (role IN ('Admin', 'Super Admin')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended')),
  email_verified BOOLEAN DEFAULT false,
  institution TEXT,
  country TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. ABSTRACTS (Submission Lifecycle)
CREATE TABLE IF NOT EXISTS public.abstracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  abstract_text TEXT NOT NULL,
  topic TEXT NOT NULL,
  file_url TEXT, 
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Revision')),
  review_comment TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL, 
  institution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_abstracts_email ON public.abstracts(email);
CREATE INDEX IF NOT EXISTS idx_abstracts_status ON public.abstracts(status);

-- 3. REGISTRATIONS (Payments & Attendance)
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL DEFAULT 'ASCENDIX SUMMIT 2026',
  tier TEXT NOT NULL, 
  amount NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed')),
  payment_method TEXT,
  transaction_id TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  institution TEXT,
  country TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_payment ON public.registrations(payment_status);

-- 4. CONTACTS (Administrative Inbox)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Unread' CHECK (status IN ('Unread', 'Read', 'Replied')),
  reply_text TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SPEAKERS (Unified Registry)
CREATE TABLE IF NOT EXISTS public.speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  university TEXT,
  country TEXT,
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  category TEXT DEFAULT 'keynote',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SPONSORS (Global Alliance)
CREATE TABLE IF NOT EXISTS public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  tier TEXT DEFAULT 'Sponsor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. EVENT PROGRAM & SCHEDULE
CREATE TABLE IF NOT EXISTS public.program_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  day TEXT DEFAULT 'Day 1',
  location TEXT,
  session_type TEXT DEFAULT 'Technical Session',
  speaker_name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. IMPORTANT DATES & MILESTONES
CREATE TABLE IF NOT EXISTS public.important_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. VENUE & GALLERY
CREATE TABLE IF NOT EXISTS public.venue_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  host_city TEXT DEFAULT 'New Delhi, India',
  venue_name TEXT DEFAULT 'Pragati Maidan Convention Center',
  venue_address TEXT DEFAULT 'Pragati Maidan, New Delhi, Delhi 110001',
  venue_description TEXT,
  map_url TEXT,
  virtual_tour_url TEXT,
  accommodation_info TEXT,
  tourism_info TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.venue_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  category TEXT DEFAULT 'venue' CHECK (category IN ('venue', 'accommodation', 'tourism', 'past_event')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. SITE SETTINGS (Dynamic CMS)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_title TEXT NOT NULL DEFAULT 'WISVORA PEAK 2026',
  site_tagline TEXT DEFAULT 'Pioneering the future of Sustainable Materials',
  currency TEXT DEFAULT '₹',
  contact_email TEXT DEFAULT 'contact@wisvorapeak.com',
  contact_phone TEXT DEFAULT '+91 9366531405',
  contact_address TEXT DEFAULT 'WISVORA PEAK PRIVATE LIMITED, Guwahati, Assam, India',
  office_hours TEXT DEFAULT 'Mon - Fri: 09:00 - 18:00',
  twitter_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  hero_title TEXT,
  hero_tagline TEXT,
  hero_image_url TEXT,
  about_title TEXT DEFAULT 'The Future of Food',
  about_content TEXT,
  about_image_url TEXT,
  event_dates TEXT DEFAULT 'November 18-20, 2026',
  global_reach TEXT DEFAULT '50+ Countries',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all required columns exist in site_settings (Schema Evolution)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='site_tagline') THEN
        ALTER TABLE public.site_settings ADD COLUMN site_tagline TEXT DEFAULT 'Pioneering the future of Sustainable Materials';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='currency') THEN
        ALTER TABLE public.site_settings ADD COLUMN currency TEXT DEFAULT '₹';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='contact_email') THEN
        ALTER TABLE public.site_settings ADD COLUMN contact_email TEXT DEFAULT 'contact@wisvorapeak.com';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='contact_phone') THEN
        ALTER TABLE public.site_settings ADD COLUMN contact_phone TEXT DEFAULT '+91 9366531405';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='contact_address') THEN
        ALTER TABLE public.site_settings ADD COLUMN contact_address TEXT DEFAULT 'WISVORA PEAK PRIVATE LIMITED, Guwahati, Assam, India';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='office_hours') THEN
        ALTER TABLE public.site_settings ADD COLUMN office_hours TEXT DEFAULT 'Mon - Fri: 09:00 - 18:00';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='twitter_url') THEN
        ALTER TABLE public.site_settings ADD COLUMN twitter_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='linkedin_url') THEN
        ALTER TABLE public.site_settings ADD COLUMN linkedin_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='instagram_url') THEN
        ALTER TABLE public.site_settings ADD COLUMN instagram_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='hero_title') THEN
        ALTER TABLE public.site_settings ADD COLUMN hero_title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='hero_tagline') THEN
        ALTER TABLE public.site_settings ADD COLUMN hero_tagline TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='hero_image_url') THEN
        ALTER TABLE public.site_settings ADD COLUMN hero_image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='about_title') THEN
        ALTER TABLE public.site_settings ADD COLUMN about_title TEXT DEFAULT 'The Future of Food';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='about_content') THEN
        ALTER TABLE public.site_settings ADD COLUMN about_content TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='about_image_url') THEN
        ALTER TABLE public.site_settings ADD COLUMN about_image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='event_dates') THEN
        ALTER TABLE public.site_settings ADD COLUMN event_dates TEXT DEFAULT 'November 18-20, 2026';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='global_reach') THEN
        ALTER TABLE public.site_settings ADD COLUMN global_reach TEXT DEFAULT '50+ Countries';
    END IF;
END $$;

-- 11. VENUE TRAVEL INFO
CREATE TABLE IF NOT EXISTS public.venue_travel_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Info',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.venue_travel_info (title, description, icon_name, display_order) VALUES
('Travel', 'Changi Airport is one of the best in the world with direct flights from everywhere.', 'Plane', 1),
('Visa', 'We provide letters to help you with your visa application.', 'Globe', 2),
('Hotels', 'Get special rates at our partner hotels near the venue.', 'Hotel', 3),
('Tourism', 'Visit famous sites like Gardens by the Bay and Marina Bay Sands.', 'Info', 4)
ON CONFLICT DO NOTHING;

-- 10.1 ABOUT HIGHLIGHTS
CREATE TABLE IF NOT EXISTS public.about_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Lightbulb',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.about_highlights (title, description, icon_name, display_order) VALUES
('Industry Partners', 'Work with top companies to turn research into products.', 'Lightbulb', 1),
('Startups & Business', 'A place for businesses and investors to meet and grow.', 'Network', 2),
('Global Growth', 'Join conversations with experts on sustainable farming.', 'Handshake', 3)
ON CONFLICT DO NOTHING;

-- INITIAL SEED DATA
INSERT INTO public.venue_settings (id, venue_name) 
VALUES (1, 'Pragati Maidan Convention Center')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.site_settings (id, site_title, hero_title, hero_tagline, about_content) 
VALUES (
  1, 
  'Polymers & Composite Materials 2026', 
  'Polymers & Composite Materials 2026',
  'Pioneering the future of Sustainable Materials and Biopolymers.',
  'Join the world''s leading Material Summit. Connect with industry pioneers, researchers, and decision-makers from across the globe.'
)
ON CONFLICT (id) DO NOTHING;

-- 11. PRICING & TIERS (Global Financial Hub)
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Registration', 'Sponsorship', 'Exhibition', 'Accommodation', 'Other')),
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pricing_category ON public.pricing_tiers(category);

-- INITIAL PRICING SEED
INSERT INTO public.pricing_tiers (name, category, amount, currency, description, features)
VALUES 
('International Delegate', 'Registration', 550, 'USD', 'Standard access for academic and industry professionals.', '["Full Access", "Conference Kit", "Lunch & Tea", "Proceedings"]'::jsonb),
('Student Delegate', 'Registration', 350, 'USD', 'Discounted rate for active PhD and post-doctoral students.', '["Full Access", "Conference Kit", "Lunch & Tea"]'::jsonb),
('Gold Sponsor', 'Sponsorship', 5000, 'USD', 'Premium branding and exhibition opportunities.', '["Premium Booth", "2-min Video Pitch", "Logo on Backdrop", "3 Free Passes"]'::jsonb)
ON CONFLICT DO NOTHING;

-- 12. LEGAL CONTENT (Privacy, Terms, Cookies)
CREATE TABLE IF NOT EXISTS public.legal_content (
  slug TEXT PRIMARY KEY, -- privacy, terms, cookies
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INITIAL LEGAL SEED
INSERT INTO public.legal_content (slug, title, content) VALUES
('privacy', 'Privacy Policy', '# Privacy Policy\n\nYour privacy is important to us. This policy explains how we collect, use, and safeguard your data during the Wisvora Summit 2026.\n\n### 1. Data Collection\nWe collect personal information such as name, email, and institution during registration.\n\n### 2. Usage\nYour data is used solely for conference logistics, abstract processing, and legitimate communications regarding the summit.'),
('terms', 'Terms of Service', '# Terms of Service\n\nBy registering for the Wisvora Scientific Summit, you agree to the following terms and conditions.\n\n### 1. Registration\nAll registrations are personal and non-transferable without prior written consent from the organizing committee.\n\n### 2. Liability\nThe organizers are not responsible for personal loss or damage during the event.'),
('cookies', 'Cookie Protocol', '# Cookie Protocol\n\nWe use technical cookies to enhance your experience and secure your sessions.\n\n### 1. Essential Cookies\nUsed for maintaining login sessions and security tokens.\n\n### 2. Analytical Cookies\nUsed to understand website traffic patterns and improve our global digital presence.')
ON CONFLICT (slug) DO NOTHING;

-- 13. BROCHURES & GUIDES
CREATE TABLE IF NOT EXISTS public.brochures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  icon_name TEXT DEFAULT 'FileDown',
  file_url TEXT NOT NULL,
  file_size TEXT,
  type TEXT DEFAULT 'Guide',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. SUMMIT TOPICS
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Globe',
  color_gradient TEXT DEFAULT 'from-blue-600 to-indigo-400',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SEED TOPICS
INSERT INTO public.topics (title, description, icon_name, color_gradient, display_order) VALUES
('Food Systems', 'New ways to ensure food for everyone and build sustainable systems.', 'Globe', 'from-blue-600 to-indigo-400', 1),
('Smart Farming', 'Using drones and GPS to manage farms more efficiently.', 'Zap', 'from-amber-500 to-orange-400', 2),
('Digital Farming', 'Using AI and data to monitor crops and increase yield.', 'Database', 'from-cyan-500 to-blue-400', 3),
('Climate-Smart Farming', 'New farming methods to protect the climate and soil.', 'CloudSun', 'from-emerald-500 to-green-400', 4),
('Water & Soil', 'Using new technology to save water and keep soil healthy.', 'Droplets', 'from-sky-500 to-blue-400', 5),
('Genetics', 'Research on new crops and genetic improvements.', 'Dna', 'from-purple-500 to-pink-400', 6),
('Resilient Farming', 'Building farms that can handle climate changes.', 'Sprout', 'from-green-600 to-emerald-400', 7),
('Animal Health', 'Medical care and healthy feeding for farm animals.', 'HeartPulse', 'from-rose-500 to-pink-400', 8),
('Smart Livestock', 'Using sensors to manage farm animals more intelligently.', 'Binary', 'from-indigo-600 to-blue-400', 9),
('Alternative Proteins', 'Plant-based and lab-grown protein research.', 'Beef', 'from-orange-600 to-amber-400', 10),
('Food Safety', 'Healthy food, nutritional analysis, and safety standards.', 'Apple', 'from-red-500 to-orange-400', 11),
('Food Processing', 'Automation and smart packaging in the food factory.', 'Factory', 'from-slate-600 to-slate-400', 12)
ON CONFLICT DO NOTHING;

-- 15. FAQS
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.faqs (question, answer, display_order) VALUES
('How do I submit?', 'You can submit on our website. Click "Submit Research" to start.', 1),
('How can I present?', 'You can give a talk or show a poster.', 2),
('Do you help with visas?', 'Yes, we send letters to help you get a visa after you register.', 3),
('Is there a student discount?', 'Yes, students get a lower price.', 4),
('What do I get with my ticket?', 'Your ticket includes sessions, lunch, and a certificate.', 5)
ON CONFLICT DO NOTHING;

-- 16. TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  institution TEXT,
  country TEXT,
  quote TEXT NOT NULL,
  image_url TEXT,
  rating INTEGER DEFAULT 5,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.testimonials (name, role, institution, country, quote) VALUES
('Dr. Maria Rodriguez', 'Research Scientist', 'University of Barcelona', 'Spain', 'The previous summit was a great experience. I met many new people and found helpful ways to work together.'),
('Prof. Michael Chen', 'Department Head', 'National University of Singapore', 'Singapore', 'This is a must-attend event for anyone in farming. The team brings together the best experts.')
ON CONFLICT DO NOTHING;

-- 17. AUDIENCES (Why Attend)
CREATE TABLE IF NOT EXISTS public.audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  benefits JSONB DEFAULT '[]'::jsonb,
  icon_name TEXT DEFAULT 'Briefcase',
  color_gradient TEXT,
  link_path TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.audiences (title, subtitle, description, benefits, icon_name, link_path) VALUES
('Researchers', 'Make an Impact', 'Present your research to experts and find partners from around the world.', '["Present papers and posters", "Access to latest research", "Publishing opportunities"]'::jsonb, 'FlaskConical', '/abstract-submission'),
('Students', 'Start Your Career', 'Learn from experts and find new career paths in agriculture.', '["Career workshops", "Mentorship programs", "Poster competitions"]'::jsonb, 'GraduationCap', '/registration')
ON CONFLICT DO NOTHING;

-- 18. SITE METRICS
CREATE TABLE IF NOT EXISTS public.site_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Globe2',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.site_metrics (label, value, icon_name, display_order) VALUES
('Countries', '50+', 'Globe2', 1),
('Topics', '180+', 'Rocket', 2),
('Speakers', '120+', 'Mic2', 3),
('Partners', 'Global', 'ShieldCheck', 4)
ON CONFLICT DO NOTHING;
