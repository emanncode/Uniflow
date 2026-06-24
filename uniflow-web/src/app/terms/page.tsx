import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getMarketingMetadata } from "@/lib/seo";

export const metadata: Metadata = getMarketingMetadata({
  title: "Terms of Service",
  alternates: { canonical: "/terms" },
});

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p style={{
            fontSize: "14px", color: "var(--text-muted)", margin: "0 0 48px",
          }}>
            Last updated: June 24, 2026
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <Section title="1. Acceptance of Terms">
              <p>
                By accessing or using Uniflow (&quot;the Platform&quot;), you agree to be bound by these
                Terms of Service (&quot;Terms&quot;). If you do not agree, you may not use the Platform.
              </p>
              <p>
                These Terms apply to all users, including university administrators, lecturers,
                students, and visitors.
              </p>
            </Section>

            <Section title="2. Description of Service">
              <p>
                Uniflow provides a university timetable and campus management platform that enables
                institutions to manage timetables, courses, lecturer assignments, student schedules,
                and campus communications through web and mobile applications.
              </p>
            </Section>

            <Section title="3. User Accounts and Registration">
              <ul>
                <li>You must provide accurate and complete information when creating an account.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You must notify us immediately of any unauthorized use of your account.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
                <li>University registration is subject to review and approval by our team.</li>
              </ul>
            </Section>

            <Section title="4. University Portals">
              <ul>
                <li>Universities receive a dedicated subdomain portal upon approval.</li>
                <li>The registering university official certifies they are authorized to represent the institution.</li>
                <li>University administrators are responsible for managing access and content within their portal.</li>
                <li>We reserve the right to revoke portal access for violations of these Terms.</li>
              </ul>
            </Section>

            <Section title="5. Acceptable Use">
              <p>You agree not to:</p>
              <ul>
                <li>Use the Platform for any unlawful purpose or in violation of any applicable laws.</li>
                <li>Attempt to gain unauthorized access to any part of the Platform or its systems.</li>
                <li>Interfere with or disrupt the integrity or performance of the Platform.</li>
                <li>Upload or transmit viruses, malware, or any malicious code.</li>
                <li>Impersonate any person or entity or misrepresent your affiliation.</li>
                <li>Use the Platform to send unsolicited communications (spam).</li>
              </ul>
            </Section>

            <Section title="6. Intellectual Property">
              <p>
                The Platform, including its code, design, logos, and content, is owned by Uniflow and
                protected by intellectual property laws. You may not reproduce, modify, distribute, or
                create derivative works without our express written permission.
              </p>
            </Section>

            <Section title="7. Data Privacy">
              <p>
                Our collection and use of personal data is governed by our
                <a href="/privacy-policy" style={{ color: "var(--brand)", textDecoration: "none" }}> Privacy Policy</a>.
                By using the Platform, you consent to the data practices described therein.
              </p>
            </Section>

            <Section title="8. Limitation of Liability">
              <p>
                To the maximum extent permitted by law, Uniflow shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages arising out of or related to
                your use of the Platform. The Platform is provided &quot;as is&quot; without warranties
                of any kind, either express or implied.
              </p>
            </Section>

            <Section title="9. Termination">
              <p>
                We reserve the right to suspend or terminate access to the Platform at any time,
                without prior notice, for conduct that we believe violates these Terms or is harmful
                to other users, third parties, or our business interests.
              </p>
            </Section>

            <Section title="10. Modifications to Terms">
              <p>
                We may revise these Terms at any time. Changes will be effective immediately upon
                posting. Continued use of the Platform after changes constitutes acceptance of the
                revised Terms. We will notify registered users of material changes via email.
              </p>
            </Section>

            <Section title="11. Governing Law">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the
                Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Ondo
                State, Nigeria.
              </p>
            </Section>

            <Section title="12. Contact">
              <p>
                For questions about these Terms, please contact us at:
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
