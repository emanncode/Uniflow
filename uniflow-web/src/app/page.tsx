import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { getMarketingMetadata } from "@/lib/seo";

export const metadata: Metadata = getMarketingMetadata({
  alternates: { canonical: "/" },
});

export default function LandingPage() {
  return (
    <>
      <JsonLd />
      <h1 className="sr-only">
        Uniflow (UniflowApp) — university timetable and campus management
        platform at uniflowapp.xyz
      </h1>
      <main>
        <Navbar />
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
        <Footer />
      </main>
    </>
  );
}