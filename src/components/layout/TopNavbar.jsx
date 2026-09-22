import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Menu,
  Bell,
  LogOut,
  ShieldCheck,
  GraduationCap
} from "lucide-react";

export default function TopNavbar({ currentView, onNavigate, onToggleMobile, onOpenNotifications }) {
  const { currentUser, activeRole, notifications, systemSettings, logout } = useSmartCampus();

  const unreadCount = notifications.filter(
    (n) => (n.recipientId === currentUser?.id || n.recipientRole === currentUser?.role) && !n.read
  ).length;

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={onToggleMobile} title="Toggle Navigation">
          <Menu size={22} />
        </button>

        <div className="navbar-breadcrumb">
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {systemSettings?.collegeName || "CSMSS Chh. Shahu College of Engineering"} •
          </span>
          <span className="active-crumb" style={{ textTransform: "capitalize" }}>
            {currentView ? currentView.replace(/-/g, " ") : "Dashboard"}
          </span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Active Role Identifier Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            background: "rgba(37, 99, 235, 0.08)",
            border: "1px solid rgba(37, 99, 235, 0.2)",
            borderRadius: "20px",
            fontSize: "0.78rem",
            fontWeight: "700",
            color: "var(--primary-700)"
          }}
        >
          <ShieldCheck size={14} color="var(--primary-600)" />
          <span style={{ textTransform: "uppercase" }}>{activeRole} ACCESS</span>
        </div>

        {/* Notification Bell */}
        <button
          className="notification-bell-btn"
          onClick={onOpenNotifications}
          title="Open Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className="notification-bell-badge">{unreadCount}</span>}
        </button>

        {/* User Profile Pill & Sign Out */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "10px", borderLeft: "1px solid var(--border-subtle)" }}>
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser?.name}
              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }}
            />
          ) : (
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2563eb, #1e40af)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "0.82rem",
                border: "2px solid #e2e8f0",
                flexShrink: 0
              }}
            >
              {currentUser?.name ? currentUser.name.split(" ").slice(0, 2).map((n) => n[0]).join("") : "U"}
            </div>
          )}
          <div className="hide-on-mobile" style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", lineHeight: 1.2 }}>
              {currentUser?.name || "Logged In User"}
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              {currentUser?.rollNo || currentUser?.designation || activeRole}
            </span>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{
              padding: "5px 10px",
              fontSize: "0.75rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              color: "#dc2626",
              borderColor: "#fecaca"
            }}
            title="Sign Out of Portal"
          >
            <LogOut size={13} />
            <span className="hide-on-mobile">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
