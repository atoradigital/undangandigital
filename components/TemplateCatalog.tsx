"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import TemplateCard from "./TemplateCard";
import TemplatePreviewModal from "./TemplatePreviewModal";
import {
  CATALOG_TEMPLATES,
  getTemplateOrderHref,
  WHATSAPP_SEE_ALL_TEMPLATES,
} from "@/data/catalog-templates";
import type { CatalogTemplate } from "@/data/catalog-templates";

export default function TemplateCatalog() {
  const [previewTemplate, setPreviewTemplate] = useState<CatalogTemplate | null>(
    null
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewOpenRef = useRef(previewOpen);
  previewOpenRef.current = previewOpen;

  const openPreview = (t: CatalogTemplate) => {
    setPreviewTemplate(t);
    setPreviewOpen(true);
  };

  const closePreview = () => setPreviewOpen(false);

  const handlePreviewExitComplete = () => {
    if (!previewOpenRef.current) {
      setPreviewTemplate(null);
    }
  };

  return (
    <section id="katalog" className="py-32 px-6 lg:px-12 bg-white">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <p className="text-[#C9A961] text-sm font-light tracking-[0.2em] uppercase mb-6">
            Koleksi Template
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#3A3429] mb-6 leading-tight">
            Pilihan Template
            <span className="block italic text-[#C9A961]">Terbaik</span>
          </h2>
          <p className="text-[#5C4A37] font-light text-lg max-w-2xl mx-auto leading-relaxed">
            Setiap template dirancang dengan cermat untuk menciptakan pengalaman yang tak terlupakan.
            Dapat dikustomisasi sesuai kebutuhan Anda.
          </p>
          <div className="w-24 h-px bg-[#C9A961]/40 mx-auto mt-8"></div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {CATALOG_TEMPLATES.map((template, index) => (
            <TemplateCard
              key={template.id}
              name={template.name}
              cardImage={template.cardImage}
              whatsappLink={getTemplateOrderHref(template)}
              index={index}
              onPreview={() => openPreview(template)}
            />
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
            Ingin melihat lebih banyak template?
          </p>
          <a
            href={WHATSAPP_SEE_ALL_TEMPLATES}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 bg-transparent border border-[#C9A961]/40 text-[#5C4A37] rounded-full font-light text-sm tracking-wider hover:bg-[#C9A961]/10 transition-all uppercase"
          >
            Lihat Semua Template
          </a>
        </motion.div>
      </div>

      <TemplatePreviewModal
        isOpen={previewOpen}
        template={previewTemplate}
        onClose={closePreview}
        onExitComplete={handlePreviewExitComplete}
      />
    </section>
  );
}
