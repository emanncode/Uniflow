"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import UniflowLogo from "@/components/ui/UniflowLogo";
import Image from "next/image";
import { TwitterIcon } from "@/components/ui/Twitter";
import { GithubIcon } from "@/components/ui/Github";
import { MailboxIcon } from "@/components/ui/MailBox";

const links = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ],
  Universities: [
    { label: "Register", href: "/register" },
  ],
  Company: [
    { label: "About", href: "/about" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Security", href: "/security" },
  ],
};

const socials = [
  { icon: TwitterIcon, href: "https://x.com/emanncode", label: "Twitter" },
  { icon: GithubIcon, href: "https://github.com/emanncode", label: "GitHub" },
  { icon: MailboxIcon, href: "mailto:contact@olajubajeifeoluwa93@gmail.com", label: "Email" },
];

export default function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        borderTop: "1px solid var(--border-primary)",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      {/* top gradient line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(0, 135, 81,0.4), transparent)",
        }}
      />

      <div className="container">
        {/* ── main footer ── */}
        <div
          style={{
            padding: "clamp(48px, 6vw, 80px) 0 48px",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
            gap: "clamp(32px, 4vw, 48px)",
          }}
        >
          {/* brand column */}
          <div style={{ gridColumn: "span 2" }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <UniflowLogo size={28} />
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  lineHeight: 1.75,
                  marginTop: "16px",
                  maxWidth: "260px",
                }}
              >
                The university timetable and campus intelligence platform. Built
                for every university, worldwide.
              </p>

              {/* socials */}
              <div className="flex flex-col items-start gap-4 mt-6">
                <div className="flex items-center justify-center gap-2">
                {socials.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: "var(--brand-muted)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={social.label}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-primary)",
                        backgroundColor: "var(--bg-hover)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all var(--transition)",
                        textDecoration: "none",
                      }}
                    >
                      <Icon size={15} color="var(--text-muted)" />
                    </motion.a>
                  );
                })}
                </div>
                <a
                  href="https://www.producthunt.com/products/uniflow-2?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-uniflow-1b790008-44cb-4ab9-8c37-a886df1180cd"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    alt="Uniflow - The campus always knew. Now your phone does too. | Product Hunt"
                    width={250}
                    height={54}
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1180285&amp;theme=light&amp;t=1782329958231"
                  />
                </a>
              </div>
            </motion.div>
          </div>

          {/* link columns */}
          {Object.entries(links).map(([category, items], i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  marginBottom: "16px",
                }}
              >
                {category}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      textDecoration: "none",
                      transition: "color var(--transition)",
                      fontWeight: 400,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--text-primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-muted)")
                    }
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <style>{`
          .footer-blueprint-main {
            width: clamp(140px, 20vw, 280px);
            height: clamp(60px, 10vw, 120px);
            opacity: 0.15;
          }
          .footer-blueprint-secondary, .footer-blueprint-tertiary {
            display: block;
            width: clamp(140px, 20vw, 280px);
            height: clamp(140px, 20vw, 280px);
            opacity: 0.15;
          }
          @media (min-width: 992px) {
            .footer-blueprint-main {
              width: 280px;
              height: 120px;
              opacity: 0.28;
            }
            .footer-blueprint-secondary, .footer-blueprint-tertiary {
              width: 280px;
              height: 280px;
              opacity: 0.28;
            }
          }
          @media (max-width: 991px) {
            .footer-blueprint-secondary, .footer-blueprint-tertiary {
              display: none !important;
            }
          }
        `}</style>

        {/* Line-Art Campus Silhouette in background */}
        <div
          className="footer-blueprint-main"
          style={{
            position: "absolute",
            bottom: "70px",
            right: "4vw",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              d="M10 120 V80 H30 V90 H40 V60 H70 V75 H80 V40 H110 V65 H120 V70 H130 V120"
              stroke="var(--brand)"
              strokeWidth="1.5"
            />
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.2, ease: "easeInOut", delay: 0.2 }}
              d="M130 120 V85 H150 V95 H165 V50 H195 V65 H205 V30 H235 V80 H245 V120"
              stroke="var(--brand)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
              d="M70 120 V90 C70 80, 110 80, 110 90 V120"
              stroke="var(--brand)"
              strokeWidth="1.5"
            />
            <motion.line
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              x1="0"
              y1="120"
              x2="280"
              y2="120"
              stroke="var(--brand)"
              strokeWidth="2"
              style={{ originX: 0 }}
            />
          </svg>
        </div>

        {/* Background Blueprint 2 - Connected Nodes & Global Network (Secondary) */}
        <div
          className="footer-blueprint-secondary"
          style={{
            position: "absolute",
            bottom: "70px",
            left: "4vw",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <circle cx="200" cy="200" r="180" stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="200" cy="200" r="140" stroke="var(--brand)" strokeWidth="1" />
            <circle cx="200" cy="200" r="80" stroke="var(--brand)" strokeWidth="1" strokeDasharray="8 4" />
            <line x1="20" y1="200" x2="380" y2="200" stroke="var(--brand)" strokeWidth="1" />
            <line x1="200" y1="20" x2="200" y2="380" stroke="var(--brand)" strokeWidth="1" />
            <path d="M 50,200 Q 200,100 350,200" stroke="var(--brand)" strokeWidth="1" />
            <path d="M 50,200 Q 200,300 350,200" stroke="var(--brand)" strokeWidth="1" />
            <path d="M 200,50 Q 100,200 200,350" stroke="var(--brand)" strokeWidth="1" />
            <path d="M 200,50 Q 300,200 200,350" stroke="var(--brand)" strokeWidth="1" />
            <circle cx="290" cy="110" r="5" fill="var(--brand)" />
            <circle cx="110" cy="290" r="5" fill="var(--brand)" />
            <circle cx="340" cy="200" r="4" fill="var(--brand)" />
            <circle cx="60" cy="200" r="4" fill="var(--brand)" />
            <circle cx="200" cy="200" r="6" fill="var(--brand)" />
          </svg>
        </div>

        {/* Background Blueprint 3 - Coordinates Compass (Tertiary) */}
        <div
          className="footer-blueprint-tertiary"
          style={{
            position: "absolute",
            bottom: "20px",
            right: "45vw",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <circle cx="150" cy="150" r="60" stroke="var(--brand)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="150" cy="150" r="40" stroke="var(--brand)" strokeWidth="1" />
            <line x1="150" y1="70" x2="150" y2="230" stroke="var(--brand)" strokeWidth="1" />
            <line x1="70" y1="150" x2="230" y2="150" stroke="var(--brand)" strokeWidth="1" />
            <path d="M 150,70 L 160,110 L 150,150 L 140,110 Z" fill="rgba(0, 135, 81, 0.1)" stroke="var(--brand)" strokeWidth="1" />
            <path d="M 150,150 L 160,190 L 150,230 L 140,190 Z" fill="rgba(0, 135, 81, 0.1)" stroke="var(--brand)" strokeWidth="1" />
          </svg>
        </div>

        {/* ── bottom bar ── */}
        <div
          style={{
            borderTop: "1px solid var(--border-primary)",
            padding: "24px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Uniflow. All rights reserved.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Built for universities worldwide
            </span>
            <span
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                backgroundColor: "var(--brand)",
                display: "inline-block",
                boxShadow: "0 0 6px var(--brand)",
              }}
            />
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              🇳🇬 Made in Nigeria
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
