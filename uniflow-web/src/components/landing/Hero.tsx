"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  Variants,
} from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Ticker from "@/components/hero/Ticker";
import { Caveat } from "next/font/google";
import { Bell, MapPin, Calendar, Globe } from "lucide-react";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const bellVariants: Variants = {
  hover: {
    rotate: [0, -15, 12, -10, 8, 0],
    transition: { duration: 0.5 },
  },
};

const pinVariants: Variants = {
  hover: {
    y: [0, -5, 2, -2, 0],
    transition: { duration: 0.5 },
  },
};

const calendarVariants: Variants = {
  hover: {
    scale: [1, 1.15, 1],
    rotate: [0, -5, 5, 0],
    transition: { duration: 0.5 },
  },
};

const globeVariants: Variants = {
  hover: {
    rotate: 360,
    transition: { duration: 2, ease: "linear", repeat: Infinity },
  },
};

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: mounted ? containerRef : undefined,
    offset: ["start start", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [0, 150]);
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
          paddingTop: "clamp(80px, 10vw, 120px)",
        }}
      >
        {/* Background Image with Parallax & Dark Overlays */}
        <motion.div
          style={{
            y: bgY,
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/hero-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            zIndex: 0,
          }}
        />
        {/* Grid pattern on top of background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,220,150,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,220,150,0.01) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        {/* Dark Vignette Overlay for Premium Readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10, 10, 11, 0.4) 0%, rgba(10, 10, 11, 0.7) 60%, rgba(10, 10, 11, 1) 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* main content */}
        <motion.div
          style={{
            opacity: heroOpacity,
            position: "relative",
            zIndex: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
            paddingBottom: "40px",
          }}
          className="container"
        >
          <div>
            {/* main headline */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                  fontSize: "clamp(48px, 7vw, 92px)",
                  fontWeight: 900,
                  lineHeight: 1.0,
                  letterSpacing: "-0.04em",
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                <motion.span
                  className={caveat.className}
                  style={{
                    display: "block",
                    fontSize: "clamp(54px, 8vw, 100px)",
                    color: "var(--brand)",
                    marginBottom: "-10px",
                    fontWeight: 400,
                  }}
                >
                  Your
                </motion.span>
                Campus, Synced.
              </motion.h1>
            </div>

            {/* subheadline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                fontSize: "clamp(12px, 1.5vw, 15px)",
                fontWeight: 700,
                lineHeight: 1.4,
                letterSpacing: "0.15em",
                color: "var(--text-secondary)",
                margin: "0 0 24px",
                textTransform: "uppercase",
              }}
            >
              Zero surprises. Every lecture. One platform.
            </motion.h2>

            {/* body */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{
                fontSize: "clamp(13px, 1.5vw, 15px)",
                color: "var(--text-muted)",
                lineHeight: 1.85,
                margin: "0 0 36px",
                maxWidth: "480px",
                borderLeft: "2px solid var(--brand-muted)",
                paddingLeft: "16px",
              }}
            >
              Class canceled? Timetable shifted? With Uniflow, you always know.
              One platform connecting lecture halls directly to your phone —
              from Nigeria to anywhere in the world.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
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
                    borderRadius: "var(--radius-sm)",
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
                    borderRadius: "var(--radius-sm)",
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

            {/* testimonial reviews */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                paddingTop: "20px",
                marginBottom: "40px",
                maxWidth: "600px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  color: "#fbbf24",
                  fontSize: "14px",
                }}
              >
                {"★".repeat(5)}
              </div>
              <p
                style={{
                  fontSize: "12.5px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                &ldquo;Uniflow saved me hours of showing up to empty halls. The
                instant notifications are a life saver.&rdquo;
              </p>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                — Chidi, Student at University of Ibadan
              </span>
            </motion.div>

            {/* Categories Navigation Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                width: "100%",
                backgroundColor: "rgba(10, 10, 11, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              {[
                {
                  title: "Class Alerts",
                  desc: "Instant notifications",
                  icon: <Bell size={22} style={{ color: "var(--brand)" }} />,
                  variants: bellVariants,
                },
                {
                  title: "Relocations",
                  desc: "Hall updates",
                  icon: <MapPin size={22} style={{ color: "var(--brand)" }} />,
                  variants: pinVariants,
                },
                {
                  title: "Timetables",
                  desc: "Personal schedule",
                  icon: (
                    <Calendar size={22} style={{ color: "var(--brand)" }} />
                  ),
                  variants: calendarVariants,
                },
                {
                  title: "Student Portals",
                  desc: "Access control",
                  icon: <Globe size={22} style={{ color: "var(--brand)" }} />,
                  variants: globeVariants,
                },
              ].map((cat, i) => (
                <motion.div
                  key={cat.title}
                  whileHover="hover"
                  style={{
                    padding: "20px 24px",
                    borderRight:
                      i < 3 ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <motion.div
                    variants={cat.variants}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cat.icon}
                  </motion.div>
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {cat.title}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        marginTop: "2px",
                      }}
                    >
                      {cat.desc}
                    </div>
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
