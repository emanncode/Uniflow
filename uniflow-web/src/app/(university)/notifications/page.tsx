"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  class_update: "#f59e0b",
  resource: "#22c55e",
  general: "#60a5fa",
  system: "#8b5cf6",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifications(data ?? []);
    setLoading(false);
  }

  async function markAllRead() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div style={{ maxWidth: "640px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            Notifications
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "1px solid var(--border-secondary)",
              borderRadius: "var(--radius-md)",
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: "12px",
              color: "var(--text-secondary)",
              fontFamily: "Sora, sans-serif",
            }}
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "60px" }}
        >
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: "var(--brand)" }}
          />
        </div>
      ) : notifications.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            border: "1px dashed var(--border-secondary)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <Bell
            size={32}
            style={{
              color: "var(--text-muted)",
              marginBottom: "12px",
              display: "block",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            No notifications yet
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: "16px 18px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${n.is_read ? "var(--border-primary)" : "rgba(96,165,250,0.2)"}`,
                background: n.is_read
                  ? "var(--bg-card)"
                  : "rgba(96,165,250,0.04)",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  marginTop: "5px",
                  background: n.is_read
                    ? "var(--border-secondary)"
                    : (TYPE_COLORS[n.type] ?? "#60a5fa"),
                  boxShadow: n.is_read
                    ? "none"
                    : `0 0 6px ${TYPE_COLORS[n.type] ?? "#60a5fa"}`,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "3px",
                  }}
                >
                  {n.title}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {n.message}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    marginTop: "6px",
                  }}
                >
                  {new Date(n.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
