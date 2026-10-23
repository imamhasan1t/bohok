// BOHOK Phase 7 — useBooking React Hook
// Exposes reactive booking lifecycle methods and state to UI components

'use client';

import { useEffect, useState, useCallback } from 'react';
import { defaultBookingStore } from './bookingStore';
import {
  DetailedBooking,
  HandoverSafetyChecklist,
  BookingDispute,
} from './bookingTypes';

export function useBooking(bookingId?: string) {
  const [booking, setBooking] = useState<DetailedBooking | undefined>(() =>
    bookingId ? defaultBookingStore.getBookingById(bookingId) : undefined
  );
  const [allBookings, setAllBookings] = useState<DetailedBooking[]>(() =>
    defaultBookingStore.getAllBookings()
  );

  const refresh = useCallback(() => {
    setAllBookings(defaultBookingStore.getAllBookings());
    if (bookingId) {
      setBooking(defaultBookingStore.getBookingById(bookingId));
    }
  }, [bookingId]);

  useEffect(() => {
    const unsubscribe = defaultBookingStore.subscribe(refresh);
    return () => unsubscribe();
  }, [refresh]);

  const acceptBooking = useCallback(
    (id: string) => {
      const res = defaultBookingStore.acceptBooking(id);
      refresh();
      return res;
    },
    [refresh]
  );

  const holdPayment = useCallback(
    async (id: string, method: 'bkash' | 'nagad' | 'card' | 'demo_escrow' = 'bkash') => {
      const res = await defaultBookingStore.holdPayment(id, method);
      refresh();
      return res;
    },
    [refresh]
  );

  const travellerArrivedPickup = useCallback(
    (id: string) => {
      const res = defaultBookingStore.travellerArrivedPickup(id);
      refresh();
      return res;
    },
    [refresh]
  );

  const verifyHandoverOtp = useCallback(
    (id: string, otp: string, checklist: HandoverSafetyChecklist) => {
      const res = defaultBookingStore.verifyHandoverOtp(id, otp, checklist);
      refresh();
      return res;
    },
    [refresh]
  );

  const startJourney = useCallback(
    (id: string) => {
      const res = defaultBookingStore.startJourney(id);
      refresh();
      return res;
    },
    [refresh]
  );

  const travellerArrivedDestination = useCallback(
    (id: string) => {
      const res = defaultBookingStore.travellerArrivedDestination(id);
      refresh();
      return res;
    },
    [refresh]
  );

  const verifyDeliveryOtp = useCallback(
    async (id: string, otp: string, notes?: string) => {
      const res = await defaultBookingStore.verifyDeliveryOtp(id, otp, notes);
      refresh();
      return res;
    },
    [refresh]
  );

  const submitRating = useCallback(
    (
      id: string,
      role: 'sender' | 'traveller',
      score: number,
      comment: string,
      cats?: { punctualityScore?: number; careScore?: number; communicationScore?: number; speedScore?: number }
    ) => {
      const res = defaultBookingStore.submitRating(id, role, score, comment, cats);
      refresh();
      return res;
    },
    [refresh]
  );

  const raiseDispute = useCallback(
    (
      id: string,
      role: 'sender' | 'traveller',
      cat: BookingDispute['category'],
      catBn: string,
      desc: string
    ) => {
      const res = defaultBookingStore.raiseDispute(id, role, cat, catBn, desc);
      refresh();
      return res;
    },
    [refresh]
  );

  const cancelBooking = useCallback(
    (id: string, role: 'sender' | 'traveller', reasonBn: string) => {
      const res = defaultBookingStore.cancelBooking(id, role, reasonBn);
      refresh();
      return res;
    },
    [refresh]
  );

  return {
    booking,
    allBookings,
    senderBookings: (userId: string) => defaultBookingStore.getSenderBookings(userId),
    travellerBookings: (userId: string) => defaultBookingStore.getTravellerBookings(userId),
    acceptBooking,
    holdPayment,
    travellerArrivedPickup,
    verifyHandoverOtp,
    startJourney,
    travellerArrivedDestination,
    verifyDeliveryOtp,
    submitRating,
    raiseDispute,
    cancelBooking,
    refresh,
  };
}
