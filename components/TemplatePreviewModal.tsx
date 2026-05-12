"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { CatalogTemplate } from "@/data/catalog-templates";
import { getTemplateOrderHref } from "@/data/catalog-templates";

type TemplatePreviewModalProps = {
  isOpen: boolean;
  template: CatalogTemplate | null;
  onClose: () => void;
  onExitComplete: () => void;
};

const panelTransition = { type: "spring" as const, damping: 30, stiffness: 340 };

export default function TemplatePreviewModal({
  isOpen,
  template,
  onClose,
  onExitComplete,
}: TemplatePreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lockScroll = useCallback(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const isLocked = template !== null;
  useEffect(() => {
    if (!isLocked) return;
    return lockScroll();
  }, [isLocked, lockScroll]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!mounted || typeof document === "undefined") return null;

  const orderHref = template ? getTemplateOrderHref(template) : "#";

  const imageSrc =
    template?.previewMode === "image"
      ? (template.previewImageSrc ?? "/templates/template-undangan-1.png")
      : null;

  const iframeSrc =
    template?.previewMode === "iframe"
      ? (template.iframeSrc ?? "/v/demo?to=Tamu+Undangan")
      : null;

  return createPortal(
    <AnimatePresence onExitComplete={onExitComplete}>
      {(isOpen && template) ? (
        <motion.div
          key={template.id}
          className="fixed inset-0 z-[200]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-preview-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <button
            type="button"
            aria-label="Tutup preview"
            className="absolute inset-0 bg-[#3A3429]/40 backdrop-blur-md"
            onClick={onClose}
          />

          <div className="absolute inset-0 flex items-stretch justify-center md:items-center md:p-6 pointer-events-none">
            <motion.div
              className="pointer-events-auto flex w-full max-md:h-full max-md:min-h-0 max-md:flex-col max-md:bg-[#F9F7F2] md:max-w-[min(100%,360px)] md:max-h-[min(92dvh,880px)] md:flex-col md:rounded-2xl md:bg-[#F9F7F2]/92 md:backdrop-blur-md md:shadow-2xl md:ring-1 md:ring-[#E8D5A3]/25"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={panelTransition}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex shrink-0 items-center justify-between px-4 pt-4 pb-2 md:px-5 md:pt-5">
                <p
                  id="template-preview-title"
                  className="font-serif text-lg text-[#3A3429] md:text-xl"
                >
                  {template.name}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#5C4A37] transition-colors hover:bg-[#3A3429]/10"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" strokeWidth={1.25} />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 md:px-5 md:pb-5">
                <div className="mx-auto flex w-full max-w-[280px] flex-1 min-h-0 flex-col sm:max-w-[300px] md:max-w-[300px]">
                  <div className="flex min-h-0 flex-1 flex-col rounded-[2.25rem] border-[2px] border-[#2C2416] bg-[#2C2416] p-[7px] shadow-xl">
                    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.85rem] bg-[#1a1814]">
                      <div
                        className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y"
                        style={{ WebkitOverflowScrolling: "touch" }}
                      >
                        {template.previewMode === "image" && imageSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element -- long screenshot; natural height
                          <img
                            src={imageSrc}
                            alt={`Preview ${template.name}`}
                            className="block h-auto w-full max-w-full"
                            decoding="async"
                            loading="eager"
                            draggable={false}
                          />
                        ) : (
                          <iframe
                            key={iframeSrc}
                            title={`Demo ${template.name}`}
                            src={iframeSrc ?? "/v/demo?to=Tamu+Undangan"}
                            className="block h-[min(68dvh,640px)] w-full border-0 sm:h-[min(70dvh,680px)] md:h-[min(62vh,600px)]"
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            sandbox="allow-scripts allow-same-origin allow-popups-to-escape-sandbox"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 shrink-0 md:mt-6">
                  <a
                    href={orderHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center rounded-full bg-[#3A3429] px-6 py-3.5 text-center text-sm font-light tracking-wider text-[#F9F7F2] uppercase transition-colors hover:bg-[#5C4A37]"
                  >
                    Pesan Template Ini
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
