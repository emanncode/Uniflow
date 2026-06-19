import type { Metadata } from "next";
import { PRIVATE_PORTAL_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  ...PRIVATE_PORTAL_METADATA,
  title: "Sign In",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}