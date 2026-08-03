"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import UniflowLogo from "@/components/ui/UniflowLogo";
import { MenuIcon, MenuIconHandle } from "@/components/ui/Menu";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuIconRef = useRef<MenuIconHandle>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      menuIconRef.current?.startAnimation();
    } else {
      menuIconRef.current?.stopAnimation();
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Problem", href: "#problem" },
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: "24px",
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        padding: "0 24px",
        pointerEvents: "none",
      }}
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "1100px",
          height: "64px",
          padding: "0 24px",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-sm)",
          border: scrolled
            ? "1px solid var(--border-secondary)"
            : "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-md)",
          pointerEvents: "auto",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <UniflowLogo size={28} />
        </Link>

        {/* actions */}
        <Link href="/register" className="block">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            style={{
              padding: "10px 20px",
              fontSize: "13px",
              borderRadius: "var(--radius-sm)",
            }}
          >
            Get Started
          </motion.button>
        </Link>
      </motion.div>
    </nav>
  );
}
