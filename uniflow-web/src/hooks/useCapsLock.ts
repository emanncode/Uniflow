"use client";

import { useState, useEffect } from "react";

export function useCapsLock() {
  const [capsLock, setCapsLock] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      setCapsLock(e.getModifierState("CapsLock"));
    };
    window.addEventListener("keydown", handler);
    window.addEventListener("keyup", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("keyup", handler);
    };
  }, []);

  return capsLock;
}
