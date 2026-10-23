'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ArrowUpRight,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Package,
  Luggage,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/lib/auth/useAuth';

interface NavbarProps {
  onOpenSendModal?: () => void;
  onOpenTripModal?: () => void;
  onOpenAuthModal?: () => void;
}

export function Navbar({ onOpenSendModal, onOpenTripModal, onOpenAuthModal }: NavbarProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'হোম', href: '/#hero' },
    { label: 'কীভাবে কাজ করে', href: '/#how-it-works' },
    { label: 'পার্সেল পাঠান', href: '/send' },
    { label: 'যাত্রা পোস্ট করুন', href: '/travel' },
    { label: 'নিরাপত্তা', href: '/#trust-safety' },
    { label: 'সহায়তা', href: '/#faq' },
  ];

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-xs border-b border-[#F0ECE7] py-3'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00] flex items-center justify-center text-white font-black text-xl shadow-[0_4px_12px_rgba(255,107,0,0.3)] group-hover:scale-105 transition-transform">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" opacity="0.9" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-[#171717]">
                  BOHOK
                </span>
                <span className="text-xs font-bold text-[#FF6B00] bg-[#FFF7F0] px-1.5 py-0.5 rounded border border-[#FFE2CD]">
                  বহন
                </span>
              </div>
              <span className="text-[10px] text-[#6B6B6B] -mt-1 hidden sm:block tracking-wider">
                পাইলট: ঢাকা ↔ কুমিল্লা
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#FFF7F0]/60 border border-[#FFE2CD]/60 px-3 py-1.5 rounded-full">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-1.5 text-sm font-medium text-[#171717] hover:text-[#FF6B00] hover:bg-white rounded-full transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#FFE2CD] bg-[#FFF7F0] hover:bg-[#FFEBD8] transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-bold text-xs">
                    {user.avatarInitials}
                  </div>
                  <span className="text-xs font-bold text-[#171717]">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B6B6B]" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#FFE2CD] p-2 space-y-1 z-50"
                    >
                      <div className="px-3 py-2 border-b border-[#F0ECE7]">
                        <span className="text-xs font-bold text-[#171717] block truncate">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          ফোন যাচাইকৃত
                        </span>
                      </div>

                      <Link
                        href="/dashboard/sender"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#171717] hover:bg-[#FFF7F0] hover:text-[#FF6B00] rounded-xl transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>প্রেরক ড্যাশবোর্ড</span>
                      </Link>

                      <Link
                        href="/dashboard/traveller"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#171717] hover:bg-[#FFF7F0] hover:text-[#FF6B00] rounded-xl transition-colors"
                      >
                        <Luggage className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>সহযাত্রী ড্যাশবোর্ড</span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#171717] hover:bg-[#FFF7F0] hover:text-[#FF6B00] rounded-xl transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>প্রোফাইল</span>
                      </Link>

                      <Link
                        href="/verification"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#171717] hover:bg-[#FFF7F0] hover:text-[#FF6B00] rounded-xl transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>যাচাইকরণ কেন্দ্র</span>
                      </Link>

                      <Link
                        href="/send"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#171717] hover:bg-[#FFF7F0] hover:text-[#FF6B00] rounded-xl transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>আমার পার্সেল</span>
                      </Link>

                      <Link
                        href="/travel"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#171717] hover:bg-[#FFF7F0] hover:text-[#FF6B00] rounded-xl transition-colors"
                      >
                        <Luggage className="w-3.5 h-3.5" />
                        <span>আমার যাত্রা</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition-colors text-left cursor-pointer border-t border-[#F0ECE7] mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>লগআউট</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold text-[#171717] hover:text-[#FF6B00] px-3 py-2 transition-colors"
              >
                লগইন
              </Link>
            )}

            <Link href="/send">
              <Button
                size="sm"
                className="rounded-full shadow-sm text-sm"
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                শুরু করুন
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {isAuthenticated && user ? (
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-bold text-xs"
              >
                {user.avatarInitials}
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" variant="softOrange" className="text-xs px-2.5 py-1.5">
                  লগইন
                </Button>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#171717] hover:bg-[#FFF7F0] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-[#F0ECE7] px-4 pt-3 pb-6 shadow-xl overflow-hidden"
          >
            {isAuthenticated && user && (
              <div className="mb-3 p-3 bg-[#FFF7F0] rounded-2xl border border-[#FFE2CD] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-bold text-xs">
                    {user.avatarInitials}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#171717] block">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-[#16A34A] font-medium">
                      ✓ ফোন যাচাইকৃত
                    </span>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold text-[#FF6B00] underline"
                >
                  প্রোফাইল
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-base font-medium text-[#171717] hover:bg-[#FFF7F0] hover:text-[#FF6B00] rounded-xl transition-colors"
                >
                  {link.label}
                </a>
              ))}
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard/sender"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-base font-medium text-[#171717] hover:bg-[#FFF7F0] hover:text-[#FF6B00] rounded-xl flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-[#FF6B00]" />
                    <span>প্রেরক ড্যাশবোর্ড</span>
                  </Link>
                  <Link
                    href="/dashboard/traveller"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-base font-medium text-[#171717] hover:bg-[#FFF7F0] hover:text-[#FF6B00] rounded-xl flex items-center gap-2"
                  >
                    <Luggage className="w-4 h-4 text-[#16A34A]" />
                    <span>সহযাত্রী ড্যাশবোর্ড</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-base font-medium text-[#171717] hover:bg-[#FFF7F0] hover:text-[#FF6B00] rounded-xl"
                  >
                    আমার প্রোফাইল
                  </Link>
                  <Link
                    href="/verification"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-base font-medium text-[#171717] hover:bg-[#FFF7F0] hover:text-[#FF6B00] rounded-xl"
                  >
                    যাচাইকরণ কেন্দ্র
                  </Link>
                </>
              )}
            </div>

            <div className="border-t border-[#F0ECE7] pt-4 flex flex-col gap-2.5">
              <Link href="/send" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="primary" className="w-full justify-center">
                  পার্সেল পাঠান
                </Button>
              </Link>
              <Link href="/travel" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="secondary" className="w-full justify-center">
                  যাত্রা পোস্ট করুন
                </Button>
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="text-center py-2 text-sm font-semibold text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl"
                >
                  লগআউট করুন
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-[#6B6B6B] hover:text-[#FF6B00]"
                >
                  লগইন করুন
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
