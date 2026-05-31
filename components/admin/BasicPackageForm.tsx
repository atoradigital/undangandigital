"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Link2, Layers, ChevronDown, CheckCircle2,
  AlertCircle, Save, Loader2, Upload, X, ImagePlus,
  Heart, Clock, MapPin, Camera, User, Users,
} from "lucide-react";
import { supabase } from "@/utils/supabase";
import {
  BASIC_TEMPLATES,
  type Invitation,
  type EventData,
  type BasicTemplateValue,
} from "@/types/admin";

/* ════════════════════════════════════════════════════
   Types
════════════════════════════════════════════════════ */

interface FormState {
  /* A — Info */
  title: string;
  slug: string;
  template: BasicTemplateValue;
  /* B — Mempelai */
  pria_nama:  string;
  pria_ortu:  string;          // "Putra ke-N dari Bapak X & Ibu Y"
  wanita_nama: string;
  wanita_ortu: string;         // "Putri ke-N dari Bapak X & Ibu Y"
  /* C — Jadwal */
  akad_tanggal: string;
  akad_jam_mulai: string;
  akad_jam_selesai: string;
  resepsi_tanggal: string;
  resepsi_jam_mulai: string;
  resepsi_jam_selesai: string;
  /* D — Lokasi */
  lokasi_alamat: string;
  lokasi_maps_url: string;
}

interface ImageFiles {
  pria_foto:  File | null;
  wanita_foto: File | null;
  foto_cover: File | null;
  foto_quote: File | null;  // foto untuk card ayat
}

interface ImagePreviews {
  pria_foto:   string | null;
  wanita_foto: string | null;
  foto_cover:  string | null;
  foto_quote:  string | null;  // foto untuk card ayat
}

interface UploadProgress {
  current: number;
  total: number;
  label: string;
}

interface Props {
  /** Jika diisi → mode Edit, data existing akan diload */
  initialData?: Invitation;
}

/* ════════════════════════════════════════════════════
   Helpers
════════════════════════════════════════════════════ */

const MAX_GALLERY = 8;

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function fileToObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

/* ════════════════════════════════════════════════════
   Sub-components
════════════════════════════════════════════════════ */

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8D5A3]/40 shadow-[0_4px_24px_rgba(58,52,41,0.04)] overflow-hidden">
      <div className="flex items-start gap-4 px-8 py-6 border-b border-[#F5F1E8]">
        <div className="w-10 h-10 rounded-xl bg-[#3A3429]/5 border border-[#E8D5A3]/40 flex items-center justify-center shrink-0">
          <Icon size={18} strokeWidth={1.5} className="text-[#C9A961]" />
        </div>
        <div>
          <h2 className="font-serif text-base font-semibold text-[#3A3429] leading-tight">
            {title}
          </h2>
          <p className="font-sans text-xs text-[#5C4A37]/55 font-light mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="px-8 py-7">{children}</div>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-sans text-[10px] font-semibold text-[#5C4A37] uppercase tracking-wider mb-1.5"
    >
      {children}
      {required && <span className="text-[#C9A961] ml-0.5">*</span>}
    </label>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  prefix,
  mono,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  prefix?: string;
  mono?: boolean;
}) {
  return (
    <div className={prefix ? "relative" : undefined}>
      {prefix && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 font-sans text-xs text-[#5C4A37]/40 select-none pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${prefix ? "pl-8" : "px-4"} pr-4 py-3 bg-[#F9F7F2] border border-[#E8D5A3]/60 rounded-xl font-sans text-sm text-[#3A3429] placeholder-[#5C4A37]/30 focus:outline-none focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/10 transition-all disabled:opacity-60 ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}

function DateTimeInput({
  id,
  type,
  value,
  onChange,
  disabled,
}: {
  id: string;
  type: "date" | "time";
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-4 py-3 bg-[#F9F7F2] border border-[#E8D5A3]/60 rounded-xl font-sans text-sm text-[#3A3429] focus:outline-none focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/10 transition-all disabled:opacity-60"
    />
  );
}

/* Single image upload box with preview */
function PhotoUploadBox({
  id,
  label,
  preview,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  preview: string | null;
  onChange: (file: File) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative group flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden cursor-pointer
        ${preview ? "border-[#C9A961]/40 bg-transparent" : "border-[#E8D5A3]/50 bg-[#F9F7F2]/60 hover:border-[#C9A961]/50 hover:bg-[#F9F7F2]"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        aspect-square`}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
      />
      {preview ? (
        <>
          <Image
            src={preview}
            alt={label}
            fill
            className="object-cover"
            sizes="200px"
          />
          <div className="absolute inset-0 bg-[#2C2416]/0 group-hover:bg-[#2C2416]/40 transition-all duration-200 flex items-center justify-center">
            <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#3A3429]/5 border border-[#E8D5A3]/40 flex items-center justify-center">
            <Upload size={16} strokeWidth={1.5} className="text-[#5C4A37]/50" />
          </div>
          <p className="font-sans text-[11px] text-[#5C4A37]/50 font-light leading-tight">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   Main Form Component
════════════════════════════════════════════════════ */

export default function BasicPackageForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;

  /* ── Form state ── */
  const existing = initialData?.event_data;

  const [form, setForm] = useState<FormState>({
    title:               initialData?.title ?? "",
    slug:                initialData?.slug ?? "",
    template:            (initialData?.template as BasicTemplateValue) ?? "basic-1",
    pria_nama:           existing?.mempelai_pria?.nama  ?? "",
    pria_ortu:           existing?.mempelai_pria?.ortu  ?? "",
    wanita_nama:         existing?.mempelai_wanita?.nama ?? "",
    wanita_ortu:         existing?.mempelai_wanita?.ortu ?? "",
    akad_tanggal:        existing?.jadwal_akad?.tanggal     ?? "",
    akad_jam_mulai:      existing?.jadwal_akad?.jam_mulai   ?? "",
    akad_jam_selesai:    existing?.jadwal_akad?.jam_selesai ?? "",
    resepsi_tanggal:     existing?.jadwal_resepsi?.tanggal     ?? "",
    resepsi_jam_mulai:   existing?.jadwal_resepsi?.jam_mulai   ?? "",
    resepsi_jam_selesai: existing?.jadwal_resepsi?.jam_selesai ?? "",
    lokasi_alamat:       existing?.lokasi?.alamat   ?? "",
    lokasi_maps_url:     existing?.lokasi?.maps_url ?? "",
  });

  /* ── Image state ── */
  const [imageFiles, setImageFiles] = useState<ImageFiles>({
    pria_foto:   null,
    wanita_foto: null,
    foto_cover:  null,
    foto_quote:  null,
  });

  const [imagePreviews, setImagePreviews] = useState<ImagePreviews>({
    pria_foto:   existing?.mempelai_pria?.foto_url  ?? null,
    wanita_foto: existing?.mempelai_wanita?.foto_url ?? null,
    foto_cover:  existing?.foto_cover ?? null,
    foto_quote:  existing?.foto_quote ?? null,
  });

  /* ── Gallery state ── */
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    existing?.galeri ?? []
  );
  const [existingGallery] = useState<string[]>(existing?.galeri ?? []);

  /* ── UI state ── */
  const [templateOpen, setTemplateOpen] = useState(false);
  const [progress, setProgress]         = useState<UploadProgress | null>(null);
  const [globalError, setGlobalError]   = useState("");
  const [slugError, setSlugError]       = useState("");

  const galleryInputRef = useRef<HTMLInputElement>(null);

  /* Cleanup object URLs on unmount */
  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach((url) => {
        if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      galleryPreviews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Auto-slug ── */
  const handleTitleChange = (val: string) => {
    setForm((f) => ({ ...f, title: val, slug: slugify(val) }));
    setSlugError("");
  };

  /* ── Single photo select ── */
  const handlePhotoSelect = (key: keyof ImageFiles, file: File) => {
    const url = fileToObjectUrl(file);
    setImageFiles((prev) => ({ ...prev, [key]: file }));
    setImagePreviews((prev) => {
      if (prev[key]?.startsWith("blob:")) URL.revokeObjectURL(prev[key]!);
      return { ...prev, [key]: url };
    });
  };

  /* ── Gallery select ── */
  const handleGallerySelect = useCallback((files: FileList) => {
    const arr = Array.from(files);
    setGalleryFiles((prev) => {
      const combined = [...prev, ...arr];
      const limited  = combined.slice(0, MAX_GALLERY - existingGallery.length);
      return limited;
    });
    setGalleryPreviews((prev) => {
      const newUrls = arr.map(fileToObjectUrl);
      const combined = [...existingGallery, ...prev.filter(u => !existingGallery.includes(u)), ...newUrls];
      return combined.slice(0, MAX_GALLERY);
    });
  }, [existingGallery]);

  const removeGalleryItem = (idx: number) => {
    if (idx < existingGallery.length) return; // can't remove existing in this version
    const fileIdx = idx - existingGallery.length;
    const url = galleryPreviews[idx];
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    setGalleryFiles((prev) => prev.filter((_, i) => i !== fileIdx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ════════════════════════════════════════════════
     Upload helper
  ════════════════════════════════════════════════ */
  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage
      .from("atora-assets")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (error) throw new Error(`Upload gagal: ${error.message}`);
    const { data } = supabase.storage.from("atora-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  /* ════════════════════════════════════════════════
     Submit
  ════════════════════════════════════════════════ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setSlugError("");

    if (!form.title.trim() || !form.slug.trim()) {
      setGlobalError("Nama acara dan slug wajib diisi.");
      return;
    }

    /* Count total files to upload */
    const filesToUpload: { key: string; file: File; path: string }[] = [];
    const slug = form.slug.trim();

    if (imageFiles.pria_foto)   filesToUpload.push({ key: "pria",   file: imageFiles.pria_foto,   path: `${slug}/pria.${imageFiles.pria_foto.name.split(".").pop()}` });
    if (imageFiles.wanita_foto) filesToUpload.push({ key: "wanita", file: imageFiles.wanita_foto, path: `${slug}/wanita.${imageFiles.wanita_foto.name.split(".").pop()}` });
    if (imageFiles.foto_cover)  filesToUpload.push({ key: "cover",  file: imageFiles.foto_cover,  path: `${slug}/cover.${imageFiles.foto_cover.name.split(".").pop()}` });
    if (imageFiles.foto_quote)  filesToUpload.push({ key: "quote",  file: imageFiles.foto_quote,  path: `${slug}/quote.${imageFiles.foto_quote.name.split(".").pop()}` });
    galleryFiles.forEach((file, i) => {
      filesToUpload.push({ key: `galeri_${i}`, file, path: `${slug}/galeri-${Date.now()}-${i}.${file.name.split(".").pop()}` });
    });

    const totalSteps = filesToUpload.length + 1; // +1 for DB save
    let currentStep  = 0;

    setProgress({ current: 0, total: totalSteps, label: "Mempersiapkan..." });

    try {
      /* ── Upload images ── */
      const uploadedUrls: Record<string, string> = {};
      const galeriNewUrls: string[] = [];

      for (const item of filesToUpload) {
        currentStep++;
        setProgress({
          current: currentStep,
          total: totalSteps,
          label: `Mengunggah gambar... (${currentStep}/${filesToUpload.length})`,
        });

        const publicUrl = await uploadFile(item.file, item.path);

        if (item.key.startsWith("galeri_")) {
          galeriNewUrls.push(publicUrl);
        } else {
          uploadedUrls[item.key] = publicUrl;
        }
      }

      /* ── Resolve final URLs (new upload OR existing) ── */
      const pria_foto_url   = uploadedUrls["pria"]   ?? imagePreviews.pria_foto   ?? "";
      const wanita_foto_url = uploadedUrls["wanita"] ?? imagePreviews.wanita_foto ?? "";
      const foto_cover_url  = uploadedUrls["cover"]  ?? imagePreviews.foto_cover  ?? "";
      const foto_quote_url  = uploadedUrls["quote"]  ?? imagePreviews.foto_quote  ?? "";
      const galeri_all      = [...existingGallery, ...galeriNewUrls];

      /* ── Build event_data ── */
      const event_data: EventData = {
        mempelai_pria:   { nama: form.pria_nama,   foto_url: pria_foto_url,   ortu: form.pria_ortu   || undefined },
        mempelai_wanita: { nama: form.wanita_nama, foto_url: wanita_foto_url, ortu: form.wanita_ortu || undefined },
        foto_cover:      foto_cover_url,
        foto_quote:      foto_quote_url || undefined,
        jadwal_akad: {
          tanggal:     form.akad_tanggal,
          jam_mulai:   form.akad_jam_mulai,
          jam_selesai: form.akad_jam_selesai,
        },
        jadwal_resepsi: {
          tanggal:     form.resepsi_tanggal,
          jam_mulai:   form.resepsi_jam_mulai,
          jam_selesai: form.resepsi_jam_selesai,
        },
        lokasi: {
          alamat:   form.lokasi_alamat,
          maps_url: form.lokasi_maps_url,
        },
        galeri: galeri_all,
      };

      /* ── DB save ── */
      currentStep++;
      setProgress({ current: currentStep, total: totalSteps, label: "Menyimpan ke database..." });

      const payload = {
        title:      form.title.trim(),
        slug:       form.slug.trim(),
        template:   form.template,
        event_data,
      };

      if (isEdit && initialData?.id) {
        const { error } = await supabase
          .from("invitations")
          .update(payload)
          .eq("id", initialData.id);
        if (error) throw new Error(error.message);
      } else {
        /* Check slug uniqueness */
        const { data: existing } = await supabase
          .from("invitations")
          .select("id")
          .eq("slug", form.slug.trim())
          .maybeSingle();
        if (existing) {
          setSlugError("Slug ini sudah digunakan. Coba yang lain.");
          setProgress(null);
          return;
        }
        const { error } = await supabase.from("invitations").insert(payload);
        if (error) throw new Error(error.message);
      }

      setProgress({ current: totalSteps, total: totalSteps, label: "Berhasil disimpan!" });

      setTimeout(() => {
        router.push("/admin/dashboard");
        router.refresh();
      }, 800);

    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Terjadi kesalahan yang tidak diketahui.";
      setGlobalError(msg);
      setProgress(null);
    }
  };

  const isLoading    = progress !== null && progress.label !== "Berhasil disimpan!";
  const progressPct  = progress ? Math.round((progress.current / progress.total) * 100) : 0;
  const selectedTmpl = BASIC_TEMPLATES.find((t) => t.value === form.template) ?? BASIC_TEMPLATES[0];

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <form onSubmit={handleSubmit} className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">

      {/* ── Page header ── */}
      <div>
        <p className="font-sans text-[10px] text-[#C9A961] uppercase tracking-[0.3em] font-medium mb-1.5">
          Paket Basic
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3A3429] leading-tight">
          {isEdit ? "Edit Undangan" : "Buat Undangan Baru"}
        </h1>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#E8D5A3]/60 to-transparent" />

      {/* ════════════════════════════════════════════
          SECTION A — Info Dasar & Template
      ════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <SectionCard icon={Sparkles} title="Informasi Dasar & Desain" subtitle="Nama acara, URL unik, dan pilihan template tampilan">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <FieldLabel htmlFor="f-title" required>Nama Acara</FieldLabel>
              <TextInput
                id="f-title"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="Contoh: Pernikahan Budi & Ani"
                disabled={isLoading}
              />
            </div>

            {/* Slug */}
            <div>
              <FieldLabel htmlFor="f-slug" required>URL Unik (Slug)</FieldLabel>
              <TextInput
                id="f-slug"
                value={form.slug}
                onChange={(v) => {
                  setForm((f) => ({ ...f, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "") }));
                  setSlugError("");
                }}
                placeholder="budi-ani"
                disabled={isLoading}
                prefix="/r/"
                mono
              />
              {form.slug && !slugError && (
                <p className="mt-1 font-sans text-[10px] text-[#5C4A37]/50 pl-1 truncate">
                  Preview: <span className="text-[#C9A961]">undangandigital.id/r/{form.slug}</span>
                </p>
              )}
              {slugError && (
                <p className="mt-1 flex items-center gap-1.5 font-sans text-[11px] text-red-600">
                  <AlertCircle size={11} />{slugError}
                </p>
              )}
            </div>

            {/* Template */}
            <div>
              <FieldLabel required>Template</FieldLabel>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTemplateOpen((v) => !v)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#F9F7F2] border border-[#E8D5A3]/60 rounded-xl font-sans text-sm text-[#3A3429] focus:outline-none focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/10 transition-all disabled:opacity-60"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{selectedTmpl.label}</span>
                    <span className="text-[#5C4A37]/40 text-xs">— {selectedTmpl.desc}</span>
                  </span>
                  <ChevronDown size={15} className={`text-[#5C4A37]/50 transition-transform duration-200 ${templateOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {templateOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-1.5 left-0 right-0 z-50 bg-white border border-[#E8D5A3]/40 rounded-xl shadow-xl overflow-hidden"
                    >
                      {BASIC_TEMPLATES.map((t) => (
                        <li key={t.value}>
                          <button
                            type="button"
                            onClick={() => { setForm((f) => ({ ...f, template: t.value })); setTemplateOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left font-sans text-sm transition-colors hover:bg-[#F9F7F2] ${form.template === t.value ? "text-[#C9A961] bg-[#F9F7F2]" : "text-[#3A3429]"}`}
                          >
                            <span className="flex-1 font-medium">{t.label}</span>
                            <span className="text-[#5C4A37]/40 text-xs font-light">{t.desc}</span>
                            {form.template === t.value && <CheckCircle2 size={14} className="text-[#C9A961]" />}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* ════════════════════════════════════════════
          SECTION B — Data Mempelai
      ════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <SectionCard icon={Heart} title="Data Mempelai" subtitle="Nama lengkap dan foto masing-masing mempelai serta foto bersama">
          <div className="space-y-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pria */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-[#F5F1E8]">
                  <User size={13} strokeWidth={1.5} className="text-[#C9A961]" />
                  <span className="font-sans text-[10px] font-semibold text-[#5C4A37] uppercase tracking-wider">Mempelai Pria</span>
                </div>
                <div>
                  <FieldLabel htmlFor="f-pria-nama">Nama Lengkap</FieldLabel>
                  <TextInput
                    id="f-pria-nama"
                    value={form.pria_nama}
                    onChange={(v) => setForm((f) => ({ ...f, pria_nama: v }))}
                    placeholder="Nama lengkap mempelai pria"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="f-pria-ortu">Info Orang Tua</FieldLabel>
                  <TextInput
                    id="f-pria-ortu"
                    value={form.pria_ortu}
                    onChange={(v) => setForm((f) => ({ ...f, pria_ortu: v }))}
                    placeholder="Putra ke-1 dari Bapak X & Ibu Y"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="f-pria-foto">Foto Mempelai Pria</FieldLabel>
                  <div className="w-40">
                    <PhotoUploadBox
                      id="f-pria-foto"
                      label="Klik untuk upload foto"
                      preview={imagePreviews.pria_foto}
                      onChange={(f) => handlePhotoSelect("pria_foto", f)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Wanita */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-[#F5F1E8]">
                  <User size={13} strokeWidth={1.5} className="text-[#C9A961]" />
                  <span className="font-sans text-[10px] font-semibold text-[#5C4A37] uppercase tracking-wider">Mempelai Wanita</span>
                </div>
                <div>
                  <FieldLabel htmlFor="f-wanita-nama">Nama Lengkap</FieldLabel>
                  <TextInput
                    id="f-wanita-nama"
                    value={form.wanita_nama}
                    onChange={(v) => setForm((f) => ({ ...f, wanita_nama: v }))}
                    placeholder="Nama lengkap mempelai wanita"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="f-wanita-ortu">Info Orang Tua</FieldLabel>
                  <TextInput
                    id="f-wanita-ortu"
                    value={form.wanita_ortu}
                    onChange={(v) => setForm((f) => ({ ...f, wanita_ortu: v }))}
                    placeholder="Putri ke-1 dari Bapak X & Ibu Y"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="f-wanita-foto">Foto Mempelai Wanita</FieldLabel>
                  <div className="w-40">
                    <PhotoUploadBox
                      id="f-wanita-foto"
                      label="Klik untuk upload foto"
                      preview={imagePreviews.wanita_foto}
                      onChange={(f) => handlePhotoSelect("wanita_foto", f)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Foto Cover & Quote — dua input berdampingan */}
            <div>
              <div className="flex items-center gap-2 pb-1 mb-4 border-b border-[#F5F1E8]">
                <Users size={13} strokeWidth={1.5} className="text-[#C9A961]" />
                <span className="font-sans text-[10px] font-semibold text-[#5C4A37] uppercase tracking-wider">Aset Visual Utama</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Input 1: Foto Cover */}
                <div className="space-y-2">
                  <FieldLabel htmlFor="f-cover-foto">Foto Cover Utama &amp; Penutup</FieldLabel>
                  <p className="font-sans text-[10px] text-[#5C4A37]/45 font-light -mt-1 mb-2">
                    Ditampilkan di panel kiri (desktop) dan latar opening.
                  </p>
                  <div
                    onClick={() => !isLoading && document.getElementById("f-cover-foto")?.click()}
                    className={`relative group w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden cursor-pointer
                      ${imagePreviews.foto_cover ? "border-[#C9A961]/40" : "border-[#E8D5A3]/50 bg-[#F9F7F2]/60 hover:border-[#C9A961]/50"}
                      ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                    style={{ aspectRatio: "3/4" }}
                  >
                    <input
                      id="f-cover-foto"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isLoading}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoSelect("foto_cover", f); }}
                    />
                    {imagePreviews.foto_cover ? (
                      <>
                        <Image src={imagePreviews.foto_cover} alt="Foto cover" fill className="object-cover" sizes="280px" />
                        <div className="absolute inset-0 bg-[#2C2416]/0 group-hover:bg-[#2C2416]/40 transition-all flex items-center justify-center">
                          <Camera size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center p-4">
                        <div className="w-10 h-10 rounded-xl bg-[#3A3429]/5 border border-[#E8D5A3]/40 flex items-center justify-center">
                          <Upload size={16} strokeWidth={1.5} className="text-[#5C4A37]/50" />
                        </div>
                        <p className="font-sans text-xs text-[#5C4A37]/50 font-light">Klik untuk upload</p>
                        <p className="font-sans text-[10px] text-[#5C4A37]/35">JPG / PNG / WEBP</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input 2: Foto Quote/Ayat */}
                <div className="space-y-2">
                  <FieldLabel htmlFor="f-quote-foto">Foto Background Quote / Ayat</FieldLabel>
                  <p className="font-sans text-[10px] text-[#5C4A37]/45 font-light -mt-1 mb-2">
                    Ditampilkan di dalam card ayat (potrait). Jika kosong, gunakan foto cover.
                  </p>
                  <div
                    onClick={() => !isLoading && document.getElementById("f-quote-foto")?.click()}
                    className={`relative group w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden cursor-pointer
                      ${imagePreviews.foto_quote ? "border-[#C9A961]/40" : "border-[#E8D5A3]/50 bg-[#F9F7F2]/60 hover:border-[#C9A961]/50"}
                      ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                    style={{ aspectRatio: "3/4" }}
                  >
                    <input
                      id="f-quote-foto"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isLoading}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoSelect("foto_quote", f); }}
                    />
                    {imagePreviews.foto_quote ? (
                      <>
                        <Image src={imagePreviews.foto_quote} alt="Foto quote" fill className="object-cover" sizes="280px" />
                        <div className="absolute inset-0 bg-[#2C2416]/0 group-hover:bg-[#2C2416]/40 transition-all flex items-center justify-center">
                          <Camera size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center p-4">
                        <div className="w-10 h-10 rounded-xl bg-[#3A3429]/5 border border-[#E8D5A3]/40 flex items-center justify-center">
                          <ImagePlus size={16} strokeWidth={1.5} className="text-[#5C4A37]/50" />
                        </div>
                        <p className="font-sans text-xs text-[#5C4A37]/50 font-light">Klik untuk upload</p>
                        <p className="font-sans text-[10px] text-[#5C4A37]/35">JPG / PNG / WEBP</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* ════════════════════════════════════════════
          SECTION C — Waktu & Lokasi
      ════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <SectionCard icon={Clock} title="Waktu & Lokasi Acara" subtitle="Jadwal akad dan resepsi, serta lokasi pelaksanaan">
          <div className="space-y-7">
            {/* Akad */}
            <div>
              <div className="flex items-center gap-2 pb-1 mb-4 border-b border-[#F5F1E8]">
                <span className="font-sans text-[10px] font-semibold text-[#5C4A37] uppercase tracking-wider">Akad Nikah</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <FieldLabel htmlFor="f-akad-tgl">Tanggal</FieldLabel>
                  <DateTimeInput id="f-akad-tgl" type="date" value={form.akad_tanggal} onChange={(v) => setForm((f) => ({ ...f, akad_tanggal: v }))} disabled={isLoading} />
                </div>
                <div>
                  <FieldLabel htmlFor="f-akad-jam1">Jam Mulai</FieldLabel>
                  <DateTimeInput id="f-akad-jam1" type="time" value={form.akad_jam_mulai} onChange={(v) => setForm((f) => ({ ...f, akad_jam_mulai: v }))} disabled={isLoading} />
                </div>
                <div>
                  <FieldLabel htmlFor="f-akad-jam2">Jam Selesai</FieldLabel>
                  <DateTimeInput id="f-akad-jam2" type="time" value={form.akad_jam_selesai} onChange={(v) => setForm((f) => ({ ...f, akad_jam_selesai: v }))} disabled={isLoading} />
                </div>
              </div>
            </div>

            {/* Resepsi */}
            <div>
              <div className="flex items-center gap-2 pb-1 mb-4 border-b border-[#F5F1E8]">
                <span className="font-sans text-[10px] font-semibold text-[#5C4A37] uppercase tracking-wider">Resepsi</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <FieldLabel htmlFor="f-res-tgl">Tanggal</FieldLabel>
                  <DateTimeInput id="f-res-tgl" type="date" value={form.resepsi_tanggal} onChange={(v) => setForm((f) => ({ ...f, resepsi_tanggal: v }))} disabled={isLoading} />
                </div>
                <div>
                  <FieldLabel htmlFor="f-res-jam1">Jam Mulai</FieldLabel>
                  <DateTimeInput id="f-res-jam1" type="time" value={form.resepsi_jam_mulai} onChange={(v) => setForm((f) => ({ ...f, resepsi_jam_mulai: v }))} disabled={isLoading} />
                </div>
                <div>
                  <FieldLabel htmlFor="f-res-jam2">Jam Selesai</FieldLabel>
                  <DateTimeInput id="f-res-jam2" type="time" value={form.resepsi_jam_selesai} onChange={(v) => setForm((f) => ({ ...f, resepsi_jam_selesai: v }))} disabled={isLoading} />
                </div>
              </div>
            </div>

            {/* Lokasi */}
            <div>
              <div className="flex items-center gap-2 pb-1 mb-4 border-b border-[#F5F1E8]">
                <MapPin size={12} strokeWidth={1.5} className="text-[#C9A961]" />
                <span className="font-sans text-[10px] font-semibold text-[#5C4A37] uppercase tracking-wider">Tempat</span>
              </div>
              <div className="space-y-4">
                <div>
                  <FieldLabel htmlFor="f-lokasi-alamat">Alamat Lengkap</FieldLabel>
                  <textarea
                    id="f-lokasi-alamat"
                    value={form.lokasi_alamat}
                    onChange={(e) => setForm((f) => ({ ...f, lokasi_alamat: e.target.value }))}
                    placeholder="Contoh: Gedung Serbaguna, Jl. Raya Kebon Jeruk No. 12, Jakarta Barat"
                    rows={3}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-[#F9F7F2] border border-[#E8D5A3]/60 rounded-xl font-sans text-sm text-[#3A3429] placeholder-[#5C4A37]/30 focus:outline-none focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/10 transition-all resize-none disabled:opacity-60 leading-relaxed"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="f-maps-url">URL Google Maps</FieldLabel>
                  <TextInput
                    id="f-maps-url"
                    value={form.lokasi_maps_url}
                    onChange={(v) => setForm((f) => ({ ...f, lokasi_maps_url: v }))}
                    placeholder="https://maps.google.com/..."
                    disabled={isLoading}
                    mono
                  />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* ════════════════════════════════════════════
          SECTION D — Galeri Foto
      ════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <SectionCard icon={Camera} title="Galeri Foto" subtitle={`Foto kenangan untuk ditampilkan di undangan — maksimal ${MAX_GALLERY} foto`}>
          {/* Gallery grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-5">
            {galleryPreviews.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#E8D5A3]/40 group">
                <Image src={url} alt={`Galeri ${idx + 1}`} fill className="object-cover" sizes="150px" />
                {/* Remove button (only for new files) */}
                {idx >= existingGallery.length && (
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(idx)}
                    disabled={isLoading}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#2C2416]/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <X size={12} />
                  </button>
                )}
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-[#2C2416]/60 text-white font-mono text-[9px]">
                  {idx + 1}
                </div>
              </div>
            ))}

            {/* Add more button */}
            {galleryPreviews.length < MAX_GALLERY && (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isLoading}
                className="aspect-square rounded-xl border-2 border-dashed border-[#E8D5A3]/50 bg-[#F9F7F2]/60 hover:border-[#C9A961]/50 hover:bg-[#F9F7F2] flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <ImagePlus size={20} strokeWidth={1.3} className="text-[#5C4A37]/40 group-hover:text-[#C9A961] transition-colors" />
                <span className="font-sans text-[10px] text-[#5C4A37]/40 group-hover:text-[#C9A961] transition-colors">
                  Tambah
                </span>
              </button>
            )}
          </div>

          <input
            ref={galleryInputRef}
            id="f-gallery"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files?.length) handleGallerySelect(e.target.files); }}
          />

          <p className="font-sans text-[11px] text-[#5C4A37]/40 font-light">
            {galleryPreviews.length}/{MAX_GALLERY} foto dipilih
            {galleryPreviews.length < MAX_GALLERY && (
              <> · Masih bisa menambahkan {MAX_GALLERY - galleryPreviews.length} foto lagi</>
            )}
          </p>
        </SectionCard>
      </motion.div>

      {/* ════════════════════════════════════════════
          STICKY FOOTER — Progress & Actions
      ════════════════════════════════════════════ */}
      <div className="sticky bottom-0 left-0 right-0 z-30 bg-[#F9F7F2]/95 backdrop-blur-md border-t border-[#E8D5A3]/40 -mx-6 lg:-mx-10 px-6 lg:px-10 py-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Progress bar */}
          <AnimatePresence>
            {progress && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-[#5C4A37]/70 font-light flex items-center gap-2">
                    {progress.label === "Berhasil disimpan!" ? (
                      <CheckCircle2 size={13} className="text-emerald-500" />
                    ) : (
                      <Loader2 size={13} className="animate-spin text-[#C9A961]" />
                    )}
                    {progress.label}
                  </span>
                  <span className="font-mono text-[11px] text-[#5C4A37]/50">
                    {progressPct}%
                  </span>
                </div>
                <div className="h-1 bg-[#E8D5A3]/30 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${progress.label === "Berhasil disimpan!" ? "bg-emerald-500" : "bg-[#C9A961]"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
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

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              id="basic-form-submit"
              disabled={isLoading || !form.title.trim() || !form.slug.trim()}
              className="flex items-center gap-2 px-7 py-3 bg-[#3A3429] hover:bg-[#5C4A37] disabled:opacity-40 disabled:cursor-not-allowed text-[#F9F7F2] rounded-xl font-sans text-sm font-light tracking-wider transition-all duration-300 shadow-md"
            >
              {isLoading ? (
                <><Loader2 size={15} className="animate-spin" /><span>Memproses...</span></>
              ) : (
                <><Save size={15} strokeWidth={1.5} /><span>{isEdit ? "Simpan Perubahan" : "Simpan & Buat Undangan"}</span></>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
              className="px-5 py-3 border border-[#E8D5A3]/60 hover:border-[#E8D5A3] text-[#5C4A37] rounded-xl font-sans text-sm font-light transition-all duration-200 disabled:opacity-40"
            >
              Batal
            </button>
          </div>
        </div>
      </div>

      {/* Bottom padding for sticky footer */}
      <div className="h-24" />
    </form>
  );
}
