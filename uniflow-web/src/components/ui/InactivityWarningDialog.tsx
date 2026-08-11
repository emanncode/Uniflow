"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, LogOut } from "lucide-react";

interface InactivityWarningDialogProps {
  isOpen: boolean;
  secondsRemaining: number;
  onKeepWorking: () => void;
  onLogout: () => void;
}

export default function InactivityWarningDialog({
  isOpen,
  secondsRemaining,
  onKeepWorking,
  onLogout,
}: InactivityWarningDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onKeepWorking}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(8, 8, 8, 0.65)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "var(--bg-card)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid var(--border-secondary)",
              borderRadius: "var(--radius-lg)",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border-brand)",
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {/* Pulsing Warning Icon */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "var(--warning-muted)",
                border: "1px solid rgba(217, 119, 6, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                position: "relative",
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  inset: -4,
                  borderRadius: "50%",
                  border: "1px solid rgba(217, 119, 6, 0.1)",
                }}
              />
              <Clock size={24} color="var(--warning)" />
            </div>

            {/* Dialog Content */}
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: "0 0 10px 0",
                fontFamily: "Sora, sans-serif",
              }}
            >
              Session Timeout Warning
            </h3>
            <p
              style={{
                fontSize: "13.5px",
                color: "var(--text-secondary)",
                lineHeight: "1.5",
                margin: "0 0 24px 0",
              }}
            >
              You have been inactive for a while. For your security, you will be logged out in{" "}
              <strong style={{ color: "var(--warning)", fontSize: "15px" }}>
                {secondsRemaining}
              </strong>{" "}
              seconds.
            </p>

            {/* Dialog Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                width: "100%",
              }}
            >
              <button
                type="button"
                onClick={onLogout}
                className="btn-secondary"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  height: "44px",
                }}
              >
                <LogOut size={14} />
                Sign out
              </button>
              <button
                type="button"
                onClick={onKeepWorking}
                className="btn-primary"
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  height: "44px",
                }}
              >
                Keep working
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
