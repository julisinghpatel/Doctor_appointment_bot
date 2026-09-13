-- migrate:up
CREATE TABLE users (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name           TEXT NOT NULL,
    email          TEXT NOT NULL,
    password_hash  TEXT NOT NULL,
    role           user_role_enum NOT NULL,
    doctor_id      BIGINT REFERENCES doctors(id) ON DELETE SET NULL,
    staff_code     TEXT,
    phone          TEXT NOT NULL DEFAULT '',
    salary         NUMERIC(12,2) NOT NULL DEFAULT 0,
    joining_date   DATE,
    address        TEXT NOT NULL DEFAULT '',
    active_days    TEXT[] NOT NULL DEFAULT '{Mon,Tue,Wed,Thu,Fri,Sat}',
    is_active      BOOLEAN NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_users_email      UNIQUE (email),
    CONSTRAINT uq_users_staff_code UNIQUE (staff_code),
    CONSTRAINT uq_users_doctor_id  UNIQUE (doctor_id),
    CONSTRAINT chk_users_doctor_link CHECK (
        (role = 'doctor' AND doctor_id IS NOT NULL) OR
        (role != 'doctor' AND doctor_id IS NULL)
    )
);

CREATE INDEX idx_users_role   ON users (role);
CREATE INDEX idx_users_active ON users (is_active) WHERE is_active = true;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- migrate:down
DROP TRIGGER IF EXISTS set_updated_at ON users;
DROP TABLE IF EXISTS users CASCADE;
