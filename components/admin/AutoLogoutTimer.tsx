"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

/** 15 minutes in milliseconds */
const IDLE_TIMEOUT = 15 * 60 * 1000;

/**
 * AutoLogoutTimer
 *
 * Headless component (no UI) that monitors user activity.
 * If the admin is idle for 15 minutes, it signs them out
 * and redirects to the login page.
 */
export default function AutoLogoutTimer() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logout, IDLE_TIMEOUT);
    };

    // Start the initial timer
    resetTimer();

    // Activity events that reset the idle timer
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [logout]);

  // Renders nothing — purely a logic component
  return null;
}
