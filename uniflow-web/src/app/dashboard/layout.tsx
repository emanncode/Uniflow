import type { Metadata } from "next";
import DashboardClientWrapper from "@/components/layout/DashboardClientWrapper";
import { PRIVATE_PORTAL_METADATA } from "@/lib/seo";

export const metadata: Metadata = PRIVATE_PORTAL_METADATA;
export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardClientWrapper>{children}</DashboardClientWrapper>
  );
}