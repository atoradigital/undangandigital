"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface Props {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title = "Konfirmasi Hapus",
  message = "Tindakan ini tidak dapat dibatalkan. Data yang dihapus tidak bisa dipulihkan.",
  confirmLabel = "Hapus Sekarang",
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, loading, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !loading && onCancel()}
            className="fixed inset-0 z-[60] bg-[#2C2416]/50 backdrop-blur-sm"
          />

          {/* Dialog card */}
          <motion.div
            key="confirm-card"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[70] flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#E8D5A3]/30 pointer-events-auto overflow-hidden">
              {/* Top accent */}
              <div className="h-[3px] bg-gradient-to-r from-red-400/60 via-red-500 to-red-400/60" />

              <div className="px-6 py-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                      <AlertTriangle size={17} className="text-red-500" strokeWidth={1.8} />
                    </div>
                    <h3 className="font-serif text-base font-semibold text-[#3A3429]">
                      {title}
                    </h3>
                  </div>
                  <button
                    onClick={() => !loading && onCancel()}
                    disabled={loading}
                    className="text-[#5C4A37]/30 hover:text-[#5C4A37] transition-colors disabled:opacity-40 -mt-0.5"
                    aria-label="Tutup"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Message */}
                <p className="font-sans text-sm text-[#5C4A37]/70 font-light leading-relaxed ml-12">
                  {message}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 ml-12">
                  <button
                    id="confirm-delete-btn"
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-sans text-sm font-medium transition-all duration-200 shadow-sm"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={14} strokeWidth={1.8} />
                    )}
                    <span>{loading ? "Menghapus..." : confirmLabel}</span>
                  </button>
                  <button
                    onClick={() => !loading && onCancel()}
                    disabled={loading}
                    className="px-5 py-2.5 border border-[#E8D5A3]/60 hover:border-[#E8D5A3] text-[#5C4A37] rounded-xl font-sans text-sm font-light transition-all duration-200 disabled:opacity-40"
                  >
                    Batalkan
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
