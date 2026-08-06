"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const TIMEOUT_MS = 3600000; // 1 hour

export function useInactivityTimeout(signOutPath: string = "/login") {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only apply timeout if user is authenticated/on non-public paths
    const isPublicPath =
      pathname === "/login" ||
      pathname === "/u/login" ||
      pathname === "/reset-password" ||
      pathname === "/u/reset-password";

    if (isPublicPath) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const handleLogout = async () => {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Error during auto sign out due to inactivity:", err);
      } finally {
        router.push(signOutPath);
      }
    };

    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(handleLogout, TIMEOUT_MS);
    };

    // Global events to detect activity
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];

    // Initialize timer
    resetTimer();

    // Attach listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup listeners and timer
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [router, pathname, signOutPath]);
}
