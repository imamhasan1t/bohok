// BOHOK Phase 7 — Bangladesh Highway Corridor Definitions
// Realistic highway checkpoints along N1, N2, N5, N8 corridors

import { CorridorRoute } from './trackingTypes';

export const BANGLADESH_HIGHWAY_CORRIDORS: Record<string, CorridorRoute> = {
  'dhaka-cumilla': {
    id: 'dhaka-cumilla',
    originBn: 'ঢাকা',
    destinationBn: 'কুমিল্লা',
    corridorNameBn: 'ঢাকা-চট্টগ্রাম জাতীয় মহাসড়ক (N1 করিডোর)',
    totalDistanceKm: 96,
    estimatedStandardDurationMinutes: 135,
    checkpoints: [
      {
        id: 'cp-dc-1',
        nameBn: 'সায়েদাবাদ / যাত্রাবাড়ী পয়েন্ট',
        distanceKm: 0,
        cumulativeKm: 0,
        targetPercent: 5,
        passed: true,
        estimatedArrivalBn: 'সকাল ০৭:১৫',
        milestoneDescriptionBn: 'যাত্রার প্রারম্ভিক পিকআপ পয়েন্ট ত্যাগ',
      },
      {
        id: 'cp-dc-2',
        nameBn: 'কাঁচপুর টোল প্লাজা ও ব্রিজ',
        distanceKm: 16,
        cumulativeKm: 16,
        targetPercent: 20,
        passed: false,
        estimatedArrivalBn: 'সকাল ০৭:৪৫',
        milestoneDescriptionBn: 'ঢাকা সীমানা অতিক্রম, এন১ মহাসড়কে প্রবেশ',
      },
      {
        id: 'cp-dc-3',
        nameBn: 'মেঘনা সেতু সংযোগ পয়েন্ট',
        distanceKm: 28,
        cumulativeKm: 44,
        targetPercent: 45,
        passed: false,
        estimatedArrivalBn: 'সকাল ০৮:২০',
        milestoneDescriptionBn: 'মেঘনা নদী পারাপার, গজারিয়া করিডোর',
      },
      {
        id: 'cp-dc-4',
        nameBn: 'দাউদকান্দি মেঘনা-গোমতী টোল প্লাজা',
        distanceKm: 24,
        cumulativeKm: 68,
        targetPercent: 70,
        passed: false,
        estimatedArrivalBn: 'সকাল ০৮:৫৫',
        milestoneDescriptionBn: 'কুমিল্লা জেলা সীমানায় সুগম প্রবেশ',
      },
      {
        id: 'cp-dc-5',
        nameBn: 'কুমিল্লা সেনানিবাস / পদুয়ার বাজার',
        distanceKm: 28,
        cumulativeKm: 96,
        targetPercent: 100,
        passed: false,
        estimatedArrivalBn: 'সকাল ০৯:৩০',
        milestoneDescriptionBn: 'গন্তব্যে আগমন, হস্তান্তরের জন্য প্রস্তুত',
      },
    ],
  },

  'dhaka-chattogram': {
    id: 'dhaka-chattogram',
    originBn: 'ঢাকা',
    destinationBn: 'চট্টগ্রাম',
    corridorNameBn: 'ঢাকা-চট্টগ্রাম এক্সপ্রেসওয়ে করিডোর (N1)',
    totalDistanceKm: 248,
    estimatedStandardDurationMinutes: 300,
    checkpoints: [
      {
        id: 'cp-dch-1',
        nameBn: 'কাঁচপুর সেতু',
        distanceKm: 16,
        cumulativeKm: 16,
        targetPercent: 10,
        passed: true,
        estimatedArrivalBn: 'সকাল ০৭:৩০',
        milestoneDescriptionBn: 'এন১ এক্সপ্রেসওয়ে যাত্রা শুরু',
      },
      {
        id: 'cp-dch-2',
        nameBn: 'দাউদকান্দি ব্রিজ',
        distanceKm: 52,
        cumulativeKm: 68,
        targetPercent: 30,
        passed: false,
        estimatedArrivalBn: 'সকাল ০৮:৫০',
        milestoneDescriptionBn: 'মেঘনা-গোমতী নদী অতিক্রম',
      },
      {
        id: 'cp-dch-3',
        nameBn: 'কুমিল্লা বাইপাস (ময়নামতি)',
        distanceKm: 32,
        cumulativeKm: 100,
        targetPercent: 45,
        passed: false,
        estimatedArrivalBn: 'সকাল ০৯:৪৫',
        milestoneDescriptionBn: 'মধ্যবর্তী ট্রানজিট নোড',
      },
      {
        id: 'cp-dch-4',
        nameBn: 'ফেনী মহিপাল ফ্লাইওভার',
        distanceKm: 55,
        cumulativeKm: 155,
        targetPercent: 65,
        passed: false,
        estimatedArrivalBn: 'সকাল ১০:৫০',
        milestoneDescriptionBn: 'ফেনী জেলা বাইপাস',
      },
      {
        id: 'cp-dch-5',
        nameBn: 'সীতাকুণ্ড বাইপাস',
        distanceKm: 60,
        cumulativeKm: 215,
        targetPercent: 85,
        passed: false,
        estimatedArrivalBn: 'বেলা ১১:৫০',
        milestoneDescriptionBn: 'চট্টগ্রাম প্রবেশমুখের নিকটে',
      },
      {
        id: 'cp-dch-6',
        nameBn: 'অলংকার / একে খান গেট, চট্টগ্রাম',
        distanceKm: 33,
        cumulativeKm: 248,
        targetPercent: 100,
        passed: false,
        estimatedArrivalBn: 'দুপুর ১২:৩০',
        milestoneDescriptionBn: 'চট্টগ্রাম শহরে পদার্পণ',
      },
    ],
  },

  'dhaka-sylhet': {
    id: 'dhaka-sylhet',
    originBn: 'ঢাকা',
    destinationBn: 'সিলেট',
    corridorNameBn: 'ঢাকা-সিলেট মহাসড়ক (N2 করিডোর)',
    totalDistanceKm: 240,
    estimatedStandardDurationMinutes: 330,
    checkpoints: [
      {
        id: 'cp-ds-1',
        nameBn: 'কাঁচপুর সংযোগ',
        distanceKm: 16,
        cumulativeKm: 16,
        targetPercent: 10,
        passed: true,
        estimatedArrivalBn: 'সকাল ০৭:১৫',
        milestoneDescriptionBn: 'এন২ মহাসড়কে প্রবেশ',
      },
      {
        id: 'cp-ds-2',
        nameBn: 'ভৈরব মেঘনা সেতু',
        distanceKm: 64,
        cumulativeKm: 80,
        targetPercent: 35,
        passed: false,
        estimatedArrivalBn: 'সকাল ০৯:০০',
        milestoneDescriptionBn: 'ভৈরব রেল-সড়ক জংশন পারাপার',
      },
      {
        id: 'cp-ds-3',
        nameBn: 'ব্রাহ্মণবাড়িয়া বাইপাস (বিশ্বরোড)',
        distanceKm: 30,
        cumulativeKm: 110,
        targetPercent: 50,
        passed: false,
        estimatedArrivalBn: 'সকাল ১০:০০',
        milestoneDescriptionBn: 'মধ্যবর্তী মহাসড়ক মোড়',
      },
      {
        id: 'cp-ds-4',
        nameBn: 'শায়েস্তাগঞ্জ নতুন ব্রিজ, হবিগঞ্জ',
        distanceKm: 60,
        cumulativeKm: 170,
        targetPercent: 75,
        passed: false,
        estimatedArrivalBn: 'বেলা ১১:২০',
        milestoneDescriptionBn: 'সিলেট বিভাগের প্রধান ট্রানজিট হাব',
      },
      {
        id: 'cp-ds-5',
        nameBn: 'কদমতলী কেন্দ্রীয় বাস টার্মিনাল, সিলেট',
        distanceKm: 70,
        cumulativeKm: 240,
        targetPercent: 100,
        passed: false,
        estimatedArrivalBn: 'দুপুর ১২:৪৫',
        milestoneDescriptionBn: 'সিলেট শহরে প্রবেশ',
      },
    ],
  },
};

/**
 * Returns matching corridor or fallback for any route
 */
export function getCorridorForRoute(originBn: string, destinationBn: string): CorridorRoute {
  const normOrigin = originBn.trim().toLowerCase();
  const normDest = destinationBn.trim().toLowerCase();

  if (
    (normOrigin.includes('ঢাকা') || normOrigin.includes('dhaka')) &&
    (normDest.includes('কুমিল্লা') || normDest.includes('cumilla') || normDest.includes('comilla'))
  ) {
    return BANGLADESH_HIGHWAY_CORRIDORS['dhaka-cumilla'];
  }

  if (
    (normOrigin.includes('ঢাকা') || normOrigin.includes('dhaka')) &&
    (normDest.includes('চট্টগ্রাম') || normDest.includes('chattogram') || normDest.includes('chittagong'))
  ) {
    return BANGLADESH_HIGHWAY_CORRIDORS['dhaka-chattogram'];
  }

  if (
    (normOrigin.includes('ঢাকা') || normOrigin.includes('dhaka')) &&
    (normDest.includes('সিলেট') || normDest.includes('sylhet'))
  ) {
    return BANGLADESH_HIGHWAY_CORRIDORS['dhaka-sylhet'];
  }

  // Generic Corridor generator for arbitrary routes
  return {
    id: `corridor-${encodeURIComponent(originBn)}-${encodeURIComponent(destinationBn)}`,
    originBn,
    destinationBn,
    corridorNameBn: `${originBn} ↔ ${destinationBn} জাতীয় মহাসড়ক সংযোগ`,
    totalDistanceKm: 120,
    estimatedStandardDurationMinutes: 150,
    checkpoints: [
      {
        id: 'cp-gen-1',
        nameBn: `${originBn} প্রস্থান পয়েন্ট`,
        distanceKm: 0,
        cumulativeKm: 0,
        targetPercent: 10,
        passed: true,
        estimatedArrivalBn: 'সকাল ০৮:০০',
        milestoneDescriptionBn: 'প্রারম্ভিক পিকআপ সম্পন্ন',
      },
      {
        id: 'cp-gen-2',
        nameBn: `মধ্যবর্তী মহাসড়ক ইন্টারচেঞ্জ`,
        distanceKm: 50,
        cumulativeKm: 50,
        targetPercent: 50,
        passed: false,
        estimatedArrivalBn: 'সকাল ০৯:১৫',
        milestoneDescriptionBn: 'মহাসড়কে সুগম গতিতে পার্সেল ট্রানজিট',
      },
      {
        id: 'cp-gen-3',
        nameBn: `${destinationBn} শহর বাইপাস`,
        distanceKm: 45,
        cumulativeKm: 95,
        targetPercent: 80,
        passed: false,
        estimatedArrivalBn: 'সকাল ১০:১০',
        milestoneDescriptionBn: 'গন্তব্য সীমানায় পদার্পণ',
      },
      {
        id: 'cp-gen-4',
        nameBn: `${destinationBn} প্রধান পয়েন্ট`,
        distanceKm: 25,
        cumulativeKm: 120,
        targetPercent: 100,
        passed: false,
        estimatedArrivalBn: 'সকাল ১০:৪৫',
        milestoneDescriptionBn: 'ডেলিভারি মিটিং পয়েন্টে আগমন',
      },
    ],
  };
}
