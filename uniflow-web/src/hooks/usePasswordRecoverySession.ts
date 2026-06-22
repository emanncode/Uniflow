"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type RecoveryState = "loading" | "confirm" | "ready" | "invalid";

const RECOVERY_WAIT_MS = 4000;

function parseAuthError(params: URLSearchParams): string | null {
  const errorCode = params.get("error_code");
  const error = params.get("error");
  if (!error && !errorCode) return null;
  return (
    params.get("error_description")?.replace(/\+/g, " ") ||
    "This reset link is invalid or has expired."
  );
}

/** Some mail clients strip "=" from query strings (token_hashVALUE instead of token_hash=VALUE). */
function extractTokenHash(search: string, searchParams: URLSearchParams): string | null {
  const direct = searchParams.get("token_hash");
  if (direct) return direct;

  for (const [key] of searchParams.entries()) {
    if (key.startsWith("token_hash") && key.length > "token_hash".length) {
      return key.slice("token_hash".length);
    }
  }

  const match = search.match(/[?&]token_hash([^=&]+)/);
  return match?.[1] ?? null;
}

function isRecoverySession(session: Session | null): boolean {
  if (!session) return false;
  const user = session.user as { recovery_sent_at?: string | null };
  return Boolean(user.recovery_sent_at);
}

function waitForRecoveryEvent(timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      subscription.unsubscribe();
      resolve(ok);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        finish(true);
      }
    });

    const timer = setTimeout(() => finish(false), timeoutMs);
  });
}

function cleanRecoveryUrl() {
  const params = new URLSearchParams(window.location.search);
  const university = params.get("university");
  const next = university
    ? `${window.location.pathname}?university=${encodeURIComponent(university)}`
    : window.location.pathname;
  window.history.replaceState({}, "", next);
}

async function waitForRecoverySession(
  attempts = 8,
  delayMs = 400,
): Promise<boolean> {
  for (let i = 0; i < attempts; i += 1) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (isRecoverySession(session)) return true;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}

export function usePasswordRecoverySession() {
  const [state, setState] = useState<RecoveryState>("loading");
  const [error, setError] = useState("");
  const [tokenHash, setTokenHash] = useState<string | null>(null);

  const confirmToken = useCallback(async () => {
    if (!tokenHash) return;

    setState("loading");
    setError("");

    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });

    if (verifyError) {
      setState("invalid");
      setError(verifyError.message);
      return;
    }

    setState("ready");
    cleanRecoveryUrl();
  }, [tokenHash]);

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

    const init = async () => {
      const search = window.location.search;
      const searchParams = new URLSearchParams(search);
      const searchError = parseAuthError(searchParams);
      if (searchError) {
        invalid(searchError);
        cleanRecoveryUrl();
        return;
      }

      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
      const hashParams = new URLSearchParams(hash);
      const hashError = parseAuthError(hashParams);
      if (hashError) {
        invalid(hashError);
        cleanRecoveryUrl();
        return;
      }

      const hashToken = hashParams.get("token_hash");
      const queryToken = extractTokenHash(search, searchParams);
      const recoveryType =
        searchParams.get("type") === "recovery" ||
        hashParams.get("type") === "recovery";

      if ((hashToken || queryToken) && recoveryType) {
        if (!active) return;
        setTokenHash(hashToken || queryToken);
        setState("confirm");
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
        cleanRecoveryUrl();
        return;
      }

      const hasRecoveryHash =
        window.location.hash.includes("type=recovery") ||
        window.location.hash.includes("access_token=");

      if (hasRecoveryHash) {
        const recovered = await waitForRecoveryEvent(RECOVERY_WAIT_MS);
        if (
          recovered &&
          (await waitForRecoverySession(4, 300))
        ) {
          ready();
          cleanRecoveryUrl();
          return;
        }
        invalid("This reset link is invalid or has expired.");
        return;
      }

      if (await waitForRecoverySession(3, 300)) {
        ready();
        return;
      }

      invalid("Open the reset link from your email to set a new password.");
    };

    init();

    return () => {
      active = false;
    };
  }, []);

  return { state, error, confirmToken };
}