import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Sora } from "next/font/google";
import { getMarketingMetadata } from "@/lib/seo";

export const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = getMarketingMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sora.className}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}