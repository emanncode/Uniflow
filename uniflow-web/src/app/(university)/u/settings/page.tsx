"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Shield, Save, Eye, EyeOff, Loader2, GraduationCap } from "lucide-react";

export default function UniversitySettingsPage() {
  const [profile, setProfile] = useState({ full_name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", session.user.id)
        .single();
      if (data) {
        setProfile({ full_name: data.full_name, email: data.email });
      }
      setLoading(false);
    };

    void loadProfile();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const { error: err } = await supabase
      .from("profiles")
      .update({ full_name: profile.full_name })
      .eq("id", session.user.id);
    if (err) {
      setError(err.message);
    } else {
      setSuccess("Profile updated.");
      setTimeout(() => setSuccess(""), 3000);
    }
    setSaving(false);
  }

  async function handleChangePassword() {
    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (passwords.new.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    setError("");
    const { error: err } = await supabase.auth.updateUser({
      password: passwords.new,
    });
    if (err) {
      setError(err.message);
    } else {
      setSuccess("Password changed.");
      setPasswords({ new: "", confirm: "" });
      setShowPasswordSection(false);
      setTimeout(() => setSuccess(""), 3000);
    }
    setSaving(false);
  }

  if (loading)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "60px" }}
      >
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: "var(--brand)" }}
        />
      </div>
    );

  return (
    <div style={{ maxWidth: "560px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "4px",
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Manage your account
        </p>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: "16px" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="alert-success" style={{ marginBottom: "16px" }}>
          {success}
        </div>
      )}

      {/* Profile */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-primary)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-sm)",
              background: "var(--brand-muted)",
              border: "1px solid var(--border-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={15} style={{ color: "var(--brand)" }} />
          </div>
          <div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Profile
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Your personal information
            </p>
          </div>
        </div>
        <div
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              className="input"
              value={profile.full_name}
              onChange={(e) =>
                setProfile((p) => ({ ...p, full_name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={profile.email}
              disabled
              style={{ opacity: 0.5, cursor: "not-allowed" }}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              width: "fit-content",
              padding: "10px 20px",
            }}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save changes
          </button>
        </div>
      </div>

      {/* Academic */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-primary)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-sm)",
              background: "var(--success-muted)",
              border: "1px solid var(--success-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GraduationCap size={15} style={{ color: "var(--success)" }} />
          </div>
          <div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Course levels
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Controls level tabs on Courses and Timetable pages
            </p>
          </div>
        </div>
        <div style={{ padding: "20px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Level ranges (100–400 or 100–500) are configured per department the
            first time you open that department&apos;s Students page. The
            choice is saved in the database and applies to students, courses,
            and timetables for that department.
          </p>
        </div>
      </div>

      {/* Security */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        <div
          onClick={() => setShowPasswordSection(!showPasswordSection)}
          style={{
            padding: "16px 20px",
            borderBottom: showPasswordSection
              ? "1px solid var(--border-primary)"
              : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-sm)",
                background: "var(--info-muted)",
                border: "1px solid var(--info-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={15} style={{ color: "var(--info)" }} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Security
              </p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Change your password
              </p>
            </div>
          </div>
          <span
            style={{
              fontSize: "12px",
              color: "var(--brand)",
              fontWeight: 600,
            }}
          >
            {showPasswordSection ? "Cancel" : "Change password"}
          </span>
        </div>

        {showPasswordSection && (
          <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {[
              {
                key: "new",
                label: "New Password",
                show: showNew,
                toggle: () => setShowNew(!showNew),
              },
              {
                key: "confirm",
                label: "Confirm Password",
                show: showConfirm,
                toggle: () => setShowConfirm(!showConfirm),
              },
            ].map((field) => (
              <div key={field.key}>
                <label className="label">{field.label}</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={field.show ? "text" : "password"}
                    className="input"
                    placeholder="••••••••"
                    value={passwords[field.key as "new" | "confirm"]}
                    onChange={(e) =>
                      setPasswords((p) => ({
                        ...p,
                        [field.key]: e.target.value,
                      }))
                    }
                    style={{ paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={field.toggle}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {field.show ? (
                      <EyeOff
                        size={15}
                        style={{ color: "var(--text-muted)" }}
                      />
                    ) : (
                      <Eye size={15} style={{ color: "var(--text-muted)" }} />
                    )}
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={handleChangePassword}
              disabled={saving}
              style={{
                padding: "11px 20px",
                borderRadius: "var(--radius-md)",
                background: "var(--info)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: "Sora, sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                width: "fit-content",
              }}
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Shield size={14} />
              )}
              Update password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
