-- Migration: Odontology module tables (patients + appointments)
-- Run this migration in your Supabase SQL editor.

-- Patients
CREATE TABLE IF NOT EXISTS odontology_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  dob DATE,
  sex TEXT,
  address TEXT,

  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_odontology_patients_org_id ON odontology_patients(org_id);
CREATE INDEX IF NOT EXISTS idx_odontology_patients_name ON odontology_patients(org_id, first_name, last_name);

-- Appointments
CREATE TABLE IF NOT EXISTS odontology_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES odontology_patients(id) ON DELETE CASCADE,

  dentist_name TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled',
  reason TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_odontology_appointments_org_id ON odontology_appointments(org_id);
CREATE INDEX IF NOT EXISTS idx_odontology_appointments_patient ON odontology_appointments(org_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_odontology_appointments_scheduled_at ON odontology_appointments(org_id, scheduled_at);

-- Enable RLS
ALTER TABLE odontology_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontology_appointments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies: users can read within their orgs
-- Note: adjust table names/roles to match your membership table model if needed.
DO $$
BEGIN
  -- Patients
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'odontology_patients' AND policyname = 'org_members_can_select_patients'
  ) THEN
    CREATE POLICY org_members_can_select_patients
      ON odontology_patients FOR SELECT
      USING (org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid()));
  END IF;

  -- Appointments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'odontology_appointments' AND policyname = 'org_members_can_select_appointments'
  ) THEN
    CREATE POLICY org_members_can_select_appointments
      ON odontology_appointments FOR SELECT
      USING (org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid()));
  END IF;
END $$;

-- updated_at triggers
CREATE OR REPLACE FUNCTION odontology_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_odontology_patients_updated_at ON odontology_patients;
CREATE TRIGGER trg_odontology_patients_updated_at
  BEFORE UPDATE ON odontology_patients
  FOR EACH ROW
  EXECUTE FUNCTION odontology_set_updated_at();

DROP TRIGGER IF EXISTS trg_odontology_appointments_updated_at ON odontology_appointments;
CREATE TRIGGER trg_odontology_appointments_updated_at
  BEFORE UPDATE ON odontology_appointments
  FOR EACH ROW
  EXECUTE FUNCTION odontology_set_updated_at();

