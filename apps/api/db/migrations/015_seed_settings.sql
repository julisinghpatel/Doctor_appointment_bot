-- migrate:up
INSERT INTO settings (clinic_name, clinic_phone, clinic_address, whatsapp_number)
VALUES ('KG Nanda Hospital', '', '', '')
ON CONFLICT DO NOTHING;

-- migrate:down
DELETE FROM settings WHERE id = 1;
