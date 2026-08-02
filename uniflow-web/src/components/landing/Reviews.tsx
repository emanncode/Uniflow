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

interface ScrollColProps {
  items: Array<{ quote: string; author: string; institution?: string; role?: string }>;
  speed?: number;
}

function ScrollColumn({ items, speed = 0.5 }: ScrollColProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;

    const scroll = () => {
      if (!isPaused) {
        container.scrollTop += speed;
        // Loop back seamlessly when halfway point is reached
        if (container.scrollTop >= container.scrollHeight / 2) {
          container.scrollTop = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, speed]);

  // Duplicate items for infinite scroll effect
  const doubledItems = [...items, ...items];

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="reviews-scroll-col"
      style={{
        overflowY: "auto",
        height: "450px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        paddingRight: "4px",
      }}
    >
      {doubledItems.map((item, index) => (
        <div
          key={index}
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-sm)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
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
        .reviews-scroll-col::-webkit-scrollbar {
          display: none;
        }
        .reviews-scroll-col {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* ── header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: "clamp(48px, 6vw, 80px)", textAlign: "center" }}
        >
          <div
            className={caveat.className}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
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
                margin: "0 auto 16px",
                maxWidth: "600px",
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
        </motion.div>

        {/* ── scrolling columns layout ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "24px",
            maxWidth: "960px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Column 1: School Reviews */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3
              style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--brand)",
                marginBottom: "8px",
                paddingLeft: "4px",
              }}
            >
              School Administration
            </h3>
            <ScrollColumn items={schoolReviews} speed={0.4} />
          </div>

          {/* Column 2: Student Reviews */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3
              style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--brand)",
                marginBottom: "8px",
                paddingLeft: "4px",
              }}
            >
              Students & Lecturers
            </h3>
            <ScrollColumn items={studentReviews} speed={0.5} />
          </div>
        </div>
      </div>
    </section>
  );
}
