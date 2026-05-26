-- Run this in your NeonDB console to initialize the schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'weekly',
  custom_dates TEXT[] DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0),
  pain_score INT NOT NULL CHECK (pain_score BETWEEN 1 AND 6),
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(member_id, day_of_week)
);
