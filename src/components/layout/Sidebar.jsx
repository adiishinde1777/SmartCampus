import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  BookOpen,
  Bell,
  Clock,
  FileSpreadsheet,
  AlertOctagon,
  Sparkles,
  User,
  LogOut,
  Users,
  GraduationCap,
  Building2,
  Settings,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  Layers,
  BarChart3,
  CalendarDays,
  FileText,
  HelpCircle,
  Activity
} from "lucide-react";

export default function Sidebar({ currentView, setCurrentView, isMobileOpen, setIsMobileOpen }) {
  const { currentUser, activeRole, logout, notifications, complaints, leaves } = useSmartCampus();

  const unreadNotifs = notifications.filter(
    (n) => (n.recipientId === currentUser?.id || n.recipientRole === currentUser?.role) && !n.read
  ).length;

  const pendingLeavesCount = leaves.filter((l) => l.status === "Pending").length;
  const pendingComplaintsCount = complaints.filter((c) => c.status !== "Resolved").length;

  // Role based navigation definitions
  const getNavItems = () => {
    switch (activeRole) {
      case "student":
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "attendance", label: "Attendance", icon: CalendarCheck },
          { id: "marks", label: "Marks & Grades", icon: Award },
          { id: "assignments", label: "Assignments", icon: BookOpen },
          { id: "notices", label: "Notices", icon: Bell },
          { id: "exams", label: "Exam Schedule", icon: CalendarDays },
          { id: "leave", label: "Apply Leave", icon: Clock },
          { id: "complaints", label: "Complaints", icon: AlertOctagon },
          { id: "performance", label: "Academic Health", icon: TrendingUp },
          { id: "notifications", label: "Notifications", icon: Bell, badge: unreadNotifs },
          { id: "ai-assistant", label: "AI Assistant", icon: Sparkles, highlight: true },
          { id: "profile", label: "My Profile", icon: User }
        ];
      case "teacher":
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "classes", label: "My Classes", icon: GraduationCap },
          { id: "attendance", label: "Mark Attendance", icon: CalendarCheck, highlight: true },
          { id: "marks", label: "Upload Marks", icon: Award },
          { id: "assignments", label: "Assignments", icon: BookOpen },
          { id: "notices", label: "Class Notices", icon: Bell },
          { id: "leaves", label: "Leave Requests", icon: Clock, badge: pendingLeavesCount },
          { id: "performance", label: "Student Performance", icon: Activity },
          { id: "reports", label: "Reports & Exports", icon: FileSpreadsheet },
          { id: "notifications", label: "Notifications", icon: Bell, badge: unreadNotifs },
          { id: "profile", label: "Profile", icon: User }
        ];
      case "parent":
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "attendance", label: "Child Attendance", icon: CalendarCheck, highlight: true },
          { id: "marks", label: "Marks & Progress", icon: Award },
          { id: "assignments", label: "Assignments", icon: BookOpen },
          { id: "notices", label: "College Notices", icon: Bell },
          { id: "academic-status", label: "Academic Status", icon: TrendingUp },
          { id: "notifications", label: "Absence Alerts", icon: Bell, badge: unreadNotifs },
          { id: "profile", label: "Profile", icon: User }
        ];
      case "hod":
        return [
          { id: "dashboard", label: "HOD Dashboard", icon: LayoutDashboard },
          { id: "students", label: "Dept Students", icon: Users },
          { id: "faculty", label: "Faculty Tracking", icon: GraduationCap },
          { id: "attendance", label: "Attendance Radar", icon: CalendarCheck },
          { id: "marks", label: "Marks Overview", icon: Award },
          { id: "assignments", label: "Assignments Monitor", icon: BookOpen },
          { id: "complaints", label: "Complaints Tracker", icon: AlertOctagon, badge: pendingComplaintsCount },
          { id: "notices", label: "Publish Notices", icon: Bell },
          { id: "analytics", label: "Dept Analytics", icon: BarChart3 },
          { id: "reports", label: "Dept Reports", icon: FileSpreadsheet },
          { id: "profile", label: "Profile", icon: User }
        ];
      case "principal":
        return [
          { id: "dashboard", label: "Principal Dashboard", icon: LayoutDashboard },
          { id: "departments", label: "Departments", icon: Building2 },
          { id: "attendance-analytics", label: "Attendance Analytics", icon: CalendarCheck },
          { id: "academic-analytics", label: "Academic Analytics", icon: TrendingUp },
          { id: "complaints", label: "College Complaints", icon: AlertOctagon },
          { id: "notices", label: "College Circulars", icon: Bell },
          { id: "reports", label: "Executive Reports", icon: FileSpreadsheet },
          { id: "drilldown", label: "College Drill-Down", icon: Layers, highlight: true },
          { id: "profile", label: "Profile", icon: User }
        ];
      case "admin":
        return [
          { id: "dashboard", label: "Admin Console", icon: LayoutDashboard },
          { id: "users", label: "User Management", icon: Users },
          { id: "departments", label: "Departments", icon: Building2 },
          { id: "subjects", label: "Subjects & Faculty", icon: BookOpen },
          { id: "timetable", label: "Timetable Master", icon: CalendarDays },
          { id: "threshold", label: "Attendance Threshold", icon: ShieldCheck, highlight: true },
          { id: "notices", label: "Notice Board", icon: Bell },
          { id: "complaints", label: "All Complaints", icon: AlertOctagon },
          { id: "audit-logs", label: "Audit Trail Logs", icon: FileText },
          { id: "settings", label: "System Settings", icon: Settings },
          { id: "profile", label: "Profile", icon: User }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleNavClick = (id) => {
    setCurrentView(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <aside
      className="sidebar"
      style={{
        transform: isMobileOpen ? "translateX(0)" : undefined
      }}
    >
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-logo-icon">
          <GraduationCap size={24} />
        </div>
        <div>
          <div className="brand-title">
            <span>SMART CAMPUS</span>
          </div>
          <div className="brand-tagline">Track • Alert • Analyse • Act</div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="sidebar-role-badge">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldCheck size={14} color="#38bdf8" />
          <span className="role-name">{activeRole} PORTAL</span>
        </div>
        <span className="role-status-dot" title="Live & Synchronized" />
      </div>

      {/* Navigation list */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              onClick={() => handleNavClick(item.id)}
              style={{
                border: "none",
                background: isActive
                  ? "linear-gradient(90deg, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.08) 100%)"
                  : "transparent",
                textAlign: "left",
                width: "100%"
              }}
            >
              <Icon size={18} />
              <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.label}
              </span>
              {item.highlight && !item.badge && (
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60a5fa" }} />
              )}
              {item.badge > 0 && <span className="badge-count">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="sidebar-footer">
        <div className="user-profile-mini">
          <img
            src={
              currentUser?.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            }
            alt={currentUser?.name}
          />
          <div className="user-details">
            <div className="user-name">{currentUser?.name || "Logged User"}</div>
            <div className="user-sub">{currentUser?.designation || currentUser?.departmentName || activeRole}</div>
          </div>
          <button
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              color: "#ef4444",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "4px"
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
