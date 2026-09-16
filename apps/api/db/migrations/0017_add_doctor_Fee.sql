-- migrate:up
ALTER TABLE doctors
  ADD COLUMN old_patient_fee INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN emergency_fee INTEGER NOT NULL DEFAULT 0;

-- migrate:down
ALTER TABLE doctors
  DROP COLUMN IF EXISTS old_patient_fee,
  DROP COLUMN IF EXISTS emergency_fee;
