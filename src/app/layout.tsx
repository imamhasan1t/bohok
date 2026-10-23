import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BOHOK | বহন — পিয়ার-টু-পিয়ার ক্রাউডশিপিং প্ল্যাটফর্ম (ঢাকা ↔ কুমিল্লা)',
  description:
    'আপনি যাচ্ছেন, আপনার সাথে পার্সেলও যাক। ঢাকা থেকে কুমিল্লা রুটে প্রতিদিন যাতায়াতকারী যাচাইকৃত সহযাত্রীদের মাধ্যমে দ্রুত, সাশ্রয়ী ও নিরাপদে জরুরি পার্সেল পৌঁছে দিন।',
  keywords: [
    'BOHOK',
    'বহন',
    'crowdshipping bangladesh',
    'peer to peer courier bd',
    'dhaka to cumilla parcel',
    'জরুরি পার্সেল ডেলিভারি',
    'যাত্রীর সাথে পার্সেল',
    'ঢাকা কুমিল্লা পার্সেল',
  ],
  authors: [{ name: 'BOHOK Product Team' }],
  openGraph: {
    title: 'BOHOK — আপনি যাচ্ছেন, আপনার সাথে পার্সেলও যাক',
    description: 'বাংলাদেশ-ফার্স্ট ক্রাউডশিপিং: আপনার যাত্রাপথে পার্সেল নিয়ে বাড়তি আয় করুন, অথবা জরুরি পার্সেল দ্রুত পাঠান।',
    url: 'https://bohok.com.bd',
    siteName: 'BOHOK',
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BOHOK | বাংলাদেশ-ফার্স্ট ক্রাউডশিপিং',
    description: 'ঢাকা ↔ কুমিল্লা পাইলট রুটে দ্রুত ও বিশ্বস্ত সহযাত্রী ডেলিভারি নেটওয়ার্ক।',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#FF6B00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="scroll-smooth">
      <body className="min-h-screen bg-white text-[#171717] antialiased selection:bg-[#FFE2CD] selection:text-[#E85D04]">
        {children}
      </body>
    </html>
  );
}
