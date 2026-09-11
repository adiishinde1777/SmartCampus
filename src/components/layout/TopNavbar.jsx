import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  GraduationCap
} from "lucide-react";

export default function TopNavbar({ currentView, onToggleMobile, onOpenNotifications }) {
  const { currentUser, activeRole, switchUser, users, notifications, systemSettings } = useSmartCampus();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(
    (n) => (n.recipientId === currentUser?.id || n.recipientRole === currentUser?.role) && !n.read
  ).length;

  const roles = [
    { role: "student", label: "Student (Rahul Patil)", id: "stu-1" },
    { role: "teacher", label: "Teacher (Prof. R.K. Patil)", id: "tea-1" },
    { role: "parent", label: "Parent (Suresh Patil)", id: "par-1" },
    { role: "hod", label: "HOD (Dr. V.S. Rao)", id: "hod-1" },
    { role: "principal", label: "Principal (Dr. S.K. Mehta)", id: "prin-1" },
    { role: "admin", label: "Admin Officer", id: "adm-1" }
  ];

  const handleRoleSelect = (targetId) => {
    switchUser(targetId);
    setRoleDropdownOpen(false);
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={onToggleMobile}>
          <Menu size={22} />
        </button>

        <div className="navbar-breadcrumb">
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {systemSettings.collegeName} •
          </span>
          <span className="active-crumb" style={{ textTransform: "capitalize" }}>
            {currentView.replace(/-/g, " ")}
          </span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Quick Persona Switcher Dropdown */}
        <div className="role-switcher-dropdown">
          <button
            className="role-switch-btn"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
          >
            <ShieldCheck size={16} color="var(--primary-600)" />
            <span>Switch Role: <strong style={{ textTransform: "uppercase", color: "var(--primary-700)" }}>{activeRole}</strong></span>
            <ChevronDown size={14} />
          </button>

          {roleDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "115%",
                right: 0,
                background: "white",
                borderRadius: "12px",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-xl)",
                width: "280px",
                padding: "8px",
                zIndex: 60,
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              <div style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Select Active Login Persona
              </div>
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: activeRole === r.role ? "var(--primary-50)" : "transparent",
                    color: activeRole === r.role ? "var(--primary-700)" : "var(--text-main)",
                    fontWeight: activeRole === r.role ? "700" : "500",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <span>{r.label}</span>
                  {activeRole === r.role && <CheckCircle2 size={16} color="var(--primary-600)" />}
                </button>
              ))}
            </div>
          )}
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

        {/* User Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "8px", borderLeft: "1px solid var(--border-subtle)" }}>
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            alt={currentUser?.name}
            style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }}
          />
          <div className="hide-on-mobile" style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", lineHeight: 1.2 }}>
              {currentUser?.name}
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              {currentUser?.rollNo || currentUser?.designation || activeRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
