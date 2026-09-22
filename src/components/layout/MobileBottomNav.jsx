import React from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  Bell,
  Menu,
  GraduationCap,
  FileText,
  Users,
  Building2,
  ShieldCheck,
  User
} from "lucide-react";

export default function MobileBottomNav({ currentView, onNavigate, onToggleMobile }) {
  const { activeRole, currentUser, notifications } = useSmartCampus();

  const unreadCount = (notifications || []).filter(
    (n) => (n.recipientId === currentUser?.id || n.recipientRole === currentUser?.role) && !n.read
  ).length;

  const getNavItems = () => {
    switch (activeRole) {
      case "student":
        return [
          { id: "dashboard", label: "Home", icon: LayoutDashboard },
          { id: "attendance", label: "Attendance", icon: CalendarCheck },
          { id: "marks", label: "Marks", icon: Award },
          { id: "notifications", label: "Alerts", icon: Bell, badge: unreadCount },
          { id: "menu", label: "More", icon: Menu, isMenu: true }
        ];
      case "teacher":
        return [
          { id: "dashboard", label: "Home", icon: LayoutDashboard },
          { id: "attendance", label: "Mark Attend", icon: CalendarCheck },
          { id: "my-class", label: "Class", icon: GraduationCap },
          { id: "notifications", label: "Alerts", icon: Bell, badge: unreadCount },
          { id: "menu", label: "More", icon: Menu, isMenu: true }
        ];
      case "parent":
        return [
          { id: "dashboard", label: "Home", icon: LayoutDashboard },
          { id: "attendance", label: "Ward Attend", icon: CalendarCheck },
          { id: "doctor-letters", label: "Doctor Note", icon: FileText },
          { id: "notifications", label: "SMS Alerts", icon: Bell, badge: unreadCount },
          { id: "menu", label: "More", icon: Menu, isMenu: true }
        ];
      case "hod":
        return [
          { id: "dashboard", label: "HOD Home", icon: LayoutDashboard },
          { id: "attendance", label: "Radar", icon: CalendarCheck },
          { id: "faculty", label: "Faculty", icon: GraduationCap },
          { id: "students", label: "Students", icon: Users },
          { id: "menu", label: "More", icon: Menu, isMenu: true }
        ];
      case "principal":
        return [
          { id: "dashboard", label: "Console", icon: LayoutDashboard },
          { id: "departments", label: "Depts", icon: Building2 },
          { id: "attendance-analytics", label: "Attendance", icon: CalendarCheck },
          { id: "notices", label: "Circulars", icon: Bell },
          { id: "menu", label: "More", icon: Menu, isMenu: true }
        ];
      case "admin":
      default:
        return [
          { id: "dashboard", label: "Console", icon: LayoutDashboard },
          { id: "users", label: "Users", icon: Users },
          { id: "departments", label: "Depts", icon: Building2 },
          { id: "threshold", label: "SMS Rules", icon: ShieldCheck },
          { id: "menu", label: "More", icon: Menu, isMenu: true }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={`mobile-bottom-nav-item ${isActive ? "active" : ""}`}
            onClick={() => {
              if (item.isMenu) {
                onToggleMobile();
              } else {
                onNavigate(item.id);
              }
            }}
          >
            <div style={{ position: "relative", display: "inline-flex" }}>
              <Icon size={20} />
              {item.badge > 0 && (
                <span className="mobile-nav-badge">{item.badge > 9 ? "9+" : item.badge}</span>
              )}
            </div>
            <span className="mobile-bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
