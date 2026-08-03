"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Caveat } from "next/font/google";
import SectionBackground from "@/components/landing/SectionBackground";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const schoolReviews = [
  {
    quote: "Managing scheduling across 12 faculties used to take us days. With Uniflow, timetable generation is automated and completely conflict-free.",
    author: "Academic Office",
    institution: "Vertex University",
  },
  {
    quote: "We've seen student attendance improve simply because they receive instant updates about venue and time changes on their phones.",
    author: "Dean of Student Affairs",
    institution: "Peak State University",
  },
  {
    quote: "Transitioning our department resources and course announcements onto Uniflow has saved us hours of administrative overhead.",
    author: "Department Coordinator",
    institution: "Horizon University",
  },
  {
    quote: "The administrative dashboard gives us total oversight of lecture halls, resource usage, and coordinator requests in real-time.",
    author: "Registrar",
    institution: "Apex Institution",
  },
];

const studentReviews = [
  {
    quote: "No more wasted transport fares. I know exactly when a class is delayed or shifted before I even step foot out of my hostel.",
    author: "Femi",
    role: "Computer Science Student",
  },
  {
    quote: "The interface is very simple. Having my personalized timetable with push alerts saves me from the daily WhatsApp group chaos.",
    author: "Aisha",
    role: "Biochemistry Student",
  },
  {
    quote: "Our lecturers upload past questions and lecture notes directly onto the portal, making studying and preparation much easier.",
    author: "David",
    role: "Engineering Student",
  },
  {
    quote: "I can track all my enrolled courses, venue changes, and department announcements in one single feed. Highly recommended.",
    author: "Chioma",
    role: "Economics Student",
  },
];

interface ScrollRowProps {
  items: Array<{ quote: string; author: string; institution?: string; role?: string }>;
  speed?: number;
}

function ScrollRow({ items, speed = 0.5 }: ScrollRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let scrollPos = container.scrollLeft;

    const scroll = () => {
      if (!isPaused) {
        scrollPos += speed;
        // Loop back seamlessly when halfway point is reached
        if (scrollPos >= container.scrollWidth / 2) {
          scrollPos = 0;
        }
        container.scrollLeft = scrollPos;
      } else {
        // Sync scrollPos with manual scrolling
        scrollPos = container.scrollLeft;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, speed]);

  const doubledItems = [...items, ...items];

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="reviews-scroll-row"
      style={{
        overflowX: "auto",
        display: "flex",
        flexDirection: "row",
        gap: "16px",
        padding: "8px 0",
        cursor: "grab",
      }}
    >
      {doubledItems.map((item, index) => (
        <div
          key={index}
          style={{
            width: "320px",
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-sm)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "16px",
            boxShadow: "var(--shadow-md)",
            flexShrink: 0,
            transition: "border-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--brand)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-primary)";
          }}
        >
          <p
            style={{
              fontSize: "13.5px",
              color: "var(--text-primary)",
              lineHeight: 1.6,
              margin: 0,
              whiteSpace: "normal",
            }}
          >
            &ldquo;{item.quote}&rdquo;
          </p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              {item.author}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
              }}
            >
              {item.institution || item.role}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

const CommunityNodesIllustration = () => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "380px",
        height: "190px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-primary)",
        backgroundColor: "#080a09",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", fontFamily: "monospace", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-primary)", paddingBottom: "6px", marginBottom: "16px" }}>
        COMMUNITY RESPONSE HUB
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "space-around", alignItems: "flex-end", position: "relative", paddingBottom: "12px" }}>
        {/* Node 1: Student */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          {/* Animated floating quote bubble */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              bottom: "54px",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "8px",
              fontFamily: "monospace",
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
            }}
          >
            &quot;No more wasted transport!&quot;
          </motion.div>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--border-primary)", backgroundColor: "#0e1110", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "8px", fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace" }}>ST</span>
          </div>
          <span style={{ fontSize: "8px", color: "var(--text-muted)", marginTop: "6px", fontFamily: "monospace" }}>STUDENT</span>
        </div>

        {/* Node 2: Lecturer */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          {/* Animated floating quote bubble */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{
              position: "absolute",
              bottom: "54px",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--brand)",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "8px",
              fontFamily: "monospace",
              color: "var(--brand)",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 10px rgba(0, 135, 81, 0.1)"
            }}
          >
            &quot;Instant alerts work!&quot;
          </motion.div>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--brand)", backgroundColor: "#062216", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "8px", fontWeight: 700, color: "var(--brand)", fontFamily: "monospace" }}>LC</span>
          </div>
          <span style={{ fontSize: "8px", color: "var(--brand)", marginTop: "6px", fontFamily: "monospace" }}>LECTURER</span>
        </div>

        {/* Node 3: Admin */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          {/* Animated floating quote bubble */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{
              position: "absolute",
              bottom: "54px",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "8px",
              fontFamily: "monospace",
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
            }}
          >
            &quot;Days of admin saved.&quot;
          </motion.div>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--border-primary)", backgroundColor: "#0e1110", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "8px", fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace" }}>AD</span>
          </div>
          <span style={{ fontSize: "8px", color: "var(--text-muted)", marginTop: "6px", fontFamily: "monospace" }}>ADMIN</span>
        </div>

        {/* Connecting Line-Art Dotted Paths */}
        <svg style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
          <path d="M 60,110 Q 190,50 320,110" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" strokeDasharray="3 3" />
          <path d="M 60,110 Q 190,140 320,110" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" strokeDasharray="3 3" />
        </svg>
      </div>
    </div>
  );
};

export default function Reviews() {
  return (
    <section
      id="reviews"
      style={{
        padding: "clamp(80px, 20vw, 120px) 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <SectionBackground />
      
      <style>{`
        .reviews-scroll-row::-webkit-scrollbar {
          display: none;
        }
        .reviews-scroll-row {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* ── header ── */}
        <div
          style={{
            marginBottom: "clamp(48px, 6vw, 80px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className={caveat.className}
              style={{
                display: "flex",
                fontSize: "42px",
                fontWeight: 700,
                color: "var(--brand)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              What Our Community Says
            </div>

            <div style={{ maxWidth: "640px" }}>
              <div style={{ overflow: "hidden" }}>
                <motion.h2
                  initial={{ y: "100%" }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontSize: "clamp(32px, 5vw, 60px)",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.05,
                    color: "var(--text-primary)",
                    margin: 0,
                  }}
                >
                  Loved by administrators.{" "}
                  <span
                    style={{
                      color: "var(--brand)",
                      textShadow: "0 0 30px rgba(0, 135, 81,0.3)",
                    }}
                  >
                    Trusted by students.
                  </span>
                </motion.h2>
              </div>
            </div>
          </motion.div>

          {/* Right column: Speech propagation nodes */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <CommunityNodesIllustration />
          </motion.div>
        </div>

        {/* ── scrolling rows layout ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "36px",
            width: "100%",
            position: "relative",
          }}
        >
          {/* Row 1: School Reviews */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3
              style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--brand)",
                marginBottom: "4px",
                paddingLeft: "4px",
              }}
            >
              School Administration
            </h3>
            <ScrollRow items={schoolReviews} speed={0.4} />
          </div>

          {/* Row 2: Student Reviews */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3
              style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--brand)",
                marginBottom: "4px",
                paddingLeft: "4px",
              }}
            >
              Students & Lecturers
            </h3>
            <ScrollRow items={studentReviews} speed={0.5} />
          </div>
        </div>
      </div>
    </section>
  );
}
