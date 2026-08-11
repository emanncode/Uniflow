"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Building,
  Globe,
  Users,
  Mail,
  ExternalLink,
  Search,
  CheckCircle2,
  Key,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { universityPortalHost, universityPortalUrl } from "@/lib/domain";

interface University {
  id: string;
  university_name: string;
  short_name: string;
  official_email: string;
  country: string;
  state: string | null;
  website: string | null;
  estimated_students: number | null;
  contact_person_name: string;
  contact_person_role: string | null;
  created_at: string;
}

const fetchUniversities = async (
  setUniversities: React.Dispatch<React.SetStateAction<University[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const { data } = await supabase
    .from("university_registrations")
    .select(
      "id, university_name, short_name, official_email, country, state, website, estimated_students, contact_person_name, contact_person_role, created_at",
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (data) setUniversities(data);
  setLoading(false);
};

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<{
    email: string;
    id: string;
  } | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    fetchUniversities(setUniversities, setLoading);
  }, []);

  const handleResetPassword = async (email: string, id: string) => {
    setConfirmReset(null);
    setResettingId(id);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setResetSuccess(email);
      } else {
        setResetError(data.error || "Failed to reset password");
      }
    } catch {
      setResetError("An error occurred while resetting password");
    } finally {
      setResettingId(null);
    }
  };

  const filtered = useMemo(
    () =>
      universities.filter(
        (u) =>
          u.university_name.toLowerCase().includes(search.toLowerCase()) ||
          u.short_name.toLowerCase().includes(search.toLowerCase()) ||
          u.country.toLowerCase().includes(search.toLowerCase()),
      ),
    [universities, search],
  );

  return (
    <div>
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(20px, 3vw, 28px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              margin: "0 0 6px",
            }}
          >
            Universities
          </h1>
          <p
            style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}
          >
            All approved universities on Uniflow.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* stat badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.15)",
            }}
          >
            <CheckCircle2 size={14} color="#22c55e" />
            <span
              style={{ fontSize: "13px", fontWeight: 700, color: "#22c55e" }}
            >
              {universities.length}
            </span>
          </div>
        </div>
      </div>

      {/* search */}
      <div
        style={{
          position: "relative",
          marginBottom: "24px",
          maxWidth: "400px",
        }}
      >
        <Search
          size={15}
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
          placeholder="Search universities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: "40px" }}
        />
      </div>

      {/* content */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "var(--text-muted)",
            fontSize: "13px",
          }}
        >
          Loading universities...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            border: "1px dashed var(--border-secondary)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <Building
            size={32}
            color="var(--text-muted)"
            style={{
              marginBottom: "12px",
              display: "block",
              margin: "0 auto 12px",
            }}
          />
          <p
            style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}
          >
            {search
              ? "No universities match your search."
              : "No approved universities yet."}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
            gap: "16px",
          }}
        >
          {filtered.map((uni, i) => (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                padding: "20px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-primary)",
                backgroundColor: "var(--bg-card)",
                backdropFilter: "blur(12px)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* top row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "rgba(0, 135, 81,0.08)",
                      border: "1px solid rgba(0, 135, 81,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Building
                      size={18}
                      color="var(--brand)"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: "2px",
                        lineHeight: 1.3,
                      }}
                    >
                      {uni.university_name}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--brand)",
                        fontFamily: "monospace",
                        fontWeight: 600,
                      }}
                    >
                      {uni.short_name}
                    </div>
                  </div>
                </div>
              </div>

              {/* details */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                {[
                  { icon: Mail, value: uni.official_email },
                  {
                    icon: Globe,
                    value: uni.state
                      ? `${uni.state}, ${uni.country}`
                      : uni.country,
                  },
                  {
                    icon: Users,
                    value: uni.estimated_students
                      ? `~${uni.estimated_students.toLocaleString()} students`
                      : "Student count not provided",
                  },
                ].map((item, j) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Icon
                        size={12}
                        color="var(--text-muted)"
                        style={{ flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* portal + website */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <a
                  href={universityPortalUrl(uni.short_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    fontSize: "11px",
                    color: "var(--brand)",
                    fontFamily: "monospace",
                    fontWeight: 600,
                    textDecoration: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title="Open university admin portal"
                >
                  {universityPortalHost(uni.short_name)}
                  <ExternalLink
                    size={10}
                    style={{ opacity: 0.7, flexShrink: 0 }}
                  />
                </a>
                <a
                  href={universityPortalUrl(uni.short_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                    color: "var(--brand)",
                    textDecoration: "none",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  <ExternalLink size={11} />
                  Website
                </a>
              </div>

              {/* actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "4px",
                }}
              >
                <button
                  onClick={() =>
                    setConfirmReset({ email: uni.official_email, id: uni.id })
                  }
                  disabled={resettingId === uni.id}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "8px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-primary)",
                    color: "var(--text-primary)",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  className="hover-bright"
                >
                  {resettingId === uni.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Key size={12} />
                  )}
                  Reset Admin Password
                </button>
              </div>

              {/* approved date */}
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--border-primary)",
                }}
              >
                Approved{" "}
                {new Date(uni.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmReset && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              backgroundColor: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: "100%",
                maxWidth: "400px",
                backgroundColor: "var(--bg-card)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-primary)",
                padding: "24px",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(245,158,11,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  border: "1px solid rgba(245,158,11,0.2)",
                }}
              >
                <AlertTriangle size={24} color="#f59e0b" />
              </div>

              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                Reset Password?
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  marginBottom: "24px",
                  lineHeight: 1.5,
                }}
              >
                Are you sure you want to reset the admin password for{" "}
                <strong>{confirmReset.email}</strong>? A secure password reset
                link will be sent to their email.
              </p>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setConfirmReset(null)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "transparent",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                    fontSize: "14px",
                    border: "1px solid var(--border-primary)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleResetPassword(confirmReset.email, confirmReset.id)
                  }
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--brand)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {resetSuccess && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              backgroundColor: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: "100%",
                maxWidth: "400px",
                backgroundColor: "var(--bg-card)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-primary)",
                padding: "24px",
                position: "relative",
              }}
            >
              <button
                onClick={() => setResetSuccess(null)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "4px",
                }}
              >
                <X size={16} />
              </button>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(34,197,94,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <CheckCircle2 size={24} color="#22c55e" />
              </div>

              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                Reset Link Sent
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  marginBottom: "24px",
                  lineHeight: 1.5,
                }}
              >
                A secure password reset link has been sent to{" "}
                <strong>{resetSuccess}</strong>.
              </p>

              <button
                onClick={() => setResetSuccess(null)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--brand)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {resetError && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              backgroundColor: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: "100%",
                maxWidth: "400px",
                backgroundColor: "var(--bg-card)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-primary)",
                padding: "24px",
                position: "relative",
              }}
            >
              <button
                onClick={() => setResetError(null)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "4px",
                }}
              >
                <X size={16} />
              </button>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(239,68,68,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <AlertTriangle size={24} color="#ef4444" />
              </div>

              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                Reset Failed
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  marginBottom: "24px",
                  lineHeight: 1.5,
                }}
              >
                {resetError}
              </p>

              <button
                onClick={() => setResetError(null)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--brand)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                OK
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
