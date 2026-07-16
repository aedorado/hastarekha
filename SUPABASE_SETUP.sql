-- SQL SETUP SCRIPT FOR HASTA-REKHA DATABANK
-- Run this in your Supabase project's SQL Editor to set up the database table!

CREATE TABLE IF NOT EXISTS public.hands (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  dob TEXT,
  tob TEXT,
  pob TEXT,
  gender TEXT,
  dominant_hand TEXT NOT NULL,
  images JSONB DEFAULT '{}'::jsonb, -- Stores {"right_palm": "url", "right_back": "url", "left_palm": "url", "left_back": "url"}
  general_notes TEXT,
  mounts_data JSONB DEFAULT '{}'::jsonb,
  lines_data JSONB DEFAULT '{}'::jsonb,
  pins JSONB DEFAULT '[]'::jsonb,
  drawings JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.hands ENABLE ROW LEVEL SECURITY;

-- Since this is a shared database for a study group/course, 
-- we will enable public access for SELECT, INSERT, UPDATE, and DELETE.
-- (Adjust these if you want private user-specific accounts later!)

CREATE POLICY "Allow anonymous read access"
ON public.hands
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous insert access"
ON public.hands
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous update access"
ON public.hands
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access"
ON public.hands
FOR DELETE
TO anon
USING (true);
