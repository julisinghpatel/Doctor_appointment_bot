-- migrate:up
CREATE TYPE gender_enum          AS ENUM ('male', 'female', 'other');
CREATE TYPE user_role_enum       AS ENUM ('superadmin', 'admin', 'doctor', 'receptionist', 'pharmacy');
CREATE TYPE patient_type_enum    AS ENUM ('new', 'existing');
CREATE TYPE session_type_enum    AS ENUM ('morning', 'afternoon');
CREATE TYPE booking_type_enum    AS ENUM ('OPD', 'HOSPITALIZATION');
CREATE TYPE booking_status_enum  AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE booking_source_enum  AS ENUM ('whatsapp', 'admin', 'offline', 'website');
CREATE TYPE medicine_status_enum AS ENUM ('pending', 'processing', 'dispatched', 'completed', 'cancelled');
CREATE TYPE medicine_source_enum AS ENUM ('whatsapp', 'admin');

-- migrate:down
DROP TYPE IF EXISTS medicine_source_enum;
DROP TYPE IF EXISTS medicine_status_enum;
DROP TYPE IF EXISTS booking_source_enum;
DROP TYPE IF EXISTS booking_status_enum;
DROP TYPE IF EXISTS booking_type_enum;
DROP TYPE IF EXISTS session_type_enum;
DROP TYPE IF EXISTS patient_type_enum;
DROP TYPE IF EXISTS user_role_enum;
DROP TYPE IF EXISTS gender_enum;
