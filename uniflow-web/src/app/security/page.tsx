import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getMarketingMetadata } from "@/lib/seo";

export const metadata: Metadata = getMarketingMetadata({
  title: "Security",
  alternates: { canonical: "/security" },
});

export default function SecurityPage() {
  return (
    <main className="page">
      <Navbar />
      <div style={{ paddingTop: "140px" }} />

      <section className="section">
        <div className="container" style={{ maxWidth: "800px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "4px 12px", borderRadius: "999px",
            border: "1px solid var(--border-brand)",
            backgroundColor: "var(--brand-subtle)",
            fontSize: "11px", fontWeight: 600,
            color: "var(--brand)", letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: "16px",
          }}>
            Security
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900,
            letterSpacing: "-0.04em", color: "var(--text-primary)",
            margin: "0 0 16px",
          }}>
            Security at Uniflow
          </h1>
          <p style={{
            fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.75,
            margin: "0 0 48px", maxWidth: "640px",
          }}>
            We take the security of your data seriously. Our platform is built with industry-standard
            security practices to protect your information at every layer.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <Section title="Encryption">
              <p>
                All data transmitted between your device and our servers is encrypted using
                <strong> TLS 1.3</strong> (Transport Layer Security). Data stored on our servers is
                encrypted at rest using AES-256 encryption. We follow encryption best practices to
                ensure your information remains confidential.
              </p>
            </Section>

            <Section title="Authentication">
              <p>
                We implement secure authentication mechanisms including:
              </p>
              <ul>
                <li>Password hashing using bcrypt with salting.</li>
                <li>Session management with secure, HTTP-only cookies.</li>
                <li>Role-based access control for university portals.</li>
                <li>Rate limiting and brute-force protection on login endpoints.</li>
              </ul>
            </Section>

            <Section title="Infrastructure Security">
              <ul>
                <li><strong>Hosting:</strong> Our platform is hosted on Vercel and Supabase, both SOC 2 compliant providers.</li>
                <li><strong>Network Security:</strong> All services run behind firewalls with strict access controls.</li>
                <li><strong>Monitoring:</strong> We continuously monitor our systems for suspicious activity and potential threats.</li>
                <li><strong>Backups:</strong> Regular automated backups are performed to ensure data integrity and availability.</li>
              </ul>
            </Section>

            <Section title="Application Security">
              <ul>
                <li>Regular security audits and vulnerability assessments.</li>
                <li>Dependency scanning to identify and patch known vulnerabilities.</li>
                <li>Input validation and output encoding to prevent injection attacks.</li>
                <li>CSRF protection on all state-changing operations.</li>
                <li>Strict Content Security Policy (CSP) headers.</li>
              </ul>
            </Section>

            <Section title="Data Access Controls">
              <p>
                Access to production data is restricted to authorized team members only. We follow the
                principle of least privilege, ensuring that each user and service has only the minimum
                level of access required to perform their functions. All access is logged and audited.
              </p>
            </Section>

            <Section title="Vulnerability Disclosure">
              <p>
                We welcome responsible disclosure of security vulnerabilities. If you discover a
                security issue, please report it to us immediately at{' '}
                <a href="mailto:contact@olajubajeifeoluwa93@gmail.com" style={{ color: "var(--brand)", textDecoration: "none" }}>
                  contact@olajubajeifeoluwa93@gmail.com
                </a>.
                We will acknowledge receipt within 24 hours and work to resolve the issue promptly.
              </p>
            </Section>

            <Section title="Compliance">
              <p>
                We are committed to compliance with applicable data protection regulations, including
                the Nigeria Data Protection Regulation (NDPR) and other relevant frameworks. We
                regularly review our security practices to align with industry standards and legal
                requirements.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                For security-related inquiries, please reach out to:
              </p>
              <p>
                Email: <a href="mailto:contact@olajubajeifeoluwa93@gmail.com" style={{ color: "var(--brand)", textDecoration: "none" }}>contact@olajubajeifeoluwa93@gmail.com</a>
              </p>
            </Section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{
        fontSize: "20px", fontWeight: 700, color: "var(--text-primary)",
        margin: "0 0 12px", letterSpacing: "-0.02em",
      }}>
        {title}
      </h2>
      <div style={{
        fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.8,
      }}>
        {children}
      </div>
      <style>{`
        ul { padding-left: 20px; margin: 8px 0; }
        li { margin-bottom: 6px; }
        p { margin: 8px 0; }
      `}</style>
    </div>
  );
}
