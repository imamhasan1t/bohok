// BOHOK Phase 9 — Bengali Notification Message Templates
// Pre-crafted in natural Bangladeshi Bengali with Bengali numeral formatting

import { toBengaliNumerals } from '../../utils';

export interface NotificationTemplateData {
  recipientName?: string;
  senderName?: string;
  travellerName?: string;
  routeBn?: string;
  parcelTitleBn?: string;
  otpCode?: string;
  amountTaka?: number;
  pickupTimeBn?: string;
}

export const NotificationTemplates = {
  bookingRequested(data: NotificationTemplateData) {
    return {
      titleBn: 'নতুন পার্সেল বহনের অনুরোধ',
      bodyBn: `আপনার ${data.routeBn || 'যাত্রাপথে'} "${data.parcelTitleBn || 'একটি পার্সেল'}" বহনের নতুন অনুরোধ এসেছে।`,
      smsBn: `বহক: আপনার যাত্রাপথে একটি পার্সেল বহনের অনুরোধ এসেছে। গ্রহণ করতে ড্যাশবোর্ড দেখুন।`,
    };
  },

  bookingAccepted(data: NotificationTemplateData) {
    return {
      titleBn: 'সহযাত্রী আপনার বুকিং গ্রহণ করেছেন',
      bodyBn: `${data.travellerName || 'সহযাত্রী'} আপনার পার্সেল বহনে সম্মতি দিয়েছেন। যাত্রা নিশ্চিত করতে এস্ক্রো পেমেন্ট সম্পন্ন করুন।`,
      smsBn: `বহক: সহযাত্রী আপনার বুকিং গ্রহণ করেছেন। পার্সেল পাঠাতে পেমেন্ট সম্পন্ন করুন।`,
    };
  },

  paymentHeld(data: NotificationTemplateData) {
    const amountBn = toBengaliNumerals(data.amountTaka || 0);
    return {
      titleBn: 'পেমেন্ট নিরাপদে জমা হয়েছে',
      bodyBn: `৳${amountBn} এস্ক্রো একাউন্টে নিরাপদে জমা হয়েছে। পার্সেল ডেলিভারি না হওয়া পর্যন্ত অর্থ সুরক্ষিত থাকবে।`,
      smsBn: `বহক: আপনার ৳${amountBn} এস্ক্রোতে জমা হয়েছে। ডেলিভারি সম্পন্ন হলে সহযাত্রী অর্থ পাবেন।`,
    };
  },

  handoverOtp(data: NotificationTemplateData) {
    const otpBn = toBengaliNumerals(data.otpCode || '');
    return {
      titleBn: 'হস্তান্তর ওটিপি (১ম কোড)',
      bodyBn: `আপনার হস্তান্তর ওটিপি: ${otpBn}। সহযাত্রীর কাছে পার্সেল তুলে দেওয়ার সময় এই কোডটি তাকে দিন।`,
      smsBn: `বহক হস্তান্তর ওটিপি: ${data.otpCode || ''}। পার্সেল দেওয়ার সময় সহযাত্রীকে দিন। কাউকে এই কোড আগে শেয়ার করবেন না।`,
    };
  },

  handoverConfirmed(data: NotificationTemplateData) {
    return {
      titleBn: 'পার্সেল হস্তান্তর সফল হয়েছে',
      bodyBn: `${data.travellerName || 'সহযাত্রী'} পার্সেল বুঝে নিয়েছেন। পার্সেলটি এখন যাত্রাপথে রয়েছে।`,
      smsBn: `বহক: সহযাত্রী পার্সেল বুঝে নিয়েছেন এবং গন্তব্যের উদ্দেশ্যে রওনা হয়েছেন।`,
    };
  },

  approachingDestination(data: NotificationTemplateData) {
    return {
      titleBn: 'সহযাত্রী গন্তব্যের কাছাকাছি',
      bodyBn: `সহযাত্রী ${data.routeBn?.split('→')[1]?.trim() || 'গন্তব্যের'} কাছাকাছি পৌঁছেছেন। প্রাপককে প্রস্তুত থাকতে বলুন।`,
      smsBn: `বহক: সহযাত্রী গন্তব্যের কাছাকাছি পৌঁছেছেন। প্রাপককে প্রস্তুত থাকতে বলুন।`,
    };
  },

  deliveryOtp(data: NotificationTemplateData) {
    const otpBn = toBengaliNumerals(data.otpCode || '');
    return {
      titleBn: 'ডেলিভারি ওটিপি (২য় কোড)',
      bodyBn: `প্রাপক ডেলিভারি ওটিপি: ${otpBn}। পার্সেল অক্ষতভাবে গ্রহণ করার পর সহযাত্রীকে এই কোড দিন।`,
      smsBn: `বহক ডেলিভারি ওটিপি: ${data.otpCode || ''}। পার্সেল অক্ষতভাবে গ্রহণের পর সহযাত্রীকে এই কোড দিন।`,
    };
  },

  deliveryConfirmed(data: NotificationTemplateData) {
    return {
      titleBn: 'পার্সেল সফলভাবে ডেলিভারি হয়েছে',
      bodyBn: 'প্রাপক পার্সেল গ্রহণ করেছেন এবং ডেলিভারি সম্পন্ন হয়েছে। বহক ব্যবহারের জন্য ধন্যবাদ!',
      smsBn: `বহক: আপনার পার্সেল সফলভাবে প্রাপকের কাছে পৌঁছেছে। বহক ব্যবহারের জন্য ধন্যবাদ!`,
    };
  },

  payoutReleased(data: NotificationTemplateData) {
    const amountBn = toBengaliNumerals(data.amountTaka || 0);
    return {
      titleBn: 'উপার্জন আপনার ওয়ালেটে জমা হয়েছে',
      bodyBn: `অভিনন্দন! সফলভাবে পার্সেল পৌঁছে দেওয়ায় ৳${amountBn} আপনার একাউন্টে যোগ হয়েছে।`,
      smsBn: `বহক: অভিনন্দন! সফলভাবে পার্সেল পৌঁছে দেওয়ায় আপনার অ্যাকাউন্টে ৳${amountBn} ছাড় দেওয়া হয়েছে।`,
    };
  },

  disputeRaised(data: NotificationTemplateData) {
    return {
      titleBn: 'বুকিংয়ে বিরোধ উত্থাপিত হয়েছে',
      bodyBn: 'বুকিংটি পর্যালোচনায় রয়েছে এবং পেমেন্ট সাময়িকভাবে স্থগিত রাখা হয়েছে। সাপোর্ট টিম দ্রুত যোগাযোগ করবে।',
      smsBn: `বহক: আপনার বুকিং নিয়ে বিরোধ দায়ের হয়েছে। সাপোর্ট টিম ২৪ ঘণ্টার মধ্যে যোগাযোগ করবে।`,
    };
  },
};
