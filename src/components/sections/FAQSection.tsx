'use client';

import React, { useState } from 'react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { FAQ_ITEMS } from '@/data/faqs';
import { ChevronDown, HelpCircle, PhoneCall, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#FFF7F0]/30 border-t border-[#FFE2CD]/60">
      <Container size="narrow">
        <SectionHeading
          badgeText="সরাসরি উত্তর"
          title="সচরাচর জিজ্ঞাসিত প্রশ্নাবলী"
          highlightText="(FAQ)"
          subtitle="বোহক পিয়ার-টু-পিয়ার ক্রাউডশিপিং সম্পর্কিত আপনার সকল সাধারণ প্রশ্নের সুস্পষ্ট উত্তর জেনে নিন।"
        />

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#FFE2CD] overflow-hidden transition-all duration-200 shadow-xs hover:border-[#FF6B00]"
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none focus-visible:bg-[#FFF7F0]"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#FF6B00] bg-[#FFF7F0] px-2 py-0.5 rounded-md inline-block">
                      {item.categoryBn}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-[#171717] leading-snug">
                      {item.questionBn}
                    </h4>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full bg-[#FFF7F0] flex items-center justify-center text-[#FF6B00] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-[#FF6B00] text-white' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-[#6B6B6B] leading-relaxed border-t border-[#F0ECE7]">
                        {item.answerBn}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Banner */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-[#FFE2CD] text-center space-y-3 shadow-xs">
          <h4 className="text-base sm:text-lg font-bold text-[#171717]">
            আপনার কি অন্য কোনো প্রশ্ন বা বিশেষ পরামর্শ রয়েছে?
          </h4>
          <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-md mx-auto">
            আমাদের ডেডিকেটেড পাইলট সাপোর্ট টিম প্রতিদিন সকাল ৮টা থেকে রাত ১১টা পর্যন্ত সহায়তার জন্য উন্মুক্ত।
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#FF6B00]">
              <PhoneCall className="w-4 h-4" /> হটলাইন: ০৯৬১২-বোহক
            </span>
            <span className="text-[#6B6B6B]">•</span>
            <span className="flex items-center gap-1.5 text-[#16A34A]">
              <MessageSquare className="w-4 h-4" /> লাইভ সাপোর্ট চ্যাট
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
