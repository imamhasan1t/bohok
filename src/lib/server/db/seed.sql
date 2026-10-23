-- ==============================================================================
-- BOHOK (বহন) Phase 8 — Seed Data (PostgreSQL / Supabase)
-- Demo users, trips, parcels and bookings for development and local testing
-- ==============================================================================

-- 1. Demo Users
INSERT INTO users (id, phone, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '+8801711002233', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', '+8801819556677', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. User Profiles
INSERT INTO user_profiles (user_id, name, avatar_initials, verification_status, is_phone_verified, is_identity_verified) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ইমাম হাসান (Demo Sender)', 'ইহ', 'PHONE_VERIFIED', true, false),
  ('22222222-2222-2222-2222-222222222222', 'মোঃ আব্দুর রহিম (Demo Traveller)', 'আর', 'TRUSTED_TRAVELLER', true, false)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Roles
INSERT INTO user_roles (user_id, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'SENDER'),
  ('22222222-2222-2222-2222-222222222222', 'TRAVELLER')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Traveller & Sender Profiles
INSERT INTO traveller_profiles (user_id, total_trips_completed, rating_avg, preferred_vehicle_mode, is_verified_traveller) VALUES
  ('22222222-2222-2222-2222-222222222222', 14, 4.90, 'গ্রিন লাইন এসি বাস', true)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO sender_profiles (user_id, total_parcels_sent, rating_avg) VALUES
  ('11111111-1111-1111-1111-111111111111', 5, 5.00)
ON CONFLICT (user_id) DO NOTHING;

-- 5. Sample Trip: Dhaka -> Cumilla
INSERT INTO trips (
  id, traveller_id, origin_city, origin_area, destination_city, destination_area,
  departure_at, estimated_arrival_at, travel_mode, vehicle_mode_bn,
  total_capacity_kg, remaining_capacity_kg, pickup_preference, pickup_preference_bn, status
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'ঢাকা', 'সায়েদাবাদ বাস টার্মিনাল',
  'কুমিল্লা', 'শাসনগাছা / পদুয়ার বাজার',
  NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours',
  'bus', 'গ্রিন লাইন এসি বাস',
  5.00, 4.20,
  'near_me', 'সায়েদাবাদ বাস কাউন্টার সংলগ্ন',
  'PUBLISHED'
) ON CONFLICT (id) DO NOTHING;

-- 6. Sample Parcel: Legal documents
INSERT INTO parcels (
  id, sender_id, origin_city, origin_area, destination_city, destination_area,
  category, category_bn, weight_kg, package_size, package_size_bn, description,
  urgency, urgency_bn, recipient_name, recipient_phone, status
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'ঢাকা', 'সায়েদাবাদ বাস টার্মিনাল',
  'কুমিল্লা', 'শাসনগাছা / পদুয়ার বাজার',
  'documents', 'জরুরি আইনি ডকুমেন্টস ও সার্টিফিকেট', 0.80, 'small', 'ছোট প্যাকেট',
  'কোর্ট ও জমির দলিলপত্রাদি', 'today', 'আজকে ডেলিভারি',
  'তানজিলা হক', '+8801912334455', 'BOOKED'
) ON CONFLICT (id) DO NOTHING;

-- 7. Sample Booking & Escrow Payment
INSERT INTO bookings (
  id, parcel_id, trip_id, sender_id, traveller_id, status,
  traveller_fee, platform_fee, trust_guarantee, total_amount, confirmed_at
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'PAYMENT_HELD',
  150.00, 20.00, 10.00, 180.00, NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (
  id, booking_id, amount, method, status, held_at
) VALUES (
  '66666666-6666-6666-6666-666666666666',
  '55555555-5555-5555-5555-555555555555',
  180.00, 'bkash', 'HELD', NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. Handover Record
INSERT INTO handovers (
  id, booking_id, package_inspected, no_prohibited_items, recipient_phone_confirmed, weight_within_limit, status
) VALUES (
  '77777777-7777-7777-7777-777777777777',
  '55555555-5555-5555-5555-555555555555',
  false, false, false, false, 'PENDING'
) ON CONFLICT (booking_id) DO NOTHING;
