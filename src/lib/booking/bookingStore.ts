// BOHOK Phase 7 — Central Booking Domain Store & State Orchestrator
// Coordinates the full lifecycle: Sender -> Match -> Escrow -> Handover -> Transit -> Delivery -> Release -> Rating

import {
  BookingDispute,
  BookingLifecycleStatus,
  BookingPriceBreakdown,
  BookingRating,
  DetailedBooking,
  HandoverSafetyChecklist,
} from './bookingTypes';
import { validateBookingTransition, canCancelBooking } from './bookingTransitions';
import { createBookingEvent, BookingEvent } from './bookingEvents';
import { defaultDemoPaymentProvider } from '../payment/demoPaymentProvider';
import { defaultDemoTrackingProvider } from '../tracking/demoTrackingProvider';

// Subscriber callback type
type StoreSubscriber = () => void;

class BookingStore {
  private bookings: Map<string, DetailedBooking> = new Map();
  private events: BookingEvent[] = [];
  private subscribers: Set<StoreSubscriber> = new Set();

  constructor() {
    this.seedInitialBookings();
  }

  public subscribe(callback: StoreSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify(): void {
    this.subscribers.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('BookingStore subscriber error:', err);
      }
    });
  }

  public getAllBookings(): DetailedBooking[] {
    return Array.from(this.bookings.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getBookingById(id: string): DetailedBooking | undefined {
    return this.bookings.get(id);
  }

  public getSenderBookings(senderId: string): DetailedBooking[] {
    return this.getAllBookings().filter((b) => b.senderId === senderId);
  }

  public getTravellerBookings(travellerId: string): DetailedBooking[] {
    return this.getAllBookings().filter((b) => b.travellerId === travellerId);
  }

  public getEvents(bookingId: string): BookingEvent[] {
    return this.events.filter((e) => e.bookingId === bookingId);
  }

  /**
   * 1. Create a new booking request from a matched trip
   */
  public createBooking(params: {
    parcelId: string;
    tripId: string;
    senderId: string;
    senderName: string;
    senderPhone: string;
    recipientName: string;
    recipientPhone: string;
    travellerId: string;
    travellerName: string;
    travellerPhone: string;
    travellerRating: number;
    travellerAvatar: string;
    travellerVehicleBn: string;
    originCityBn: string;
    originAreaBn: string;
    destinationCityBn: string;
    destinationAreaBn: string;
    routeBn: string;
    corridorNameBn: string;
    parcelTitleBn: string;
    parcelCategoryBn: string;
    parcelWeightKg: number;
    parcelSizeBn: string;
    pickupEstimatedTimeBn: string;
    deliveryEstimatedTimeBn: string;
    priceBreakdown: BookingPriceBreakdown;
  }): DetailedBooking {
    const id = `BHK-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    // Generate dual secure OTPs (never revealed to traveller before handovers)
    const otp1 = Math.floor(1000 + Math.random() * 9000).toString();
    const otp2 = Math.floor(1000 + Math.random() * 9000).toString();

    const booking: DetailedBooking = {
      id,
      parcelId: params.parcelId,
      tripId: params.tripId,
      senderId: params.senderId,
      senderName: params.senderName,
      senderPhone: params.senderPhone,
      senderPhoneMasked: this.maskPhone(params.senderPhone),
      recipientName: params.recipientName,
      recipientPhone: params.recipientPhone,
      recipientPhoneMasked: this.maskPhone(params.recipientPhone),
      travellerId: params.travellerId,
      travellerName: params.travellerName,
      travellerPhone: params.travellerPhone,
      travellerPhoneMasked: this.maskPhone(params.travellerPhone),
      travellerRating: params.travellerRating,
      travellerAvatar: params.travellerAvatar,
      travellerVehicleBn: params.travellerVehicleBn,
      originCityBn: params.originCityBn,
      originAreaBn: params.originAreaBn,
      destinationCityBn: params.destinationCityBn,
      destinationAreaBn: params.destinationAreaBn,
      routeBn: params.routeBn,
      corridorNameBn: params.corridorNameBn,
      parcelTitleBn: params.parcelTitleBn,
      parcelCategoryBn: params.parcelCategoryBn,
      parcelWeightKg: params.parcelWeightKg,
      parcelSizeBn: params.parcelSizeBn,
      pickupEstimatedTimeBn: params.pickupEstimatedTimeBn,
      deliveryEstimatedTimeBn: params.deliveryEstimatedTimeBn,
      status: 'PENDING_TRAVELLER',
      priceBreakdown: params.priceBreakdown,
      paymentStatus: 'UNPAID',
      handover: {
        otp1,
        otp1Verified: false,
        checklist: {
          packageInspected: false,
          noProhibitedItems: false,
          recipientPhoneConfirmed: false,
          weightWithinLimit: false,
        },
      },
      delivery: {
        otp2,
        otp2Verified: false,
      },
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          status: 'PENDING_TRAVELLER',
          titleBn: 'বুকিং অনুরোধ পাঠানো হয়েছে',
          descriptionBn: `সহযাত্রী ${params.travellerName}-এর সম্মতির অপেক্ষায়`,
          timestamp: now,
          actorRole: 'sender',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.bookings.set(id, booking);

    this.recordEvent(
      id,
      'BOOKING_REQUESTED',
      'PENDING_TRAVELLER',
      'বুকিং অনুরোধ সম্পন্ন',
      `প্রেরক ${params.senderName} সহযাত্রীর কাছে অনুরোধ জানিয়েছেন`,
      'sender',
      params.senderId
    );

    this.notify();
    return booking;
  }

  /**
   * 2. Traveller accepts the booking request
   */
  public acceptBooking(bookingId: string): DetailedBooking {
    const booking = this.getRequiredBooking(bookingId);
    this.assertTransition(booking.status, 'ACCEPTED');

    booking.status = 'ACCEPTED';
    booking.updatedAt = new Date().toISOString();
    booking.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'ACCEPTED',
      titleBn: 'সহযাত্রী অনুরোধ গ্রহণ করেছেন',
      descriptionBn: 'এসক্রো পেমেন্ট পরিশোধের পর পিকআপের কার্যক্রম শুরু হবে',
      timestamp: booking.updatedAt,
      actorRole: 'traveller',
    });

    this.recordEvent(
      bookingId,
      'BOOKING_ACCEPTED',
      'ACCEPTED',
      'বুকিং গ্রহণ',
      `সহযাত্রী ${booking.travellerName} অনুরোধ গ্রহণ করেছেন`,
      'traveller',
      booking.travellerId
    );

    this.notify();
    return booking;
  }

  /**
   * 3. Hold payment in demo escrow
   */
  public async holdPayment(
    bookingId: string,
    method: 'bkash' | 'nagad' | 'card' | 'demo_escrow' = 'bkash'
  ): Promise<DetailedBooking> {
    const booking = this.getRequiredBooking(bookingId);

    // If currently ACCEPTED, step to PAYMENT_PENDING then PAYMENT_HELD
    if (booking.status === 'ACCEPTED') {
      booking.status = 'PAYMENT_PENDING';
    }

    this.assertTransition(booking.status, 'PAYMENT_HELD');

    const txn = await defaultDemoPaymentProvider.createTransaction(
      bookingId,
      {
        travellerFee: booking.priceBreakdown.travellerFee,
        platformFee: booking.priceBreakdown.platformFee,
        trustGuarantee: booking.priceBreakdown.trustGuarantee,
        totalAmount: booking.priceBreakdown.total,
      },
      method,
      booking.senderId,
      booking.travellerId
    );

    await defaultDemoPaymentProvider.holdEscrow(txn.id);

    booking.status = 'PAYMENT_HELD';
    booking.paymentStatus = 'HELD';
    booking.paymentTransactionId = txn.id;
    booking.updatedAt = new Date().toISOString();

    booking.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'PAYMENT_HELD',
      titleBn: 'এসক্রো পেমেন্ট সংরক্ষিত',
      descriptionBn: `৳${booking.priceBreakdown.total} টাকা BOHOK ডেমো ভল্টে জমা রাখা হয়েছে`,
      timestamp: booking.updatedAt,
      actorRole: 'system',
    });

    this.recordEvent(
      bookingId,
      'PAYMENT_ESCROW_HELD',
      'PAYMENT_HELD',
      'এসক্রো পেমেন্ট নিশ্চিত',
      `টাকা নিরাপদে সংরক্ষিত আছে (${txn.transactionNumber})`,
      'system',
      'system',
      { transactionId: txn.id }
    );

    this.notify();
    return booking;
  }

  /**
   * 4. Traveller arrives at pickup location
   */
  public travellerArrivedPickup(bookingId: string): DetailedBooking {
    const booking = this.getRequiredBooking(bookingId);

    if (booking.status === 'PAYMENT_HELD') {
      booking.status = 'READY_FOR_PICKUP';
    }

    this.assertTransition(booking.status, 'TRAVELLER_ARRIVED');

    booking.status = 'TRAVELLER_ARRIVED';
    booking.updatedAt = new Date().toISOString();

    booking.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'TRAVELLER_ARRIVED',
      titleBn: 'সহযাত্রী পিকআপ স্থানে পৌঁছেছেন',
      descriptionBn: `${booking.originAreaBn}-এ সহযাত্রী উপস্থিত হয়েছেন। নিরাপত্তা চেকলিস্ট পূরণ করুন।`,
      timestamp: booking.updatedAt,
      actorRole: 'traveller',
    });

    this.recordEvent(
      bookingId,
      'TRAVELLER_ARRIVED_PICKUP',
      'TRAVELLER_ARRIVED',
      'পিকআপে উপস্থিতি',
      `সহযাত্রী ${booking.travellerName} পিকআপ লোকেশনে পৌঁছেছেন`,
      'traveller',
      booking.travellerId
    );

    this.notify();
    return booking;
  }

  /**
   * 5. Verify First OTP (Handover from Sender to Traveller)
   * The Sender provides the code verbally or on-screen, Traveller types it in.
   */
  public verifyHandoverOtp(
    bookingId: string,
    inputOtp: string,
    checklist: HandoverSafetyChecklist
  ): { success: boolean; messageBn: string; booking: DetailedBooking } {
    const booking = this.getRequiredBooking(bookingId);

    // If currently TRAVELLER_ARRIVED or PAYMENT_HELD, move to HANDOVER_PENDING
    if (booking.status === 'TRAVELLER_ARRIVED' || booking.status === 'PAYMENT_HELD' || booking.status === 'READY_FOR_PICKUP') {
      booking.status = 'HANDOVER_PENDING';
    }

    // Safety checks validation
    if (
      !checklist.packageInspected ||
      !checklist.noProhibitedItems ||
      !checklist.recipientPhoneConfirmed ||
      !checklist.weightWithinLimit
    ) {
      return {
        success: false,
        messageBn: 'অনুগ্রহ করে নিরাপত্তা চেকলিস্টের সকল শর্তাবলি নিশ্চিত করুন।',
        booking,
      };
    }

    if (booking.handover.otp1.trim() !== inputOtp.trim()) {
      return {
        success: false,
        messageBn: 'ভুল ওটিপি কোড! প্রেরকের স্ক্রিনে প্রদর্শিত ১ম ওটিপি কোডটি নির্ভুলভাবে দিন।',
        booking,
      };
    }

    this.assertTransition(booking.status, 'HANDED_OVER');

    booking.status = 'HANDED_OVER';
    booking.handover.otp1Verified = true;
    booking.handover.verifiedAt = new Date().toISOString();
    booking.handover.checklist = checklist;
    booking.updatedAt = booking.handover.verifiedAt;

    booking.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'HANDED_OVER',
      titleBn: 'পার্সেল সফলভাবে হস্তান্তর সম্পন্ন (১ম ওটিপি)',
      descriptionBn: 'নিরাপত্তা চেকলিস্ট সম্পন্ন এবং পার্সেল সহযাত্রীর দায়িত্বে প্রদান করা হয়েছে',
      timestamp: booking.updatedAt,
      actorRole: 'traveller',
    });

    this.recordEvent(
      bookingId,
      'HANDOVER_OTP_VERIFIED',
      'HANDED_OVER',
      '১ম ওটিপি যাচাই সম্পন্ন',
      'পার্সেল সহযাত্রীর জিম্মায় হস্তান্তর করা হয়েছে',
      'traveller',
      booking.travellerId
    );

    this.notify();
    return {
      success: true,
      messageBn: '১ম ওটিপি কোড সঠিক হয়েছে। পার্সেল হস্তান্তর সফলভাবে সম্পন্ন হয়েছে।',
      booking,
    };
  }

  /**
   * 6. Start Journey (Enter IN_TRANSIT)
   */
  public startJourney(bookingId: string): DetailedBooking {
    const booking = this.getRequiredBooking(bookingId);
    this.assertTransition(booking.status, 'IN_TRANSIT');

    booking.status = 'IN_TRANSIT';
    booking.updatedAt = new Date().toISOString();

    booking.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'IN_TRANSIT',
      titleBn: 'যাত্রা শুরু হয়েছে (মহাসড়কে পার্সেল)',
      descriptionBn: `${booking.corridorNameBn}-এ পার্সেল গন্তব্যের উদ্দেশ্যে চলছে`,
      timestamp: booking.updatedAt,
      actorRole: 'traveller',
    });

    this.recordEvent(
      bookingId,
      'JOURNEY_STARTED',
      'IN_TRANSIT',
      'মহাসড়ক যাত্রা শুরু',
      'সহযাত্রী জাতীয় মহাসড়কে যাত্রা শুরু করেছেন',
      'traveller',
      booking.travellerId
    );

    this.notify();
    return booking;
  }

  /**
   * 7. Traveller Arrives at Destination City
   */
  public travellerArrivedDestination(bookingId: string): DetailedBooking {
    const booking = this.getRequiredBooking(bookingId);
    this.assertTransition(booking.status, 'ARRIVED_DESTINATION');

    booking.status = 'ARRIVED_DESTINATION';
    booking.updatedAt = new Date().toISOString();

    booking.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'ARRIVED_DESTINATION',
      titleBn: 'গন্তব্য শহরে পৌঁছেছে',
      descriptionBn: `সহযাত্রী ${booking.destinationCityBn}-এ পৌঁছেছেন। প্রাপকের সাথে সাক্ষাতের প্রস্তুতি চলছে।`,
      timestamp: booking.updatedAt,
      actorRole: 'traveller',
    });

    this.recordEvent(
      bookingId,
      'ARRIVED_DESTINATION',
      'ARRIVED_DESTINATION',
      'গন্তব্যে পৌঁছানো',
      `সহযাত্রী ${booking.destinationCityBn} শহরে পৌঁছেছেন`,
      'traveller',
      booking.travellerId
    );

    this.notify();
    return booking;
  }

  /**
   * 8. Verify Second OTP (Delivery to Recipient) & Automatically Release Escrow
   */
  public async verifyDeliveryOtp(
    bookingId: string,
    inputOtp: string,
    recipientNotes?: string
  ): Promise<{ success: boolean; messageBn: string; booking: DetailedBooking }> {
    const booking = this.getRequiredBooking(bookingId);

    if (booking.status === 'ARRIVED_DESTINATION' || booking.status === 'IN_TRANSIT') {
      booking.status = 'DELIVERY_PENDING';
    }

    if (booking.delivery.otp2.trim() !== inputOtp.trim()) {
      return {
        success: false,
        messageBn: 'ভুল ডেলিভারি ওটিপি! প্রাপকের ফোনে পাঠানো ২য় ওটিপি কোডটি নির্ভুলভাবে দিন।',
        booking,
      };
    }

    this.assertTransition(booking.status, 'DELIVERED');

    booking.status = 'DELIVERED';
    booking.delivery.otp2Verified = true;
    booking.delivery.verifiedAt = new Date().toISOString();
    booking.delivery.recipientNotes = recipientNotes;
    booking.updatedAt = booking.delivery.verifiedAt;

    // Release Payment from Escrow to Traveller
    if (booking.paymentTransactionId) {
      try {
        await defaultDemoPaymentProvider.releaseEscrow(booking.paymentTransactionId);
        booking.paymentStatus = 'RELEASED';
      } catch (err) {
        console.warn('Escrow release note:', err);
      }
    }

    booking.timeline.push(
      {
        id: `tl-${Date.now()}-1`,
        status: 'DELIVERED',
        titleBn: 'পার্সেল সফলভাবে ডেলিভারি সম্পন্ন (২য় ওটিপি)',
        descriptionBn: `প্রাপক ${booking.recipientName} পণ্য বুঝে পেয়েছেন`,
        timestamp: booking.updatedAt,
        actorRole: 'traveller',
      },
      {
        id: `tl-${Date.now()}-2`,
        status: 'DELIVERED',
        titleBn: 'সহযাত্রীকে পেমেন্ট রিলিজ সম্পন্ন',
        descriptionBn: `ভাড়া ৳${booking.priceBreakdown.travellerFee} সহযাত্রীর অ্যাকাউন্টে হস্তান্তর করা হয়েছে`,
        timestamp: booking.updatedAt,
        actorRole: 'system',
      }
    );

    this.recordEvent(
      bookingId,
      'DELIVERY_OTP_VERIFIED',
      'DELIVERED',
      'ডেলিভারি সম্পন্ন',
      '২য় ওটিপি সফলভাবে যাচাই হয়েছে ও পণ্য হস্তান্তর করা হয়েছে',
      'traveller',
      booking.travellerId
    );

    this.recordEvent(
      bookingId,
      'PAYMENT_ESCROW_RELEASED',
      'DELIVERED',
      'টাকা প্রদান সম্পন্ন',
      'সহযাত্রীকে এসক্রো ভল্ট থেকে ভাড়া ছাড় দেওয়া হয়েছে',
      'system',
      'system'
    );

    this.notify();
    return {
      success: true,
      messageBn: '২য় ওটিপি যাচাই সফল হয়েছে! পার্সেল ডেলিভারি সম্পন্ন এবং সহযাত্রীর অ্যাকাউন্টে টাকা পাঠানো হয়েছে।',
      booking,
    };
  }

  /**
   * 9. Submit Two-Sided Rating (Sender rates Traveller OR Traveller rates Sender)
   */
  public submitRating(
    bookingId: string,
    fromRole: 'sender' | 'traveller',
    rating: number,
    comment: string,
    categories: {
      punctualityScore?: number;
      careScore?: number;
      communicationScore?: number;
      speedScore?: number;
    } = {}
  ): DetailedBooking {
    const booking = this.getRequiredBooking(bookingId);

    const ratingRecord: BookingRating = {
      id: `rt-${Date.now()}`,
      bookingId,
      fromRole,
      fromUserId: fromRole === 'sender' ? booking.senderId : booking.travellerId,
      toUserId: fromRole === 'sender' ? booking.travellerId : booking.senderId,
      rating: Math.max(1, Math.min(5, Math.round(rating))),
      comment,
      ...categories,
      createdAt: new Date().toISOString(),
    };

    if (fromRole === 'sender') {
      booking.senderRating = ratingRecord;
    } else {
      booking.travellerReview = ratingRecord;
    }

    booking.updatedAt = ratingRecord.createdAt;

    this.recordEvent(
      bookingId,
      'RATING_SUBMITTED',
      booking.status,
      'রেটিং ও মতামত প্রদান',
      `${fromRole === 'sender' ? 'প্রেরক' : 'সহযাত্রী'} ${rating} তারকা রেটিং প্রদান করেছেন`,
      fromRole,
      ratingRecord.fromUserId,
      { rating, comment }
    );

    this.notify();
    return booking;
  }

  /**
   * 10. Register Dispute
   */
  public raiseDispute(
    bookingId: string,
    raisedByRole: 'sender' | 'traveller',
    category: BookingDispute['category'],
    categoryBn: string,
    description: string
  ): DetailedBooking {
    const booking = this.getRequiredBooking(bookingId);

    this.assertTransition(booking.status, 'DISPUTED');

    const dispute: BookingDispute = {
      id: `dsp-${Date.now()}`,
      bookingId,
      raisedByUserId: raisedByRole === 'sender' ? booking.senderId : booking.travellerId,
      raisedByRole,
      category,
      categoryBn,
      description,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    booking.status = 'DISPUTED';
    booking.dispute = dispute;
    booking.updatedAt = dispute.createdAt;

    booking.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'DISPUTED',
      titleBn: 'সমস্যা পর্যালোচনায় নথিভুক্ত (বিরোধ)',
      descriptionBn: `কারণ: ${categoryBn}। বিওহক সহায়তা দল ২৪ ঘণ্টার মধ্যে সমাধান প্রদান করবে।`,
      timestamp: dispute.createdAt,
      actorRole: raisedByRole,
    });

    this.recordEvent(
      bookingId,
      'DISPUTE_RAISED',
      'DISPUTED',
      'বিরোধ আবেদন জমা',
      `বিরোধ দায়ের করা হয়েছে: ${description}`,
      raisedByRole,
      dispute.raisedByUserId,
      { category, description }
    );

    this.notify();
    return booking;
  }

  /**
   * 11. Cancel Booking (Strictly only permitted before handover)
   */
  public cancelBooking(
    bookingId: string,
    cancelledByRole: 'sender' | 'traveller',
    reasonBn: string
  ): DetailedBooking {
    const booking = this.getRequiredBooking(bookingId);

    if (!canCancelBooking(booking.status)) {
      throw new Error(
        `বুকিং বর্তমানে '${booking.status}' অবস্থায় রয়েছে। হস্তান্তরের পর সরাসরি বাতিল করা অসম্ভব; বিরোধ (Dispute) ফাইল করুন।`
      );
    }

    this.assertTransition(booking.status, 'CANCELLED');

    booking.status = 'CANCELLED';
    booking.cancellationReason = reasonBn;
    booking.updatedAt = new Date().toISOString();

    // If payment was held, refund automatically
    if (booking.paymentStatus === 'HELD' && booking.paymentTransactionId) {
      defaultDemoPaymentProvider.refundEscrow(booking.paymentTransactionId, reasonBn);
      booking.paymentStatus = 'REFUNDED';
    }

    booking.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'CANCELLED',
      titleBn: 'বুকিং বাতিল করা হয়েছে',
      descriptionBn: `কারণ: ${reasonBn}`,
      timestamp: booking.updatedAt,
      actorRole: cancelledByRole,
    });

    this.recordEvent(
      bookingId,
      'BOOKING_CANCELLED',
      'CANCELLED',
      'বুকিং বাতিল',
      `বুকিং বাতিল হয়েছে: ${reasonBn}`,
      cancelledByRole,
      cancelledByRole === 'sender' ? booking.senderId : booking.travellerId
    );

    this.notify();
    return booking;
  }

  private getRequiredBooking(id: string): DetailedBooking {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error(`Booking ${id} not found in store`);
    }
    return booking;
  }

  private assertTransition(
    current: BookingLifecycleStatus,
    target: BookingLifecycleStatus
  ): void {
    const res = validateBookingTransition(current, target);
    if (!res.valid) {
      throw new Error(res.errorMessageBn || res.errorMessage);
    }
  }

  private recordEvent(
    bookingId: string,
    type: BookingEvent['type'],
    status: BookingLifecycleStatus,
    titleBn: string,
    descriptionBn: string,
    actorRole: 'sender' | 'traveller' | 'recipient' | 'system',
    actorId: string,
    metadata?: Record<string, unknown>
  ): void {
    const ev = createBookingEvent(
      bookingId,
      type,
      status,
      titleBn,
      descriptionBn,
      actorRole,
      actorId,
      metadata
    );
    this.events.push(ev);
  }

  private maskPhone(phone: string): string {
    const clean = phone.replace(/\s+/g, '');
    if (clean.length < 10) return phone;
    const prefix = clean.slice(0, 6);
    const suffix = clean.slice(-3);
    return `${prefix}****${suffix}`;
  }

  /**
   * Seed realistic live scenario bookings representing various operational stages
   */
  private seedInitialBookings(): void {
    const now = Date.now();

    // 1. BHK-89241: Dhaka -> Cumilla, PAYMENT_HELD, ready for Handover
    const b1: DetailedBooking = {
      id: 'BHK-89241',
      parcelId: 'pcl-dhaka-cumilla-docs',
      tripId: 'trip-rahim-dhaka-cumilla',
      senderId: 'user-sender-imam',
      senderName: 'ইমাম হাসান',
      senderPhone: '+880 1711-002233',
      senderPhoneMasked: '+880 1711-***233',
      recipientName: 'তানজিলা হক',
      recipientPhone: '+880 1912-334455',
      recipientPhoneMasked: '+880 1912-***455',
      travellerId: 'user-traveller-rahim',
      travellerName: 'মোঃ আব্দুর রহিম',
      travellerPhone: '+880 1819-556677',
      travellerPhoneMasked: '+880 1819-***677',
      travellerRating: 4.9,
      travellerAvatar: '👨‍💼',
      travellerVehicleBn: 'গ্রিন লাইন এসি বাস',
      originCityBn: 'ঢাকা',
      originAreaBn: 'সায়েদাবাদ বাস টার্মিনাল',
      destinationCityBn: 'কুমিল্লা',
      destinationAreaBn: 'শাসনগাছা / পদুয়ার বাজার',
      routeBn: 'ঢাকা → কুমিল্লা',
      corridorNameBn: 'ঢাকা-চট্টগ্রাম জাতীয় মহাসড়ক (N1 করিডোর)',
      parcelTitleBn: 'জরুরি আইনি ডকুমেন্টস ও সার্টিফিকেট',
      parcelCategoryBn: 'ডকুমেন্ট',
      parcelWeightKg: 0.8,
      parcelSizeBn: 'ছোট প্যাকেট',
      pickupEstimatedTimeBn: 'আজ সকাল ০৭:৩০',
      deliveryEstimatedTimeBn: 'আজ সকাল ১০:০০',
      status: 'PAYMENT_HELD',
      priceBreakdown: {
        travellerFee: 150,
        platformFee: 20,
        trustGuarantee: 10,
        total: 180,
      },
      paymentTransactionId: 'TXN-DEMO-89241-01',
      paymentStatus: 'HELD',
      handover: {
        otp1: '4829', // Held by Sender (Imam), to be entered by Rahim
        otp1Verified: false,
        checklist: {
          packageInspected: false,
          noProhibitedItems: false,
          recipientPhoneConfirmed: false,
          weightWithinLimit: false,
        },
      },
      delivery: {
        otp2: '7154', // Held by Recipient (Tanjila)
        otp2Verified: false,
      },
      timeline: [
        {
          id: 'tl-1',
          status: 'PENDING_TRAVELLER',
          titleBn: 'বুকিং অনুরোধ পাঠানো হয়েছে',
          descriptionBn: 'ইমাম হাসান সহযাত্রী রহিমের নিকট পার্সেল বহনের অনুরোধ পাঠিয়েছেন',
          timestamp: new Date(now - 3600000 * 2).toISOString(),
          actorRole: 'sender',
        },
        {
          id: 'tl-2',
          status: 'ACCEPTED',
          titleBn: 'সহযাত্রী অনুরোধ গ্রহণ করেছেন',
          descriptionBn: 'আব্দুর রহিম পার্সেল বহনের সম্মতি দিয়েছেন',
          timestamp: new Date(now - 3600000 * 1.5).toISOString(),
          actorRole: 'traveller',
        },
        {
          id: 'tl-3',
          status: 'PAYMENT_HELD',
          titleBn: 'এসক্রো পেমেন্ট সংরক্ষিত',
          descriptionBn: '৳১৮০ টাকা ডেমো ভল্টে সুরক্ষিত জমা আছে',
          timestamp: new Date(now - 3600000).toISOString(),
          actorRole: 'system',
        },
      ],
      createdAt: new Date(now - 3600000 * 2).toISOString(),
      updatedAt: new Date(now - 3600000).toISOString(),
    };

    // 2. BHK-74192: Dhaka -> Chattogram, IN_TRANSIT
    const b2: DetailedBooking = {
      id: 'BHK-74192',
      parcelId: 'pcl-dhaka-ctg-cloth',
      tripId: 'trip-tanjil-dhaka-ctg',
      senderId: 'user-sender-imam',
      senderName: 'ইমাম হাসান',
      senderPhone: '+880 1711-002233',
      senderPhoneMasked: '+880 1711-***233',
      recipientName: 'ফারুক আহমেদ',
      recipientPhone: '+880 1515-889900',
      recipientPhoneMasked: '+880 1515-***900',
      travellerId: 'user-traveller-tanjil',
      travellerName: 'তানজিল মাহমুদ',
      travellerPhone: '+880 1622-114477',
      travellerPhoneMasked: '+880 1622-***477',
      travellerRating: 4.8,
      travellerAvatar: '👨‍💻',
      travellerVehicleBn: 'ইউনিক এক্সপ্রেস বাস',
      originCityBn: 'ঢাকা',
      originAreaBn: 'কমলাপুর রেল স্টেশন এলাকা',
      destinationCityBn: 'চট্টগ্রাম',
      destinationAreaBn: 'জিইসি মোড়',
      routeBn: 'ঢাকা → চট্টগ্রাম',
      corridorNameBn: 'ঢাকা-চট্টগ্রাম এক্সপ্রেসওয়ে করিডোর (N1)',
      parcelTitleBn: 'ঈদ উপহারের ঐতিহ্যবাহী হস্তশিল্প পোশাক',
      parcelCategoryBn: 'কাপড়',
      parcelWeightKg: 1.5,
      parcelSizeBn: 'মাঝারি বাক্স',
      pickupEstimatedTimeBn: 'আজ সকাল ০৬:৪৫',
      deliveryEstimatedTimeBn: 'আজ দুপুর ০১:১৫',
      status: 'IN_TRANSIT',
      priceBreakdown: {
        travellerFee: 280,
        platformFee: 30,
        trustGuarantee: 15,
        total: 325,
      },
      paymentTransactionId: 'TXN-DEMO-74192-02',
      paymentStatus: 'HELD',
      handover: {
        otp1: '6391',
        otp1Verified: true,
        verifiedAt: new Date(now - 7200000).toISOString(),
        checklist: {
          packageInspected: true,
          noProhibitedItems: true,
          recipientPhoneConfirmed: true,
          weightWithinLimit: true,
        },
      },
      delivery: {
        otp2: '8402',
        otp2Verified: false,
      },
      timeline: [
        {
          id: 'tl-ctg-1',
          status: 'PAYMENT_HELD',
          titleBn: 'এসক্রো পেমেন্ট সংরক্ষিত',
          descriptionBn: '৳৩২৫ টাকা ডেমো ভল্টে জমা আছে',
          timestamp: new Date(now - 10800000).toISOString(),
          actorRole: 'system',
        },
        {
          id: 'tl-ctg-2',
          status: 'HANDED_OVER',
          titleBn: 'পার্সেল হস্তান্তর সফল (১ম ওটিপি)',
          descriptionBn: 'কমলাপুরে তানজিল মাহমুদ পণ্য বুঝে পেয়েছেন',
          timestamp: new Date(now - 7200000).toISOString(),
          actorRole: 'traveller',
        },
        {
          id: 'tl-ctg-3',
          status: 'IN_TRANSIT',
          titleBn: 'মহাসড়কে যাত্রা চলমান',
          descriptionBn: 'এন১ এক্সপ্রেসওয়ে ধরে চট্টগ্রাম অভিমুখে চলছে',
          timestamp: new Date(now - 3600000).toISOString(),
          actorRole: 'traveller',
        },
      ],
      createdAt: new Date(now - 14400000).toISOString(),
      updatedAt: new Date(now - 3600000).toISOString(),
    };

    // 3. BHK-63104: Dhaka -> Sylhet, DELIVERED & RATED
    const b3: DetailedBooking = {
      id: 'BHK-63104',
      parcelId: 'pcl-dhaka-sylhet-book',
      tripId: 'trip-nusrat-dhaka-sylhet',
      senderId: 'user-sender-imam',
      senderName: 'ইমাম হাসান',
      senderPhone: '+880 1711-002233',
      senderPhoneMasked: '+880 1711-***233',
      recipientName: 'সালমা খাতুন',
      recipientPhone: '+880 1712-445566',
      recipientPhoneMasked: '+880 1712-***566',
      travellerId: 'user-traveller-nusrat',
      travellerName: 'নুসরাত জাহান',
      travellerPhone: '+880 1733-998877',
      travellerPhoneMasked: '+880 1733-***877',
      travellerRating: 5.0,
      travellerAvatar: '👩‍💼',
      travellerVehicleBn: 'উপবন এক্সপ্রেস ট্রেন',
      originCityBn: 'ঢাকা',
      originAreaBn: 'বিমানবন্দর রেলওয়ে স্টেশন',
      destinationCityBn: 'সিলেট',
      destinationAreaBn: 'জিন্দাবাজার',
      routeBn: 'ঢাকা → সিলেট',
      corridorNameBn: 'ঢাকা-সিলেট মহাসড়ক (N2 করিডোর)',
      parcelTitleBn: 'মেডিকেল পরীক্ষার পাঠ্যবই ও নোটবুক',
      parcelCategoryBn: 'বই',
      parcelWeightKg: 2.0,
      parcelSizeBn: 'বইয়ের পার্সেল',
      pickupEstimatedTimeBn: 'গতকাল দুপুর ০২:৩০',
      deliveryEstimatedTimeBn: 'গতকাল রাত ০৯:০০',
      status: 'DELIVERED',
      priceBreakdown: {
        travellerFee: 220,
        platformFee: 25,
        trustGuarantee: 15,
        total: 260,
      },
      paymentTransactionId: 'TXN-DEMO-63104-03',
      paymentStatus: 'RELEASED',
      handover: {
        otp1: '5219',
        otp1Verified: true,
        verifiedAt: new Date(now - 86400000).toISOString(),
        checklist: {
          packageInspected: true,
          noProhibitedItems: true,
          recipientPhoneConfirmed: true,
          weightWithinLimit: true,
        },
      },
      delivery: {
        otp2: '9371',
        otp2Verified: true,
        verifiedAt: new Date(now - 43200000).toISOString(),
      },
      senderRating: {
        id: 'rt-sylhet-1',
        bookingId: 'BHK-63104',
        fromRole: 'sender',
        fromUserId: 'user-sender-imam',
        toUserId: 'user-traveller-nusrat',
        rating: 5,
        careScore: 5,
        speedScore: 5,
        communicationScore: 5,
        comment: 'অসাধারণ দায়িত্বশীলতা! সময়মতো সঠিক হাতে বইগুলো পৌঁছে দিয়েছেন।',
        createdAt: new Date(now - 40000000).toISOString(),
      },
      timeline: [
        {
          id: 'tl-syl-1',
          status: 'DELIVERED',
          titleBn: 'ডেলিভারি সম্পন্ন ও এসক্রো রিলিজ',
          descriptionBn: 'সালমা খাতুন বইগুলো বুঝে পেয়েছেন এবং নুসরাত জাহানকে ভাড়া পরিশোধ করা হয়েছে',
          timestamp: new Date(now - 43200000).toISOString(),
          actorRole: 'system',
        },
      ],
      createdAt: new Date(now - 90000000).toISOString(),
      updatedAt: new Date(now - 40000000).toISOString(),
    };

    // 4. BHK-90123: Cumilla -> Dhaka, PENDING_TRAVELLER (assigned to Rahim as Traveller)
    const b4: DetailedBooking = {
      id: 'BHK-90123',
      parcelId: 'pcl-cumilla-dhaka-sweets',
      tripId: 'trip-rahim-cumilla-dhaka',
      senderId: 'user-sender-ayesha',
      senderName: 'আয়েশা সিদ্দিকা',
      senderPhone: '+880 1811-778899',
      senderPhoneMasked: '+880 1811-***899',
      recipientName: 'কামাল হোসেন',
      recipientPhone: '+880 1714-223344',
      recipientPhoneMasked: '+880 1714-***344',
      travellerId: 'user-traveller-rahim',
      travellerName: 'মোঃ আব্দুর রহিম',
      travellerPhone: '+880 1819-556677',
      travellerPhoneMasked: '+880 1819-***677',
      travellerRating: 4.9,
      travellerAvatar: '👨‍💼',
      travellerVehicleBn: 'এনা ট্রান্সপোর্ট বাস',
      originCityBn: 'কুমিল্লা',
      originAreaBn: 'মনোহরপুর / কান্দিরপাড়',
      destinationCityBn: 'ঢাকা',
      destinationAreaBn: 'ধানমন্ডি ২৭',
      routeBn: 'কুমিল্লা → ঢাকা',
      corridorNameBn: 'ঢাকা-চট্টগ্রাম জাতীয় মহাসড়ক (N1 করিডোর)',
      parcelTitleBn: 'কুমিল্লার বিখ্যাত খাঁটি রসমালাই (সিল করা বাক্স)',
      parcelCategoryBn: 'অন্যান্য অনুমোদিত পণ্য',
      parcelWeightKg: 1.2,
      parcelSizeBn: 'মিষ্টান্ন বাক্স',
      pickupEstimatedTimeBn: 'আজ বিকেল ০৪:০০',
      deliveryEstimatedTimeBn: 'আজ সন্ধ্যা ০৭:৩০',
      status: 'PENDING_TRAVELLER',
      priceBreakdown: {
        travellerFee: 170,
        platformFee: 20,
        trustGuarantee: 10,
        total: 200,
      },
      paymentStatus: 'UNPAID',
      handover: {
        otp1: '3941',
        otp1Verified: false,
        checklist: {
          packageInspected: false,
          noProhibitedItems: false,
          recipientPhoneConfirmed: false,
          weightWithinLimit: false,
        },
      },
      delivery: {
        otp2: '6528',
        otp2Verified: false,
      },
      timeline: [
        {
          id: 'tl-cm-1',
          status: 'PENDING_TRAVELLER',
          titleBn: 'বুকিং অনুরোধ এসেছে',
          descriptionBn: 'আয়েশা সিদ্দিকা কুমিল্লা থেকে ঢাকা রসমালাই বহনের অনুরোধ পাঠিয়েছেন',
          timestamp: new Date(now - 1800000).toISOString(),
          actorRole: 'sender',
        },
      ],
      createdAt: new Date(now - 1800000).toISOString(),
      updatedAt: new Date(now - 1800000).toISOString(),
    };

    this.bookings.set(b1.id, b1);
    this.bookings.set(b2.id, b2);
    this.bookings.set(b3.id, b3);
    this.bookings.set(b4.id, b4);
  }
}

export const defaultBookingStore = new BookingStore();
