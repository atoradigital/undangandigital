"use client";

// Paksa halaman menjadi dynamic — tidak di-prerender saat build
// karena Supabase membutuhkan env vars yang hanya ada di runtime
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Users,
  Pencil,
  Trash2,
  ChevronRight,
  CalendarDays,
  X,
  LayoutGrid,
  Loader2,
  Search,
  Flower2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/utils/supabase";
import { TEMPLATE_OPTIONS, type Invitation } from "@/types/admin";
import InvitationForm from "@/components/admin/InvitationForm";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

/* ────────────────────────────────────────────────── */

type ModalMode = "create" | "edit" | null;

const TEMPLATE_ICON: Record<string, React.ElementType> = {
  modern: Sparkles,
  klasik: BookOpen,
  floral: Flower2,
};

const TEMPLATE_BADGE: Record<string, string> = {
  modern: "bg-[#3A3429]/8 text-[#3A3429] border-[#3A3429]/10",
  klasik: "bg-[#5C4A37]/8 text-[#5C4A37] border-[#5C4A37]/10",
  floral: "bg-[#C9A961]/10 text-[#7A5E2A] border-[#C9A961]/20",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/* ── Skeleton row ── */
function SkeletonRow() {
  return (
    <tr className="border-b border-[#F5F1E8]">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3.5 bg-[#E8D5A3]/30 rounded-full animate-pulse" style={{ width: `${60 + i * 8}%` }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Empty state ── */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#F5F1E8] border border-[#E8D5A3]/40 flex items-center justify-center mb-5">
        <LayoutGrid size={26} strokeWidth={1.3} className="text-[#C9A961]/70" />
      </div>
      <h3 className="font-serif text-lg text-[#3A3429] font-semibold mb-2">
        Belum ada klien
      </h3>
      <p className="font-sans text-sm text-[#5C4A37]/50 font-light mb-6 max-w-xs">
        Mulai dengan membuat undangan digital pertama untuk klien Anda.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#3A3429] hover:bg-[#5C4A37] text-[#F9F7F2] rounded-xl font-sans text-sm font-light tracking-wider transition-all duration-200 shadow-sm"
      >
        <Plus size={15} strokeWidth={2} />
        Tambah Klien Pertama
      </button>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────── */

export default function DashboardPage() {
  const router = useRouter();

  const [invitations, setInvitations]   = useState<Invitation[]>([]);
  const [loading,     setLoading]       = useState(true);
  const [search,      setSearch]        = useState("");

  /* Modal */
  const [modalMode,   setModalMode]     = useState<ModalMode>(null);
  const [editTarget,  setEditTarget]    = useState<Invitation | null>(null);

  /* Delete */
  const [deleteTarget, setDeleteTarget] = useState<Invitation | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  /* ── Fetch ── */
  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setInvitations(data as Invitation[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchInvitations(); }, [fetchInvitations]);

  /* ── Stats ── */
  const stats = TEMPLATE_OPTIONS.map((t) => ({
    ...t,
    count: invitations.filter((i) => i.template === t.value).length,
  }));

  /* ── Filtered list ── */
  const filtered = invitations.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.slug.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Modal helpers ── */
  const openCreate = () => { setEditTarget(null); setModalMode("create"); };
  const openEdit   = (inv: Invitation) => { setEditTarget(inv); setModalMode("edit"); };
  const closeModal = () => { setModalMode(null); setEditTarget(null); };

  const handleFormSuccess = (saved: Invitation) => {
    closeModal();
    if (modalMode === "create") {
      setInvitations((prev) => [saved, ...prev]);
    } else {
      setInvitations((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", deleteTarget.id);

    if (!error) {
      setInvitations((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  /* ── Modal Close on Escape ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  return (
    <>
      <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-sans text-[10px] text-[#C9A961] uppercase tracking-[0.3em] font-medium mb-1.5">
              Panel Administrasi
            </p>
            <h1 className="font-serif text-3xl font-bold text-[#3A3429] leading-tight">
              Daftar Klien
            </h1>
          </div>
          <button
            id="add-client-btn"
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#3A3429] hover:bg-[#5C4A37] text-[#F9F7F2] rounded-xl font-sans text-sm font-light tracking-wider transition-all duration-200 shadow-md shrink-0"
          >
            <Plus size={15} strokeWidth={2} />
            Tambah Klien Baru
          </button>
        </div>

        {/* ── Thin divider ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#E8D5A3]/60 to-transparent" />

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-5 border border-[#E8D5A3]/40 shadow-[0_2px_12px_rgba(58,52,41,0.04)]"
          >
            <p className="font-serif text-3xl font-bold text-[#3A3429]">
              {loading ? "—" : invitations.length}
            </p>
            <p className="font-sans text-[10px] text-[#5C4A37]/60 uppercase tracking-wider mt-1 font-medium">
              Total Klien
            </p>
          </motion.div>

          {/* Per template */}
          {stats.map((s, i) => {
            const Icon = TEMPLATE_ICON[s.value] ?? Sparkles;
            return (
              <motion.div
                key={s.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.04 }}
                className="bg-white rounded-2xl p-5 border border-[#E8D5A3]/40 shadow-[0_2px_12px_rgba(58,52,41,0.04)]"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-serif text-3xl font-bold text-[#3A3429]">
                    {loading ? "—" : s.count}
                  </p>
                  <Icon size={14} strokeWidth={1.5} className="text-[#C9A961]/60 mt-1" />
                </div>
                <p className="font-sans text-[10px] text-[#5C4A37]/60 uppercase tracking-wider font-medium">
                  {s.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Table card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-2xl border border-[#E8D5A3]/40 shadow-[0_4px_24px_rgba(58,52,41,0.04)] overflow-hidden"
        >
          {/* Search bar */}
          <div className="px-6 py-4 border-b border-[#F5F1E8] flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C4A37]/30" />
              <input
                type="text"
                placeholder="Cari nama acara atau slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F9F7F2] border border-[#E8D5A3]/40 rounded-xl font-sans text-xs text-[#3A3429] placeholder-[#5C4A37]/30 focus:outline-none focus:border-[#C9A961] transition-all"
              />
            </div>
            <span className="font-sans text-[10px] text-[#5C4A37]/40 font-light shrink-0">
              {loading ? "..." : `${filtered.length} data`}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full font-sans">
              <thead>
                <tr className="border-b border-[#F5F1E8]">
                  {["#", "Nama Acara", "Slug", "Template", "Dibuat", "Aksi"].map((col) => (
                    <th
                      key={col}
                      className="px-5 py-3.5 text-left text-[9px] font-semibold text-[#5C4A37]/50 uppercase tracking-[0.18em] bg-[#FDFCF9]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F1E8]">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 && !search ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState onAdd={openCreate} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="py-16 text-center font-sans text-sm text-[#5C4A37]/40">
                        Tidak ada hasil untuk &ldquo;{search}&rdquo;
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv, idx) => {
                    const TplIcon = TEMPLATE_ICON[inv.template] ?? Sparkles;
                    const tplOpt = TEMPLATE_OPTIONS.find((t) => t.value === inv.template);
                    return (
                      <motion.tr
                        key={inv.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group hover:bg-[#FDFCF9] transition-colors"
                      >
                        {/* # */}
                        <td className="px-5 py-4 text-[#5C4A37]/25 text-[11px] font-mono">
                          {String(idx + 1).padStart(2, "0")}
                        </td>

                        {/* Title */}
                        <td className="px-5 py-4">
                          <p className="font-sans text-sm font-medium text-[#3A3429] leading-tight">
                            {inv.title}
                          </p>
                        </td>

                        {/* Slug */}
                        <td className="px-5 py-4">
                          <span className="font-mono text-[11px] text-[#5C4A37]/50 bg-[#F5F1E8] px-2 py-1 rounded-lg">
                            /r/{inv.slug}
                          </span>
                        </td>

                        {/* Template */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${TEMPLATE_BADGE[inv.template] ?? ""}`}>
                            <TplIcon size={9} strokeWidth={2} />
                            {tplOpt?.label ?? inv.template}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="flex items-center gap-1.5 font-sans text-[11px] text-[#5C4A37]/50">
                            <CalendarDays size={11} strokeWidth={1.5} />
                            {formatDate(inv.created_at)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            {/* Kelola Tamu */}
                            <Link
                              href={`/admin/dashboard/${inv.id}/guests`}
                              id={`manage-guests-${inv.id}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3A3429]/5 hover:bg-[#3A3429]/10 text-[#3A3429] font-sans text-[11px] font-medium transition-colors group/link"
                            >
                              <Users size={12} strokeWidth={1.8} />
                              <span className="hidden sm:inline">Kelola Tamu</span>
                              <ChevronRight size={10} className="hidden sm:block opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </Link>

                            {/* Edit */}
                            <button
                              id={`edit-inv-${inv.id}`}
                              onClick={() => openEdit(inv)}
                              className="p-1.5 rounded-lg hover:bg-[#C9A961]/10 text-[#5C4A37]/40 hover:text-[#C9A961] transition-colors"
                              title="Edit data klien"
                            >
                              <Pencil size={13} strokeWidth={1.8} />
                            </button>

                            {/* Delete */}
                            <button
                              id={`delete-inv-${inv.id}`}
                              onClick={() => setDeleteTarget(inv)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-[#5C4A37]/40 hover:text-red-500 transition-colors"
                              title="Hapus klien"
                            >
                              <Trash2 size={13} strokeWidth={1.8} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          {!loading && invitations.length > 0 && (
            <div className="px-5 py-3 border-t border-[#F5F1E8] bg-[#FDFCF9]">
              <p className="font-sans text-[10px] text-[#5C4A37]/40 font-light">
                Total{" "}
                <span className="font-medium text-[#3A3429]">{invitations.length}</span>{" "}
                klien terdaftar
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ══════════════════════════════
          MODAL — Create / Edit
      ══════════════════════════════ */}
      <AnimatePresence>
        {modalMode && (
          <>
            {/* Backdrop */}
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeModal}
              className="fixed inset-0 z-50 bg-[#2C2416]/50 backdrop-blur-sm"
            />

            {/* Modal panel */}
            <motion.div
              key="modal-panel"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-0 z-[55] flex items-center justify-center px-4 pointer-events-none"
            >
              <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E8D5A3]/30 pointer-events-auto overflow-hidden">
                {/* Gold accent line */}
                <div className="h-[3px] bg-gradient-to-r from-transparent via-[#C9A961] to-transparent" />

                {/* Modal header */}
                <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-[#F5F1E8]">
                  <div>
                    <h2 className="font-serif text-lg font-semibold text-[#3A3429]">
                      {modalMode === "create" ? "Buat Klien Baru" : "Edit Data Klien"}
                    </h2>
                    <p className="font-sans text-xs text-[#5C4A37]/50 font-light mt-0.5">
                      {modalMode === "create"
                        ? "Isi detail acara untuk halaman undangan digital"
                        : `Mengedit: ${editTarget?.title}`}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-[#5C4A37]/30 hover:text-[#5C4A37] transition-colors"
                    aria-label="Tutup modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Form */}
                <div className="px-7 py-6">
                  <InvitationForm
                    initialData={editTarget ?? undefined}
                    onSuccess={handleFormSuccess}
                    onCancel={closeModal}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════
          DIALOG — Konfirmasi Hapus
      ══════════════════════════════ */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Data Klien"
        message={`Anda akan menghapus "${deleteTarget?.title}". Semua data tamu yang terhubung juga akan ikut terhapus secara permanen.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}
