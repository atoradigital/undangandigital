"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, MapPin, Music, User, Heart, Gift, Camera, Sparkles } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "RSVP Online",
    description: "Mudah mengelola konfirmasi kehadiran tamu secara real-time",
  },
  {
    icon: MapPin,
    title: "Google Maps",
    description: "Lokasi acara terintegrasi dengan Google Maps untuk navigasi mudah",
  },
  {
    icon: Music,
    title: "Musik & Video",
    description: "Tambahkan musik latar dan video kenangan untuk pengalaman lebih berkesan",
  },
  {
    icon: User,
    title: "Sapaan Nama Tamu",
    description: "Setiap tamu mendapat sapaan personal dengan nama mereka",
    exclusive: true,
  },
  {
    icon: Heart,
    title: "Love Story",
    description: "Ceritakan perjalanan cinta Anda dengan timeline yang indah",
  },
  {
    icon: Gift,
    title: "Wedding Gift",
    description: "Fitur wishlist dan informasi rekening untuk hadiah pernikahan",
  },
  {
    icon: Camera,
    title: "Galeri Foto",
    description: "Tampilkan koleksi foto prewedding dan momen spesial lainnya",
  },
  {
    icon: Sparkles,
    title: "Animasi Elegan",
    description: "Efek animasi halus dan transisi yang memukau untuk setiap halaman",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="fitur" className="py-32 px-6 lg:px-12 bg-[#F9F7F2]">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <p className="text-[#C9A961] text-sm font-light tracking-[0.2em] uppercase mb-6">
            Fitur Lengkap
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#3A3429] mb-6 leading-tight">
            Setiap Detail
            <span className="block italic text-[#C9A961]">Dirancang Sempurna</span>
          </h2>
          <div className="w-24 h-px bg-[#C9A961]/40 mx-auto mt-8"></div>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`group relative p-8 rounded-lg bg-white/50 backdrop-blur-sm border border-[#E8D5A3]/20 hover:border-[#C9A961]/40 transition-all duration-300 ${
                  feature.exclusive ? "ring-2 ring-[#C9A961]/20" : ""
                }`}
              >
                {feature.exclusive && (
                  <div className="absolute -top-3 -right-3 bg-[#C9A961] text-[#3A3429] text-xs px-3 py-1 rounded-full font-light tracking-wider uppercase">
                    Eksklusif
                  </div>
                )}
                <div className="w-12 h-12 bg-[#E8D5A3]/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#C9A961]/20 transition-colors">
                  <Icon className="w-6 h-6 text-[#5C4A37]" />
                </div>
                <h3 className="font-serif text-xl text-[#3A3429] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#5C4A37] font-light text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
