import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getMarketingMetadata } from "@/lib/seo";

export const metadata: Metadata = getMarketingMetadata({
  title: "Privacy Policy",
  alternates: { canonical: "/privacy-policy" },
});

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p style={{
            fontSize: "14px", color: "var(--text-muted)", margin: "0 0 48px",
          }}>
            Last updated: June 24, 2026
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <Section title="1. Introduction">
              <p>
                Uniflow (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our platform, website, and mobile applications.
              </p>
              <p>
                By using Uniflow, you agree to the collection and use of information in accordance with
                this policy. If you do not agree, please discontinue use of our services.
              </p>
            </Section>

            <Section title="2. Information We Collect">
              <p>We may collect the following types of information:</p>
              <ul>
                <li><strong>Personal Information:</strong> Name, email address, phone number, university affiliation, and role when you register or use our services.</li>
                <li><strong>Institutional Information:</strong> University name, short name, official email domain, website, and related details provided during registration.</li>
                <li><strong>Usage Data:</strong> Information about how you access and interact with our platform, including page views, features used, and timestamps.</li>
                <li><strong>Device Information:</strong> Device type, operating system, browser type, and mobile network information.</li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use the collected information for the following purposes:</p>
              <ul>
                <li>To provide, operate, and maintain our platform and services.</li>
                <li>To authenticate users and manage university portal access.</li>
                <li>To communicate with you about updates, security alerts, and support.</li>
                <li>To improve and personalize user experience.</li>
                <li>To detect, prevent, and address technical issues and fraud.</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </Section>

            <Section title="4. Data Sharing and Disclosure">
              <p>We do not sell your personal information. We may share your data in the following circumstances:</p>
              <ul>
                <li><strong>With your consent:</strong> We may share information when you have given us explicit permission.</li>
                <li><strong>Service providers:</strong> We may engage third-party vendors to support our operations (e.g., hosting, analytics, email delivery).</li>
                <li><strong>Legal requirements:</strong> We may disclose information if required by law or in response to valid legal requests.</li>
                <li><strong>University administration:</strong> Information may be shared with authorized university administrators within your institution&apos;s portal.</li>
              </ul>
            </Section>

            <Section title="5. Data Security">
              <p>
                We implement appropriate technical and organizational security measures to protect your data,
                including encryption in transit (TLS) and at rest, access controls, and regular security audits.
                However, no method of transmission over the Internet is 100% secure.
              </p>
            </Section>

            <Section title="6. Data Retention">
              <p>
                We retain your personal information for as long as your account is active or as needed to
                provide you with our services. We may retain certain data longer to comply with legal,
                tax, or regulatory obligations.
              </p>
            </Section>

            <Section title="7. Your Rights">
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your data.</li>
                <li>Object to or restrict processing of your data.</li>
                <li>Data portability.</li>
              </ul>
              <p>To exercise these rights, please contact us at <a href="mailto:contact@olajubajeifeoluwa93@gmail.com" style={{ color: "var(--brand)", textDecoration: "none" }}>contact@olajubajeifeoluwa93@gmail.com</a>.</p>
            </Section>

            <Section title="8. Cookies">
              <p>
                We use cookies and similar tracking technologies to enhance your experience. Please refer to our
                <a href="/cookie-policy" style={{ color: "var(--brand)", textDecoration: "none" }}> Cookie Policy</a> for detailed information.
              </p>
            </Section>

            <Section title="9. Third-Party Links">
              <p>
                Our platform may contain links to third-party websites. We are not responsible for the
                privacy practices or content of these external sites.
              </p>
            </Section>

            <Section title="10. Children&apos;s Privacy">
              <p>
                Our services are not intended for individuals under the age of 16. We do not knowingly
                collect personal information from children. If we become aware that a child has provided
                us with personal data, we will take steps to delete it.
              </p>
            </Section>

            <Section title="11. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify users of material
                changes via email or a prominent notice on our platform. Your continued use after changes
                constitutes acceptance of the updated policy.
              </p>
            </Section>

            <Section title="12. Contact Us">
              <p>
                If you have questions or concerns about this Privacy Policy, please reach out to us at:
              </p>
              <p>
                Email: <a href="mailto:contact@olajubajeifeoluwa93@gmail.com" style={{ color: "var(--brand)", textDecoration: "none" }}>contact@olajubajeifeoluwa93@gmail.com</a><br />
                Address: Ondo State, Nigeria
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
