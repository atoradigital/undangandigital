"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Link2,
  Layers,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
} from "lucide-react";
import { supabase } from "@/utils/supabase";
import { TEMPLATE_OPTIONS, type Template, type Invitation } from "@/types/admin";

/* ────────────────────────────────────────────────── */

interface Props {
  /** Jika diisi → mode Edit, jika kosong → mode Create */
  initialData?: Invitation;
  onSuccess: (inv: Invitation) => void;
  onCancel: () => void;
}

interface FormState {
  title: string;
  slug: string;
  template: Template;
}

/* ────────────────────────────────────────────────── */

export default function InvitationForm({ initialData, onSuccess, onCancel }: Props) {
  const isEdit = !!initialData;

  const [form, setForm] = useState<FormState>({
    title:    initialData?.title    ?? "",
    slug:     initialData?.slug     ?? "",
    template: (initialData?.template as Template) ?? "modern",
  });

  const [templateOpen, setTemplateOpen] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [slugError,    setSlugError]    = useState("");
  const [globalError,  setGlobalError]  = useState("");

  /* Reset state when initialData changes */
  useEffect(() => {
    setForm({
      title:    initialData?.title    ?? "",
      slug:     initialData?.slug     ?? "",
      template: (initialData?.template as Template) ?? "modern",
    });
    setSlugError("");
    setGlobalError("");
  }, [initialData]);

  /* Auto-generate slug from title */
  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setForm((f) => ({ ...f, title: val, slug }));
    setSlugError("");
  };

  const handleSlugChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setForm((f) => ({ ...f, slug: clean }));
    setSlugError("");
  };

  /* Cek duplikasi slug */
  const checkSlugUnique = async (slug: string): Promise<boolean> => {
    let query = supabase
      .from("invitations")
      .select("id")
      .eq("slug", slug);

    // Pada mode Edit, kecualikan ID saat ini
    if (isEdit && initialData?.id) {
      query = query.neq("id", initialData.id);
    }

    const { data, error } = await query;
    if (error) return true; // Anggap unik jika query gagal
    return !data || data.length === 0;
  };

  /* Submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setSlugError("");

    if (!form.title.trim() || !form.slug.trim()) return;

    setLoading(true);

    try {
      /* 1. Cek keunikan slug */
      const isUnique = await checkSlugUnique(form.slug);
      if (!isUnique) {
        setSlugError("Slug ini sudah digunakan. Coba yang lain.");
        setLoading(false);
        return;
      }

      /* 2. Insert atau Update */
      const payload = {
        title:    form.title.trim(),
        slug:     form.slug.trim(),
        template: form.template,
      };

      let result: Invitation | null = null;

      if (isEdit && initialData?.id) {
        const { data, error } = await supabase
          .from("invitations")
          .update(payload)
          .eq("id", initialData.id)
          .select()
          .single();
        if (error) throw error;
        result = data as Invitation;
      } else {
        const { data, error } = await supabase
          .from("invitations")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        result = data as Invitation;
      }

      if (result) onSuccess(result);
    } catch (err: unknown) {
      console.error("[InvitationForm] error:", err);
      // Supabase returns PostgrestError (plain object), not native Error
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Terjadi kesalahan yang tidak diketahui.";
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = TEMPLATE_OPTIONS.find((t) => t.value === form.template)!;
  const canSubmit = form.title.trim() && form.slug.trim() && !loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Nama Acara ── */}
      <div className="space-y-1.5">
        <label
          htmlFor="inv-title"
          className="flex items-center gap-1.5 font-sans text-[10px] font-semibold text-[#5C4A37] uppercase tracking-wider"
        >
          <Sparkles size={9} className="text-[#C9A961]" />
          Nama Acara
        </label>
        <input
          id="inv-title"
          type="text"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Contoh: Pernikahan Reza & Cinta"
          disabled={loading}
          className="w-full px-4 py-3 bg-[#F9F7F2] border border-[#E8D5A3]/60 rounded-xl font-sans text-sm text-[#3A3429] placeholder-[#5C4A37]/30 focus:outline-none focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/10 transition-all disabled:opacity-60"
        />
      </div>

      {/* ── URL Slug ── */}
      <div className="space-y-1.5">
        <label
          htmlFor="inv-slug"
          className="flex items-center gap-1.5 font-sans text-[10px] font-semibold text-[#5C4A37] uppercase tracking-wider"
        >
          <Link2 size={9} className="text-[#C9A961]" />
          URL Unik (Slug)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 font-sans text-xs text-[#5C4A37]/40 select-none pointer-events-none">
            /r/
          </span>
          <input
            id="inv-slug"
            type="text"
            value={form.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="pernikahan-reza-cinta"
            disabled={loading}
            className={`w-full pl-8 pr-4 py-3 bg-[#F9F7F2] border rounded-xl font-sans text-sm text-[#3A3429] placeholder-[#5C4A37]/30 focus:outline-none transition-all font-mono disabled:opacity-60 ${
              slugError
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-[#E8D5A3]/60 focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/10"
            }`}
          />
        </div>
        {/* URL preview */}
        {form.slug && !slugError && (
          <p className="font-sans text-[10px] text-[#5C4A37]/50 font-light pl-1 truncate">
            Preview:{" "}
            <span className="text-[#C9A961]">undangandigital.id/r/{form.slug}</span>
          </p>
        )}
        {/* Slug error */}
        <AnimatePresence>
          {slugError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 font-sans text-[11px] text-red-600 pl-1"
            >
              <AlertCircle size={11} />
              {slugError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Template Dropdown ── */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 font-sans text-[10px] font-semibold text-[#5C4A37] uppercase tracking-wider">
          <Layers size={9} className="text-[#C9A961]" />
          Pilihan Template
        </label>

        <div className="relative">
          <button
            type="button"
            id="inv-template-select"
            onClick={() => setTemplateOpen((v) => !v)}
            disabled={loading}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#F9F7F2] border border-[#E8D5A3]/60 rounded-xl font-sans text-sm text-[#3A3429] focus:outline-none focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/10 transition-all disabled:opacity-60"
          >
            <span className="flex items-center gap-2">
              <span>{selectedTemplate.label}</span>
              <span className="text-[#5C4A37]/40 text-xs">— {selectedTemplate.desc}</span>
            </span>
            <ChevronDown
              size={15}
              className={`text-[#5C4A37]/50 transition-transform duration-200 ${templateOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {templateOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1.5 left-0 right-0 z-20 bg-white border border-[#E8D5A3]/40 rounded-xl shadow-xl overflow-hidden"
              >
                {TEMPLATE_OPTIONS.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, template: opt.value }));
                        setTemplateOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left font-sans text-sm transition-colors hover:bg-[#F9F7F2] ${
                        form.template === opt.value ? "text-[#C9A961] bg-[#F9F7F2]" : "text-[#3A3429]"
                      }`}
                    >
                      <span className="flex-1 font-medium">{opt.label}</span>
                      <span className="text-[#5C4A37]/40 text-xs font-light">{opt.desc}</span>
                      {form.template === opt.value && (
                        <CheckCircle2 size={14} className="text-[#C9A961]" />
                      )}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Global Error ── */}
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 font-sans text-xs"
          >
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            {globalError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          id="inv-form-submit"
          disabled={!canSubmit}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#3A3429] hover:bg-[#5C4A37] disabled:opacity-40 disabled:cursor-not-allowed text-[#F9F7F2] rounded-xl font-sans text-sm font-light tracking-wider transition-all duration-200 shadow-sm"
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /><span>Menyimpan...</span></>
          ) : (
            <><Save size={14} strokeWidth={1.5} /><span>{isEdit ? "Simpan Perubahan" : "Buat Klien"}</span></>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-5 py-2.5 border border-[#E8D5A3]/60 hover:border-[#E8D5A3] text-[#5C4A37] rounded-xl font-sans text-sm font-light transition-all duration-200 disabled:opacity-40"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
