import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getMarketingMetadata } from "@/lib/seo";
import { Caveat } from "next/font/google";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = getMarketingMetadata({
  title: "About",
  alternates: { canonical: "/about" },
});

export default function AboutPage() {
  return (
    <main className="page" style={{ position: "relative", overflow: "hidden" }}>
      {/* background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--bg-hover) 1px, transparent 1px), linear-gradient(90deg, var(--bg-hover) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Navbar />
      <div style={{ paddingTop: "30px" }} />

      <section className="section">
        <div className="container" style={{ maxWidth: "800px" }}>
          <div
            className={caveat.className}
            style={{
              display: "block",
              fontSize: "clamp(20px, 4vw, 30px)",
              fontWeight: 700,
              color: "var(--brand)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            Company
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "var(--text-primary)",
              margin: "0 0 16px",
            }}
          >
            About Uniflow
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "var(--text-secondary)",
              lineHeight: 1.75,
              margin: "0 0 48px",
              maxWidth: "640px",
            }}
          >
            We&apos;re building the operating system for university campus
            management — making timetable scheduling, course management, and
            campus communication seamless for every institution worldwide.
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "28px" }}
          >
            <Section title="Our Mission">
              <p>
                Universities today manage timetables with spreadsheets,
                whiteboards, and sheer determination. Students miss classes
                because of scheduling conflicts. Lecturers juggle multiple
                course allocations with no centralized view. Administrators
                spend weeks each semester building timetables from scratch.
              </p>
              <p>
                We&apos;re changing that. Uniflow gives every university a
                dedicated platform for timetable management, course allocation,
                and campus communication — accessible to students and lecturers
                through a mobile app and web portal.
              </p>
            </Section>

            <Section title="Our Story">
              <p>
                Uniflow was born from a simple observation: in an age of AI and
                cloud computing, most universities still rely on manual
                processes for their most fundamental operational need — the
                timetable. After experiencing the frustration of scheduling
                conflicts, missed classes, and opaque course information
                firsthand, we set out to build a better way.
              </p>
              <p>
                What started as a solution for one university has grown into a
                platform designed for every university, anywhere in the world.
                Starting from Nigeria and expanding across Africa and beyond.
              </p>
            </Section>

            <Section title="What We Do">
              <p>Uniflow provides:</p>
              <ul>
                <li>
                  <strong>Timetable Management:</strong> Intelligent scheduling
                  with conflict detection and real-time updates.
                </li>
                <li>
                  <strong>Course Allocation:</strong> Streamlined
                  lecturer-to-course assignment with workload tracking.
                </li>
                <li>
                  <strong>Student Mobile App:</strong> Personalised timetables,
                  class updates, and campus notifications in your pocket.
                </li>
                <li>
                  <strong>University Portal:</strong> Dedicated web portal for
                  each institution with role-based access.
                </li>
                <li>
                  <strong>Real-Time Updates:</strong> Instant notifications for
                  class changes, cancellations, and room moves.
                </li>
              </ul>
            </Section>

            <Section title="Our Values">
              <ul>
                <li>
                  <strong>Simplicity:</strong> Complex systems should feel
                  simple. We design for clarity and ease of use.
                </li>
                <li>
                  <strong>Reliability:</strong> Universities depend on us. We
                  build for uptime, accuracy, and trust.
                </li>
                <li>
                  <strong>Accessibility:</strong> Every university deserves
                  modern tools, regardless of size or budget.
                </li>
                <li>
                  <strong>Innovation:</strong> We continuously improve our
                  platform to meet evolving campus needs.
                </li>
              </ul>
            </Section>

            <Section title="Contact">
              <p>
                Want to learn more or bring Uniflow to your university?
                We&apos;d love to hear from you.
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:contact@olajubajeifeoluwa93@gmail.com"
                  style={{ color: "var(--brand)", textDecoration: "none" }}
                >
                  contact@olajubajeifeoluwa93@gmail.com
                </a>
                <br />
              </p>
            </Section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "var(--text-primary)",
          margin: "0 0 12px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: "14px",
          color: "var(--text-secondary)",
          lineHeight: 1.8,
        }}
      >
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
