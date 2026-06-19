import type { Metadata } from "next";
import { getMarketingMetadata } from "@/lib/seo";

export const metadata: Metadata = getMarketingMetadata({
  title: "Register Your University",
  description:
    "Register your university on UniflowApp (uniflowapp.xyz). Get a dedicated admin portal, timetable tools, and a mobile app for students and lecturers.",
  alternates: { canonical: "/register" },
});

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}