"use client";

import { motion, Variants } from "framer-motion";
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

const iconContainerVariants: Variants = {
  initial: {
    backgroundColor: "rgba(0, 135, 81, 0.12)",
  },
  hover: {
    backgroundColor: "rgba(0, 135, 81, 0.25)",
    transition: { duration: 0.3 },
  },
};

const iconVariants: Record<string, Variants> = {
  users: {
    initial: { x: 0 },
    hover: {
      x: [-2, 2, -2, 2, 0],
      transition: { duration: 0.4 },
    },
  },
  messageSquare: {
    initial: { rotate: 0 },
    hover: {
      rotate: [0, -12, 10, -8, 8, 0],
      transition: { duration: 0.5 },
    },
  },
  mapPin: {
    initial: { y: 0 },
    hover: {
      y: [0, -5, 2, -2, 0],
      transition: { duration: 0.5 },
    },
  },
  alertTriangle: {
    initial: { scale: 1 },
    hover: {
      scale: [1, 1.18, 0.95, 1.08, 1],
      transition: { duration: 0.5 },
    },
  },
  fileX: {
    initial: { rotate: 0, scale: 1 },
    hover: {
      rotate: [0, -10, 10, 0],
      scale: 0.9,
      transition: { duration: 0.4 },
    },
  },
  phone: {
    initial: { rotate: 0 },
    hover: {
      rotate: [0, -15, 15, -15, 15, 0],
      transition: { duration: 0.5 },
    },
  },
};

const problems = [
  {
    icon: Users,
    animationKey: "users" as const,
    title: "Empty halls, wasted trips",
    desc: "Students commute across campus only to find their lecturer never showed up.",
    stat: "3x/week",
    statLabel: "average wasted trips",
  },
  {
    icon: MessageSquare,
    animationKey: "messageSquare" as const,
    title: '"Class don cancel" on WhatsApp',
    desc: "Cancellations spread through informal group chats — too slow, too unreliable.",
    stat: "47min",
    statLabel: "average delay in finding out",
  },
  {
    icon: MapPin,
    animationKey: "mapPin" as const,
    title: "Venue changes nobody announced",
    desc: "Class moved from LT1 to Hall B. Who told the students? Nobody.",
    stat: "1 in 3",
    statLabel: "venue changes go unannounced",
  },
  {
    icon: AlertTriangle,
    animationKey: "alertTriangle" as const,
    title: "Timetable clashes nobody caught",
    desc: "Two courses, same time, same venue. Discovered on day one of semester.",
    stat: "12+",
    statLabel: "clashes per semester average",
  },
  {
    icon: FileX,
    animationKey: "fileX" as const,
    title: "No single source of truth",
    desc: "PDFs, screenshots, WhatsApp messages — everyone has a different version.",
    stat: "5+",
    statLabel: "places students check for schedule",
  },
  {
    icon: Phone,
    animationKey: "phone" as const,
    title: "Lecturers with no formal channel",
    desc: "No official way to communicate changes. Everything is informal and unrecorded.",
    stat: "0",
    statLabel: "formal channels in most universities",
  },
];

const TimetableClashIllustration = () => {
  return (
    <motion.div
      whileHover="hover"
      initial="initial"
      style={{
        width: "100%",
        maxWidth: "400px",
        height: "220px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-primary)",
        backgroundColor: "#080a09",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "16px 20px",
        boxShadow: "var(--shadow-md)",
        cursor: "default",
      }}
    >
      {/* Grid Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", fontFamily: "monospace", letterSpacing: "0.05em" }}>SCHEDULER // TIME-VENUE MATRIX</span>
        <span style={{ fontSize: "9px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", fontFamily: "monospace" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "rgba(0,135,81,0.2)", border: "1px solid var(--brand)", display: "inline-block" }} />
          LIVE_STATUS
        </span>
      </div>

      {/* Grid Body */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "50px 1fr 1fr", gap: "12px", position: "relative" }}>
        {/* Time Slots Column */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", fontSize: "9px", color: "var(--text-muted)", fontFamily: "monospace", borderRight: "1px solid var(--border-primary)", paddingRight: "8px" }}>
          <div>08:00</div>
          <div>09:00</div>
          <div>10:00</div>
          <div>11:00</div>
        </div>

        {/* Venue Column 1 */}
        <div style={{ borderRight: "1px dashed var(--border-primary)", position: "relative", paddingLeft: "4px" }}>
          <div style={{ fontSize: "8px", color: "var(--text-muted)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: "8px" }}>Hall A (LT1)</div>
          
          {/* Lecture Block A */}
          <motion.div
            variants={{
              initial: { y: 15, width: "110px", borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.08)", color: "#ef4444" },
              hover: { y: 15, width: "100px", borderColor: "var(--brand)", backgroundColor: "rgba(0, 135, 81, 0.08)", color: "var(--brand)" }
            }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            style={{
              position: "absolute",
              height: "50px",
              borderRadius: "var(--radius-sm)",
              borderWidth: "1px",
              borderStyle: "solid",
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700 }}>PHY 101</span>
            <span style={{ fontSize: "8px", opacity: 0.8, marginTop: "2px", fontFamily: "monospace" }}>09:00 AM</span>
          </motion.div>
        </div>

        {/* Venue Column 2 */}
        <div style={{ position: "relative", paddingLeft: "4px" }}>
          <div style={{ fontSize: "8px", color: "var(--text-muted)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: "8px" }}>Hall B (LT2)</div>

          {/* Lecture Block B */}
          <motion.div
            variants={{
              initial: { x: -126, y: 30, width: "110px", borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.08)", color: "#ef4444" },
              hover: { x: 0, y: 15, width: "100px", borderColor: "var(--brand)", backgroundColor: "rgba(0, 135, 81, 0.08)", color: "var(--brand)" }
            }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            style={{
              position: "absolute",
              height: "50px",
              borderRadius: "var(--radius-sm)",
              borderWidth: "1px",
              borderStyle: "solid",
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              zIndex: 3,
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700 }}>MTH 101</span>
            <span style={{ fontSize: "8px", opacity: 0.8, marginTop: "2px", fontFamily: "monospace" }}>09:00 AM</span>
          </motion.div>
        </div>

        {/* Clean clash indicator line */}
        <motion.div
          variants={{
            initial: { opacity: 1, scale: 1 },
            hover: { opacity: 0, scale: 0.9 }
          }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            left: "85px",
            top: "30px",
            padding: "4px 8px",
            backgroundColor: "#7f1d1d",
            border: "1px solid #ef4444",
            color: "#ef4444",
            borderRadius: "3px",
            fontSize: "8px",
            fontWeight: 700,
            fontFamily: "monospace",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <AlertTriangle size={10} />
          CONFLICT: HALL_OVERLAP
        </motion.div>

        {/* Clean resolution indicator */}
        <motion.div
          variants={{
            initial: { opacity: 0, y: 8, scale: 0.95 },
            hover: { opacity: 1, y: 0, scale: 1 }
          }}
          transition={{ type: "spring", stiffness: 250, damping: 18 }}
          style={{
            position: "absolute",
            bottom: "0px",
            left: "50px",
            right: "0px",
            backgroundColor: "#062216",
            border: "1px solid var(--brand)",
            borderRadius: "3px",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 11,
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: "8px", fontFamily: "monospace", color: "var(--brand)", fontWeight: 700 }}>RESOLUTION: OK // SLOT_SHIFTED</span>
          <span style={{ fontSize: "8px", color: "var(--text-muted)" }}>0ms lag</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

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

      <style>{`
        @media (max-width: 991px) {
          .problem-blueprint { display: none !important; }
        }
      `}</style>

      {/* Background Blueprint - Schedule Chaos */}
      <div
        className="problem-blueprint"
        style={{
          position: "absolute",
          top: "15%",
          left: "3vw",
          width: "280px",
          height: "280px",
          opacity: 0.08,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <line x1="20" y1="20" x2="280" y2="20" stroke="var(--brand)" strokeWidth="1" />
          <line x1="20" y1="70" x2="280" y2="70" stroke="var(--brand)" strokeWidth="1" />
          <line x1="20" y1="120" x2="280" y2="120" stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="20" y1="170" x2="280" y2="170" stroke="var(--brand)" strokeWidth="1" />
          <line x1="20" y1="220" x2="280" y2="220" stroke="var(--brand)" strokeWidth="1" />

          <line x1="40" y1="20" x2="40" y2="220" stroke="var(--brand)" strokeWidth="1" />
          <line x1="100" y1="20" x2="100" y2="220" stroke="var(--brand)" strokeWidth="1" />
          <line x1="160" y1="20" x2="160" y2="220" stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="220" y1="20" x2="220" y2="220" stroke="var(--brand)" strokeWidth="1" strokeDasharray="8 4" />

          <circle cx="150" cy="120" r="60" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5 5" />
          <line x1="150" y1="120" x2="185" y2="85" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="150" y1="120" x2="110" y2="120" stroke="#ef4444" strokeWidth="1.5" />

          <circle cx="185" cy="85" r="4" fill="#ef4444" />
          <circle cx="110" cy="120" r="4" fill="#ef4444" />
          <circle cx="160" cy="90" r="5" fill="#ef4444" />
          <path d="M 150,80 L 170,100 L 130,100 Z" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="1" />
        </svg>
      </div>

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

          {/* Right column: Interactive illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <TimetableClashIllustration />
          </motion.div>
        </div>

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
                whileHover="hover"
                variants={{
                  hover: {
                    y: -4,
                    transition: { duration: 0.3, ease: "easeOut" },
                  },
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
                    variants={iconContainerVariants}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <motion.div
                      variants={iconVariants[problem.animationKey]}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={22} color="var(--brand)" strokeWidth={1.8} />
                    </motion.div>
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
