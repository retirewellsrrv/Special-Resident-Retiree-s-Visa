-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('admin', 'applicant');
CREATE TYPE gender AS ENUM ('male', 'female', 'other');
CREATE TYPE nationality AS ENUM ('filipino', 'american', 'japanese', 'korean', 'chinese', 'other');
CREATE TYPE application_status AS ENUM ('draft', 'submitted', 'under_review', 'pending_documents', 'approved', 'rejected');
CREATE TYPE document_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE document_type AS ENUM ('passport', 'birth_certificate', 'marriage_certificate', 'bank_statement', 'medical_certificate', 'photo', 'other');
CREATE TYPE service_type AS ENUM ('srrv_classic', 'srrv_smile', 'srrv_human_touch', 'srrv_courtesy');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'bank_transfer', 'gcash', 'maya');

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'applicant',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_profiles (
  user_id  INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name     TEXT NOT NULL
);

CREATE TABLE client_profiles (
  user_id      INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  gender       gender,
  nationality  nationality,
  age          INTEGER,
  address      TEXT
);

CREATE TABLE services (
  id            SERIAL PRIMARY KEY,
  type          service_type NOT NULL,
  price         NUMERIC NOT NULL,
  description   TEXT,
  is_available  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE applications (
  id                SERIAL PRIMARY KEY,
  client_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_type      service_type NOT NULL,
  application_code  INTEGER NOT NULL UNIQUE,
  status            application_status NOT NULL DEFAULT 'draft',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE documents (
  id              SERIAL PRIMARY KEY,
  application_id  INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  path            TEXT NOT NULL,
  type            document_type NOT NULL,
  status          document_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id               SERIAL PRIMARY KEY,
  client_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status           payment_status NOT NULL DEFAULT 'pending',
  amount           NUMERIC NOT NULL,
  transaction_code TEXT,
  payment_method   payment_method NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id           SERIAL PRIMARY KEY,
  sender_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id            SERIAL PRIMARY KEY,
  client_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification  TEXT NOT NULL
);

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_applications
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();