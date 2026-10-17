"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { waOrderDigital } from "@/data/contact";

export default function Hero() {
  const whatsappHref = waOrderDigital();
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-20 overflow-hidden bg-[#F9F7F2]">
      {/* Organic Shapes Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#E8D5A3]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#C9A961]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E8D5A3]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Hairline decorative elements */}
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E8D5A3]/30 to-transparent"></div>
      <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E8D5A3]/30 to-transparent"></div>

      <div className="container mx-auto relative z-10">
        {/* Mengubah perbandingan grid dari 7:5 menjadi 6:6 agar area mockup lebih luas */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Headline Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 text-center lg:text-left"
          >
            <div className="mb-8">
              <p className="text-[#C9A961] text-sm font-light tracking-[0.2em] uppercase mb-6">
                Atora — Undangan Digital Premium
              </p>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-6xl xl:text-7xl text-[#3A3429] leading-[1.1] mb-8">
                Rayakan Momen{" "}
                <span className="italic text-[#C9A961]">Terindah</span>
                <br />
                dalam Hidup Anda
              </h1>
              <p className="text-[#5C4A37] text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Setiap detail dirancang dengan cermat untuk menciptakan pengalaman yang tak terlupakan.
                Undangan digital Atora yang elegan, modern, dan penuh makna.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-10 py-4 bg-[#3A3429] text-[#F9F7F2] rounded-full font-light text-sm tracking-wider hover:bg-[#5C4A37] transition-all uppercase shadow-md"
              >
                Pesan Sekarang
              </a>
              <a
                href="#katalog"
                className="inline-flex items-center justify-center px-10 py-4 bg-transparent text-[#3A3429] rounded-full font-light text-sm tracking-wider border border-[#C9A961]/40 hover:bg-[#C9A961]/10 transition-all uppercase"
              >
                Lihat Katalog
              </a>
            </div>
          </motion.div>

          {/* Visual Mockup - Perbesar Ukuran Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative pb-16 lg:pb-0 pl-0 lg:pl-4"
          >
            {/* Desktop / Laptop Mockup - Diperbesar dengan background dalam gelap */}
            <div className="relative transform rotate-[-2deg] mb-6 sm:mb-8">
              <div className="bg-[#3A3429] rounded-xl p-2.5 sm:p-3 shadow-2xl">
                {/* Mengubah bg-[#F9F7F2] menjadi bg-[#181613] menghilangkan frame garis putih */}
                <div className="bg-[#181613] rounded-lg overflow-hidden border border-[#5C4A37]/30">
                  <div className="bg-[#2A241D] h-7 sm:h-8 flex items-center px-3 sm:px-4 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C9A961]/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C9A961]/40"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C9A961]/40"></div>
                  </div>
                  <div className="aspect-[16/10] relative w-full overflow-hidden bg-[#181613]">
                    <Image
                      src="/preview/preview-desktop.png"
                      alt="Preview Desktop Atora"
                      fill
                      className="object-cover object-top"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Mockup - Lebih Tinggi/Panjang & Lebih Besar */}
            <div className="absolute -bottom-6 right-2 sm:-bottom-10 sm:right-2 w-52 sm:w-60 lg:w-64 transform rotate-[6deg] z-20">
              <div className="bg-[#3A3429] rounded-[2.5rem] p-2.5 sm:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* Mengubah bg-[#F9F7F2] menjadi bg-[#181613] agar tidak ada garis tepi putih */}
                <div className="bg-[#181613] rounded-[2rem] overflow-hidden border border-[#5C4A37]/30">
                  {/* Rasio smartphone disesuaikan menjadi 9/19 agar konten lebih panjang & tidak terpotong */}
                  <div className="relative aspect-[9/19] w-full overflow-hidden bg-[#181613]">
                    <Image
                      src="/preview/preview-mobile.png"
                      alt="Preview Mobile Atora"
                      fill
                      className="object-cover object-top"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}