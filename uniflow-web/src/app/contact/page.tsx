import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getMarketingMetadata } from "@/lib/seo";

export const metadata: Metadata = getMarketingMetadata({
  title: "Contact",
  alternates: { canonical: "/contact" },
});

export default function ContactPage() {
  return (
    <main className="page">
      <Navbar />
      <div style={{ paddingTop: "140px" }} />

      <section className="section">
        <div className="container" style={{ maxWidth: "680px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "4px 12px", borderRadius: "999px",
            border: "1px solid var(--border-brand)",
            backgroundColor: "var(--brand-subtle)",
            fontSize: "11px", fontWeight: 600,
            color: "var(--brand)", letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: "16px",
          }}>
            Company
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900,
            letterSpacing: "-0.04em", color: "var(--text-primary)",
            margin: "0 0 16px",
          }}>
            Get in touch
          </h1>

          <p style={{
            fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.75,
            margin: "0 0 48px", maxWidth: "520px",
          }}>
            Have a question about Uniflow? Want to bring your university on board?
            Or just want to say hello? We&apos;d love to hear from you.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{
                fontSize: "13px", fontWeight: 700, color: "var(--text-primary)",
                margin: "0 0 4px", letterSpacing: "0.02em",
              }}>
                Email Us
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                For general inquiries, partnerships, and support:{' '}
                <a href="mailto:contact@olajubajeifeoluwa93@gmail.com"
                  style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
                  contact@olajubajeifeoluwa93@gmail.com
                </a>
              </p>
            </div>

            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{
                fontSize: "13px", fontWeight: 700, color: "var(--text-primary)",
                margin: "0 0 4px", letterSpacing: "0.02em",
              }}>
                University Registration
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                Ready to bring your university to Uniflow?{' '}
                <a href="/register"
                  style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
                  Register here
                </a>
                {' '}and we&apos;ll get back to you within 48 hours.
              </p>
            </div>

            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{
                fontSize: "13px", fontWeight: 700, color: "var(--text-primary)",
                margin: "0 0 4px", letterSpacing: "0.02em",
              }}>
                Social
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                Follow us on{' '}
                <a href="https://x.com/emanncode" target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
                  X (Twitter)
                </a>
                {' '}and{' '}
                <a href="https://github.com/emanncode" target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
                  GitHub
                </a>
                {' '}for updates and announcements.
              </p>
            </div>

            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{
                fontSize: "13px", fontWeight: 700, color: "var(--text-primary)",
                margin: "0 0 4px", letterSpacing: "0.02em",
              }}>
                Location
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                Nigeria
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
