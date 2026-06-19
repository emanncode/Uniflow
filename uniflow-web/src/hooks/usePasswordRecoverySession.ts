"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type RecoveryState = "loading" | "ready" | "invalid";

export function usePasswordRecoverySession() {
  const [state, setState] = useState<RecoveryState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const ready = () => {
      if (active) setState("ready");
    };

    const invalid = (message: string) => {
      if (!active) return;
      setState("invalid");
      setError(message);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") ready();
    });

    const init = async () => {
      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          invalid(exchangeError.message);
          return;
        }
        ready();
        window.history.replaceState({}, "", window.location.pathname);
        return;
      }

      if (window.location.hash.includes("type=recovery")) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          ready();
          window.history.replaceState({}, "", window.location.pathname);
          return;
        }
        invalid("This reset link is invalid or has expired.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        ready();
        return;
      }

      invalid("Open the reset link from your email to set a new password.");
    };

    init();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { state, error };
}