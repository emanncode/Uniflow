"use client";

import { useState } from "react";
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

const iconVariants: Record<string, Variants> = {
  bell: {
    hover: {
      rotate: [0, -18, 15, -12, 8, 0],
      transition: { duration: 0.5 },
    },
  },
  zap: {
    hover: {
      scale: [1, 1.28, 0.95, 1.08, 1],
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.45 },
    },
  },
  shield: {
    hover: {
      scale: 1.15,
      y: -2,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  },
  mapPin: {
    hover: {
      y: [0, -6, 2, -2, 0],
      transition: { duration: 0.5 },
    },
  },
  bookOpen: {
    hover: {
      scale: 1.15,
      rotate: -8,
      transition: { type: "spring", stiffness: 400, damping: 12 },
    },
  },
  users: {
    hover: {
      scale: 1.12,
      x: [-3, 3, -2, 2, 0],
      transition: { duration: 0.4 },
    },
  },
  clock: {
    hover: {
      rotate: 360,
      transition: { duration: 1.2, ease: "easeInOut" },
    },
  },
  barChart: {
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

export default function Features() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

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
            const isHovered = hoveredCard === i;

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
                    transition: { duration: 0.3, ease: "easeOut" },
                  },
                }}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  padding: "clamp(24px, 3vw, 32px)",
                  borderRadius: "var(--radius-sm)",
                  border: isHovered
                    ? "1px solid var(--brand)"
                    : "1px solid var(--border-primary)",
                  backgroundColor: isHovered
                    ? "#062216"
                    : "var(--bg-secondary)",
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: "16px",
                  cursor: "default",
                  position: "relative" as const,
                  overflow: "hidden",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: "var(--shadow-md)",
                }}
              >

                {/* icon */}
                <motion.div
                  variants={iconVariants[feature.animationKey]}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: isHovered
                      ? "rgba(0, 135, 81, 0.2)"
                      : "rgba(255,255,255,0.06)",
                    border: isHovered
                      ? "1px solid rgba(0, 135, 81, 0.3)"
                      : "1px solid var(--border-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.4s ease",
                  }}
                >
                  <Icon
                    size={22}
                    color={
                      isHovered ? "var(--brand)" : "var(--text-secondary)"
                    }
                    strokeWidth={1.8}
                  />
                </motion.div>

                {/* text */}
                <div>
                  <h3
                    style={{
                      fontSize: "clamp(14px, 1.6vw, 16px)",
                      fontWeight: 700,
                      color: "var(--text-primary)",
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
