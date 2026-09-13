-- migrate:up
CREATE TABLE bookings (
    id                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id               TEXT NOT NULL,
    token_number             TEXT,
    patient_id               BIGINT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id                BIGINT REFERENCES doctors(id) ON DELETE SET NULL,
    department_id            BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    service_id               BIGINT REFERENCES services(id) ON DELETE SET NULL,
    slot_id                  BIGINT REFERENCES time_slots(id) ON DELETE SET NULL,
    session_id               BIGINT REFERENCES doctor_sessions(id) ON DELETE SET NULL,
    appointment_date         DATE,
    patient_type_at_booking  patient_type_enum,
    type                     booking_type_enum NOT NULL DEFAULT 'OPD',
    status                   booking_status_enum NOT NULL DEFAULT 'pending',
    source                   booking_source_enum NOT NULL DEFAULT 'whatsapp',
    problem_description      TEXT NOT NULL DEFAULT '',
    contact_phone            TEXT,
    email                    TEXT,
    created_by               BIGINT REFERENCES users(id) ON DELETE SET NULL,
    meta                     JSONB NOT NULL DEFAULT '{}',
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_bookings_booking_id UNIQUE (booking_id)
);

CREATE INDEX idx_bookings_status        ON bookings (status, created_at DESC);
CREATE INDEX idx_bookings_doctor_date   ON bookings (doctor_id, appointment_date);
CREATE INDEX idx_bookings_patient       ON bookings (patient_id, appointment_date DESC);
CREATE INDEX idx_bookings_created_at    ON bookings (created_at DESC);
CREATE INDEX idx_bookings_created_by    ON bookings (created_by, created_at DESC);
CREATE INDEX idx_bookings_doctor_status ON bookings (doctor_id, status);
CREATE INDEX idx_bookings_capacity      ON bookings (doctor_id, appointment_date)
    WHERE status IN ('pending', 'confirmed');

CREATE TRIGGER set_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- migrate:down
DROP TRIGGER IF EXISTS set_updated_at ON bookings;
DROP TABLE IF EXISTS bookings CASCADE;
