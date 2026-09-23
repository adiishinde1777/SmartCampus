import React, { useState, useEffect } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import StudentRegisterPage from "./StudentRegisterPage";
import TeacherRegisterPage from "./TeacherRegisterPage";
import {
  GraduationCap,
  ShieldCheck,
  User,
  ArrowRight,
  BookOpen,
  Users,
  Building2,
  HeartHandshake,
  Sparkles,
  Phone,
  UserPlus,
  UserCheck,
  Code
} from "lucide-react";

export default function LoginPage() {
  const { login } = useSmartCampus();

  const [selectedRole, setSelectedRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegisterPage, setShowRegisterPage] = useState(() => {
    if (typeof window !== "undefined") {
      const param = new URLSearchParams(window.location.search).get("register");
      if (param === "student" || param === "teacher" || param === "hod" || param === "principal") {
        return param;
      }
    }
    return null;
  });

  // Listen for popstate or URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const param = new URLSearchParams(window.location.search).get("register");
      if (param === "student" || param === "teacher" || param === "hod" || param === "principal") {
        setShowRegisterPage(param);
      }
    };
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  const handleBackToLogin = () => {
    setShowRegisterPage(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("register");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  };

  if (showRegisterPage === "student") {
    return <StudentRegisterPage onBackToLogin={handleBackToLogin} />;
  }

  if (showRegisterPage === "teacher" || showRegisterPage === "hod" || showRegisterPage === "principal") {
    return <TeacherRegisterPage initialRole={showRegisterPage} onBackToLogin={handleBackToLogin} />;
  }

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError("");
    setUsername("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(username, password, selectedRole);
      if (!res.success) {
        setError(res.message || "Invalid credentials. Please verify your details.");
      }
    } catch (err) {
      setError(err.message || "Failed to authenticate. Ensure server is running.");
    } finally {
      setLoading(false);
    }
  };

  const getFieldLabels = () => {
    switch (selectedRole) {
      case "student":
        return {
          userLabel: "Student Mobile Number / Email ID / PRN",
          userPlaceholder: "e.g. 9876543210 or student@campus.edu or 24025331378056",
          passLabel: "Student Password",
          passPlaceholder: "Enter your password",
          hint: "Student login: Enter registered Mobile Number, Email ID, or PRN & your Password"
        };
      case "parent":
        return {
          userLabel: "Registered Parent Mobile Number",
          userPlaceholder: "e.g. 9422000000",
          passLabel: "Parent Password",
          passPlaceholder: "Enter your password",
          hint: "Parent login: Enter Parent Mobile Number & Password"
        };
      case "teacher":
        return {
          userLabel: "Faculty Mobile Number",
          userPlaceholder: "e.g. 9822000000",
          passLabel: "Faculty Password",
          passPlaceholder: "Enter your password",
          hint: "Teacher login: Enter Mobile Number & Password"
        };
      case "hod":
        return {
          userLabel: "HOD Mobile Number",
          userPlaceholder: "e.g. 9822000000",
          passLabel: "HOD Password",
          passPlaceholder: "Enter your password",
          hint: "HOD login: Enter Mobile Number & Password"
        };
      case "principal":
        return {
          userLabel: "Principal Mobile Number",
          userPlaceholder: "e.g. 9822000000",
          passLabel: "Principal Password",
          passPlaceholder: "Enter your password",
          hint: "Principal login: Enter Mobile Number & Password"
        };
      case "admin":
      default:
        return {
          userLabel: "Admin Mobile Number or Username",
          userPlaceholder: "admin or 7378535499",
          passLabel: "Admin Password",
          passPlaceholder: "••••••••",
          hint: "System Administrator: Enter admin credentials (admin / admin123)"
        };
    }
  };

  const fields = getFieldLabels();

  return (
    <div className="login-page-container">
      <div className="login-grid-wrapper">
        
        {/* Left Hero Pitch & Branding */}
        <div className="login-hero-col" style={{ padding: "4px" }}>
          <div className="login-hero-header">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", padding: "6px 14px", borderRadius: "30px", marginBottom: "16px" }}>
              <Sparkles size={16} color="#60a5fa" />
              <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#93c5fd", letterSpacing: "0.05em" }}>
                CAMPUS AUTOMATION & MANAGEMENT SYSTEM
              </span>
            </div>

            <h1 className="login-hero-title">
              SMART CAMPUS
            </h1>

            <p style={{ fontSize: "0.95rem", color: "#94a3b8", lineHeight: 1.5, marginBottom: "20px" }}>
              CSMSS Chh. Shahu College of Engineering • Integrated Academic, Faculty, Student & Parent Communication Portal
            </p>
          </div>

          {/* Student Online Registration Card */}
          <div className="enroll-prompt-card" style={{ marginBottom: "12px" }}>
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "white" }}>
                🎓 New Student Enrollment
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>
                Students: Fill academic profile & parent contact information
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowRegisterPage("student");
                const url = new URL(window.location.href);
                url.searchParams.set("register", "student");
                window.history.pushState({}, "", url.pathname + "?" + url.searchParams.toString());
              }}
              className="btn btn-primary btn-sm"
              style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
            >
              <UserPlus size={16} />
              <span>Student Register</span>
            </button>
          </div>

          {/* Teacher, HOD & Principal Onboarding Card (Separate Link) */}
          <div className="enroll-prompt-card" style={{ background: "rgba(124, 58, 237, 0.15)", borderColor: "rgba(167, 139, 250, 0.3)" }}>
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "#e9d5ff" }}>
                👨‍🏫 Faculty, HOD & Principal Registration
              </div>
              <div style={{ fontSize: "0.8rem", color: "#c4b5fd", marginTop: "2px" }}>
                Authorized Staff: Register using security key (csmss$2533)
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowRegisterPage("teacher");
                const url = new URL(window.location.href);
                url.searchParams.set("register", "teacher");
                window.history.pushState({}, "", url.pathname + "?" + url.searchParams.toString());
              }}
              className="btn btn-secondary btn-sm"
              style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", background: "#7c3aed", borderColor: "#6d28d9", color: "white" }}
            >
              <UserCheck size={16} />
              <span>Staff Register</span>
            </button>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="login-auth-card">
          <div style={{ marginBottom: "24px", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.55rem", fontWeight: "800", color: "#0f172a" }}>
              Sign In to Portal
            </h2>
            <p style={{ fontSize: "0.84rem", color: "#64748b", marginTop: "4px" }}>
              {fields.hint}
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                padding: "12px 14px",
                borderRadius: "10px",
                fontSize: "0.84rem",
                marginBottom: "18px",
                fontWeight: "600"
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Login Role</label>
              <select
                className="form-control"
                style={{ fontSize: "0.92rem", fontWeight: "600", padding: "10px 14px" }}
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <option value="student">🎓 Student</option>
                <option value="teacher">👨‍🏫 Teacher / Faculty</option>
                <option value="parent">👨‍👩‍👧 Parent / Guardian</option>
                <option value="hod">🏛️ Head of Department (HOD)</option>
                <option value="principal">🏫 Principal & Director</option>
                <option value="admin">⚙️ System Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>{fields.userLabel}</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={fields.userPlaceholder}
                style={{ padding: "10px 14px" }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>{fields.passLabel}</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={fields.passPlaceholder}
                style={{ padding: "10px 14px" }}
                required
              />
              {selectedRole === "admin" && (
                <small style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>
                  Default admin credentials: admin / admin123
                </small>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px" }}
            >
              <span>{loading ? "Verifying..." : "Authenticate & Enter Portal"}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Footer note */}
          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.78rem", color: "#64748b" }}>
            CSMSS Chh. Shahu College of Engineering • Academic Management System
          </div>
        </div>

      </div>

      {/* DEVELOPED BY ADITYA SHINDE BRANDING BADGE (PAGE FOOTER / DOWN MADHE) */}
      <div className="login-page-footer">
        <div className="dev-badge-card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                flexShrink: 0
              }}
            >
              <Code size={22} />
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "#93c5fd", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                SYSTEM ARCHITECT & DEVELOPER
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "white", letterSpacing: "0.01em" }}>
                Developed by Aditya Shinde
              </div>
            </div>
          </div>

          <a
            href="tel:7378535499"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "white",
              color: "#1e3a8a",
              padding: "9px 18px",
              borderRadius: "12px",
              fontWeight: "800",
              fontSize: "0.85rem",
              textDecoration: "none",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              whiteSpace: "nowrap"
            }}
          >
            <Phone size={16} color="#2563eb" />
            <span>Contact: 7378535499</span>
          </a>
        </div>

        <div style={{ textAlign: "center", marginTop: "14px", fontSize: "0.76rem", color: "#64748b" }}>
          CSMSS Chh. Shahu College of Engineering • SmartCampus ERP Portal
        </div>
      </div>
    </div>
  );
}
