"use client";

import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import { waAskPackage, waCustomPackage } from "@/data/contact";

const plans = [
  {
    name: "Basic",
    price: "299K",
    description: "Cocok untuk acara sederhana",
    features: [
      "1 Template Pilihan",
      "RSVP Online",
      "Google Maps",
      "Sapaan Nama Tamu",
      "Galeri Foto (5 foto)",
      "Dukungan Email",
      "Valid 3 Bulan",
    ],
    popular: false,
  },
  {
    name: "Premium",
    price: "499K",
    description: "Paling populer untuk pernikahan",
    features: [
      "1 Template Premium",
      "Semua Fitur Basic",
      "Musik & Video",
      "Love Story Timeline",
      "Galeri Foto Unlimited",
      "Wedding Gift",
      "Dukungan WhatsApp",
      "Valid 1 Tahun",
      "Revisi 3x",
    ],
    popular: true,
  },
  {
    name: "VIP",
    price: "799K",
    description: "Paket lengkap dengan kustomisasi penuh",
    features: [
      "Template Custom Design",
      "Semua Fitur Premium",
      "Animasi Kustom",
      "Domain Custom",
      "Galeri Video",
      "Live Chat Support",
      "Valid Selamanya",
      "Revisi Unlimited",
      "Priority Support",
      "Free Update Template",
    ],
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="harga" className="py-32 px-6 lg:px-12 bg-[#F9F7F2]">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <p className="text-[#C9A961] text-sm font-light tracking-[0.2em] uppercase mb-6">
            Paket Harga
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#3A3429] mb-6 leading-tight">
            Investasi untuk
            <span className="block italic text-[#C9A961]">Momen Spesial</span>
          </h2>
          <p className="text-[#5C4A37] font-light text-lg max-w-2xl mx-auto leading-relaxed">
            Pilih paket yang sesuai dengan kebutuhan acara Anda
          </p>
          <div className="w-24 h-px bg-[#C9A961]/40 mx-auto mt-8"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-lg p-10 ${
                plan.popular
                  ? "bg-white border-2 border-[#C9A961]/40 shadow-xl"
                  : "bg-white/50 backdrop-blur-sm border border-[#E8D5A3]/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#C9A961] text-[#3A3429] px-4 py-1 rounded-full text-xs font-light tracking-wider uppercase">
                    Paling Populer
                  </span>
                </div>
              )}

              <div className="text-center mb-10">
                <h3 className="font-serif text-2xl text-[#3A3429] mb-2">{plan.name}</h3>
                <p className="text-[#5C4A37] font-light text-sm mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="font-serif text-5xl text-[#3A3429]">{plan.price}</span>
                  <span className="text-[#5C4A37] font-light ml-2">/undangan</span>
                </div>
                <div className="w-16 h-px bg-[#C9A961]/40 mx-auto"></div>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.popular ? "text-[#C9A961]" : "text-[#5C4A37]"
                      }`}
                    />
                    <span className="text-[#5C4A37] font-light text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={waAskPackage(plan.name)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-light text-sm tracking-wider transition-all uppercase ${
                  plan.popular
                    ? "bg-[#3A3429] text-[#F9F7F2] hover:bg-[#5C4A37]"
                    : "bg-transparent border border-[#C9A961]/40 text-[#5C4A37] hover:bg-[#C9A961]/10"
                }`}
              >
                <MessageCircle
                  className={`h-[18px] w-[18px] shrink-0 ${
                    plan.popular
                      ? "text-[#F9F7F2] opacity-90"
                      : "text-[#5C4A37]"
                  }`}
                  strokeWidth={1.5}
                />
                Pesan Paket {plan.name}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-[#5C4A37] font-light mb-6">
            Butuh paket khusus atau ada pertanyaan?
          </p>
          <a
            href={waCustomPackage()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 bg-transparent border border-[#C9A961]/40 text-[#5C4A37] rounded-full font-light text-sm tracking-wider hover:bg-[#C9A961]/10 transition-all uppercase"
          >
            Hubungi Kami
          </a>
        </motion.div>
      </div>
    </section>
  );
}
