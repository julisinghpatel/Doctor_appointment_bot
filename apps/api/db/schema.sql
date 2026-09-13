\restrict dbmate

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: booking_source_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_source_enum AS ENUM (
    'whatsapp',
    'admin',
    'offline',
    'website'
);


--
-- Name: booking_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_status_enum AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'completed'
);


--
-- Name: booking_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_type_enum AS ENUM (
    'OPD',
    'HOSPITALIZATION'
);


--
-- Name: gender_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gender_enum AS ENUM (
    'male',
    'female',
    'other'
);


--
-- Name: medicine_source_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.medicine_source_enum AS ENUM (
    'whatsapp',
    'admin'
);


--
-- Name: medicine_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.medicine_status_enum AS ENUM (
    'pending',
    'processing',
    'dispatched',
    'completed',
    'cancelled'
);


--
-- Name: patient_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.patient_type_enum AS ENUM (
    'new',
    'existing'
);


--
-- Name: session_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.session_type_enum AS ENUM (
    'morning',
    'afternoon'
);


--
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role_enum AS ENUM (
    'superadmin',
    'admin',
    'doctor',
    'receptionist',
    'pharmacy'
);


--
-- Name: trigger_set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id bigint NOT NULL,
    booking_id text NOT NULL,
    token_number text,
    patient_id bigint NOT NULL,
    doctor_id bigint,
    department_id bigint,
    service_id bigint,
    slot_id bigint,
    session_id bigint,
    appointment_date date,
    patient_type_at_booking public.patient_type_enum,
    type public.booking_type_enum DEFAULT 'OPD'::public.booking_type_enum NOT NULL,
    status public.booking_status_enum DEFAULT 'pending'::public.booking_status_enum NOT NULL,
    source public.booking_source_enum DEFAULT 'whatsapp'::public.booking_source_enum NOT NULL,
    problem_description text DEFAULT ''::text NOT NULL,
    contact_phone text,
    email text,
    created_by bigint,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.bookings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.bookings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: counters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.counters (
    key text NOT NULL,
    seq bigint DEFAULT 0 NOT NULL
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id bigint NOT NULL,
    name text NOT NULL,
    name_hindi text,
    description text DEFAULT ''::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.departments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: doctor_patient_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_patient_types (
    doctor_id bigint NOT NULL,
    patient_type public.patient_type_enum NOT NULL
);


--
-- Name: doctor_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_sessions (
    id bigint NOT NULL,
    doctor_id bigint NOT NULL,
    session_type public.session_type_enum NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: doctor_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.doctor_sessions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.doctor_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctors (
    id bigint NOT NULL,
    department_id bigint,
    name text NOT NULL,
    name_hindi text,
    phone text DEFAULT ''::text NOT NULL,
    role text DEFAULT ''::text NOT NULL,
    qualification text DEFAULT ''::text NOT NULL,
    qualification_hindi text,
    display_schedule text DEFAULT ''::text NOT NULL,
    specialization text NOT NULL,
    specialization_hindi text,
    specialty text DEFAULT ''::text NOT NULL,
    address text DEFAULT ''::text NOT NULL,
    gender public.gender_enum,
    consultation_fee integer DEFAULT 0 NOT NULL,
    experience_years integer DEFAULT 0 NOT NULL,
    image_url text DEFAULT ''::text NOT NULL,
    max_patients_per_day integer DEFAULT 30 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.doctors ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.doctors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: medicine_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medicine_orders (
    id bigint NOT NULL,
    order_id text NOT NULL,
    patient_id bigint NOT NULL,
    delivery_address text NOT NULL,
    prescription_url text NOT NULL,
    customer_notes text DEFAULT ''::text NOT NULL,
    staff_notes text DEFAULT ''::text NOT NULL,
    status public.medicine_status_enum DEFAULT 'pending'::public.medicine_status_enum NOT NULL,
    source public.medicine_source_enum DEFAULT 'whatsapp'::public.medicine_source_enum NOT NULL,
    created_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: medicine_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.medicine_orders ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.medicine_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: patients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients (
    id bigint NOT NULL,
    uhid text,
    phone text NOT NULL,
    name text NOT NULL,
    identity_key text GENERATED ALWAYS AS (((lower(regexp_replace(phone, '\D'::text, ''::text, 'g'::text)) || '|'::text) || lower(regexp_replace(regexp_replace(TRIM(BOTH FROM name), '[^\w\s]'::text, ''::text, 'g'::text), '\s+'::text, ' '::text, 'g'::text)))) STORED NOT NULL,
    age integer,
    gender public.gender_enum,
    district text DEFAULT ''::text NOT NULL,
    address text DEFAULT ''::text NOT NULL,
    pin_code text DEFAULT ''::text NOT NULL,
    is_registered boolean DEFAULT false NOT NULL,
    is_old boolean DEFAULT false NOT NULL,
    last_visited date,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_patients_age CHECK (((age IS NULL) OR ((age >= 0) AND (age <= 120))))
);


--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.patients ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.patients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id bigint NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    duration_minutes integer DEFAULT 30 NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.services ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.services_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id bigint NOT NULL,
    clinic_name text DEFAULT 'DocBot Clinic'::text NOT NULL,
    clinic_phone text DEFAULT ''::text NOT NULL,
    clinic_address text DEFAULT ''::text NOT NULL,
    whatsapp_number text DEFAULT ''::text NOT NULL,
    whatsapp_api_status text DEFAULT 'connected'::text NOT NULL,
    notification_booking_confirm boolean DEFAULT true NOT NULL,
    notification_booking_reminder boolean DEFAULT true NOT NULL,
    notification_booking_cancel boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_settings_singleton CHECK ((id = 1))
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.settings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: time_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_slots (
    id bigint NOT NULL,
    doctor_id bigint NOT NULL,
    slot_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_available boolean DEFAULT true NOT NULL
);


--
-- Name: time_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.time_slots ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.time_slots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role public.user_role_enum NOT NULL,
    doctor_id bigint,
    staff_code text,
    phone text DEFAULT ''::text NOT NULL,
    salary numeric(12,2) DEFAULT 0 NOT NULL,
    joining_date date,
    address text DEFAULT ''::text NOT NULL,
    active_days text[] DEFAULT '{Mon,Tue,Wed,Thu,Fri,Sat}'::text[] NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_users_doctor_link CHECK ((((role = 'doctor'::public.user_role_enum) AND (doctor_id IS NOT NULL)) OR ((role <> 'doctor'::public.user_role_enum) AND (doctor_id IS NULL))))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: counters counters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.counters
    ADD CONSTRAINT counters_pkey PRIMARY KEY (key);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: doctor_patient_types doctor_patient_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_patient_types
    ADD CONSTRAINT doctor_patient_types_pkey PRIMARY KEY (doctor_id, patient_type);


--
-- Name: doctor_sessions doctor_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_sessions
    ADD CONSTRAINT doctor_sessions_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: medicine_orders medicine_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicine_orders
    ADD CONSTRAINT medicine_orders_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: time_slots time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_pkey PRIMARY KEY (id);


--
-- Name: bookings uq_bookings_booking_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT uq_bookings_booking_id UNIQUE (booking_id);


--
-- Name: departments uq_departments_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT uq_departments_name UNIQUE (name);


--
-- Name: doctor_sessions uq_doctor_sessions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_sessions
    ADD CONSTRAINT uq_doctor_sessions UNIQUE (doctor_id, session_type);


--
-- Name: medicine_orders uq_medicine_orders_order_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicine_orders
    ADD CONSTRAINT uq_medicine_orders_order_id UNIQUE (order_id);


--
-- Name: patients uq_patients_identity_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT uq_patients_identity_key UNIQUE (identity_key);


--
-- Name: patients uq_patients_uhid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT uq_patients_uhid UNIQUE (uhid);


--
-- Name: time_slots uq_timeslots_doctor_date_time; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT uq_timeslots_doctor_date_time UNIQUE (doctor_id, slot_date, start_time);


--
-- Name: users uq_users_doctor_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_doctor_id UNIQUE (doctor_id);


--
-- Name: users uq_users_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_email UNIQUE (email);


--
-- Name: users uq_users_staff_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_staff_code UNIQUE (staff_code);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_bookings_capacity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_capacity ON public.bookings USING btree (doctor_id, appointment_date) WHERE (status = ANY (ARRAY['pending'::public.booking_status_enum, 'confirmed'::public.booking_status_enum]));


--
-- Name: idx_bookings_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_created_at ON public.bookings USING btree (created_at DESC);


--
-- Name: idx_bookings_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_created_by ON public.bookings USING btree (created_by, created_at DESC);


--
-- Name: idx_bookings_doctor_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_doctor_date ON public.bookings USING btree (doctor_id, appointment_date);


--
-- Name: idx_bookings_doctor_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_doctor_status ON public.bookings USING btree (doctor_id, status);


--
-- Name: idx_bookings_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_patient ON public.bookings USING btree (patient_id, appointment_date DESC);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status, created_at DESC);


--
-- Name: idx_doctors_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doctors_active ON public.doctors USING btree (is_active, name);


--
-- Name: idx_doctors_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doctors_department ON public.doctors USING btree (department_id) WHERE (is_active = true);


--
-- Name: idx_medicine_orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_medicine_orders_created_at ON public.medicine_orders USING btree (created_at DESC);


--
-- Name: idx_medicine_orders_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_medicine_orders_patient ON public.medicine_orders USING btree (patient_id);


--
-- Name: idx_medicine_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_medicine_orders_status ON public.medicine_orders USING btree (status, created_at DESC);


--
-- Name: idx_patients_is_old; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_is_old ON public.patients USING btree (is_old);


--
-- Name: idx_patients_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_name ON public.patients USING btree (name);


--
-- Name: idx_patients_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_phone ON public.patients USING btree (phone);


--
-- Name: idx_timeslots_available; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timeslots_available ON public.time_slots USING btree (doctor_id, slot_date, is_available) WHERE (is_available = true);


--
-- Name: idx_timeslots_doctor_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timeslots_doctor_date ON public.time_slots USING btree (doctor_id, slot_date);


--
-- Name: idx_users_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_active ON public.users USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: bookings set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: departments set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: doctors set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: medicine_orders set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.medicine_orders FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: patients set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: services set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: settings set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: users set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: bookings bookings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;


--
-- Name: bookings bookings_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.doctor_sessions(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.time_slots(id) ON DELETE SET NULL;


--
-- Name: doctor_patient_types doctor_patient_types_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_patient_types
    ADD CONSTRAINT doctor_patient_types_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: doctor_sessions doctor_sessions_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_sessions
    ADD CONSTRAINT doctor_sessions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: doctors doctors_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE RESTRICT;


--
-- Name: medicine_orders medicine_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicine_orders
    ADD CONSTRAINT medicine_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: medicine_orders medicine_orders_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicine_orders
    ADD CONSTRAINT medicine_orders_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;


--
-- Name: time_slots time_slots_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: users users_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict dbmate


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('001'),
    ('002'),
    ('003'),
    ('004'),
    ('005'),
    ('006'),
    ('007'),
    ('008'),
    ('009'),
    ('010'),
    ('011'),
    ('012'),
    ('013'),
    ('014'),
    ('015');
