-- migrate:up
CREATE TABLE patients (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uhid           TEXT,
    phone          TEXT NOT NULL,
    name           TEXT NOT NULL,
    identity_key   TEXT GENERATED ALWAYS AS (
        lower(regexp_replace(phone, '\D', '', 'g'))
        || '|' ||
        lower(regexp_replace(regexp_replace(trim(name), '[^\w\s]', '', 'g'), '\s+', ' ', 'g'))
    ) STORED NOT NULL,
    age            INTEGER,
    gender         gender_enum,
    district       TEXT NOT NULL DEFAULT '',
    address        TEXT NOT NULL DEFAULT '',
    pin_code       TEXT NOT NULL DEFAULT '',
    is_registered  BOOLEAN NOT NULL DEFAULT false,
    is_old         BOOLEAN NOT NULL DEFAULT false,
    last_visited   DATE,
    meta           JSONB NOT NULL DEFAULT '{}',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_patients_uhid         UNIQUE (uhid),
    CONSTRAINT uq_patients_identity_key UNIQUE (identity_key),
    CONSTRAINT chk_patients_age         CHECK (age IS NULL OR (age BETWEEN 0 AND 120))
);

CREATE INDEX idx_patients_phone  ON patients (phone);
CREATE INDEX idx_patients_name   ON patients (name);
CREATE INDEX idx_patients_is_old ON patients (is_old);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- migrate:down
DROP TRIGGER IF EXISTS set_updated_at ON patients;
DROP TABLE IF EXISTS patients CASCADE;
