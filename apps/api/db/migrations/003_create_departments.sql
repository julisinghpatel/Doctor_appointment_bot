-- migrate:up
CREATE TABLE departments (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name         TEXT NOT NULL,
    name_hindi   TEXT,
    description  TEXT NOT NULL DEFAULT '',
    is_active    BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_departments_name UNIQUE (name)
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- migrate:down
DROP TRIGGER IF EXISTS set_updated_at ON departments;
DROP TABLE IF EXISTS departments CASCADE;
