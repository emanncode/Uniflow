"use client";

import { motion } from "framer-motion";

interface SectionBackgroundProps {
  showWatermark?: boolean;
  y?: any;
}

export default function SectionBackground({
  showWatermark = false,
  y,
}: SectionBackgroundProps) {
  return (
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
            "linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.8,
        }}
      />
    </motion.div>
  );
}
