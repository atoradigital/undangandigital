"use client";

import { motion } from "framer-motion";
import { Eye, MessageCircle } from "lucide-react";

interface TemplateCardProps {
  name: string;
  image: string;
  demoUrl: string;
  whatsappLink: string;
  index: number;
}

export default function TemplateCard({ name, image, demoUrl, whatsappLink, index }: TemplateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
    >
      {/* Image Preview */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#E8D5A3]/20 to-[#C9A961]/10">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center p-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-[#C9A961] to-[#E8D5A3] rounded-full flex items-center justify-center">
              <span className="text-4xl">💐</span>
            </div>
            <p className="text-[#5C4A37] font-serif text-lg">{name}</p>
          </div>
        </motion.div>
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A3429]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-serif text-xl text-[#3A3429] mb-6">{name}</h3>
        <div className="flex flex-col gap-3">
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-[#C9A961]/40 text-[#5C4A37] rounded-full font-light text-sm tracking-wider hover:bg-[#C9A961]/10 transition-all uppercase"
          >
            <Eye size={16} />
            Lihat Demo
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#3A3429] text-[#F9F7F2] rounded-full font-light text-sm tracking-wider hover:bg-[#5C4A37] transition-all uppercase"
          >
            <MessageCircle size={16} />
            Pesan Sekarang
          </a>
        </div>
      </div>
    </motion.div>
  );
}
