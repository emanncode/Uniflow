"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Building2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { universityPortalHost } from "@/lib/domain";
import { queryKeys } from "@/lib/queryClient";

export const dynamic = "force-dynamic";
interface Registration {
  id: string;
  university_name: string;
  short_name: string;
  country: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

async function fetchRegistrationsData() {
  const [
    { count: pending },
    { count: approved },
    { count: rejected },
    { data: recentData },
  ] = await Promise.all([
    supabase
      .from("university_registrations")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("university_registrations")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("university_registrations")
      .select("id", { count: "exact", head: true })
      .eq("status", "rejected"),
    supabase
      .from("university_registrations")
      .select("id, university_name, short_name, country, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    stats: {
      pending: pending ?? 0,
      approved: approved ?? 0,
      rejected: rejected ?? 0,
      total: (pending ?? 0) + (approved ?? 0) + (rejected ?? 0),
    },
    recent: (recentData as Registration[]) ?? [],
  };
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.registrations(),
    queryFn: fetchRegistrationsData,
    staleTime: 1000 * 30,
  });

  const stats = data?.stats ?? { pending: 0, approved: 0, rejected: 0, total: 0 };
  const recent = data?.recent ?? [];

  const statCards = useMemo(() => [
    {
      label: "Total Applications",
      value: stats.total,
      icon: Building2,
      color: "var(--text-secondary)",
      bg: "var(--bg-hover)",
    },
    {
      label: "Pending Review",
      value: stats.pending,
      icon: Clock,
      color: "var(--warning)",
      bg: "var(--warning-muted)",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle2,
      color: "var(--success)",
      bg: "var(--success-muted)",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "var(--danger)",
      bg: "var(--danger-muted)",
    },
  ], [stats.total, stats.pending, stats.approved, stats.rejected]);

  return (
    <div>
      {/* header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "clamp(20px, 3vw, 28px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            margin: "0 0 6px",
          }}
        >
          Overview
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
          Manage Uniflow university registrations and approvals.
        </p>
      </div>

      {/* stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                padding: "20px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-primary)",
                backgroundColor: "var(--bg-card)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {card.label}
                </span>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: card.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={16} color={card.color} strokeWidth={1.8} />
                </div>
              </div>
              <div
                style={{
                  fontSize: "clamp(24px, 3vw, 36px)",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: card.color,
                  lineHeight: 1,
                }}
              >
                {isLoading ? "—" : card.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* recent applications */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-primary)",
          backgroundColor: "var(--bg-card)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Recent Applications
          </div>
          <a
            href="/dashboard/registrations"
            style={{
              fontSize: "12px",
              color: "var(--brand)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            View all →
          </a>
        </div>

        {isLoading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "13px",
            }}
          >
            Loading...
          </div>
        ) : recent.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "13px",
            }}
          >
            No applications yet.
          </div>
        ) : (
          <div>
            {recent.map((reg, i) => (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 20px",
                  gap: "12px",
                  borderBottom:
                    i < recent.length - 1
                      ? "1px solid var(--border-primary)"
                      : "none",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "2px",
                    }}
                  >
                    {reg.university_name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {universityPortalHost(reg.short_name)} · {reg.country}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "999px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color:
                      reg.status === "pending"
                        ? "var(--warning)"
                        : reg.status === "approved"
                          ? "var(--success)"
                          : "var(--danger)",
                    backgroundColor:
                      reg.status === "pending"
                        ? "var(--warning-muted)"
                        : reg.status === "approved"
                          ? "var(--success-muted)"
                          : "var(--danger-muted)",
                    border: `1px solid ${reg.status === "pending" ? "var(--warning-muted)" : reg.status === "approved" ? "var(--success-muted)" : "var(--danger-muted)"}`,
                  }}
                >
                  {reg.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
