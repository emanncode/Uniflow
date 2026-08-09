"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import UniflowLogo from "@/components/ui/UniflowLogo";
import ThemeToggle from "@/components/ThemeToggle";
import StepIndicator from "@/components/register/StepIndicator";
import FieldWrapper from "@/components/register/FieldWrapper";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Users,
  User,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { validateAndNormalizeEmail } from "@/lib/email";
import { Caveat } from "next/font/google";
import { universityPortalHost, ensureAbsoluteUrl } from "@/lib/domain";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const UniversityBlueprints = () => (
  <>
    <style>{`
      @keyframes float-1 {
        0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
        50% { transform: translateY(-8px) scale(1.01) rotate(1deg); }
      }
      @keyframes float-2 {
        0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
        50% { transform: translateY(8px) scale(0.99) rotate(-1deg); }
      }
      @keyframes float-3 {
        0%, 100% { transform: translateX(0px) translateY(0px); }
        50% { transform: translateX(-5px) translateY(-5px); }
      }
      .blueprint-bg-item {
        opacity: var(--blueprint-opacity, 0.85);
        transition: opacity 0.4s ease, transform 0.4s ease;
        pointer-events: none;
        z-index: 0;
      }
      .blueprint-bg-item:hover {
        opacity: var(--blueprint-hover-opacity, 1.0);
      }
    `}</style>

    {/* 1. Graduation Cap (Top Left) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        top: "3%",
        left: "3%",
        width: "clamp(100px, 15vw, 240px)",
        height: "clamp(100px, 15vw, 240px)",
        animation: "float-1 10s ease-in-out infinite",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <path
          d="M 150,50 L 250,100 L 150,150 L 50,100 Z"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <path
          d="M 100,125 L 100,180 C 100,200 200,200 200,180 L 200,125"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <path
          d="M 210,110 L 250,160 L 250,220"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <circle cx="250" cy="220" r="4" fill="var(--brand, #008751)" />
        <text
          x="150"
          y="85"
          fill="var(--brand, #008751)"
          fontSize="8"
          textAnchor="middle"
          fontFamily="monospace"
        >
          GRAD_CAP
        </text>
      </svg>
    </div>

    {/* 2. Open Book (Top Right) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        top: "4%",
        right: "3%",
        width: "clamp(90px, 14vw, 220px)",
        height: "clamp(90px, 14vw, 220px)",
        animation: "float-2 12s ease-in-out infinite",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <path
          d="M 150,220 C 120,200 60,200 30,220 L 30,80 C 60,60 120,60 150,80 C 180,60 240,60 270,80 L 270,220 C 240,200 180,200 150,220 Z"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <path
          d="M 150,80 L 150,220"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <path
          d="M 50,105 L 130,105"
          stroke="var(--brand, #008751)"
          strokeWidth="0.75"
          strokeDasharray="2 2"
        />
        <path
          d="M 50,135 L 130,135"
          stroke="var(--brand, #008751)"
          strokeWidth="0.75"
          strokeDasharray="2 2"
        />
        <path
          d="M 170,105 L 250,105"
          stroke="var(--brand, #008751)"
          strokeWidth="0.75"
          strokeDasharray="2 2"
        />
        <path
          d="M 170,135 L 250,135"
          stroke="var(--brand, #008751)"
          strokeWidth="0.75"
          strokeDasharray="2 2"
        />
        <text
          x="150"
          y="50"
          fill="var(--brand, #008751)"
          fontSize="8"
          textAnchor="middle"
          fontFamily="monospace"
        >
          LIB_BOOK
        </text>
      </svg>
    </div>

    {/* 3. Trophy Achievement (Bottom Left) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        bottom: "3%",
        left: "3%",
        width: "clamp(100px, 15vw, 230px)",
        height: "clamp(100px, 15vw, 230px)",
        animation: "float-2 11s ease-in-out infinite",
        animationDelay: "1s",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <path
          d="M 90,80 L 210,80 L 210,140 C 210,180 180,200 150,200 C 120,200 90,180 90,140 Z"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <path
          d="M 150,200 L 150,240"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <path
          d="M 110,240 L 190,240"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <path
          d="M 90,100 H 60 C 50,100 50,140 60,140 H 90"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <path
          d="M 210,100 H 240 C 250,100 250,140 240,140 H 210"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <text
          x="150"
          y="65"
          fill="var(--brand, #008751)"
          fontSize="8"
          textAnchor="middle"
          fontFamily="monospace"
        >
          ACHIEVEMENT
        </text>
      </svg>
    </div>

    {/* 4. University Hall Columns (Bottom Right) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        bottom: "4%",
        right: "3%",
        width: "clamp(90px, 14vw, 220px)",
        height: "clamp(90px, 14vw, 220px)",
        animation: "float-1 13s ease-in-out infinite",
        animationDelay: "0.5s",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <path
          d="M 40,240 H 260 M 40,220 H 260 M 60,80 L 150,30 L 240,80 Z"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <rect
          x="75"
          y="100"
          width="20"
          height="120"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <rect
          x="115"
          y="100"
          width="20"
          height="120"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <rect
          x="165"
          y="100"
          width="20"
          height="120"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <rect
          x="205"
          y="100"
          width="20"
          height="120"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <text
          x="150"
          y="270"
          fill="var(--brand, #008751)"
          fontSize="8"
          textAnchor="middle"
          fontFamily="monospace"
        >
          FACULTY_HALL
        </text>
      </svg>
    </div>

    {/* 5. Atom Science (Middle Left) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        top: "28%",
        left: "-4%",
        width: "clamp(80px, 12vw, 180px)",
        height: "clamp(80px, 12vw, 180px)",
        animation: "float-3 9s ease-in-out infinite",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <ellipse
          cx="150"
          cy="150"
          rx="110"
          ry="40"
          transform="rotate(30 150 150)"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <ellipse
          cx="150"
          cy="150"
          rx="110"
          ry="40"
          transform="rotate(-30 150 150)"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <circle
          cx="150"
          cy="150"
          r="15"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <circle cx="210" cy="85" r="4" fill="var(--brand, #008751)" />
        <text
          x="150"
          y="25"
          fill="var(--brand, #008751)"
          fontSize="8"
          textAnchor="middle"
          fontFamily="monospace"
        >
          SCIENCE_DEPT
        </text>
      </svg>
    </div>

    {/* 6. Globe Geography (Middle Right) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        top: "25%",
        right: "-4%",
        width: "clamp(80px, 12vw, 180px)",
        height: "clamp(80px, 12vw, 180px)",
        animation: "float-3 10s ease-in-out infinite",
        animationDelay: "1.5s",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <circle
          cx="150"
          cy="150"
          r="90"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <ellipse
          cx="150"
          cy="150"
          rx="90"
          ry="30"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <line
          x1="60"
          y1="150"
          x2="240"
          y2="150"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
        <line
          x1="150"
          y1="60"
          x2="150"
          y2="240"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
        <text
          x="150"
          y="35"
          fill="var(--brand, #008751)"
          fontSize="8"
          textAnchor="middle"
          fontFamily="monospace"
        >
          GLOBAL_STUDIES
        </text>
      </svg>
    </div>

    {/* 7. Certificate Diploma (Bottom Middle Left) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        bottom: "28%",
        left: "-4%",
        width: "clamp(80px, 12vw, 180px)",
        height: "clamp(80px, 12vw, 180px)",
        animation: "float-1 8s ease-in-out infinite",
        animationDelay: "2s",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <rect
          x="40"
          y="50"
          width="220"
          height="170"
          rx="4"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <rect
          x="52"
          y="62"
          width="196"
          height="146"
          rx="2"
          stroke="var(--brand, #008751)"
          strokeWidth="0.75"
          strokeDasharray="3 3"
        />
        <text
          x="150"
          y="100"
          fill="var(--brand, #008751)"
          fontSize="12"
          textAnchor="middle"
          fontFamily="serif"
          fontWeight="bold"
        >
          DIPLOMA
        </text>
        <line
          x1="80"
          y1="135"
          x2="220"
          y2="135"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <circle
          cx="150"
          cy="170"
          r="12"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
      </svg>
    </div>

    {/* 8. Timetable Schedule (Bottom Middle Right) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        bottom: "25%",
        right: "-4%",
        width: "clamp(80px, 12vw, 180px)",
        height: "clamp(80px, 12vw, 180px)",
        animation: "float-2 9s ease-in-out infinite",
        animationDelay: "1s",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <rect
          x="50"
          y="60"
          width="200"
          height="170"
          rx="6"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <line
          x1="50"
          y1="100"
          x2="250"
          y2="100"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <circle
          cx="90"
          cy="80"
          r="6"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
        <circle
          cx="210"
          cy="80"
          r="6"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
        <line
          x1="100"
          y1="130"
          x2="200"
          y2="130"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <line
          x1="100"
          y1="160"
          x2="200"
          y2="160"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <text
          x="150"
          y="45"
          fill="var(--brand, #008751)"
          fontSize="8"
          textAnchor="middle"
          fontFamily="monospace"
        >
          TIMETABLE
        </text>
      </svg>
    </div>

    {/* 9. Innovate Lightbulb (Top Center-Left) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        top: "14%",
        left: "25%",
        width: "clamp(70px, 10vw, 150px)",
        height: "clamp(70px, 10vw, 150px)",
        animation: "float-2 11s ease-in-out infinite",
        animationDelay: "3s",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <path
          d="M 150,220 C 130,220 100,195 100,140 C 100,90 140,70 150,70 C 160,70 200,90 200,140 C 200,195 170,220 150,220 Z"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <rect
          x="130"
          y="220"
          width="40"
          height="15"
          rx="2"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <path
          d="M 150,100 L 150,140 M 130,120 L 170,120"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text
          x="150"
          y="45"
          fill="var(--brand, #008751)"
          fontSize="8"
          textAnchor="middle"
          fontFamily="monospace"
        >
          INNOVATE
        </text>
      </svg>
    </div>

    {/* 10. Student Cap Portrait (Top Center-Right) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        top: "10%",
        right: "24%",
        width: "clamp(70px, 10vw, 150px)",
        height: "clamp(70px, 10vw, 150px)",
        animation: "float-1 8s ease-in-out infinite",
        animationDelay: "1.5s",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <circle
          cx="150"
          cy="110"
          r="40"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <path
          d="M 80,220 C 80,180 110,160 150,160 C 190,160 220,180 220,220 Z"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <text
          x="150"
          y="30"
          fill="var(--brand, #008751)"
          fontSize="8"
          textAnchor="middle"
          fontFamily="monospace"
        >
          STUDENTS
        </text>
      </svg>
    </div>

    {/* 11. Honors Ribbon (Bottom Center-Left) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        bottom: "14%",
        left: "22%",
        width: "clamp(70px, 10vw, 160px)",
        height: "clamp(70px, 10vw, 160px)",
        animation: "float-3 10s ease-in-out infinite",
        animationDelay: "2.5s",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <circle
          cx="150"
          cy="110"
          r="50"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <path
          d="M 135,155 L 115,240 L 150,220 L 185,240 L 165,155"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <text
          x="150"
          y="45"
          fill="var(--brand, #008751)"
          fontSize="8"
          textAnchor="middle"
          fontFamily="monospace"
        >
          HONORS
        </text>
      </svg>
    </div>

    {/* 12. Ruler & Compass (Bottom Center-Right) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        bottom: "10%",
        right: "24%",
        width: "clamp(70px, 10vw, 150px)",
        height: "clamp(70px, 10vw, 150px)",
        animation: "float-3 9s ease-in-out infinite",
        animationDelay: "0.5s",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <path
          d="M 150,50 L 100,210 M 150,50 L 200,210"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <rect
          x="50"
          y="220"
          width="200"
          height="20"
          rx="2"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <line
          x1="110"
          y1="220"
          x2="110"
          y2="235"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
        <line
          x1="170"
          y1="220"
          x2="170"
          y2="235"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
        <text
          x="150"
          y="270"
          fill="var(--brand, #008751)"
          fontSize="8"
          textAnchor="middle"
          fontFamily="monospace"
        >
          ENGINEERING
        </text>
      </svg>
    </div>

    {/* 13. Compass Logo Edge (Top Center Edge) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        top: "1.5%",
        left: "44%",
        width: "clamp(60px, 8vw, 130px)",
        height: "clamp(60px, 8vw, 130px)",
        animation: "float-1 9s ease-in-out infinite",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <circle
          cx="150"
          cy="150"
          r="50"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <circle
          cx="150"
          cy="150"
          r="20"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
      </svg>
    </div>

    {/* 14. Global Node Map (Bottom Center Edge) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        bottom: "1.5%",
        left: "44%",
        width: "clamp(60px, 8vw, 130px)",
        height: "clamp(60px, 8vw, 130px)",
        animation: "float-2 10s ease-in-out infinite",
        animationDelay: "1s",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <circle
          cx="100"
          cy="100"
          r="10"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
        <circle
          cx="200"
          cy="100"
          r="10"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
        <circle
          cx="150"
          cy="200"
          r="15"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
        <line
          x1="100"
          y1="110"
          x2="150"
          y2="185"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <line
          x1="200"
          y1="110"
          x2="150"
          y2="185"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
      </svg>
    </div>

    {/* 15. Mini Beaker Flask (Middle Left Gap) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        top: "44%",
        left: "20%",
        width: "clamp(60px, 8vw, 120px)",
        height: "clamp(60px, 8vw, 120px)",
        animation: "float-3 12s ease-in-out infinite",
        animationDelay: "2s",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <path
          d="M 120,80 H 180 M 140,80 V 130 L 90,220 H 210 L 160,130 V 80"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <line
          x1="110"
          y1="180"
          x2="190"
          y2="180"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      </svg>
    </div>

    {/* 16. Stacked Books (Middle Right Gap) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        top: "44%",
        right: "20%",
        width: "clamp(60px, 8vw, 120px)",
        height: "clamp(60px, 8vw, 120px)",
        animation: "float-3 8s ease-in-out infinite",
        animationDelay: "0.5s",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <rect
          x="60"
          y="80"
          width="140"
          height="30"
          rx="2"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
        <rect
          x="80"
          y="115"
          width="140"
          height="35"
          rx="2"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
        <rect
          x="70"
          y="155"
          width="150"
          height="40"
          rx="2"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
      </svg>
    </div>

    {/* 17. DNA Helix (Bottom Left Gap) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        bottom: "44%",
        left: "20%",
        width: "clamp(60px, 8vw, 120px)",
        height: "clamp(60px, 8vw, 120px)",
        animation: "float-2 11s ease-in-out infinite",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <path
          d="M 100,60 Q 150,150 200,240 M 200,60 Q 150,150 100,240"
          stroke="var(--brand, #008751)"
          strokeWidth="1.5"
        />
        <line
          x1="110"
          y1="90"
          x2="190"
          y2="90"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <line
          x1="125"
          y1="120"
          x2="175"
          y2="120"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <line
          x1="125"
          y1="180"
          x2="175"
          y2="180"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
        <line
          x1="110"
          y1="210"
          x2="190"
          y2="210"
          stroke="var(--brand, #008751)"
          strokeWidth="1"
        />
      </svg>
    </div>

    {/* 18. Radar Compass (Bottom Right Gap) */}
    <div
      className="blueprint-bg-item absolute"
      style={{
        bottom: "44%",
        right: "20%",
        width: "clamp(60px, 8vw, 120px)",
        height: "clamp(60px, 8vw, 120px)",
        animation: "float-1 9s ease-in-out infinite",
        animationDelay: "1.5s",
      }}
    >
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <circle
          cx="150"
          cy="150"
          r="60"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
        <path
          d="M 150,110 L 165,150 L 150,190 L 135,150 Z"
          stroke="var(--brand, #008751)"
          strokeWidth="1.25"
        />
      </svg>
    </div>
  </>
);

export const dynamic = "force-dynamic";

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
  "Canada",
  "Other",
];

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

type Step = 1 | 2;

interface FormData {
  university_name: string;
  short_name: string;
  official_email: string;
  phone: string;
  country: string;
  state: string;
  website: string;
  estimated_students: string;
  contact_person_name: string;
  contact_person_role: string;
  agreed: boolean;
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({
    university_name: "",
    short_name: "",
    official_email: "",
    phone: "",
    country: "Nigeria",
    state: "",
    website: "",
    estimated_students: "",
    contact_person_name: "",
    contact_person_role: "",
    agreed: false,
  });

  const update = (key: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const formatShortName = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9]/g, "");

  const validateStep1 = () => {
    if (!form.university_name.trim()) return "University name is required";
    if (!form.short_name.trim()) return "Short name is required";
    if (form.short_name.length < 2)
      return "Short name must be at least 2 characters";
    if (!form.official_email.trim()) return "Official email is required";

    const emailCheck = validateAndNormalizeEmail(form.official_email);
    if (!emailCheck.valid)
      return emailCheck.error || "Enter a valid email address";

    if (!form.country) return "Country is required";
    return "";
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }

    // Apply domain correction so summary + submission use the fixed value
    const emailCheck = validateAndNormalizeEmail(form.official_email);
    if (emailCheck.wasCorrected) {
      update("official_email", emailCheck.normalized);
    }

    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.contact_person_name.trim()) {
      setError("Contact person name is required");
      return;
    }
    if (!form.agreed) {
      setError("Please agree to the terms to continue");
      return;
    }

    setLoading(true);
    setError("");

    // check if short name already taken
    const { data: existing } = await supabase
      .from("university_registrations")
      .select("id")
      .eq("short_name", form.short_name)
      .single();

    if (existing) {
      setError(
        `The short name "${form.short_name}" is already taken. Please choose another.`,
      );
      setLoading(false);
      return;
    }

    const emailCheck = validateAndNormalizeEmail(form.official_email);
    if (!emailCheck.valid) {
      setError(emailCheck.error || "Enter a valid email address");
      setLoading(false);
      return;
    }
    const finalOfficialEmail = emailCheck.normalized;

    const { error: insertError } = await supabase
      .from("university_registrations")
      .insert({
        university_name: form.university_name.trim(),
        short_name: form.short_name.trim(),
        official_email: finalOfficialEmail,
        phone: form.phone.trim() || null,
        country: form.country,
        state: form.state || null,
        website: ensureAbsoluteUrl(form.website) || null,
        estimated_students: form.estimated_students
          ? parseInt(form.estimated_students)
          : null,
        contact_person_name: form.contact_person_name.trim(),
        contact_person_role: form.contact_person_role.trim() || null,
        status: "pending",
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    await fetch("/api/send-registration-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: finalOfficialEmail,
        university_name: form.university_name.trim(),
      }),
    });

    setSubmitted(true);
    setLoading(false);
  };

  // ── success screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--bg-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <UniversityBlueprints />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, var(--brand-muted) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            textAlign: "center",
            maxWidth: "480px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "var(--brand-subtle)",
              border: "1px solid var(--border-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
              boxShadow: "var(--shadow-brand)",
            }}
          >
            <CheckCircle2 size={36} color="var(--brand)" strokeWidth={1.5} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "var(--text-primary)",
              margin: "0 0 16px",
            }}
          >
            Application submitted!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              fontSize: "15px",
              color: "var(--text-muted)",
              lineHeight: 1.75,
              margin: "0 0 12px",
            }}
          >
            We&apos;ve received your registration for{" "}
            <strong style={{ color: "var(--text-secondary)" }}>
              {form.university_name}
            </strong>
            .
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              lineHeight: 1.75,
              margin: "0 0 40px",
            }}
          >
            Our team will review your application and get back to you at{" "}
            <strong style={{ color: "var(--text-secondary)" }}>
              {form.official_email}
            </strong>{" "}
            within 48 hours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              padding: "16px 20px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--brand-subtle)",
              border: "1px solid var(--border-brand)",
              marginBottom: "32px",
              fontSize: "13px",
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}
          >
            Your portal will be available at{" "}
            <strong style={{ color: "var(--brand)", fontFamily: "monospace" }}>
              {universityPortalHost(form.short_name)}
            </strong>{" "}
            once approved.
          </motion.div>

          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{
                padding: "14px 32px",
                fontSize: "14px",
                borderRadius: "var(--radius-lg)",
              }}
            >
              Back to home
            </motion.button>
          </Link>
        </motion.div>
      </main>
    );
  }

  // ── main form ───────────────────────────────────────────────
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <UniversityBlueprints />
      {/* background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--bg-hover) 1px, transparent 1px), linear-gradient(90deg, var(--bg-hover) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "500px",
          background:
            "radial-gradient(ellipse, var(--brand-subtle) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* navbar */}
      <nav
        className="glass-nav"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        ><
          ThemeToggle />
        </div>
      </nav>

      {/* content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(32px, 5vw, 60px) 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ width: "100%", maxWidth: "560px" }}>
          {/* header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: "40px" }}
          >
            {/* back button */}
            <div style={{ marginBottom: "24px" }}>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "color var(--transition)",
                }}
                className="hover:text-brand group"
              >
                <ChevronLeft
                  size={16}
                  style={{ transition: "transform var(--transition)" }}
                  className="group-hover:-translate-x-1"
                />
                <span>Back</span>
              </Link>
            </div>
            <div
              className={caveat.className}
              style={{
                display: "block",
                fontSize: "clamp(20px, 4vw, 30px)",
                fontWeight: 700,
                color: "var(--brand)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              University Registration
            </div>
            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: "var(--text-primary)",
                margin: "0 0 10px",
              }}
            >
              Bring your university{" "}
              <span style={{ color: "var(--brand)" }}>to Uniflow.</span>
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Fill out the form below. We&apos;ll review your application and
              set up your portal within 48 hours.
            </p>
          </motion.div>

          {/* step indicator */}
          <StepIndicator step={step} />

          {/* form card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: step === 1 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: step === 1 ? 20 : -20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                backgroundColor: "var(--bg-card)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-xl)",
                padding: "clamp(24px, 4vw, 40px)",
              }}
            >
              {error && (
                <div className="alert-error" style={{ marginBottom: "24px" }}>
                  {error}
                </div>
              )}

              {step === 1 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <FieldWrapper label="University Full Name *">
                    <div style={{ position: "relative" }}>
                      <Building2
                        size={16}
                        color="var(--text-muted)"
                        style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Adekunle Ajasin University, Akungba-Akoko"
                        value={form.university_name}
                        onChange={(e) =>
                          update("university_name", e.target.value)
                        }
                        style={{ paddingLeft: "40px" }}
                      />
                    </div>
                  </FieldWrapper>

                  <FieldWrapper
                    label="Short Name *"
                    hint={
                      form.short_name
                        ? `Your portal will be: ${universityPortalHost(form.short_name)}`
                        : "Lowercase letters and numbers only. This becomes your subdomain."
                    }
                  >
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. aaua"
                        value={form.short_name}
                        onChange={(e) =>
                          update("short_name", formatShortName(e.target.value))
                        }
                        style={{
                          fontFamily: "monospace",
                          borderColor: form.short_name
                            ? "var(--border-brand)"
                            : undefined,
                        }}
                      />
                      {form.short_name && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "10px",
                            fontWeight: 600,
                            color: "var(--brand)",
                            backgroundColor: "var(--brand-muted)",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            border: "1px solid var(--border-brand)",
                            pointerEvents: "none",
                          }}
                        >
                          {universityPortalHost(form.short_name)}
                        </motion.div>
                      )}
                    </div>
                  </FieldWrapper>

                  <FieldWrapper label="Official University Email *">
                    <div style={{ position: "relative" }}>
                      <Mail
                        size={16}
                        color="var(--text-muted)"
                        style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        type="email"
                        className="input"
                        placeholder="e.g. registrar@aaua.edu.xyz"
                        value={form.official_email}
                        onChange={(e) =>
                          update("official_email", e.target.value)
                        }
                        style={{ paddingLeft: "40px" }}
                      />
                    </div>
                  </FieldWrapper>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <FieldWrapper label="Phone">
                      <div style={{ position: "relative" }}>
                        <Phone
                          size={16}
                          color="var(--text-muted)"
                          style={{
                            position: "absolute",
                            left: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                          }}
                        />
                        <input
                          type="tel"
                          className="input"
                          placeholder="+234 800 000 0000"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          style={{ paddingLeft: "40px" }}
                        />
                      </div>
                    </FieldWrapper>

                    <FieldWrapper label="Estimated Students">
                      <div style={{ position: "relative" }}>
                        <Users
                          size={16}
                          color="var(--text-muted)"
                          style={{
                            position: "absolute",
                            left: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                          }}
                        />
                        <input
                          type="number"
                          className="input"
                          placeholder="e.g. 5000"
                          value={form.estimated_students}
                          onChange={(e) =>
                            update("estimated_students", e.target.value)
                          }
                          style={{ paddingLeft: "40px" }}
                        />
                      </div>
                    </FieldWrapper>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <FieldWrapper label="Country *">
                      <select
                        className="select"
                        value={form.country}
                        onChange={(e) => update("country", e.target.value)}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </FieldWrapper>

                    <FieldWrapper label="State">
                      {form.country === "Nigeria" ? (
                        <select
                          className="select"
                          value={form.state}
                          onChange={(e) => update("state", e.target.value)}
                        >
                          <option value="">Select state</option>
                          {NIGERIAN_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="input"
                          placeholder="State / Province"
                          value={form.state}
                          onChange={(e) => update("state", e.target.value)}
                        />
                      )}
                    </FieldWrapper>
                  </div>

                  <FieldWrapper label="University Website">
                    <div style={{ position: "relative" }}>
                      <Globe
                        size={16}
                        color="var(--text-muted)"
                        style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        type="url"
                        className="input"
                        placeholder="https://www.aaua.edu.xyz"
                        value={form.website}
                        onChange={(e) => update("website", e.target.value)}
                        style={{ paddingLeft: "40px" }}
                      />
                    </div>
                  </FieldWrapper>

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "var(--shadow-brand)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "15px",
                      fontSize: "15px",
                      borderRadius: "var(--radius-lg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      marginTop: "8px",
                    }}
                  >
                    Continue <ArrowRight size={16} />
                  </motion.button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <FieldWrapper label="Your Full Name *">
                    <div style={{ position: "relative" }}>
                      <User
                        size={16}
                        color="var(--text-muted)"
                        style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Dr. Adebayo Okafor"
                        value={form.contact_person_name}
                        onChange={(e) =>
                          update("contact_person_name", e.target.value)
                        }
                        style={{ paddingLeft: "40px" }}
                      />
                    </div>
                  </FieldWrapper>

                  <FieldWrapper label="Your Role at the University">
                    <div style={{ position: "relative" }}>
                      <Briefcase
                        size={16}
                        color="var(--text-muted)"
                        style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Registrar, ICT Director, Vice Chancellor"
                        value={form.contact_person_role}
                        onChange={(e) =>
                          update("contact_person_role", e.target.value)
                        }
                        style={{ paddingLeft: "40px" }}
                      />
                    </div>
                  </FieldWrapper>

                  {/* summary card */}
                  <div
                    style={{
                      padding: "16px 20px",
                      borderRadius: "var(--radius-lg)",
                      backgroundColor: "var(--brand-subtle)",
                      border: "1px solid var(--border-brand)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--brand)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase" as const,
                        marginBottom: "12px",
                      }}
                    >
                      Registration Summary
                    </div>
                    {[
                      { label: "University", value: form.university_name },
                      {
                        label: "Portal URL",
                        value: universityPortalHost(form.short_name),
                      },
                      { label: "Email", value: form.official_email },
                      {
                        label: "Country",
                        value: form.state
                          ? `${form.state}, ${form.country}`
                          : form.country,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          {item.label}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            fontWeight: 600,
                            textAlign: "right",
                            fontFamily:
                              item.label === "Portal URL"
                                ? "monospace"
                                : "inherit",
                          }}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* terms */}
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      onClick={() => update("agreed", !form.agreed)}
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "5px",
                        border: form.agreed
                          ? "none"
                          : "1px solid var(--border-secondary)",
                        backgroundColor: form.agreed
                          ? "var(--brand)"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "2px",
                        cursor: "pointer",
                        transition: "all var(--transition)",
                        boxShadow: form.agreed
                          ? "0 0 12px var(--border-brand)"
                          : "none",
                      }}
                    >
                      {form.agreed && <CheckCircle2 size={12} color="#fff" />}
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        lineHeight: 1.6,
                      }}
                    >
                      I confirm that I am authorized to register this university
                      on Uniflow and agree to the{" "}
                      <Link
                        href="/terms"
                        style={{
                          color: "var(--brand)",
                          textDecoration: "none",
                        }}
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        style={{
                          color: "var(--brand)",
                          textDecoration: "none",
                        }}
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "8px" }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setStep(1);
                        setError("");
                      }}
                      className="glass-btn"
                      style={{
                        padding: "15px 20px",
                        fontSize: "14px",
                        borderRadius: "var(--radius-lg)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ArrowLeft size={15} /> Back
                    </motion.button>
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "var(--shadow-brand)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={loading}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        padding: "15px",
                        fontSize: "15px",
                        borderRadius: "var(--radius-lg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      {loading ? "Submitting..." : "Submit Application →"}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
