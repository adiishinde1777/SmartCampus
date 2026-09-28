import React, { useState, useEffect } from "react";
import { Zap, AlertTriangle, Clock, ChevronRight, X, Volume2, ShieldAlert } from "lucide-react";
import { Modal } from "./UIPrimitives";

export default function FlashNoticeBanner({ notices = [], onNavigate }) {
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [now, setNow] = useState(new Date());

  // Update clock every minute for accurate expiry countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter currently active flash notices
  const activeFlashNotices = (notices || []).filter((n) => {
    if (!n.isFlashMessage) return false;
    if (!n.flashExpiresAt) return true;
    return new Date(n.flashExpiresAt) > now;
  });

  if (activeFlashNotices.length === 0) {
    return null;
  }

  // Pick highest priority / newest flash notice
  const currentFlash = activeFlashNotices[0];

  const calculateTimeRemaining = (expiryDateStr) => {
    if (!expiryDateStr) return "Active";
    const diffMs = new Date(expiryDateStr) - now;
    if (diffMs <= 0) return "Expiring soon";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    return `${hours}h ${mins}m remaining`;
  };

  if (isDismissed) {
    return (
      <div
        style={{
          background: "linear-gradient(90deg, #991b1b, #dc2626)",
          borderRadius: "10px",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "white",
          boxShadow: "0 2px 10px rgba(220, 38, 38, 0.25)",
          cursor: "pointer"
        }}
        onClick={() => setIsDismissed(false)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.84rem", fontWeight: "700" }}>
          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#fef08a", animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
          <span>🚨 IMPORTANT NOTICE: {currentFlash.title}</span>
          <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "10px" }}>
            {calculateTimeRemaining(currentFlash.flashExpiresAt)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(false);
          }}
          className="btn btn-sm"
          style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "3px 10px", fontSize: "0.75rem", border: "none" }}
        >
          Expand Notice
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className="flash-notice-container"
        style={{
          background: "linear-gradient(135deg, #450a0a 0%, #991b1b 50%, #b91c1c 100%)",
          border: "2px solid #ef4444",
          borderRadius: "16px",
          padding: "16px 22px",
          color: "white",
          boxShadow: "0 10px 30px -5px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Animated Glow Backdrop */}
        <div
          style={{
            position: "absolute",
            top: "-50%",
            right: "-10%",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(239,68,68,0.3) 0%, rgba(0,0,0,0) 70%)",
            borderRadius: "50%",
            pointerEvents: "none"
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1, minWidth: "260px" }}>
            {/* Siren / Flash Icon with Pulse */}
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                border: "2px solid #fca5a5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 0 15px rgba(239, 68, 68, 0.8)"
              }}
            >
              <Zap size={24} color="#ffffff" fill="#ffffff" />
            </div>

            <div>
              {/* Header tags */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                <span
                  style={{
                    background: "#fef2f2",
                    color: "#991b1b",
                    fontSize: "0.72rem",
                    fontWeight: "900",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <ShieldAlert size={12} /> तातडीची सूचना • CRITICAL FLASH NOTICE
                </span>

                <span
                  style={{
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(254, 202, 202, 0.4)",
                    color: "#fecaca",
                    fontSize: "0.73rem",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Clock size={12} /> {calculateTimeRemaining(currentFlash.flashExpiresAt)}
                </span>

                <span style={{ fontSize: "0.74rem", color: "#fca5a5" }}>
                  By: <strong>{currentFlash.author}</strong>
                </span>
              </div>

              {/* Title & Preview Content */}
              <h3 style={{ fontSize: "1.18rem", fontWeight: "800", color: "#ffffff", margin: "4px 0 6px 0", lineHeight: 1.3 }}>
                {currentFlash.title}
              </h3>

              <p style={{ fontSize: "0.88rem", color: "#fee2e2", margin: 0, lineHeight: 1.45, maxWidth: "800px" }}>
                {currentFlash.content.length > 160 ? `${currentFlash.content.substring(0, 160)}...` : currentFlash.content}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <button
              onClick={() => setSelectedNotice(currentFlash)}
              className="btn btn-sm"
              style={{
                background: "#ffffff",
                color: "#991b1b",
                fontWeight: "800",
                fontSize: "0.82rem",
                padding: "8px 16px",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span>View Full Notice</span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              title="Minimize banner"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#fee2e2",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Full Notice Detailed Modal */}
      {selectedNotice && (
        <Modal
          isOpen={Boolean(selectedNotice)}
          onClose={() => setSelectedNotice(null)}
          title="🚨 Institutional Flash Notice / परिपत्रक"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                background: "#fff1f2",
                border: "1.5px solid #fecdd3",
                borderRadius: "12px",
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px"
              }}
            >
              <div>
                <span style={{ fontSize: "0.74rem", fontWeight: "800", color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Active Flash Duration
                </span>
                <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#9f1239" }}>
                  ⏳ {calculateTimeRemaining(selectedNotice.flashExpiresAt)}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.78rem", color: "#881337" }}>
                Published: <strong>{selectedNotice.publishDate}</strong>
                {selectedNotice.flashExpiresAt && (
                  <div>Valid until: {new Date(selectedNotice.flashExpiresAt).toLocaleString()}</div>
                )}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                {selectedNotice.title}
              </h3>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                  {selectedNotice.category}
                </span>
                <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                  High Priority
                </span>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Applicable To: {selectedNotice.department || "All Departments"}
                </span>
              </div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "16px 20px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "0.94rem",
                lineHeight: 1.65,
                color: "#1e293b",
                whiteSpace: "pre-line"
              }}
            >
              {selectedNotice.content}
            </div>

            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                paddingTop: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                fontSize: "0.82rem",
                color: "#64748b"
              }}
            >
              <div>
                Author / Authorized Signatory: <strong>{selectedNotice.author}</strong>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedNotice(null)}
              >
                Close Notice
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
