"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CATALOG_TEMPLATES, getTemplateOrderHref, type CatalogTemplate } from "@/data/catalog-templates";

export default function TemplateCatalog() {
  return (
    <section id="katalog" className="py-24 px-6 lg:px-12 bg-[#F9F7F2]">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header Section — Disamakan persis dengan section fitur */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 max-w-2xl mx-auto"
        >
          <p className="text-[#C9A961] text-sm font-light tracking-[0.2em] uppercase mb-6">
            Pilihan Koleksi
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#3A3429] mb-6 leading-tight">
            Katalog Template
            <span className="block italic text-[#C9A961]">Undangan Digital</span>
          </h2>
          <p className="text-[#5C4A37] text-base font-light leading-relaxed">
            Pilih desain favorit Anda dan klik <strong className="font-medium">Lihat Demo Live</strong> untuk merasakan animasi serta fitur interaktifnya secara langsung.
          </p>
          <div className="w-24 h-px bg-[#C9A961]/40 mx-auto mt-8"></div>
        </motion.div>

        {/* Grid Katalog Template */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATALOG_TEMPLATES.map((template: CatalogTemplate) => (
            <div
              key={template.id}
              className="bg-[#FFFFFF] rounded-2xl overflow-hidden border border-[#E8D5A3]/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Gambar Thumbnail Card */}
              <div>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E8D5A3]/10">
                  {template.cardImage ? (
                    <Image
                      src={template.cardImage}
                      alt={template.name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#C9A961] font-serif text-lg">
                      {template.name}
                    </div>
                  )}
                  {/* Badge Kategori */}
                  {template.category && (
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[10px] font-medium tracking-wider uppercase px-3 py-1 rounded-full backdrop-blur-md shadow-sm ${
                          template.category === "premium"
                            ? "bg-[#3A3429] text-[#F3E5AB] border border-[#D4AF37]/50"
                            : "bg-[#F9F7F2]/90 text-[#5C4A37] border border-[#C9A961]/30"
                        }`}
                      >
                        {template.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info Template */}
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-[#3A3429] mb-2">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-[#5C4A37] text-xs font-light leading-relaxed">
                      {template.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex flex-col gap-2.5">
                {/* Tombol Lihat Demo Live (Buka di Tab Baru) */}
                <a
                  href={template.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-3 px-4 rounded-full border border-[#C9A961]/50 text-[#3A3429] text-xs font-medium tracking-widest uppercase hover:bg-[#C9A961]/10 transition-all flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Lihat Demo Live
                </a>

                {/* Tombol Pesan Sekarang */}
                <a
                  href={getTemplateOrderHref(template)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-3 px-4 rounded-full bg-[#3A3429] text-[#F9F7F2] text-xs font-medium tracking-widest uppercase hover:bg-[#5C4A37] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Pesan Sekarang
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}