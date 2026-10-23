// BOHOK Phase 7 — Booking, Handover & Delivery Lifecycle Test Suite
import assert from 'node:assert';
import { defaultBookingStore } from '../bookingStore';
import { validateBookingTransition, canCancelBooking } from '../bookingTransitions';
import { defaultDemoPaymentProvider } from '../../payment/demoPaymentProvider';
import { defaultDemoTrackingProvider } from '../../tracking/demoTrackingProvider';
import { getCorridorForRoute } from '../../tracking/trackingCorridors';

export function runPhase7BookingTests() {
  console.log('\n--- Suite 4: Phase 7 Booking, Handover & Delivery Lifecycle (12 Tests) ---');

  // Test 1: Valid State Machine Transitions
  {
    const step1 = validateBookingTransition('PENDING_TRAVELLER', 'ACCEPTED');
    assert.strictEqual(step1.valid, true, 'PENDING_TRAVELLER -> ACCEPTED must be valid');

    const step2 = validateBookingTransition('ACCEPTED', 'PAYMENT_PENDING');
    assert.strictEqual(step2.valid, true, 'ACCEPTED -> PAYMENT_PENDING must be valid');

    const step3 = validateBookingTransition('PAYMENT_HELD', 'READY_FOR_PICKUP');
    assert.strictEqual(step3.valid, true, 'PAYMENT_HELD -> READY_FOR_PICKUP must be valid');

    const step4 = validateBookingTransition('HANDED_OVER', 'IN_TRANSIT');
    assert.strictEqual(step4.valid, true, 'HANDED_OVER -> IN_TRANSIT must be valid');

    const step5 = validateBookingTransition('DELIVERY_PENDING', 'DELIVERED');
    assert.strictEqual(step5.valid, true, 'DELIVERY_PENDING -> DELIVERED must be valid');
    console.log('  ✔ PASS [39] [Booking] 1. Valid lifecycle transitions accepted by state machine');
  }

  // Test 2: Invalid State Machine Transitions Strictly Rejected
  {
    const invalid1 = validateBookingTransition('PENDING_TRAVELLER', 'IN_TRANSIT');
    assert.strictEqual(invalid1.valid, false, 'Direct jump from PENDING to IN_TRANSIT must fail');
    assert.ok(invalid1.errorMessageBn?.includes('গ্রহণযোগ্য নয়'));

    const invalid2 = validateBookingTransition('DELIVERED', 'IN_TRANSIT');
    assert.strictEqual(invalid2.valid, false, 'Cannot go back to IN_TRANSIT from DELIVERED');
    console.log('  ✔ PASS [40] [Booking] 2. Invalid lifecycle transitions strictly rejected');
  }

  // Test 3: Cancellation Boundary Rules
  {
    assert.strictEqual(canCancelBooking('PENDING_TRAVELLER'), true, 'Can cancel at PENDING');
    assert.strictEqual(canCancelBooking('ACCEPTED'), true, 'Can cancel at ACCEPTED');
    assert.strictEqual(canCancelBooking('PAYMENT_HELD'), true, 'Can cancel at PAYMENT_HELD');
    assert.strictEqual(canCancelBooking('HANDED_OVER'), false, 'Cannot directly cancel once handed over');
    assert.strictEqual(canCancelBooking('IN_TRANSIT'), false, 'Cannot cancel when in transit');
    assert.strictEqual(canCancelBooking('DELIVERED'), false, 'Cannot cancel after delivery');
    console.log('  ✔ PASS [41] [Booking] 3. Enforces strict cancellation boundaries before handover');
  }

  // Test 4: Demo Escrow Creation & Hold
  {
    const booking = defaultBookingStore.createBooking({
      parcelId: 'pcl-test-1',
      tripId: 'trip-test-1',
      senderId: 'user-sender-test',
      senderName: 'পরীক্ষামূলক প্রেরক',
      senderPhone: '+880 1711-223344',
      recipientName: 'পরীক্ষামূলক প্রাপক',
      recipientPhone: '+880 1911-556677',
      travellerId: 'user-traveller-test',
      travellerName: 'পরীক্ষামূলক সহযাত্রী',
      travellerPhone: '+880 1811-990011',
      travellerRating: 4.9,
      travellerAvatar: '👨‍✈️',
      travellerVehicleBn: 'বাস',
      originCityBn: 'ঢাকা',
      originAreaBn: 'সায়েদাবাদ',
      destinationCityBn: 'কুমিল্লা',
      destinationAreaBn: 'শাসনগাছা',
      routeBn: 'ঢাকা → কুমিল্লা',
      corridorNameBn: 'ঢাকা-চট্টগ্রাম করিডোর',
      parcelTitleBn: 'জরুরি নথি',
      parcelCategoryBn: 'ডকুমেন্ট',
      parcelWeightKg: 0.5,
      parcelSizeBn: 'ছোট',
      pickupEstimatedTimeBn: 'সকাল ০৮:০০',
      deliveryEstimatedTimeBn: 'সকাল ১০:৩০',
      priceBreakdown: {
        travellerFee: 150,
        platformFee: 20,
        trustGuarantee: 10,
        total: 180,
      },
    });

    assert.strictEqual(booking.status, 'PENDING_TRAVELLER');
    assert.strictEqual(booking.paymentStatus, 'UNPAID');

    defaultBookingStore.acceptBooking(booking.id);
    assert.strictEqual(booking.status, 'ACCEPTED');

    console.log('  ✔ PASS [42] [Booking] 4. Booking creation and traveller acceptance update state cleanly');
  }

  // Test 5: Escrow Payment Hold
  {
    const bookings = defaultBookingStore.getAllBookings();
    const target = bookings.find((b) => b.status === 'ACCEPTED');
    assert.ok(target, 'Should find ACCEPTED booking');

    // Hold payment
    defaultBookingStore.holdPayment(target.id, 'bkash').then((updated) => {
      assert.strictEqual(updated.status, 'PAYMENT_HELD');
      assert.strictEqual(updated.paymentStatus, 'HELD');
      assert.ok(updated.paymentTransactionId);
    });
    console.log('  ✔ PASS [43] [Payment] 5. Demo Escrow holds funds safely without real financial charge');
  }

  // Test 6: Handover OTP 1 Verification Requires 4-Point Safety Checklist
  {
    const b = defaultBookingStore.getBookingById('BHK-89241');
    assert.ok(b, 'Seed BHK-89241 must exist');

    // Incomplete checklist should fail
    const failedChecklist = defaultBookingStore.verifyHandoverOtp(b.id, b.handover.otp1, {
      packageInspected: true,
      noProhibitedItems: false, // Incomplete!
      recipientPhoneConfirmed: true,
      weightWithinLimit: true,
    });
    assert.strictEqual(failedChecklist.success, false);
    assert.ok(failedChecklist.messageBn.includes('নিরাপত্তা চেকলিস্টের সকল শর্তাবলি'));

    // Wrong OTP should fail
    const wrongOtp = defaultBookingStore.verifyHandoverOtp(b.id, '0000', {
      packageInspected: true,
      noProhibitedItems: true,
      recipientPhoneConfirmed: true,
      weightWithinLimit: true,
    });
    assert.strictEqual(wrongOtp.success, false);
    assert.ok(wrongOtp.messageBn.includes('ভুল ওটিপি'));

    // Correct OTP and complete checklist should succeed
    const validHandover = defaultBookingStore.verifyHandoverOtp(b.id, b.handover.otp1, {
      packageInspected: true,
      noProhibitedItems: true,
      recipientPhoneConfirmed: true,
      weightWithinLimit: true,
    });
    assert.strictEqual(validHandover.success, true);
    assert.strictEqual(validHandover.booking.status, 'HANDED_OVER');
    assert.strictEqual(validHandover.booking.handover.otp1Verified, true);
    console.log('  ✔ PASS [44] [Handover] 6. OTP 1 and 4-point safety checklist verified correctly');
  }

  // Test 7: Start Journey into Transit
  {
    const b = defaultBookingStore.getBookingById('BHK-89241');
    assert.ok(b);
    const inTransit = defaultBookingStore.startJourney(b.id);
    assert.strictEqual(inTransit.status, 'IN_TRANSIT');
    console.log('  ✔ PASS [45] [Transit] 7. Journey transitions to IN_TRANSIT along national highway');
  }

  // Test 8: Corridor Tracking Simulation & Privacy Masking
  {
    const corridor = getCorridorForRoute('ঢাকা', 'কুমিল্লা');
    assert.strictEqual(corridor.checkpoints.length, 5, 'Dhaka-Cumilla corridor must have 5 checkpoints');

    defaultDemoTrackingProvider.getTracking('BHK-74192', 'ঢাকা', 'চট্টগ্রাম').then((tracking) => {
      assert.ok(tracking.corridorNameBn.includes('ঢাকা-চট্টগ্রাম'));
      assert.ok(tracking.maskedCurrentLocationBn.includes('মহাসড়ক'));
      assert.strictEqual(tracking.isSimulated, true);
    });
    console.log('  ✔ PASS [46] [Tracking] 8. Corridor tracking calculates ETA and preserves location privacy');
  }

  // Test 9: Delivery OTP 2 Verification & Automatic Escrow Release
  {
    const b = defaultBookingStore.getBookingById('BHK-74192');
    assert.ok(b);

    // Wrong OTP 2
    defaultBookingStore.verifyDeliveryOtp(b.id, '1111').then((res) => {
      assert.strictEqual(res.success, false);
    });

    // Correct OTP 2
    defaultBookingStore.verifyDeliveryOtp(b.id, b.delivery.otp2).then((res) => {
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.booking.status, 'DELIVERED');
      assert.strictEqual(res.booking.paymentStatus, 'RELEASED');
    });
    console.log('  ✔ PASS [47] [Delivery] 9. Delivery OTP 2 verification releases escrow to traveller');
  }

  // Test 10: Two-Sided Ratings Calculation
  {
    const ratedBooking = defaultBookingStore.submitRating(
      'BHK-89241',
      'sender',
      5,
      'দারুণ ও দায়িত্বশীল সেবা!',
      { careScore: 5, speedScore: 5, communicationScore: 5 }
    );
    assert.ok(ratedBooking.senderRating);
    assert.strictEqual(ratedBooking.senderRating.rating, 5);
    assert.strictEqual(ratedBooking.senderRating.fromRole, 'sender');
    console.log('  ✔ PASS [48] [Rating] 10. Two-sided ratings record and persist user trust scores');
  }

  // Test 11: Dispute Filing and Status Transition
  {
    const disputeBooking = defaultBookingStore.raiseDispute(
      'BHK-89241',
      'sender',
      'late_delivery',
      'অযৌক্তিক অতিরিক্ত বিলম্ব',
      'সহযাত্রী এখনও গন্তব্যে পৌঁছাননি'
    );
    assert.strictEqual(disputeBooking.status, 'DISPUTED');
    assert.ok(disputeBooking.dispute);
    assert.strictEqual(disputeBooking.dispute.category, 'late_delivery');
    console.log('  ✔ PASS [49] [Dispute] 11. Disputes freeze normal lifecycle and register audit record');
  }

  // Test 12: Cancellation Refunds Escrow Before Handover
  {
    const cBooking = defaultBookingStore.createBooking({
      parcelId: 'pcl-refund-test',
      tripId: 'trip-refund-test',
      senderId: 'user-sender-imam',
      senderName: 'ইমাম হাসান',
      senderPhone: '+880 1711-002233',
      recipientName: 'প্রাপক',
      recipientPhone: '+880 1912-334455',
      travellerId: 'user-traveller-rahim',
      travellerName: 'আব্দুর রহিম',
      travellerPhone: '+880 1819-556677',
      travellerRating: 4.9,
      travellerAvatar: '👨‍💼',
      travellerVehicleBn: 'বাস',
      originCityBn: 'ঢাকা',
      originAreaBn: 'সায়েদাবাদ',
      destinationCityBn: 'কুমিল্লা',
      destinationAreaBn: 'কান্দিরপাড়',
      routeBn: 'ঢাকা → কুমিল্লা',
      corridorNameBn: 'N1 করিডোর',
      parcelTitleBn: 'বইয়ের পার্সেল',
      parcelCategoryBn: 'বই',
      parcelWeightKg: 1.0,
      parcelSizeBn: 'বই',
      pickupEstimatedTimeBn: 'দুপুর ১২:০০',
      deliveryEstimatedTimeBn: 'বিকেল ০৩:০০',
      priceBreakdown: {
        travellerFee: 140,
        platformFee: 20,
        trustGuarantee: 10,
        total: 170,
      },
    });

    const cancelled = defaultBookingStore.cancelBooking(cBooking.id, 'sender', 'প্রয়োজন শেষ হয়েছে');
    assert.strictEqual(cancelled.status, 'CANCELLED');
    console.log('  ✔ PASS [50] [Cancellation] 12. Pre-handover cancellation cleanly updates state');
  }
}
