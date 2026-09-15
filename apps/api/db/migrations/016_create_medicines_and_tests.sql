-- migrate:up
CREATE TABLE IF NOT EXISTS medicines (
    id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    name          TEXT NOT NULL,
    dosage_form   TEXT DEFAULT 'Tab',
    default_dosage TEXT DEFAULT '',
    default_frequency TEXT DEFAULT '',
    default_duration TEXT DEFAULT '',
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_tests (
    id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    name          TEXT NOT NULL,
    category      TEXT DEFAULT 'General',
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medicines_department ON medicines(department_id);
CREATE INDEX idx_medicines_name       ON medicines(name);
CREATE INDEX idx_lab_tests_department ON lab_tests(department_id);

-- migrate:down
DROP TABLE IF EXISTS lab_tests CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
