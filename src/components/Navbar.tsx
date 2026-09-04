"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="border-b border-[#262B38] bg-[#151922]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-3">
            {/* Logo / Brand */}
            <Link href="/" className="flex items-center space-x-3 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#00E0C6] p-0.5 shadow-lg shadow-indigo-950/40">
                <div className="w-full h-full bg-[#0B0E14] rounded-[10px] flex items-center justify-center text-[#00E0C6] group-hover:bg-[#151922] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-display font-bold tracking-tight text-[#F4F5F7] block leading-tight">
                  Campus Notes
                </span>
                <span className="hidden sm:block text-[11px] font-medium tracking-wide text-[#9AA1B2] uppercase">
                  Central Study Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden sm:flex items-center space-x-2">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium text-[#9AA1B2] hover:text-[#F4F5F7] hover:bg-[#1D2330] rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link
                href="/browse"
                className="px-3 py-2 text-sm font-medium text-[#9AA1B2] hover:text-[#F4F5F7] hover:bg-[#1D2330] rounded-lg transition-colors"
              >
                Browse Notes
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center px-4 py-2 ml-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-[#7C5CFF] to-[#00E0C6] shadow-md shadow-indigo-950/50 hover:brightness-110 active:scale-[0.97] transition-all"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Notes
              </Link>
            </nav>

            {/* Mobile Actions: Upload CTA + Hamburger Menu */}
            <div className="flex sm:hidden items-center space-x-2">
              <Link
                href="/upload"
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-[#7C5CFF] to-[#00E0C6] shadow-xs active:scale-[0.97] transition-transform"
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#9AA1B2] hover:text-[#F4F5F7] hover:bg-[#1D2330] transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Collapsible Nav Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-[#262B38] py-3 space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-[#F4F5F7] hover:bg-[#1D2330] rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link
                href="/browse"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-[#9AA1B2] hover:text-[#F4F5F7] hover:bg-[#1D2330] rounded-lg transition-colors"
              >
                Browse Notes
              </Link>
              <Link
                href="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-[#00E0C6] hover:bg-[#1D2330] rounded-lg transition-colors"
              >
                Upload Material
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Persistent Floating Action Button (FAB) for Mobile per DESIGN.md Section 3.1 */}
      <Link
        href="/upload"
        className="sm:hidden fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl shadow-indigo-950 bg-gradient-to-r from-[#7C5CFF] to-[#00E0C6] text-white flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Upload Notes"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </>
  );
}