import { Mail, Phone, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react";
import Link from "next/link";
import { ATORA, waOrderDigital } from "@/data/contact";

const contactIcon = "h-5 w-5 shrink-0 text-[#C9A961] mt-0.5";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappLink = waOrderDigital();

  return (
    <footer className="bg-[#3A3429] text-[#E8D5A3]">
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-serif text-2xl italic text-[#C9A961] mb-6 tracking-wide">
              Atora
            </h3>
            <p className="text-[#E8D5A3]/70 font-light text-sm leading-relaxed">
              Membuat momen spesial Anda lebih berkesan dengan undangan digital yang elegan dan modern.
            </p>
          </div>

          <div>
            <h4 className="text-[#C9A961] font-light text-sm tracking-wider uppercase mb-6">
              Tautan Cepat
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#fitur"
                  className="text-[#E8D5A3]/70 hover:text-[#C9A961] transition-colors font-light text-sm"
                >
                  Fitur
                </Link>
              </li>
              <li>
                <Link
                  href="#katalog"
                  className="text-[#E8D5A3]/70 hover:text-[#C9A961] transition-colors font-light text-sm"
                >
                  Katalog Template
                </Link>
              </li>
              <li>
                <Link
                  href="#harga"
                  className="text-[#E8D5A3]/70 hover:text-[#C9A961] transition-colors font-light text-sm"
                >
                  Paket Harga
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#C9A961] font-light text-sm tracking-wider uppercase mb-6">
              Kontak
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className={contactIcon} strokeWidth={1.5} aria-hidden />
                <a
                  href={`tel:${ATORA.phoneTel}`}
                  className="text-[#E8D5A3]/70 hover:text-[#C9A961] transition-colors font-light text-sm"
                >
                  {ATORA.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className={contactIcon} strokeWidth={1.5} aria-hidden />
                <a
                  href={`mailto:${ATORA.email}`}
                  className="text-[#E8D5A3]/70 hover:text-[#C9A961] transition-colors font-light text-sm break-all"
                >
                  {ATORA.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className={contactIcon} strokeWidth={1.5} aria-hidden />
                <span className="text-[#E8D5A3]/70 font-light text-sm">Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#C9A961] font-light text-sm tracking-wider uppercase mb-6">
              Ikuti Kami
            </h4>
            <div className="flex gap-4 mb-6">
              <a
                href={ATORA.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-11 w-11 items-center justify-center rounded-full bg-[#5C4A37]/50 text-[#C9A961] transition-colors hover:bg-[#C9A961] hover:text-[#3A3429]"
                aria-label="Instagram Atora"
              >
                <Instagram className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a
                href={ATORA.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-11 w-11 items-center justify-center rounded-full bg-[#5C4A37]/50 text-[#C9A961] transition-colors hover:bg-[#C9A961] hover:text-[#3A3429]"
                aria-label="Facebook Atora"
              >
                <Facebook className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-11 w-11 items-center justify-center rounded-full bg-[#5C4A37]/50 text-[#C9A961] transition-colors hover:bg-[#C9A961] hover:text-[#3A3429]"
                aria-label="WhatsApp Atora"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
              </a>
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A961] px-6 py-3 text-[#3A3429] transition-colors hover:bg-[#E8D5A3]"
            >
              <MessageCircle className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
              <span className="font-light text-sm tracking-wider uppercase">Chat WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="border-t border-[#5C4A37]/50 pt-8 text-center">
          <p className="text-[#E8D5A3]/50 font-light text-xs">
            © {currentYear} Atora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
