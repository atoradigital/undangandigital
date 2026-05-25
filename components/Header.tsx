"use client";

import { useState, useEffect } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { waOrderDigital } from "@/data/contact";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const whatsappLink = waOrderDigital();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? "border-b border-[#E8D5A3]/25 bg-[#F9F7F2]/75 backdrop-blur-lg backdrop-saturate-150"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link
            href="/"
            aria-label="ATORA — beranda"
            className="flex min-w-0 shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A961]/60"
          >
            <Image
              src="/logo/logo-atora-lanscape.png"
              alt="Atora Logo"
              height={64}
              width={213}
              className="h-16 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            <Link
              href="#fitur"
              className="font-sans text-xs text-[#5C4A37] transition-colors hover:text-[#C9A961] sm:text-[0.8125rem] font-light tracking-wider uppercase"
            >
              Fitur
            </Link>
            <Link
              href="#katalog"
              className="font-sans text-xs text-[#5C4A37] transition-colors hover:text-[#C9A961] sm:text-[0.8125rem] font-light tracking-wider uppercase"
            >
              Katalog
            </Link>
            <Link
              href="#harga"
              className="font-sans text-xs text-[#5C4A37] transition-colors hover:text-[#C9A961] sm:text-[0.8125rem] font-light tracking-wider uppercase"
            >
              Harga
            </Link>
            <div className="h-4 w-px bg-[#E8D5A3]/40 mx-2"></div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans flex items-center gap-2 rounded-full border border-[#C9A961]/30 px-5 py-2.5 text-xs font-light tracking-wider text-[#3A3429] transition-all hover:bg-[#C9A961]/10 sm:px-6 sm:text-sm uppercase"
            >
              <MessageCircle className="h-[18px] w-[18px] shrink-0 text-[#5C4A37]" strokeWidth={1.5} />
              Pesan Sekarang
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#3A3429]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8D5A3]/20 bg-[#F9F7F2]/90 py-6 backdrop-blur-md">
            <div className="flex flex-col space-y-1">
              <Link
                href="#fitur"
                className="font-sans rounded-lg px-2 py-2.5 text-xs font-light tracking-wider text-[#5C4A37] uppercase transition-colors hover:bg-[#C9A961]/10 hover:text-[#C9A961] sm:text-[0.8125rem]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fitur
              </Link>
              <Link
                href="#katalog"
                className="font-sans rounded-lg px-2 py-2.5 text-xs font-light tracking-wider text-[#5C4A37] uppercase transition-colors hover:bg-[#C9A961]/10 hover:text-[#C9A961] sm:text-[0.8125rem]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Katalog
              </Link>
              <Link
                href="#harga"
                className="font-sans rounded-lg px-2 py-2.5 text-xs font-light tracking-wider text-[#5C4A37] uppercase transition-colors hover:bg-[#C9A961]/10 hover:text-[#C9A961] sm:text-[0.8125rem]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Harga
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans mt-3 flex items-center justify-center gap-2 rounded-full border border-[#C9A961]/30 px-6 py-3 text-xs font-light tracking-wider text-[#3A3429] uppercase transition-all hover:bg-[#C9A961]/10 sm:text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageCircle className="h-[18px] w-[18px] shrink-0 text-[#5C4A37]" strokeWidth={1.5} />
                Pesan Sekarang
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
