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

    const parseAuthError = (params: URLSearchParams): string | null => {
      const errorCode = params.get("error_code");
      const error = params.get("error");
      if (!error && !errorCode) return null;
      return (
        params.get("error_description")?.replace(/\+/g, " ") ||
        "This reset link is invalid or has expired."
      );
    };

    const init = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const searchError = parseAuthError(searchParams);
      if (searchError) {
        invalid(searchError);
        window.history.replaceState({}, "", window.location.pathname);
        return;
      }

      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
      const hashParams = new URLSearchParams(hash);
      const hashError = parseAuthError(hashParams);
      if (hashError) {
        invalid(hashError);
        window.history.replaceState({}, "", window.location.pathname);
        return;
      }

      const code = searchParams.get("code");

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