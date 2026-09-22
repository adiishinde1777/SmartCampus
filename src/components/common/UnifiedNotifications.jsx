import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Bell,
  CheckCheck,
  Smartphone,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  Filter
} from "lucide-react";
import { Badge } from "./UIPrimitives";

export default function UnifiedNotifications({ onNavigate }) {
  const { currentUser, activeRole, notifications, markAllNotificationsRead } = useSmartCampus();

  const userAlerts = (notifications || []).filter(
    (n) => n.recipientId === currentUser?.id || n.recipientRole === activeRole || n.recipientRole === currentUser?.role
  );

  const unreadCount = userAlerts.filter((n) => !n.read).length;

  const getIcon = (type) => {
    if (type?.includes("attendance") || type === "warning") return <AlertTriangle size={18} color="#ef4444" />;
    if (type === "marks") return <FileText size={18} color="#2563eb" />;
    if (type === "assignment") return <Calendar size={18} color="#8b5cf6" />;
    if (type === "leave") return <Clock size={18} color="#f59e0b" />;
    return <Bell size={18} color="#0284c7" />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
              Notifications & Automated Alerts Center
            </h2>
            {unreadCount > 0 && (
              <Badge variant="danger">{unreadCount} New</Badge>
            )}
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Real-time automated alerts for <strong>{currentUser?.name || "User"}</strong> ({activeRole?.toUpperCase()})
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => markAllNotificationsRead(currentUser?.id)}
            className="btn btn-secondary btn-sm"
          >
            <CheckCheck size={14} /> Mark All Read
          </button>
        </div>
      </div>

      {/* Notifications Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {userAlerts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <Bell size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <h4 style={{ fontSize: "1.05rem", fontWeight: "700" }}>No Notifications Yet</h4>
            <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
              You're completely up to date! Real-time alerts triggered by attendance, marks, or notices will appear here.
            </p>
          </div>
        ) : (
          userAlerts.map((n) => {
            const isAttendance = n.type?.includes("attendance");
            const isWarning = n.type === "warning";
            const borderCol = isAttendance || isWarning ? "#ef4444" : n.type === "marks" ? "#2563eb" : "#8b5cf6";

            return (
              <div
                key={n.id}
                className="card"
                style={{
                  borderLeft: `5px solid ${borderCol}`,
                  background: n.read ? "var(--bg-surface)" : "rgba(239, 246, 255, 0.6)",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {getIcon(n.type)}
                    <h4 style={{ fontSize: "0.98rem", fontWeight: "700", color: "var(--text-main)" }}>{n.title}</h4>
                    {!n.read && (
                      <span style={{ fontSize: "0.68rem", background: "#ef4444", color: "white", padding: "1px 6px", borderRadius: "10px", fontWeight: "700" }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{n.timestamp}</span>
                </div>

                <p style={{ fontSize: "0.88rem", color: "var(--text-main)", lineHeight: 1.5, margin: "6px 0 12px" }}>
                  {n.message}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Smartphone size={13} color="var(--primary-600)" />
                    <span>Channel: <strong>In-App • SMS Gateway • WhatsApp</strong></span>
                  </div>
                  <Badge variant="success">✓ {n.deliveryStatus || "Delivered"}</Badge>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
