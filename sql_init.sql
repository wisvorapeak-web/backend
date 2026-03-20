-- 1. PROFILES (User Management)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT, 
  role TEXT DEFAULT 'User' CHECK (role IN ('User', 'Admin', 'Reviewer', 'Super Admin')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended')),
  institution TEXT,
  department TEXT,
  country TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ABSTRACTS (Submission Management)
CREATE TABLE IF NOT EXISTS public.abstracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  abstract_text TEXT NOT NULL,
  topic TEXT NOT NULL,
  file_url TEXT, 
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Revision')),
  name TEXT, 
  email TEXT, 
  institution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. REGISTRATIONS (Event Participation)
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL DEFAULT 'Ascendix World Food 2026',
  tier TEXT NOT NULL, 
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed')),
  ama_link TEXT, 
  name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CONTACTS (Inquiries/Inbox)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Unread' CHECK (status IN ('Unread', 'Read', 'Replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SPEAKERS (Public Site Data)
CREATE TABLE IF NOT EXISTS public.speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT, 
  institution TEXT,
  avatar_url TEXT,
  bio TEXT,
  category TEXT DEFAULT 'keynote', -- 'plenary', 'keynote', 'invited', etc.
  country TEXT,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PROGRAM_SCHEDULE (Scientific Itinerary)
CREATE TABLE IF NOT EXISTS public.program_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day TEXT NOT NULL, 
  date TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  title TEXT NOT NULL,
  speaker_id UUID REFERENCES public.speakers(id) ON DELETE SET NULL,
  location TEXT,
  session_type TEXT, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. SITE_SETTINGS (SUMMIT CONFIGURATION - SINGLE ROW)
DROP TABLE IF EXISTS public.site_settings;
CREATE TABLE public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_title TEXT NOT NULL DEFAULT 'ASCENDIX 2026',
  site_tagline TEXT DEFAULT 'Pioneering the future of Sustainable Agriculture & Agrotech',
  currency TEXT DEFAULT '₹',
  contact_email TEXT DEFAULT 'contact@wisvorapeak.com',
  contact_phone TEXT DEFAULT '+91 9366531405',
  contact_address TEXT DEFAULT 'WISVORA PEAK PRIVATE LIMITED, Guwahati, Assam, India',
  office_hours TEXT DEFAULT 'Mon - Fri: 09:00 - 18:00',
  twitter_url TEXT DEFAULT 'https://twitter.com/wisvorapeak',
  linkedin_url TEXT DEFAULT 'https://linkedin.com/company/wisvorapeak',
  facebook_url TEXT DEFAULT 'https://facebook.com/wisvorapeak',
  instagram_url TEXT DEFAULT 'https://instagram.com/wisvorapeak',
  is_maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SEED INITIAL SETTINGS
INSERT INTO public.site_settings (id, site_title) 
VALUES (1, 'ASCENDIX 2026')
ON CONFLICT (id) DO NOTHING;

-- 8. IMPORTANT_DATES
CREATE TABLE IF NOT EXISTS public.important_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
