"use client";

import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  MapPin,
  AlertTriangle,
  FileX,
  Phone,
} from "lucide-react";
import { Caveat } from "next/font/google";
import SectionBackground from "@/components/landing/SectionBackground";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const problems = [
  {
    icon: Users,
    title: "Empty halls, wasted trips",
    desc: "Students commute across campus only to find their lecturer never showed up.",
    stat: "3x/week",
    statLabel: "average wasted trips",
  },
  {
    icon: MessageSquare,
    title: '"Class don cancel" on WhatsApp',
    desc: "Cancellations spread through informal group chats — too slow, too unreliable.",
    stat: "47min",
    statLabel: "average delay in finding out",
  },
  {
    icon: MapPin,
    title: "Venue changes nobody announced",
    desc: "Class moved from LT1 to Hall B. Who told the students? Nobody.",
    stat: "1 in 3",
    statLabel: "venue changes go unannounced",
  },
  {
    icon: AlertTriangle,
    title: "Timetable clashes nobody caught",
    desc: "Two courses, same time, same venue. Discovered on day one of semester.",
    stat: "12+",
    statLabel: "clashes per semester average",
  },
  {
    icon: FileX,
    title: "No single source of truth",
    desc: "PDFs, screenshots, WhatsApp messages — everyone has a different version.",
    stat: "5+",
    statLabel: "places students check for schedule",
  },
  {
    icon: Phone,
    title: "Lecturers with no formal channel",
    desc: "No official way to communicate changes. Everything is informal and unrecorded.",
    stat: "0",
    statLabel: "formal channels in most universities",
  },
];

export default function Problem() {
  return (
    <section
      id="problem"
      className="pt-4"
      style={{
        padding: "clamp(80px, 20vw, 120px) 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <SectionBackground />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* ── header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: "clamp(48px, 6vw, 80px)" }}
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
            The Problem
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
                margin: 0,
              }}
            >
              Sound familiar?
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              color: "var(--text-muted)",
              marginTop: "16px",
              maxWidth: "520px",
              lineHeight: 1.7,
            }}
          >
            Every student knows these moments. Every lecturer has been there.
            Universities have accepted this chaos for decades.{" "}
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              Uniflow ends it.
            </span>
          </motion.p>
        </motion.div>

        {/* ── problem grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "1px",
            backgroundColor: "var(--border-primary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
          }}
        >
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  padding: "clamp(28px, 3.5vw, 40px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  transition:
                    "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  cursor: "default",
                  position: "relative" as const,
                  overflow: "hidden",
                }}
              >

                {/* icon + stat row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    position: "relative" as const,
                    zIndex: 1,
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "rgba(0, 135, 81,0.12)",
                      border: "1px solid rgba(0, 135, 81,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.4s ease",
                    }}
                  >
                    <Icon size={22} color="var(--brand)" strokeWidth={1.8} />
                  </motion.div>

                  <div style={{ textAlign: "right" }}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      }}
                      style={{
                        fontSize: "clamp(20px, 2.8vw, 28px)",
                        fontWeight: 900,
                        color: "var(--brand)",
                        letterSpacing: "-0.03em",
                        lineHeight: 1,
                      }}
                    >
                      {problem.stat}
                    </motion.div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--text-muted)",
                        marginTop: "4px",
                        fontWeight: 500,
                        maxWidth: "110px",
                        textAlign: "right",
                        lineHeight: 1.4,
                      }}
                    >
                      {problem.statLabel}
                    </div>
                  </div>
                </div>

                {/* text */}
                <div style={{ position: "relative" as const, zIndex: 1 }}>
                  <h3
                    style={{
                      fontSize: "clamp(14px, 1.7vw, 17px)",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      margin: "0 0 10px",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                    }}
                  >
                    {problem.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      lineHeight: 1.75,
                      margin: 0,
                    }}
                  >
                    {problem.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── bottom callout ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            marginTop: "40px",
            padding: "clamp(24px, 3vw, 40px)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-primary)",
            backgroundColor: "var(--bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "clamp(16px, 2vw, 20px)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "6px",
                letterSpacing: "-0.02em",
              }}
            >
              Stop accepting campus chaos as normal.
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              Uniflow gives every student and lecturer real-time clarity — no
              more guessing, no more wasted trips.
            </div>
          </div>
          <motion.button
            whileHover={{
              scale: 1.04,
              boxShadow: "0 0 30px rgba(0, 135, 81,0.25)",
            }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
            style={{
              padding: "14px 28px",
              fontSize: "14px",
              borderRadius: "var(--radius-sm)",
              whiteSpace: "nowrap",
            }}
            onClick={() => (window.location.href = "/register")}
          >
            Fix it with Uniflow →
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
