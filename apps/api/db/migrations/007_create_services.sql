-- migrate:up
CREATE TABLE services (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name             TEXT NOT NULL,
    description      TEXT NOT NULL DEFAULT '',
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price            NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_active        BOOLEAN NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- migrate:down
DROP TRIGGER IF EXISTS set_updated_at ON services;
DROP TABLE IF EXISTS services CASCADE;
