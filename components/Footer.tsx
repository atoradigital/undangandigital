import { Mail, Phone, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappLink = "https://wa.me/6281234567890";

  return (
    <footer className="bg-[#3A3429] text-[#E8D5A3]">
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl italic text-[#C9A961] mb-6">
              Atora
            </h3>
            <p className="text-[#E8D5A3]/70 font-light text-sm leading-relaxed">
              Membuat momen spesial Anda lebih berkesan dengan undangan digital yang elegan dan modern.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#C9A961] font-light text-sm tracking-wider uppercase mb-6">
              Tautan Cepat
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="#fitur" className="text-[#E8D5A3]/70 hover:text-[#C9A961] transition-colors font-light text-sm">
                  Fitur
                </Link>
              </li>
              <li>
                <Link href="#katalog" className="text-[#E8D5A3]/70 hover:text-[#C9A961] transition-colors font-light text-sm">
                  Katalog Template
                </Link>
              </li>
              <li>
                <Link href="#harga" className="text-[#E8D5A3]/70 hover:text-[#C9A961] transition-colors font-light text-sm">
                  Paket Harga
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#C9A961] font-light text-sm tracking-wider uppercase mb-6">
              Kontak
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-[#C9A961] flex-shrink-0" />
                <a href="tel:+6281234567890" className="text-[#E8D5A3]/70 hover:text-[#C9A961] transition-colors font-light text-sm">
                  +62 812 3456 7890
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-[#C9A961] flex-shrink-0" />
                <a href="mailto:info@atora.id" className="text-[#E8D5A3]/70 hover:text-[#C9A961] transition-colors font-light text-sm">
                  info@undangankita.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-[#C9A961] flex-shrink-0" />
                <span className="text-[#E8D5A3]/70 font-light text-sm">Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-[#C9A961] font-light text-sm tracking-wider uppercase mb-6">
              Ikuti Kami
            </h4>
            <div className="flex gap-4 mb-6">
              <a
                href="https://instagram.com/undangankita"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#5C4A37]/50 rounded-full flex items-center justify-center hover:bg-[#C9A961] hover:text-[#3A3429] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://facebook.com/undangankita"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#5C4A37]/50 rounded-full flex items-center justify-center hover:bg-[#C9A961] hover:text-[#3A3429] transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#5C4A37]/50 rounded-full flex items-center justify-center hover:bg-[#C9A961] hover:text-[#3A3429] transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A961] text-[#3A3429] rounded-full font-light text-sm tracking-wider hover:bg-[#E8D5A3] transition-all uppercase"
            >
              <MessageCircle size={16} />
              Chat WhatsApp
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#5C4A37]/50 pt-8 text-center">
          <p className="text-[#E8D5A3]/50 font-light text-xs">
            © {currentYear} Atora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
