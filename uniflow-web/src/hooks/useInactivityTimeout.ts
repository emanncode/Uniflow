"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const IDLE_TIMEOUT_MS = 14 * 60 * 1000; // 14 minutes of inactivity before warning
const WARNING_DURATION_MS = 60 * 1000; // 1 minute warning countdown
const MAX_SESSION_MS = 8 * 60 * 60 * 1000; // 8 hours absolute session limit

export function useInactivityTimeout(
  signOutPath: string = "/login",
  idleTimeMs: number = IDLE_TIMEOUT_MS,
  warningTimeMs: number = WARNING_DURATION_MS
) {
  const router = useRouter();
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(warningTimeMs / 1000);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isWarningActiveRef = useRef(false);

  const handleLogout = useCallback(async () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setShowWarning(false);
    isWarningActiveRef.current = false;
    
    // Clear session timestamp from storage
    localStorage.removeItem("session_login_time");

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error during auto sign out due to inactivity:", err);
    } finally {
      router.push(signOutPath);
    }
  }, [router, signOutPath]);

  const resetTimer = useCallback(() => {
    // If warning is already active, don't auto-dismiss it from background activity events (only manual clicks reset it)
    if (isWarningActiveRef.current) return;

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    setShowWarning(false);

    idleTimerRef.current = setTimeout(() => {
      // Show warning and start countdown
      setShowWarning(true);
      isWarningActiveRef.current = true;
      let remaining = warningTimeMs / 1000;
      setSecondsRemaining(remaining);

      countdownTimerRef.current = setInterval(() => {
        remaining -= 1;
        setSecondsRemaining(remaining);
        if (remaining <= 0) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          handleLogout();
        }
      }, 1000);
    }, idleTimeMs);
  }, [idleTimeMs, warningTimeMs, handleLogout]);

  const forceReset = useCallback(() => {
    // Explicit manual reset (e.g. clicking "Keep working")
    isWarningActiveRef.current = false;
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    const isPublicPath =
      pathname === "/login" ||
      pathname === "/u/login" ||
      pathname === "/reset-password" ||
      pathname === "/u/reset-password";

    if (isPublicPath) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setShowWarning(false);
      isWarningActiveRef.current = false;
      return;
    }

    // Periodic check for absolute session age (every 30 seconds)
    const sessionAgeCheckInterval = setInterval(() => {
      const loginTimeStr = localStorage.getItem("session_login_time");
      if (loginTimeStr) {
        const loginTime = Number(loginTimeStr);
        if (Date.now() - loginTime > MAX_SESSION_MS) {
          console.warn("Session exceeded maximum age. Logging out.");
          handleLogout();
        }
      } else {
        // Fallback: if there is no session login time set, set it now
        localStorage.setItem("session_login_time", Date.now().toString());
      }
    }, 30000);

    // Attach activity listeners
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    
    // Initial start
    resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      clearInterval(sessionAgeCheckInterval);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [pathname, resetTimer, handleLogout]);

  return { showWarning, secondsRemaining, resetTimer: forceReset };
}
