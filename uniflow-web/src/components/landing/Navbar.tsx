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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Problem", href: "#problem" },
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <>
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
          <Link href="/" style={{ textDecoration: "none", zIndex: 101 }}>
            <UniflowLogo size={28} />
          </Link>

          {/* desktop navlinks */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  const id = link.href.replace("#", "");
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm font-medium transition-colors hover:text-white"
                style={{
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <motion.span
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  style={{ display: "inline-block" }}
                >
                  {link.name}
                </motion.span>
              </a>
            ))}
          </div>

          {/* actions & hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* desktop action */}
            <div className="hidden md:block">
              <Link href="/register" style={{ textDecoration: "none" }}>
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
            </div>

            {/* mobile menu icon toggle */}
            <div className="block md:hidden" style={{ zIndex: 101 }}>
              <MenuIcon
                ref={menuIconRef}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white cursor-pointer hover:opacity-80 transition-opacity"
                size={24}
              />
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(8, 8, 8, 0.95)",
              backdropFilter: "blur(12px)",
              zIndex: 90,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              paddingTop: "120px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "28px",
                alignItems: "center",
                width: "100%",
              }}
            >
              {navLinks.map((link, index) => {
                // Alternating slide direction: left for even indices, right for odd indices
                const direction = index % 2 === 0 ? -1 : 1;
                return (
                  <motion.div
                    key={link.name}
                    initial={{ x: direction * 120, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction * 120, opacity: 0 }}
                    transition={{
                      type: "spring",
                      damping: 20,
                      stiffness: 110,
                      delay: index * 0.08,
                    }}
                  >
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        const id = link.href.replace("#", "");
                        setTimeout(() => {
                          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      }}
                      style={{
                        fontSize: "26px",
                        fontWeight: "600",
                        color: "var(--text-primary)",
                        textDecoration: "none",
                        letterSpacing: "-0.02em",
                        transition: "color 0.2s",
                        cursor: "pointer",
                      }}
                      className="hover:text-brand"
                    >
                      {link.name}
                    </a>
                  </motion.div>
                );
              })}

              {/* Get Started Button for Mobile */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 100,
                  delay: navLinks.length * 0.08,
                }}
                style={{ marginTop: "24px", width: "100%", maxWidth: "200px" }}
              >
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ textDecoration: "none", width: "100%" }}
                >
                  <button
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "14px 28px",
                      fontSize: "15px",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: "600",
                    }}
                  >
                    Get Started
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
