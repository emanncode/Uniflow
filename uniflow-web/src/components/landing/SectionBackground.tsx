"use client";

import { motion } from "framer-motion";

interface SectionBackgroundProps {
  showWatermark?: boolean;
  y?: any;
}

export default function SectionBackground({
  showWatermark = true,
  y,
}: SectionBackgroundProps) {
  return (
    <>
      <motion.div
        style={{
          y,
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,220,150,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,220,150,0.02) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />

        {/* Radial glows */}
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "1000px",
            height: "600px",
            background:
              "radial-gradient(ellipse, var(--success-muted) 0%, transparent 60%)",
          }}
        />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "10%",
            left: "-5%",
            width: "500px",
            height: "400px",
            background:
              "radial-gradient(circle, var(--warning-muted) 0%, transparent 60%)",
          }}
        />
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          style={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, var(--info-muted) 0%, transparent 60%)",
          }}
        />
      </motion.div>

      {/* UNIFLOW watermark */}
      {showWatermark && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "clamp(120px, 20vw, 280px)",
            fontWeight: 900,
            color: "rgba(255,255,255,0.01)",
            letterSpacing: "-0.06em",
            pointerEvents: "none",
            userSelect: "none",
            whiteSpace: "nowrap",
            zIndex: 0,
          }}
        >
          UNIFLOW
        </div>
      )}
    </>
  );
}
