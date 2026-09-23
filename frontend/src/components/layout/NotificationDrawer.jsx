import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  Send,
  MessageSquare,
  ShieldAlert,
  CheckCircle2
} from "lucide-react";

export default function NotificationDrawer({ isOpen, onClose }) {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useSmartCampus();
  const [filter, setFilter] = useState("all");

  if (!isOpen) return null;

  // Filter for notifications intended for this user or their role
  const userNotifications = notifications.filter(
    (n) => n.recipientId === currentUser?.id || n.recipientRole === currentUser?.role
  );

  const filtered = userNotifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    if (filter === "attendance") return n.type.includes("attendance") || n.type === "warning";
    if (filter === "marks") return n.type === "marks";
    return true;
  });

  const getIcon = (type) => {
    if (type === "warning" || type === "attendance_absent") return <AlertTriangle size={18} color="#ef4444" />;
    if (type === "marks") return <FileText size={18} color="#2563eb" />;
    if (type === "assignment") return <Calendar size={18} color="#8b5cf6" />;
    if (type === "leave") return <Clock size={18} color="#f59e0b" />;
    return <Bell size={18} color="#0284c7" />;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card notification-drawer-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-surface)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "var(--primary-50)",
                color: "var(--primary-600)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "700" }}>Notification Center</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {userNotifications.filter((n) => !n.read).length} unread updates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            padding: "12px 20px",
            background: "var(--bg-surface-secondary)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            gap: "8px",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", gap: "6px" }}>
            {["all", "unread", "attendance", "marks"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  background: filter === tab ? "var(--primary-600)" : "white",
                  color: filter === tab ? "white" : "var(--text-muted)",
                  boxShadow: filter === tab ? "0 2px 4px rgba(37,99,235,0.2)" : "none"
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => markAllNotificationsRead(currentUser?.id)}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary-600)",
              fontSize: "0.75rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        </div>

        {/* Notifications List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            background: "#f8fafc"
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
              <CheckCircle2 size={40} color="#10b981" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontWeight: "600" }}>All caught up!</p>
              <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>No notifications in this category.</p>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                style={{
                  background: notif.read ? "white" : "#eff6ff",
                  borderRadius: "12px",
                  border: notif.read ? "1px solid var(--border-subtle)" : "1px solid #bfdbfe",
                  padding: "14px",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                  display: "flex",
                  gap: "12px"
                }}
              >
                <div style={{ marginTop: "2px" }}>{getIcon(notif.type)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.86rem", fontWeight: notif.read ? "600" : "700", color: "var(--text-main)" }}>
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb" }} />
                    )}
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4, marginBottom: "8px" }}>
                    {notif.message}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-light)" }}>
                    <span>{notif.timestamp}</span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: notif.channel === "sms_whatsapp" ? "#dcfce7" : "#e0f2fe",
                        color: notif.channel === "sms_whatsapp" ? "#15803d" : "#0369a1",
                        fontWeight: "600"
                      }}
                    >
                      {notif.channel === "sms_whatsapp" ? "📱 SMS / WhatsApp" : "⚡ In-App"} • {notif.deliveryStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
