import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Bell,
  Smartphone,
  MessageSquare,
  AlertTriangle,
  FileText,
  CheckCheck
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";

export default function ParentNotifications() {
  const { currentUser, notifications, markAllNotificationsRead } = useSmartCampus();

  const parentAlerts = notifications.filter(
    (n) => n.recipientId === currentUser?.id || n.recipientRole === "parent"
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Parent Absence & Academic Alerts Inbox
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            All real-time notifications dispatched to registered phone ({currentUser?.phone}) via SMS & WhatsApp
          </p>
        </div>

        <button
          onClick={() => markAllNotificationsRead(currentUser?.id)}
          className="btn btn-secondary btn-sm"
        >
          <CheckCheck size={14} /> Mark All Read
        </button>
      </div>

      {/* Notifications Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {parentAlerts.map((n) => (
          <div
            key={n.id}
            className="card"
            style={{
              borderLeft: n.type.includes("attendance") ? "5px solid #ef4444" : "5px solid #2563eb",
              background: n.read ? "white" : "#f0fdf4"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Smartphone size={18} color={n.type.includes("attendance") ? "#ef4444" : "#2563eb"} />
                <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>{n.title}</h4>
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{n.timestamp}</span>
            </div>

            <p style={{ fontSize: "0.88rem", color: "var(--text-main)", lineHeight: 1.5, margin: "6px 0 12px" }}>
              {n.message}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
              <span>Channel: <strong>SMS & WhatsApp Gateway (Simulated)</strong></span>
              <Badge variant="success">✓ {n.deliveryStatus}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
