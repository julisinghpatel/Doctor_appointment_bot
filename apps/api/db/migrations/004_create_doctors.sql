-- migrate:up
CREATE TABLE doctors (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    department_id         BIGINT REFERENCES departments(id) ON DELETE RESTRICT,
    name                  TEXT NOT NULL,
    name_hindi            TEXT,
    phone                 TEXT NOT NULL DEFAULT '',
    role                  TEXT NOT NULL DEFAULT '',
    qualification         TEXT NOT NULL DEFAULT '',
    qualification_hindi   TEXT,
    display_schedule      TEXT NOT NULL DEFAULT '',
    specialization        TEXT NOT NULL,
    specialization_hindi  TEXT,
    specialty             TEXT NOT NULL DEFAULT '',
    address               TEXT NOT NULL DEFAULT '',
    gender                gender_enum,
    consultation_fee      INTEGER NOT NULL DEFAULT 0,
    experience_years      INTEGER NOT NULL DEFAULT 0,
    image_url             TEXT NOT NULL DEFAULT '',
    max_patients_per_day  INTEGER NOT NULL DEFAULT 30,
    is_active             BOOLEAN NOT NULL DEFAULT true,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_doctors_department ON doctors (department_id) WHERE is_active = true;
CREATE INDEX idx_doctors_active     ON doctors (is_active, name);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- migrate:down
DROP TRIGGER IF EXISTS set_updated_at ON doctors;
DROP TABLE IF EXISTS doctors CASCADE;
