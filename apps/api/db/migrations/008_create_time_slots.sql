-- migrate:up
CREATE TABLE time_slots (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    doctor_id     BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    slot_date     DATE NOT NULL,
    start_time    TIME NOT NULL,
    end_time      TIME NOT NULL,
    is_available  BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT uq_timeslots_doctor_date_time UNIQUE (doctor_id, slot_date, start_time)
);

CREATE INDEX idx_timeslots_doctor_date ON time_slots (doctor_id, slot_date);
CREATE INDEX idx_timeslots_available   ON time_slots (doctor_id, slot_date, is_available)
    WHERE is_available = true;

-- migrate:down
DROP TABLE IF EXISTS time_slots CASCADE;
