"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Ticker from "@/components/hero/Ticker";
import SectionBackground from "@/components/landing/SectionBackground";

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: mounted ? containerRef : undefined,
    offset: ["start start", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const bgY = useSpring(rawY, { stiffness: 60, damping: 20 });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleMouse = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div ref={containerRef}>
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "clamp(40px, 6vw, 80px)",
        }}
      >
        <SectionBackground y={bgY} />

        {/* main content */}
        <motion.div
          style={{
            opacity: heroOpacity,
            position: "relative",
            zIndex: 1,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
          }}
          className="container"
        >
          {" "}
          <div>
            {/* eyebrow */}
            <div style={{ overflow: "hidden", marginBottom: "8px" }}>center
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  display: "block",
                  fontSize: "clamp(11px, 1.2vw, 13px)",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                }}
              >
                For universities worldwide
              </motion.span>
            </div>

            {/* headline lines */}
            {[
              { text: "No more", color: "var(--text-primary)" },
              { text: "showing up", color: "var(--text-primary)" },
              { text: "to empty halls.", color: "var(--brand)", glow: true },
            ].map((line, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <motion.h1
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.2 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    fontSize: "clamp(42px, 6vw, 80px)",
                    fontWeight: 900,
                    lineHeight: 1.0,
                    letterSpacing: "-0.04em",
                    color: line.color,
                    margin: 0,
                    textShadow: line.glow
                      ? "0 0 40px rgba(110,231,183,0.25)"
                      : "none",
                  }}
                >
                  {line.text}
                </motion.h1>
              </div>
            ))}

            <div style={{ height: "20px" }} />

            {/* subheadline */}
            <div style={{ overflow: "hidden" }}>
              <motion.h2
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  fontSize: "clamp(16px, 2.2vw, 22px)",
                  fontWeight: 500,
                  lineHeight: 1.4,
                  letterSpacing: "-0.02em",
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                The campus always knew.{" "}
                <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                  Now your phone does too.
                </span>
              </motion.h2>
            </div>

            {/* body */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              style={{
                fontSize: "clamp(13px, 1.5vw, 15px)",
                color: "var(--text-muted)",
                lineHeight: 1.85,
                margin: "20px 0 36px",
                maxWidth: "440px",
                borderLeft: "2px solid var(--brand-muted)",
                paddingLeft: "16px",
              }}
            >
              Class canceled. Did you know? With Uniflow, you would. One
              platform. Every lecture. Zero surprises — from{" "}
              <strong style={{ color: "var(--text-secondary)" }}>
                Nigeria
              </strong>{" "}
              to{" "}
              <strong style={{ color: "var(--text-secondary)" }}>
                anywhere in the world.
              </strong>
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginBottom: "48px",
              }}
            >
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "var(--shadow-brand)" }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                  style={{
                    padding: "15px 32px",
                    fontSize: "14px",
                    fontWeight: 700,
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--brand)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.4s var(--transition)",
                  }}
                >
                  Register Your University →
                </motion.button>
              </Link>
              <Link href="#how-it-works" style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "var(--bg-hover)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-btn"
                  style={{
                    padding: "15px 32px",
                    fontSize: "14px",
                    fontWeight: 700,
                    borderRadius: "var(--radius-lg)",
                    border: "1.5px solid var(--border-secondary)",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    color: "var(--text-primary)",
                    backdropFilter: "blur(10px)",
                    cursor: "pointer",
                    transition: "all 0.4s var(--transition)",
                  }}
                >
                  See how it works
                </motion.button>
              </Link>
            </motion.div>

            {/* stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1px",
                backgroundColor: "var(--border-primary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
              }}
            >
              {[
                { value: "1", unit: "app", label: "all universities" },
                { value: "6", unit: "roles", label: "access control" },
                { value: "0", unit: "chaos", label: "missed classes" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + i * 0.1 }}
                  style={{
                    padding: "18px 12px",
                    backgroundColor: "var(--bg-card)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(22px, 3vw, 32px)",
                      fontWeight: 900,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      color: "var(--text-primary)",
                    }}
                  >
                    {stat.value}
                    <span
                      style={{
                        color: "var(--brand)",
                        fontSize: "0.55em",
                        marginLeft: "2px",
                        fontWeight: 700,
                      }}
                    >
                      {stat.unit}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      marginTop: "5px",
                      fontWeight: 500,
                    }}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
        <Ticker />
      </section>
    </div>
  );
}
