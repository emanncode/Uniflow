"use client";

import { motion, Variants } from "framer-motion";
import {
  Bell,
  MapPin,
  Shield,
  Clock,
  BookOpen,
  Users,
  Zap,
  BarChart3,
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
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    color: "var(--text-secondary)",
  },
  hover: {
    backgroundColor: "rgba(0, 135, 81, 0.2)",
    color: "var(--brand)",
    transition: { duration: 0.3 },
  },
};

const iconVariants: Record<string, Variants> = {
  bell: {
    initial: { rotate: 0 },
    hover: {
      rotate: [0, -18, 15, -12, 8, 0],
      transition: { duration: 0.5 },
    },
  },
  zap: {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: [1, 1.28, 0.95, 1.08, 1],
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.45 },
    },
  },
  shield: {
    initial: { scale: 1, y: 0 },
    hover: {
      scale: 1.15,
      y: -2,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  },
  mapPin: {
    initial: { y: 0 },
    hover: {
      y: [0, -6, 2, -2, 0],
      transition: { duration: 0.5 },
    },
  },
  bookOpen: {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.15,
      rotate: -8,
      transition: { type: "spring", stiffness: 400, damping: 12 },
    },
  },
  users: {
    initial: { scale: 1, x: 0 },
    hover: {
      scale: 1.12,
      x: [-3, 3, -2, 2, 0],
      transition: { duration: 0.4 },
    },
  },
  clock: {
    initial: { rotate: 0 },
    hover: {
      rotate: 360,
      transition: { duration: 1.2, ease: "easeInOut" },
    },
  },
  barChart: {
    initial: { scaleY: 1 },
    hover: {
      scaleY: [1, 1.25, 0.9, 1.1, 1],
      transition: { duration: 0.5 },
    },
  },
};

const features = [
  {
    icon: Bell,
    animationKey: "bell" as const,
    title: "Real-time class updates",
    desc: "Canceled. Delayed. Moved. Students get push notifications the moment anything changes — no more WhatsApp chaos.",
    brand: false,
  },
  {
    icon: Zap,
    animationKey: "zap" as const,
    title: "Instant conflict detection",
    desc: "Before any timetable goes live, Uniflow checks every venue, lecturer, and student clash automatically.",
    brand: false,
  },
  {
    icon: Shield,
    animationKey: "shield" as const,
    title: "Role-based access control",
    desc: "Six roles, each with exactly the right permissions. University Admin manages the portal. Lecturers teach. Students learn.",
    brand: false,
  },
  {
    icon: MapPin,
    animationKey: "mapPin" as const,
    title: "Venue & time change requests",
    desc: "Lecturers request changes formally through the app. University Admin approves. Everything is tracked and recorded.",
    brand: false,
  },
  {
    icon: BookOpen,
    animationKey: "bookOpen" as const,
    title: "Course resource sharing",
    desc: "Lecturers upload materials. Students access notes, past questions and slides — all in one place.",
    brand: false,
  },
  {
    icon: Users,
    animationKey: "users" as const,
    title: "Multi-university support",
    desc: "One platform, every university. Each institution gets its own portal, subdomain and data — fully isolated.",
    brand: false,
  },
  {
    icon: Clock,
    animationKey: "clock" as const,
    title: "Smart timetable management",
    desc: "University Admin builds and publishes timetables. Changes flow down to every student automatically.",
    brand: false,
  },
  {
    icon: BarChart3,
    animationKey: "barChart" as const,
    title: "Admin oversight dashboard",
    desc: "University admins see everything — active classes, pending requests, resource uploads and more.",
    brand: false,
  },
];

const SyncIllustration = () => {
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
        REAL-TIME PROPAGATION MAP
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        {/* Source Hub Node */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid var(--brand)", backgroundColor: "#062216", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "8px", fontWeight: 700, color: "var(--brand)", fontFamily: "monospace" }}>HUB</span>
          </div>
          <span style={{ fontSize: "8px", color: "var(--text-secondary)", marginTop: "6px", fontFamily: "monospace" }}>ADMIN_PORTAL</span>
        </div>

        {/* Dotted Connection Lines */}
        <svg style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}>
          {/* Path to student device */}
          <path d="M 40,40 Q 150,-10 260,20" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" id="to-student" />
          {/* Path to lecturer device */}
          <path d="M 40,40 Q 150,90 260,60" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" id="to-lecturer" />
        </svg>

        {/* Animating Data Pulses */}
        <motion.div
          animate={{
            offsetDistance: ["0%", "100%"],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "var(--brand)",
            boxShadow: "0 0 6px var(--brand)",
            offsetPath: "path('M 40,40 Q 150,-10 260,20')",
          }}
        />

        <motion.div
          animate={{
            offsetDistance: ["0%", "100%"],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
            delay: 1.25,
          }}
          style={{
            position: "absolute",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "var(--brand)",
            boxShadow: "0 0 6px var(--brand)",
            offsetPath: "path('M 40,40 Q 150,90 260,60')",
          }}
        />

        {/* Target Devices */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "flex-end", zIndex: 2 }}>
          {/* Student App Node */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-primary)" }}>Student App</div>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: "7px", color: "var(--brand)", fontFamily: "monospace" }}
              >
                ● PUSH_SENT
              </motion.div>
            </div>
            <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "8px", fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace" }}>STUD</span>
            </div>
          </div>

          {/* Lecturer App Node */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-primary)" }}>Lecturer App</div>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                style={{ fontSize: "7px", color: "var(--brand)", fontFamily: "monospace" }}
              >
                ● PUSH_SENT
              </motion.div>
            </div>
            <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "8px", fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace" }}>LECT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Features() {
  return (
    <section
      id="features"
      style={{
        padding: "clamp(80px, 20vw, 120px) 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <SectionBackground />

      <style>{`
        @media (max-width: 991px) {
          .features-blueprint { display: none !important; }
        }
      `}</style>

      {/* Background Blueprint - Database Schema */}
      <div
        className="features-blueprint"
        style={{
          position: "absolute",
          top: "15%",
          right: "3vw",
          width: "280px",
          height: "280px",
          opacity: 0.08,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect x="110" y="20" width="80" height="40" rx="3" stroke="var(--brand)" strokeWidth="1.5" />
          <line x1="110" y1="40" x2="190" y2="40" stroke="var(--brand)" strokeWidth="1" />
          <text x="150" y="34" fill="var(--brand)" fontSize="8" textAnchor="middle" fontFamily="monospace">DB_HUB</text>

          <path d="M 150,60 L 150,120" stroke="var(--brand)" strokeWidth="1" />
          <path d="M 150,100 L 50,100 L 50,140" stroke="var(--brand)" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M 150,100 L 250,100 L 250,140" stroke="var(--brand)" strokeWidth="1" strokeDasharray="3 3" />

          <rect x="20" y="140" width="60" height="40" rx="3" stroke="var(--brand)" strokeWidth="1" />
          <text x="50" y="152" fill="var(--brand)" fontSize="6" textAnchor="middle" fontFamily="monospace">STUDENTS</text>
          <line x1="20" y1="158" x2="80" y2="158" stroke="var(--brand)" strokeWidth="0.5" />
          
          <rect x="120" y="120" width="60" height="40" rx="3" stroke="var(--brand)" strokeWidth="1" />
          <text x="150" y="132" fill="var(--brand)" fontSize="6" textAnchor="middle" fontFamily="monospace">COURSES</text>
          <line x1="120" y1="138" x2="180" y2="138" stroke="var(--brand)" strokeWidth="0.5" />

          <rect x="220" y="140" width="60" height="40" rx="3" stroke="var(--brand)" strokeWidth="1" />
          <text x="250" y="152" fill="var(--brand)" fontSize="6" textAnchor="middle" fontFamily="monospace">VENUE_MAP</text>
          <line x1="220" y1="158" x2="280" y2="158" stroke="var(--brand)" strokeWidth="0.5" />

          <circle cx="50" cy="220" r="3" stroke="var(--brand)" strokeWidth="1" />
          <circle cx="150" cy="200" r="3" stroke="var(--brand)" strokeWidth="1" />
          <circle cx="250" cy="220" r="3" stroke="var(--brand)" strokeWidth="1" />
          
          <path d="M 50,180 L 50,217" stroke="var(--brand)" strokeWidth="0.75" />
          <path d="M 150,160 L 150,197" stroke="var(--brand)" strokeWidth="0.75" />
          <path d="M 250,180 L 250,217" stroke="var(--brand)" strokeWidth="0.75" />
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
              What Uniflow Does
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
                    margin: "0 0 16px",
                  }}
                >
                  Everything your campus needs.{" "}
                  <span
                    style={{
                      color: "var(--brand)",
                      textShadow: "0 0 30px rgba(0, 135, 81,0.3)",
                    }}
                  >
                    Nothing it doesn&apos;t.
                  </span>
                </motion.h2>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                style={{
                  fontSize: "clamp(14px, 1.8vw, 17px)",
                  color: "var(--text-muted)",
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                Built specifically for universities — not adapted from generic
                tools. Every feature solves a real problem campuses face daily.
              </motion.p>
            </div>
          </motion.div>

          {/* Right column: Sync propagation diagram */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <SyncIllustration />
          </motion.div>
        </div>

        {/* ── features grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "16px",
          }}
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover="hover"
                variants={{
                  hover: {
                    y: -6,
                    borderColor: "var(--brand)",
                    backgroundColor: "#062216",
                    transition: { duration: 0.3, ease: "easeOut" },
                  },
                }}
                style={{
                  padding: "clamp(24px, 3vw, 32px)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-primary)",
                  backgroundColor: "var(--bg-secondary)",
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: "16px",
                  cursor: "default",
                  position: "relative" as const,
                  overflow: "hidden",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                {/* icon */}
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
                    variants={iconVariants[feature.animationKey]}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      size={22}
                      color="currentColor"
                      strokeWidth={1.8}
                    />
                  </motion.div>
                </motion.div>

                {/* text */}
                <div>
                  <h3
                    style={{
                      fontSize: "clamp(14px, 1.6vw, 16px)",
                      fontWeight: 700,
                      color: "var(--text-brand)",
                      margin: "0 0 10px",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      lineHeight: 1.75,
                      margin: 0,
                    }}
                  >
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
