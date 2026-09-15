-- migrate:up
CREATE TABLE total_analytics_summary (
    id INTEGER PRIMARY KEY DEFAULT 1 CONSTRAINT chk_single_row CHECK (id = 1),
    total_patients BIGINT NOT NULL DEFAULT 0,
    total_bookings BIGINT NOT NULL DEFAULT 0,
    total_confirmed_bookings BIGINT NOT NULL DEFAULT 0,
    total_pending_bookings BIGINT NOT NULL DEFAULT 0,
    total_completed_bookings BIGINT NOT NULL DEFAULT 0,
    total_cancelled_bookings BIGINT NOT NULL DEFAULT 0,
    total_revenue NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed with initial actual counts from database
INSERT INTO total_analytics_summary (
    id, total_patients, total_bookings, 
    total_confirmed_bookings, total_pending_bookings, 
    total_completed_bookings, total_cancelled_bookings
)
VALUES (
    1,
    (SELECT COUNT(*) FROM patients),
    (SELECT COUNT(*) FROM bookings),
    (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'),
    (SELECT COUNT(*) FROM bookings WHERE status = 'pending'),
    (SELECT COUNT(*) FROM bookings WHERE status = 'completed'),
    (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled')
)
ON CONFLICT (id) DO NOTHING;

-- Patient Trigger Function
CREATE OR REPLACE FUNCTION trigger_update_patient_summary()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE total_analytics_summary SET total_patients = total_patients + 1, updated_at = NOW() WHERE id = 1;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE total_analytics_summary SET total_patients = GREATEST(0, total_patients - 1), updated_at = NOW() WHERE id = 1;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_patients_summary
AFTER INSERT OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION trigger_update_patient_summary();

-- Booking Trigger Function
CREATE OR REPLACE FUNCTION trigger_update_booking_summary()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE total_analytics_summary
        SET 
            total_bookings = total_bookings + 1,
            total_pending_bookings   = total_pending_bookings   + (CASE WHEN NEW.status = 'pending'   THEN 1 ELSE 0 END),
            total_confirmed_bookings = total_confirmed_bookings + (CASE WHEN NEW.status = 'confirmed' THEN 1 ELSE 0 END),
            total_completed_bookings = total_completed_bookings + (CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END),
            total_cancelled_bookings = total_cancelled_bookings + (CASE WHEN NEW.status = 'cancelled' THEN 1 ELSE 0 END),
            updated_at = NOW()
        WHERE id = 1;

    ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        UPDATE total_analytics_summary
        SET 
            total_pending_bookings   = total_pending_bookings   - (CASE WHEN OLD.status = 'pending'   THEN 1 ELSE 0 END) + (CASE WHEN NEW.status = 'pending'   THEN 1 ELSE 0 END),
            total_confirmed_bookings = total_confirmed_bookings - (CASE WHEN OLD.status = 'confirmed' THEN 1 ELSE 0 END) + (CASE WHEN NEW.status = 'confirmed' THEN 1 ELSE 0 END),
            total_completed_bookings = total_completed_bookings - (CASE WHEN OLD.status = 'completed' THEN 1 ELSE 0 END) + (CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END),
            total_cancelled_bookings = total_cancelled_bookings - (CASE WHEN OLD.status = 'cancelled' THEN 1 ELSE 0 END) + (CASE WHEN NEW.status = 'cancelled' THEN 1 ELSE 0 END),
            updated_at = NOW()
        WHERE id = 1;

    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE total_analytics_summary
        SET 
            total_bookings           = GREATEST(0, total_bookings - 1),
            total_pending_bookings   = GREATEST(0, total_pending_bookings   - (CASE WHEN OLD.status = 'pending'   THEN 1 ELSE 0 END)),
            total_confirmed_bookings = GREATEST(0, total_confirmed_bookings - (CASE WHEN OLD.status = 'confirmed' THEN 1 ELSE 0 END)),
            total_completed_bookings = GREATEST(0, total_completed_bookings - (CASE WHEN OLD.status = 'completed' THEN 1 ELSE 0 END)),
            total_cancelled_bookings = GREATEST(0, total_cancelled_bookings - (CASE WHEN OLD.status = 'cancelled' THEN 1 ELSE 0 END)),
            updated_at = NOW()
        WHERE id = 1;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bookings_summary
AFTER INSERT OR UPDATE OF status OR DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION trigger_update_booking_summary();

-- migrate:down
DROP TRIGGER IF EXISTS trg_bookings_summary ON bookings;
DROP FUNCTION IF EXISTS trigger_update_booking_summary();
DROP TRIGGER IF EXISTS trg_patients_summary ON patients;
DROP FUNCTION IF EXISTS trigger_update_patient_summary();
DROP TABLE IF EXISTS total_analytics_summary CASCADE;

