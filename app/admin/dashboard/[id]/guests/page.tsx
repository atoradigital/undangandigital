"use client";

// Paksa halaman menjadi dynamic — tidak di-prerender saat build
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  UploadCloud,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Table2,
  ChevronRight,
  Loader2,
  AlertCircle,
  Flower2,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/utils/supabase";
import { type Invitation, type Guest, type GuestStatus } from "@/types/admin";

/* ────────────────────────────────────────────────── */

const STATUS_MAP: Record<
  GuestStatus,
  { icon: React.ElementType; label: string; cls: string }
> = {
  terkirim: {
    icon: CheckCircle2,
    label: "Terkirim",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  dibuka: {
    icon: Sparkles,
    label: "Dibuka",
    cls: "bg-blue-50 text-blue-700 border-blue-100",
  },
  belum: {
    icon: Clock,
    label: "Belum",
    cls: "bg-amber-50 text-amber-700 border-amber-100",
  },
};

const TEMPLATE_ICON: Record<string, React.ElementType> = {
  modern: Sparkles,
  klasik: BookOpen,
  floral: Flower2,
};

function StatusBadge({ status }: { status: GuestStatus }) {
  const { icon: Icon, label, cls } = STATUS_MAP[status] ?? STATUS_MAP.belum;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase border ${cls}`}
    >
      <Icon size={10} strokeWidth={2} />
      {label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-[#F5F1E8]">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-5 py-4">
          <div
            className="h-3 bg-[#E8D5A3]/30 rounded-full animate-pulse"
            style={{ width: `${50 + i * 10}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

/* ────────────────────────────────────────────────── */

export default function GuestsPage() {
  const params = useParams();
  const invId  = params?.id as string;

  /* ── Data ── */
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guests,     setGuests]     = useState<Guest[]>([]);
  const [loadingInv, setLoadingInv] = useState(true);
  const [loadingGuests, setLoadingGuests] = useState(true);
  const [fetchError, setFetchError] = useState("");

  /* ── CSV ── */
  const [isDragging,   setIsDragging]   = useState(false);
  const [csvFileName,  setCsvFileName]  = useState<string | null>(null);
  const [csvPreview,   setCsvPreview]   = useState<{ name: string; link: string }[]>([]);
  const [importing,    setImporting]    = useState(false);
  const [importMsg,    setImportMsg]    = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Fetch invitation ── */
  useEffect(() => {
    if (!invId) return;
    const fetchInv = async () => {
      setLoadingInv(true);
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", invId)
        .single();

      if (error || !data) {
        setFetchError("Undangan tidak ditemukan.");
      } else {
        setInvitation(data as Invitation);
      }
      setLoadingInv(false);
    };
    fetchInv();
  }, [invId]);

  /* ── Fetch guests ── */
  const fetchGuests = useCallback(async () => {
    if (!invId) return;
    setLoadingGuests(true);
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("invitation_id", invId)
      .order("created_at", { ascending: true });

    if (!error && data) setGuests(data as Guest[]);
    setLoadingGuests(false);
  }, [invId]);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);

  /* ── Stats ── */
  const stats = {
    total:    guests.length,
    terkirim: guests.filter((g) => g.status === "terkirim").length,
    dibuka:   guests.filter((g) => g.status === "dibuka").length,
    belum:    guests.filter((g) => g.status === "belum").length,
  };

  /* ── CSV parse ── */
  const parseCSV = useCallback(
    (text: string) => {
      const lines = text.trim().split("\n").filter(Boolean);
      const rows = lines.map((line) => {
        const name = line.split(",")[0].trim().replace(/^"|"$/g, "");
        return {
          name,
          link: `${window.location.origin}/r/${invitation?.slug ?? "undangan"}?to=${encodeURIComponent(name)}`,
        };
      });
      setCsvPreview(rows);
    },
    [invitation?.slug]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) return;
      setCsvFileName(file.name);
      setCsvPreview([]);
      setImportMsg("");
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") parseCSV(e.target.result);
      };
      reader.readAsText(file);
    },
    [parseCSV]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  /* ── Import CSV to DB (UI ready, logic wired) ── */
  const handleImport = async () => {
    if (!csvPreview.length || !invId) return;
    setImporting(true);
    setImportMsg("");

    const rows = csvPreview.map((r) => ({
      invitation_id: invId,
      name: r.name,
      link: r.link,
      status: "belum" as GuestStatus,
    }));

    const { error } = await supabase.from("guests").insert(rows);

    if (error) {
      setImportMsg("Gagal mengimpor: " + error.message);
    } else {
      setImportMsg(`${rows.length} tamu berhasil diimpor!`);
      setCsvPreview([]);
      setCsvFileName(null);
      await fetchGuests();
    }
    setImporting(false);
  };

  /* ── Export CSV ── */
  const handleExport = () => {
    if (!guests.length) return;
    const header = "Nama Tamu,Link Undangan,Status\n";
    const rows = guests
      .map((g) => `"${g.name}","${g.link ?? ""}","${g.status}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `tamu-${invitation?.slug ?? invId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ────────────────── Render ────────────────── */

  if (fetchError) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle size={32} className="text-red-400 mb-4" strokeWidth={1.5} />
        <p className="font-serif text-lg text-[#3A3429] mb-1">{fetchError}</p>
        <Link
          href="/admin/dashboard"
          className="font-sans text-sm text-[#C9A961] hover:underline mt-2"
        >
          ← Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const TplIcon = invitation ? (TEMPLATE_ICON[invitation.template] ?? Sparkles) : Sparkles;

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 font-sans text-xs text-[#5C4A37]/50">
        <Link href="/admin/dashboard" className="hover:text-[#C9A961] transition-colors flex items-center gap-1">
          <ArrowLeft size={12} />
          Dashboard
        </Link>
        <ChevronRight size={11} />
        <span className="text-[#3A3429] font-medium truncate max-w-[200px]">
          {loadingInv ? "..." : invitation?.title ?? "Klien"}
        </span>
        <ChevronRight size={11} />
        <span className="text-[#C9A961]">Kelola Tamu</span>
      </nav>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-sans text-[10px] text-[#C9A961] uppercase tracking-[0.3em] font-medium mb-1.5">
            Manajemen Tamu
          </p>
          {loadingInv ? (
            <div className="h-8 w-72 bg-[#E8D5A3]/30 rounded-full animate-pulse" />
          ) : (
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3A3429] leading-tight">
              {invitation?.title ?? "Kelola Tamu"}
            </h1>
          )}
          {invitation && (
            <div className="flex items-center gap-2 mt-2">
              <span className="font-mono text-[11px] text-[#5C4A37]/40 bg-[#F5F1E8] px-2 py-0.5 rounded-lg">
                /r/{invitation.slug}
              </span>
              <span className="flex items-center gap-1 font-sans text-[10px] text-[#5C4A37]/50">
                <TplIcon size={10} />
                {invitation.template}
              </span>
            </div>
          )}
        </div>

        {/* Export button */}
        <button
          id="export-link-btn"
          onClick={handleExport}
          disabled={!guests.length}
          className="flex items-center gap-2 px-5 py-2.5 border border-[#E8D5A3]/60 hover:border-[#C9A961]/40 hover:bg-[#C9A961]/5 disabled:opacity-40 disabled:cursor-not-allowed text-[#5C4A37] rounded-xl font-sans text-sm font-light tracking-wider transition-all duration-200 shrink-0"
        >
          <Download size={14} strokeWidth={1.8} />
          Export Link (.csv)
        </button>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#E8D5A3]/60 to-transparent" />

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Tamu",  value: stats.total,    color: "#3A3429" },
          { label: "Terkirim",    value: stats.terkirim, color: "rgb(5 150 105)" },
          { label: "Dibuka",      value: stats.dibuka,   color: "rgb(29 78 216)" },
          { label: "Belum",       value: stats.belum,    color: "rgb(180 83 9)" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            className="bg-white rounded-2xl p-5 border border-[#E8D5A3]/40 shadow-[0_2px_12px_rgba(58,52,41,0.04)]"
          >
            <p className="font-serif text-3xl font-bold" style={{ color: s.color }}>
              {loadingGuests ? "—" : s.value}
            </p>
            <p className="font-sans text-[10px] text-[#5C4A37]/60 uppercase tracking-wider mt-1 font-medium">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          CSV Upload Section
      ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-[#E8D5A3]/40 shadow-[0_4px_24px_rgba(58,52,41,0.04)] overflow-hidden"
      >
        <div className="px-7 py-6">
          {/* Section header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#3A3429]/5 border border-[#E8D5A3]/40 flex items-center justify-center shrink-0">
              <UploadCloud size={18} strokeWidth={1.5} className="text-[#C9A961]" />
            </div>
            <div>
              <h2 className="font-serif text-[#3A3429] text-base font-semibold leading-tight">
                Import Daftar Tamu (CSV)
              </h2>
              <p className="font-sans text-xs text-[#5C4A37]/60 font-light mt-0.5">
                Unggah .csv berisi nama tamu — kolom pertama = Nama Tamu
              </p>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            id="csv-drop-zone"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300
              flex flex-col items-center justify-center gap-3 py-10 px-6 text-center
              ${isDragging
                ? "border-[#C9A961] bg-[#C9A961]/5 scale-[1.01]"
                : "border-[#E8D5A3]/60 bg-[#F9F7F2]/60 hover:border-[#C9A961]/50 hover:bg-[#F9F7F2]"
              }
            `}
          >
            <input
              ref={fileInputRef}
              id="csv-file-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />

            <motion.div
              animate={isDragging ? { scale: 1.15, rotate: -5 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-12 h-12 rounded-2xl bg-[#3A3429]/5 border border-[#E8D5A3]/40 flex items-center justify-center"
            >
              {csvFileName
                ? <FileText size={22} strokeWidth={1.5} className="text-[#C9A961]" />
                : <UploadCloud size={22} strokeWidth={1.5} className="text-[#5C4A37]/50" />
              }
            </motion.div>

            {csvFileName ? (
              <div>
                <p className="font-sans text-sm font-medium text-[#3A3429]">{csvFileName}</p>
                <p className="font-sans text-xs text-[#5C4A37]/50 font-light mt-0.5">
                  {csvPreview.length} baris terdeteksi — klik untuk ganti file
                </p>
              </div>
            ) : (
              <div>
                <p className="font-sans text-sm font-medium text-[#3A3429]">
                  Drag & Drop file .csv di sini
                </p>
                <p className="font-sans text-xs text-[#5C4A37]/50 font-light mt-0.5">
                  atau{" "}
                  <span className="text-[#C9A961] underline underline-offset-2">klik untuk memilih file</span>
                </p>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8D5A3]/20 border border-[#E8D5A3]/30">
              <Table2 size={10} className="text-[#5C4A37]/50" />
              <span className="font-sans text-[9px] text-[#5C4A37]/50 tracking-wider uppercase">
                Format: Kolom pertama = Nama Tamu
              </span>
            </div>
          </div>

          {/* Preview table + import button */}
          <AnimatePresence>
            {csvPreview.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-5 space-y-4"
              >
                {/* Preview mini table */}
                <div className="rounded-xl border border-[#E8D5A3]/40 overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#FDFCF9] border-b border-[#F5F1E8] flex items-center justify-between">
                    <span className="font-sans text-[10px] text-[#5C4A37]/50 uppercase tracking-wider font-semibold">
                      Preview Import ({csvPreview.length} tamu)
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-[#F5F1E8]">
                    {csvPreview.slice(0, 8).map((row, i) => (
                      <div key={i} className="flex items-center gap-4 px-4 py-2.5">
                        <span className="font-mono text-[10px] text-[#5C4A37]/25 w-5 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-sans text-sm text-[#3A3429] font-medium flex-1 truncate">
                          {row.name}
                        </span>
                        <span className="font-mono text-[10px] text-[#5C4A37]/40 truncate max-w-[200px] hidden sm:block">
                          {row.link}
                        </span>
                      </div>
                    ))}
                    {csvPreview.length > 8 && (
                      <div className="px-4 py-2 bg-[#F9F7F2] text-center">
                        <span className="font-sans text-[10px] text-[#5C4A37]/40">
                          + {csvPreview.length - 8} tamu lainnya
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Import button & feedback */}
                <div className="flex items-center gap-4">
                  <button
                    id="import-guests-btn"
                    onClick={handleImport}
                    disabled={importing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#3A3429] hover:bg-[#5C4A37] disabled:opacity-50 text-[#F9F7F2] rounded-xl font-sans text-sm font-light tracking-wider transition-all duration-200 shadow-sm"
                  >
                    {importing
                      ? <><Loader2 size={14} className="animate-spin" /><span>Mengimpor...</span></>
                      : <><Users size={14} strokeWidth={1.8} /><span>Import {csvPreview.length} Tamu ke Database</span></>
                    }
                  </button>
                  <AnimatePresence>
                    {importMsg && (
                      <motion.p
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className={`font-sans text-xs font-medium flex items-center gap-1.5 ${importMsg.startsWith("Gagal") ? "text-red-600" : "text-emerald-600"}`}
                      >
                        {importMsg.startsWith("Gagal")
                          ? <AlertCircle size={12} />
                          : <CheckCircle2 size={12} />
                        }
                        {importMsg}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════
          Tabel Tamu
      ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-[#E8D5A3]/40 shadow-[0_4px_24px_rgba(58,52,41,0.04)] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F5F1E8] flex items-center justify-between bg-[#FDFCF9]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#3A3429]/5 border border-[#E8D5A3]/40 flex items-center justify-center">
              <Users size={15} strokeWidth={1.5} className="text-[#C9A961]" />
            </div>
            <div>
              <h2 className="font-serif text-sm font-semibold text-[#3A3429]">Daftar Tamu</h2>
              <p className="font-sans text-[10px] text-[#5C4A37]/50 font-light">
                {loadingGuests ? "Memuat..." : `${guests.length} tamu terdaftar`}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full font-sans">
            <thead>
              <tr className="border-b border-[#F5F1E8]">
                {["#", "Nama Tamu", "Link Undangan", "Status"].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3.5 text-left text-[9px] font-semibold text-[#5C4A37]/50 uppercase tracking-[0.18em]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F1E8]">
              {loadingGuests ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : guests.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#F5F1E8] border border-[#E8D5A3]/40 flex items-center justify-center">
                        <Users size={20} strokeWidth={1.3} className="text-[#C9A961]/60" />
                      </div>
                      <p className="font-serif text-sm text-[#3A3429] font-semibold">
                        Belum ada tamu
                      </p>
                      <p className="font-sans text-xs text-[#5C4A37]/40 font-light max-w-xs">
                        Import file CSV di atas untuk menambahkan daftar tamu undangan.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                guests.map((guest, idx) => (
                  <motion.tr
                    key={guest.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.025 }}
                    className="hover:bg-[#FDFCF9] transition-colors"
                  >
                    <td className="px-5 py-3.5 text-[#5C4A37]/25 text-[11px] font-mono">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#3A3429] text-sm">
                      {guest.name}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {guest.link ? (
                        <a
                          href={guest.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-[#5C4A37]/40 hover:text-[#C9A961] transition-colors truncate max-w-sm block"
                        >
                          {guest.link}
                        </a>
                      ) : (
                        <span className="font-sans text-[11px] text-[#5C4A37]/25 italic">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={guest.status} />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loadingGuests && guests.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#F5F1E8] bg-[#FDFCF9]">
            <p className="font-sans text-[10px] text-[#5C4A37]/40 font-light">
              Total{" "}
              <span className="font-medium text-[#3A3429]">{guests.length}</span>{" "}
              tamu
            </p>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3A3429]/5 hover:bg-[#3A3429]/10 text-[#3A3429] font-sans text-[10px] font-medium tracking-wider uppercase transition-colors"
            >
              <Download size={11} />
              Export CSV
            </button>
          </div>
        )}
      </motion.section>

      <div className="h-4" />
    </div>
  );
}
