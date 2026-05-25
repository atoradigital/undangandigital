"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react";
import { supabase } from "@/utils/supabase";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Translate some common Supabase errors to elegant Indonesian
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Email atau password yang Anda masukkan tidak cocok.");
        } else {
          setErrorMsg(error.message);
        }
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setErrorMsg("Gagal terhubung ke server. Silakan periksa koneksi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-[#F9F7F2]">
      {/* Decorative Elegant Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#E8D5A3]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#C9A961]/5 rounded-full blur-[100px]"></div>
        {/* Hairline decorative line grid */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E8D5A3]/25 to-transparent"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#E8D5A3]/25 to-transparent"></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link
              href="/"
              className="inline-block mx-auto mb-3 focus-visible:outline-none"
            >
              <Image
                src="/logo/logo-atora-square.png"
                alt="Atora Logo"
                width={72}
                height={72}
                className="w-[72px] h-[72px] mx-auto object-contain"
                priority
              />
            </Link>
            <p className="font-sans text-[10px] text-[#5C4A37] tracking-[0.3em] uppercase mt-2 font-light">
              Admin Panel
            </p>
            <div className="w-12 h-px bg-[#C9A961]/40 mx-auto mt-4"></div>
          </motion.div>
        </div>

        {/* Card Form */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-md border border-[#E8D5A3]/30 rounded-2xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(58,52,41,0.04)]"
        >
          <div className="mb-6 text-center">
            <h1 className="font-serif text-xl text-[#3A3429] font-light">
              Selamat datang kembali
            </h1>
            <p className="font-sans text-xs text-[#5C4A37]/75 font-light mt-1">
              Harap masuk untuk mengelola undangan digital.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-sans text-[10px] font-medium text-[#5C4A37] uppercase tracking-wider"
              >
                Alamat Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-[#5C4A37]/50" strokeWidth={1.5} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="admin@atoradigital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-[#F5F1E8]/30 border border-[#E8D5A3]/40 rounded-xl font-sans text-sm text-[#3A3429] placeholder-[#5C4A37]/30 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="block font-sans text-[10px] font-medium text-[#5C4A37] uppercase tracking-wider"
                >
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-[#5C4A37]/50" strokeWidth={1.5} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-11 py-3 bg-[#F5F1E8]/30 border border-[#E8D5A3]/40 rounded-xl font-sans text-sm text-[#3A3429] placeholder-[#5C4A37]/30 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5C4A37]/50 hover:text-[#C9A961] transition-colors focus:outline-none"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="h-4.5 w-4.5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 font-sans text-xs font-light leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center gap-2 py-3 px-6 bg-[#3A3429] hover:bg-[#5C4A37] text-[#F9F7F2] rounded-xl font-sans text-sm font-light tracking-wider transition-all duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed select-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 border-2 border-[#F9F7F2] border-t-transparent rounded-full animate-spin"></div>
                  <span>Memverifikasi...</span>
                </div>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mt-6"
        >
          <Link
            href="/"
            className="font-sans text-xs text-[#5C4A37] hover:text-[#C9A961] transition-all font-light flex items-center justify-center gap-1.5"
          >
            <span>← Kembali ke Beranda</span>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
