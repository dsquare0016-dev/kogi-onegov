-- Seed script for nominal roll bulk upload

BEGIN;

-- Truncate existing data
TRUNCATE TABLE nominal_roll RESTART IDENTITY CASCADE;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Workforce categories (example)
CREATE TABLE IF NOT EXISTS workforce_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO workforce_categories (code, name, description, is_active)
VALUES
  ('CS','Civil Service','Kogi State Civil Service',TRUE)
ON CONFLICT (code) DO NOTHING;

-- Nominal roll table (simplified example)
CREATE TABLE IF NOT EXISTS nominal_roll (
  staff_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  staff_type TEXT,
  mda TEXT,
  department TEXT,
  grade_level TEXT,
  date_of_birth DATE,
  date_of_first_appointment DATE,
  status TEXT,
  verification_status TEXT,
  expected_retirement_date DATE,
  is_registered BOOLEAN DEFAULT FALSE
);

-- Insert sample data (replace with full dataset)
INSERT INTO nominal_roll (staff_id, full_name, email, staff_type, mda, department, grade_level, date_of_birth, date_of_first_appointment, status, verification_status, expected_retirement_date, is_registered)
SELECT
  gen_random_uuid()::text as staff_id,
  full_name,
  email,
  staff_type,
  mda,
  department,
  grade_level,
  date_of_birth,
  date_of_first_appointment,
  'Active' as status,
  'Pending' as verification_status,
  '2050-01-01'::date as expected_retirement_date,
  FALSE as is_registered
FROM (
  VALUES
    ('Idris Ibrahim','idris.ibrahim@kogionegov.gov.ng','Civil Servant','Ministry of Health','Public Health','GL-10','1985-05-14','2012-03-01'),
    ('Fatima Audu','fatima.audu@kogionegov.gov.ng','Civil Servant','Ministry of Education','Secondary Education','GL-09','1991-10-22','2015-11-15'),
    ('Grace Omachonu','grace.omachonu@kogionegov.gov.ng','Civil Servant','Health Board','Health Board','GL-08','1992-04-12','2016-09-01')
) AS t(full_name,email,staff_type,mda,department,grade_level,date_of_birth,date_of_first_appointment);

COMMIT;
