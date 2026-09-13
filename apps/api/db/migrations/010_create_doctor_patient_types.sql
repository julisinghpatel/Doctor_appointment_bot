-- migrate:up
-- DORMANT: Phase 2. Controls which patient types a doctor accepts (new/existing/both).
CREATE TABLE doctor_patient_types (
    doctor_id     BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_type  patient_type_enum NOT NULL,

    PRIMARY KEY (doctor_id, patient_type)
);

-- migrate:down
DROP TABLE IF EXISTS doctor_patient_types CASCADE;
