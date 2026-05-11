"use client";

import { motion } from "framer-motion";

export default function Hero() {
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
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Headline Section - Asymmetric Layout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            <div className="mb-8">
              <p className="text-[#C9A961] text-sm font-light tracking-[0.2em] uppercase mb-6">
                Undangan Digital Premium
              </p>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-[#3A3429] leading-[1.1] mb-8">
                Rayakan Momen{" "}
                <span className="italic text-[#C9A961]">Terindah</span>
                <br />
                dalam Hidup Anda
              </h1>
              <p className="text-[#5C4A37] text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Setiap detail dirancang dengan cermat untuk menciptakan pengalaman yang tak terlupakan. 
                Undangan digital yang elegan, modern, dan penuh makna.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20memesan%20undangan%20digital"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-10 py-4 bg-[#3A3429] text-[#F9F7F2] rounded-full font-light text-sm tracking-wider hover:bg-[#5C4A37] transition-all uppercase"
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

          {/* Visual Mockup - Overlapping Design */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Laptop Mockup - Behind */}
            <div className="relative transform rotate-[-2deg] mb-8">
              <div className="bg-[#3A3429] rounded-lg p-2 shadow-2xl">
                <div className="bg-[#F9F7F2] rounded overflow-hidden">
                  <div className="bg-[#E8D5A3]/20 h-8 flex items-center px-4 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C9A961]/40"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C9A961]/40"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C9A961]/40"></div>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-[#E8D5A3]/20 to-[#C9A961]/10 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-28 h-28 mx-auto mb-4 bg-gradient-to-br from-[#C9A961] to-[#E8D5A3] rounded-full flex items-center justify-center">
                        <span className="text-4xl">💍</span>
                      </div>
                      <p className="text-[#5C4A37] font-light text-sm">Preview Undangan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Mockup - Overlapping */}
            <div className="absolute -bottom-12 -right-8 w-48 transform rotate-[8deg]">
              <div className="bg-[#3A3429] rounded-3xl p-2 shadow-2xl">
                <div className="bg-[#F9F7F2] rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-br from-[#E8D5A3]/20 to-[#C9A961]/10 aspect-[9/16] flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-[#C9A961] to-[#E8D5A3] rounded-full flex items-center justify-center">
                        <span className="text-2xl">💍</span>
                      </div>
                      <p className="text-xs text-[#5C4A37] font-light">Mobile View</p>
                    </div>
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
