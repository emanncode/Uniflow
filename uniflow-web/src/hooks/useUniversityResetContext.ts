"use client";

import { useEffect, useState } from "react";
import { universityPortalUrl } from "@/lib/domain";
import { getSubdomain } from "@/lib/subdomain";
import { supabase } from "@/lib/supabase";

type UniversityInfo = {
  name: string;
  short_name: string;
};

function shouldRedirectToUniversityPortal(search: string): boolean {
  const params = new URLSearchParams(search);
  if (params.get("type") === "recovery") return true;
  if (params.has("code")) return true;
  if (params.has("token_hash")) return true;

  for (const [key] of params.entries()) {
    if (key.startsWith("token_hash") && key.length > "token_hash".length) {
      return true;
    }
  }

  return false;
}

export function useUniversityResetContext() {
  const [university, setUniversity] = useState<UniversityInfo | null>(null);
  const [loginHref, setLoginHref] = useState("/login");
  const [loginLabel, setLoginLabel] = useState("Back to sign in");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryShort = params.get("university");
    const subdomain = getSubdomain(window.location.hostname);
    const shortName =
      queryShort || (subdomain && subdomain !== "super" ? subdomain : null);

    if (
      queryShort &&
      !subdomain &&
      shouldRedirectToUniversityPortal(window.location.search)
    ) {
      const target = new URL(universityPortalUrl(queryShort, "/reset-password"));
      for (const [key, value] of params.entries()) {
        if (key !== "university") target.searchParams.set(key, value);
      }
      if (window.location.hash) target.hash = window.location.hash;
      window.location.replace(target.toString());
      return;
    }

    if (!shortName) return;

    async function loadUniversity() {
      const { data } = await supabase
        .from("universities")
        .select("name, short_name")
        .eq("short_name", shortName)
        .eq("status", "approved")
        .maybeSingle();

      if (!data) return;

      setUniversity(data);
      setLoginHref(universityPortalUrl(data.short_name, "/login"));
      setLoginLabel("Back to portal sign in");
    }

    void loadUniversity();
  }, []);

  return { university, loginHref, loginLabel };
}