-- ==============================================================================
-- BOHOK (বহন) Phase 8 — Production PostgreSQL Schema & Constraints
-- Peer-to-Peer Crowdshipping Platform for Bangladesh
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. USERS & IDENTITY
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  avatar_initials VARCHAR(4) NOT NULL DEFAULT 'ব',
  verification_status VARCHAR(30) NOT NULL DEFAULT 'PHONE_VERIFIED',
  is_phone_verified BOOLEAN NOT NULL DEFAULT true,
  is_identity_verified BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('SENDER', 'TRAVELLER', 'ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS traveller_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_trips_completed INT NOT NULL DEFAULT 0 CHECK (total_trips_completed >= 0),
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating_avg >= 1.00 AND rating_avg <= 5.00),
  preferred_vehicle_mode VARCHAR(30),
  is_verified_traveller BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sender_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_parcels_sent INT NOT NULL DEFAULT 0 CHECK (total_parcels_sent >= 0),
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating_avg >= 1.00 AND rating_avg <= 5.00),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. TRIPS & MOBILITY CORRIDORS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  traveller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  origin_city VARCHAR(50) NOT NULL,
  origin_area VARCHAR(100) NOT NULL,
  destination_city VARCHAR(50) NOT NULL,
  destination_area VARCHAR(100) NOT NULL,
  departure_at TIMESTAMPTZ NOT NULL,
  estimated_arrival_at TIMESTAMPTZ NOT NULL,
  travel_mode VARCHAR(20) NOT NULL CHECK (travel_mode IN ('bus', 'train', 'car', 'motorcycle', 'other')),
  vehicle_mode_bn VARCHAR(50) NOT NULL,
  total_capacity_kg NUMERIC(5,2) NOT NULL CHECK (total_capacity_kg > 0),
  remaining_capacity_kg NUMERIC(5,2) NOT NULL CHECK (remaining_capacity_kg >= 0 AND remaining_capacity_kg <= total_capacity_kg),
  pickup_preference VARCHAR(30) NOT NULL DEFAULT 'near_me',
  pickup_preference_bn VARCHAR(50) NOT NULL DEFAULT 'আমার আশেপাশে',
  status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_waypoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city VARCHAR(50) NOT NULL,
  area_name VARCHAR(100) NOT NULL,
  sequence_order INT NOT NULL DEFAULT 1,
  UNIQUE (trip_id, sequence_order)
);

-- ------------------------------------------------------------------------------
-- 3. PARCELS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  origin_city VARCHAR(50) NOT NULL,
  origin_area VARCHAR(100) NOT NULL,
  destination_city VARCHAR(50) NOT NULL,
  destination_area VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('documents', 'books', 'clothes', 'other_permitted')),
  category_bn VARCHAR(50) NOT NULL,
  weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg <= 20),
  package_size VARCHAR(20) NOT NULL CHECK (package_size IN ('small', 'medium', 'large')),
  package_size_bn VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL DEFAULT 'today',
  urgency_bn VARCHAR(50) NOT NULL DEFAULT 'আজকে ডেলিভারি',
  recipient_name VARCHAR(100) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'SEARCHING' CHECK (status IN ('DRAFT', 'SEARCHING', 'MATCHED', 'BOOKED', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parcel_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  is_permitted BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 4. MATCHES & BOOKINGS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  match_score INT NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  route_score INT NOT NULL DEFAULT 0,
  time_score INT NOT NULL DEFAULT 0,
  distance_score INT NOT NULL DEFAULT 0,
  capacity_score INT NOT NULL DEFAULT 0,
  reliability_score INT NOT NULL DEFAULT 0,
  speed_score INT NOT NULL DEFAULT 0,
  compatibility_level VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE' CHECK (status IN ('CANDIDATE', 'REQUESTED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parcel_id, trip_id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID NOT NULL REFERENCES parcels(id) ON DELETE RESTRICT,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE RESTRICT,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  traveller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING_TRAVELLER' CHECK (status IN (
    'PENDING_TRAVELLER', 'ACCEPTED', 'PAYMENT_PENDING', 'PAYMENT_HELD',
    'READY_FOR_PICKUP', 'TRAVELLER_ARRIVED', 'HANDOVER_PENDING', 'HANDED_OVER',
    'IN_TRANSIT', 'ARRIVED_DESTINATION', 'DELIVERY_PENDING', 'DELIVERED',
    'CANCELLED', 'DISPUTED'
  )),
  traveller_fee NUMERIC(10,2) NOT NULL CHECK (traveller_fee >= 0),
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 20.00 CHECK (platform_fee >= 0),
  trust_guarantee NUMERIC(10,2) NOT NULL DEFAULT 10.00 CHECK (trust_guarantee >= 0),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount > 0),
  cancellation_reason TEXT,
  dispute_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Integrity Constraints:
  -- 1. Sender cannot be the traveller on their own booking
  CONSTRAINT check_sender_not_traveller CHECK (sender_id != traveller_id)
);

-- Partial index to prevent duplicate active booking for the same parcel
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_parcel_booking
  ON bookings (parcel_id)
  WHERE status NOT IN ('CANCELLED', 'DISPUTED');

-- ------------------------------------------------------------------------------
-- 5. HANDOVERS & OTP CHALLENGES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  package_inspected BOOLEAN NOT NULL DEFAULT false,
  no_prohibited_items BOOLEAN NOT NULL DEFAULT false,
  recipient_phone_confirmed BOOLEAN NOT NULL DEFAULT false,
  weight_within_limit BOOLEAN NOT NULL DEFAULT false,
  pickup_verified_at TIMESTAMPTZ,
  delivery_verified_at TIMESTAMPTZ,
  traveller_notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'HANDED_OVER', 'DELIVERED'))
);

CREATE TABLE IF NOT EXISTS otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('HANDOVER', 'DELIVERY')),
  hashed_code VARCHAR(128) NOT NULL,
  salt VARCHAR(64) NOT NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. PAYMENTS & ESCROW
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  method VARCHAR(30) NOT NULL DEFAULT 'bkash' CHECK (method IN ('bkash', 'nagad', 'card', 'demo_escrow')),
  status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'INITIATED', 'HELD', 'RELEASED', 'REFUNDED', 'FAILED')),
  held_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL CHECK (event_type IN ('INITIATE', 'HOLD_ESCROW', 'RELEASE_ESCROW', 'REFUND')),
  amount NUMERIC(10,2) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- ------------------------------------------------------------------------------
-- 7. RATINGS & DISPUTES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  role VARCHAR(20) NOT NULL CHECK (role IN ('sender', 'traveller')),
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  care_score INT CHECK (care_score >= 1 AND care_score <= 5),
  speed_score INT CHECK (speed_score >= 1 AND speed_score <= 5),
  communication_score INT CHECK (communication_score >= 1 AND communication_score <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (booking_id, from_user_id)
);

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  raised_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'REJECTED')),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 8. NOTIFICATIONS & IMMUTABLE AUDIT LOG
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title_bn TEXT NOT NULL,
  body_bn TEXT NOT NULL,
  entity_type VARCHAR(30),
  entity_id UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. PERFORMANCE & RELATIONAL INDEXES
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_trips_traveller ON trips(traveller_id);
CREATE INDEX IF NOT EXISTS idx_trips_corridor ON trips(origin_city, destination_city, status);
CREATE INDEX IF NOT EXISTS idx_parcels_sender ON parcels(sender_id);
CREATE INDEX IF NOT EXISTS idx_parcels_route ON parcels(origin_city, destination_city, status);
CREATE INDEX IF NOT EXISTS idx_bookings_sender ON bookings(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_traveller ON bookings(traveller_id, status);
CREATE INDEX IF NOT EXISTS idx_otp_challenges_booking ON otp_challenges(booking_id, purpose, is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
