-- Migration: add mode and custom_dates to groups, relax day_of_week constraint

ALTER TABLE groups ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'weekly';
ALTER TABLE groups ADD COLUMN IF NOT EXISTS custom_dates TEXT[] DEFAULT NULL;

ALTER TABLE responses DROP CONSTRAINT IF EXISTS responses_day_of_week_check;
ALTER TABLE responses ADD CONSTRAINT responses_day_of_week_check CHECK (day_of_week >= 0);
