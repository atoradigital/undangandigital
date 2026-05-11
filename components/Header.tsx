"use client";

import { useState, useEffect } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import Link from "next/link";

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

  const whatsappLink = "https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20memesan%20undangan%20digital";

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[#F9F7F2]/80 backdrop-blur-md border-b border-[#E8D5A3]/20" 
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif italic text-[#3A3429] tracking-wide">
              Atora
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            <Link 
              href="#fitur" 
              className="text-[#5C4A37] hover:text-[#C9A961] transition-colors font-light text-sm tracking-wider uppercase"
            >
              Fitur
            </Link>
            <Link 
              href="#katalog" 
              className="text-[#5C4A37] hover:text-[#C9A961] transition-colors font-light text-sm tracking-wider uppercase"
            >
              Katalog
            </Link>
            <Link 
              href="#harga" 
              className="text-[#5C4A37] hover:text-[#C9A961] transition-colors font-light text-sm tracking-wider uppercase"
            >
              Harga
            </Link>
            <div className="h-4 w-px bg-[#E8D5A3]/40 mx-2"></div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#3A3429] px-6 py-2.5 border border-[#C9A961]/30 rounded-full font-light text-sm tracking-wider hover:bg-[#C9A961]/10 transition-all uppercase"
            >
              <MessageCircle size={16} />
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
          <div className="md:hidden py-6 border-t border-[#E8D5A3]/20">
            <div className="flex flex-col space-y-4">
              <Link
                href="#fitur"
                className="text-[#5C4A37] hover:text-[#C9A961] transition-colors font-light text-sm tracking-wider uppercase py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fitur
              </Link>
              <Link
                href="#katalog"
                className="text-[#5C4A37] hover:text-[#C9A961] transition-colors font-light text-sm tracking-wider uppercase py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Katalog
              </Link>
              <Link
                href="#harga"
                className="text-[#5C4A37] hover:text-[#C9A961] transition-colors font-light text-sm tracking-wider uppercase py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Harga
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-[#3A3429] px-6 py-3 border border-[#C9A961]/30 rounded-full font-light text-sm tracking-wider hover:bg-[#C9A961]/10 transition-all uppercase mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageCircle size={16} />
                Pesan Sekarang
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
