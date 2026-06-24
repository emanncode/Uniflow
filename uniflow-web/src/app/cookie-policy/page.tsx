import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getMarketingMetadata } from "@/lib/seo";

export const metadata: Metadata = getMarketingMetadata({
  title: "Cookie Policy",
  alternates: { canonical: "/cookie-policy" },
});

export default function CookiePolicyPage() {
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
            Legal
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900,
            letterSpacing: "-0.04em", color: "var(--text-primary)",
            margin: "0 0 8px",
          }}>
            Cookie Policy
          </h1>
          <p style={{
            fontSize: "14px", color: "var(--text-muted)", margin: "0 0 48px",
          }}>
            Last updated: June 24, 2026
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <Section title="1. What Are Cookies">
              <p>
                Cookies are small text files stored on your device (computer, tablet, or mobile)
                when you visit a website. They are widely used to make websites work efficiently
                and provide information to website owners.
              </p>
            </Section>

            <Section title="2. How We Use Cookies">
              <p>Uniflow uses cookies and similar tracking technologies for the following purposes:</p>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for the Platform to function properly, including authentication and session management.</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings to enhance your experience.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Platform, allowing us to improve performance and features.</li>
                <li><strong>Security Cookies:</strong> Used to detect and prevent fraudulent activity and protect user data.</li>
              </ul>
            </Section>

            <Section title="3. Types of Cookies We Use">
              <div style={{
                overflowX: "auto",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-md)",
                marginTop: "12px",
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                      <Th>Type</Th>
                      <Th>Purpose</Th>
                      <Th>Duration</Th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <Td>Session</Td>
                      <Td>Authentication and session management</Td>
                      <Td>Session</Td>
                    </tr>
                    <tr>
                      <Td>Preferences</Td>
                      <Td>Remember user settings and preferences</Td>
                      <Td>1 year</Td>
                    </tr>
                    <tr>
                      <Td>Analytics</Td>
                      <Td>Track usage patterns and improve the Platform</Td>
                      <Td>Up to 2 years</Td>
                    </tr>
                    <tr>
                      <Td>Security</Td>
                      <Td>Detect fraud and protect user data</Td>
                      <Td>Session</Td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="4. Third-Party Cookies">
              <p>
                We may use third-party services (such as Vercel Analytics) that set their own cookies
                on our Platform. These third parties have their own cookie policies. We do not control
                these cookies.
              </p>
            </Section>

            <Section title="5. Managing Cookies">
              <p>
                You can control and manage cookies in several ways:
              </p>
              <ul>
                <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies through your browser settings.</li>
                <li><strong>Opt-Out:</strong> You can opt out of analytics cookies by adjusting your preferences.</li>
                <li><strong>Consequences:</strong> Please note that blocking essential cookies may affect the functionality of our Platform.</li>
              </ul>
            </Section>

            <Section title="6. Updates to This Policy">
              <p>
                We may update this Cookie Policy from time to time. Changes will be posted on this
                page with an updated revision date. We encourage you to review this policy periodically.
              </p>
            </Section>

            <Section title="7. Contact">
              <p>
                If you have questions about our use of cookies, please contact us at:
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

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: "12px 16px", textAlign: "left", fontWeight: 600,
      color: "var(--text-primary)", borderBottom: "1px solid var(--border-primary)",
    }}>
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{
      padding: "12px 16px", color: "var(--text-secondary)",
      borderBottom: "1px solid var(--border-primary)",
    }}>
      {children}
    </td>
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
