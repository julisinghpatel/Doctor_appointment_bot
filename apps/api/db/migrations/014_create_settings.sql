-- migrate:up
CREATE TABLE settings (
    id                              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    clinic_name                     TEXT NOT NULL DEFAULT 'DocBot Clinic',
    clinic_phone                    TEXT NOT NULL DEFAULT '',
    clinic_address                  TEXT NOT NULL DEFAULT '',
    whatsapp_number                 TEXT NOT NULL DEFAULT '',
    whatsapp_api_status             TEXT NOT NULL DEFAULT 'connected',
    notification_booking_confirm    BOOLEAN NOT NULL DEFAULT true,
    notification_booking_reminder   BOOLEAN NOT NULL DEFAULT true,
    notification_booking_cancel     BOOLEAN NOT NULL DEFAULT true,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_settings_singleton CHECK (id = 1)
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- migrate:down
DROP TRIGGER IF EXISTS set_updated_at ON settings;
DROP TABLE IF EXISTS settings CASCADE;
