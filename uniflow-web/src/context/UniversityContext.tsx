"use client";

import { createContext, useContext } from "react";

export interface UniversityContextValue {
  universityId: string | null;
  universityName: string | null;
  universityShortName: string | null;
  userEmail: string | null;
  isReady: boolean;
}

const defaultValue: UniversityContextValue = {
  universityId: null,
  universityName: null,
  universityShortName: null,
  userEmail: null,
  isReady: false,
};

const UniversityContext = createContext<UniversityContextValue>(defaultValue);

export function UniversityProvider({
  value,
  children,
}: {
  value: UniversityContextValue;
  children: React.ReactNode;
}) {
  return (
    <UniversityContext.Provider value={value}>
      {children}
    </UniversityContext.Provider>
  );
}

export function useUniversity() {
  return useContext(UniversityContext);
}