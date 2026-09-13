-- migrate:up
CREATE TABLE medicine_orders (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id          TEXT NOT NULL,
    patient_id        BIGINT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    delivery_address  TEXT NOT NULL,
    prescription_url  TEXT NOT NULL,
    customer_notes    TEXT NOT NULL DEFAULT '',
    staff_notes       TEXT NOT NULL DEFAULT '',
    status            medicine_status_enum NOT NULL DEFAULT 'pending',
    source            medicine_source_enum NOT NULL DEFAULT 'whatsapp',
    created_by        BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_medicine_orders_order_id UNIQUE (order_id)
);

CREATE INDEX idx_medicine_orders_status     ON medicine_orders (status, created_at DESC);
CREATE INDEX idx_medicine_orders_patient    ON medicine_orders (patient_id);
CREATE INDEX idx_medicine_orders_created_at ON medicine_orders (created_at DESC);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON medicine_orders
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- migrate:down
DROP TRIGGER IF EXISTS set_updated_at ON medicine_orders;
DROP TABLE IF EXISTS medicine_orders CASCADE;
