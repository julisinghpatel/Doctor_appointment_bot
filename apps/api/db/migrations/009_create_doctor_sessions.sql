-- migrate:up
-- DORMANT: Phase 2. No application code references this table.
-- Admin may pre-fill data. Bot ignores it until capacity enforcement is built.
CREATE TABLE doctor_sessions (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    doctor_id     BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    session_type  session_type_enum NOT NULL,
    start_time    TIME NOT NULL,
    end_time      TIME NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_doctor_sessions UNIQUE (doctor_id, session_type)
);

-- migrate:down
DROP TABLE IF EXISTS doctor_sessions CASCADE;
