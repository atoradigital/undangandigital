"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Sparkles,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/utils/supabase";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/clients",
    label: "Klien",
    icon: Users,
    disabled: true,
  },
  {
    href: "/admin/settings",
    label: "Pengaturan",
    icon: Settings,
    disabled: true,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
      } else {
        setUserEmail(session.user.email ?? null);
        setChecking(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-4"
        >
          <span className="font-serif text-2xl font-bold tracking-[0.25em] text-[#3A3429] uppercase">
            ATORA
          </span>
          <div className="w-8 h-[2px] bg-gradient-to-r from-transparent via-[#C9A961] to-transparent" />
          <p className="font-sans text-[10px] text-[#5C4A37]/60 tracking-[0.3em] uppercase">
            Memverifikasi Sesi...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex">
      {/* ── Overlay mobile ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-[#2C2416]/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-64 flex flex-col
          bg-[#2C2416] border-r border-[#3A3429]
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="px-6 pt-8 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/dashboard"
                className="inline-block focus-visible:outline-none"
              >
                <Image
                  src="/logo/logo-atora-lanscape.png"
                  alt="Atora Logo"
                  height={64}
                  width={213}
                  className="h-16 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                  priority
                />
              </Link>
              <p className="font-sans text-[9px] text-[#C9A961]/60 tracking-[0.3em] uppercase mt-2 font-light">
                Admin Panel
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[#F9F7F2]/40 hover:text-[#F9F7F2] transition-colors"
              aria-label="Tutup sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Thin gold divider */}
          <div className="mt-5 h-px bg-gradient-to-r from-transparent via-[#C9A961]/30 to-transparent" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl
                  font-sans text-sm font-light transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#C9A961]/15 text-[#C9A961] border border-[#C9A961]/20"
                      : item.disabled
                      ? "text-[#F9F7F2]/20 cursor-not-allowed"
                      : "text-[#F9F7F2]/60 hover:text-[#F9F7F2] hover:bg-white/[0.05]"
                  }
                `}
              >
                <Icon
                  size={16}
                  strokeWidth={1.5}
                  className={isActive ? "text-[#C9A961]" : ""}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight size={12} className="text-[#C9A961]/60" />
                )}
                {item.disabled && (
                  <span className="text-[9px] font-medium tracking-wider text-[#F9F7F2]/20 uppercase">
                    Segera
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="px-4 pb-6 pt-4 border-t border-white/[0.06]">
          {userEmail && (
            <div className="px-3 py-2 mb-3">
              <p className="font-sans text-[9px] text-[#F9F7F2]/30 uppercase tracking-wider mb-0.5">
                Login sebagai
              </p>
              <p className="font-sans text-xs text-[#F9F7F2]/60 truncate font-light">
                {userEmail}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="
              w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl
              font-sans text-sm font-light transition-all duration-200
              text-red-400/70 hover:text-red-400 hover:bg-red-900/20
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <LogOut size={16} strokeWidth={1.5} />
            <span>{loggingOut ? "Keluar..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar (mobile) */}
        <header className="sticky top-0 z-30 lg:hidden flex items-center justify-between px-5 py-4 bg-[#F9F7F2]/95 backdrop-blur-md border-b border-[#E8D5A3]/30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#3A3429] hover:text-[#C9A961] transition-colors"
            aria-label="Buka sidebar"
          >
            <Menu size={20} />
          </button>
          <Image
              src="/logo/logo-atora-lanscape.png"
              alt="Atora Logo"
              height={64}
              width={213}
              className="h-16 w-auto object-contain"
            />
          <Sparkles size={16} className="text-[#C9A961]/50" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
