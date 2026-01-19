-- Migration: Add odontogram JSONB to patients (idempotent)

ALTER TABLE odontology_patients
ADD COLUMN IF NOT EXISTS odontogram JSONB;

