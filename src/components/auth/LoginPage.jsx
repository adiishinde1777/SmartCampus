import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import StudentRegisterPage from "./StudentRegisterPage";
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
  Code
} from "lucide-react";

export default function LoginPage() {
  const { login } = useSmartCampus();

  const [selectedRole, setSelectedRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegisterPage, setShowRegisterPage] = useState(false);

  if (showRegisterPage) {
    return <StudentRegisterPage onBackToLogin={() => setShowRegisterPage(false)} />;
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

  // Dynamic input label and placeholder definitions
  const getFieldLabels = () => {
    switch (selectedRole) {
      case "student":
        return {
          userLabel: "Student PRN Number",
          userPlaceholder: "e.g. 24025331378056",
          passLabel: "Student Date of Birth (Password)",
          passPlaceholder: "YYYY-MM-DD (e.g. 2004-08-22)",
          hint: "Student login: Enter PRN as Username & Birthdate as Password"
        };
      case "parent":
        return {
          userLabel: "Registered Parent Mobile Number",
          userPlaceholder: "e.g. 9422000000",
          passLabel: "Student's Date of Birth (Password)",
          passPlaceholder: "YYYY-MM-DD (e.g. 2004-08-22)",
          hint: "Parent login: Enter Parent Mobile as Username & Ward DOB as Password"
        };
      case "teacher":
        return {
          userLabel: "Faculty Mobile Number",
          userPlaceholder: "e.g. 9822000000",
          passLabel: "Faculty Date of Birth (Password)",
          passPlaceholder: "YYYY-MM-DD (e.g. 1982-06-15)",
          hint: "Teacher login: Enter Mobile Number as Username & DOB as Password"
        };
      case "hod":
        return {
          userLabel: "HOD Mobile Number",
          userPlaceholder: "e.g. 9822000000",
          passLabel: "HOD Date of Birth (Password)",
          passPlaceholder: "YYYY-MM-DD (e.g. 1978-04-12)",
          hint: "HOD login: Enter Mobile Number as Username & DOB as Password"
        };
      case "principal":
        return {
          userLabel: "Principal Mobile Number",
          userPlaceholder: "e.g. 9822000000",
          passLabel: "Principal Date of Birth (Password)",
          passPlaceholder: "YYYY-MM-DD (e.g. 1972-11-20)",
          hint: "Principal login: Enter Mobile Number as Username & DOB as Password"
        };
      case "admin":
      default:
        return {
          userLabel: "Admin Username",
          userPlaceholder: "admin",
          passLabel: "Admin Password",
          passPlaceholder: "••••••••",
          hint: "System Administrator: Enter admin credentials"
        };
    }
  };

  const fields = getFieldLabels();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 10% 20%, #0b1329 0%, #151c38 50%, #030712 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        color: "white"
      }}
    >
      <div className="login-grid-wrapper">
        
        {/* Left Hero Pitch & Branding */}
        <div style={{ padding: "8px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", padding: "6px 14px", borderRadius: "30px", marginBottom: "20px" }}>
            <Sparkles size={16} color="#60a5fa" />
            <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#93c5fd", letterSpacing: "0.05em" }}>
              CAMPUS AUTOMATION & MANAGEMENT SYSTEM
            </span>
          </div>

          <h1 style={{ fontSize: "2.4rem", fontWeight: "800", lineHeight: 1.15, color: "white", marginBottom: "16px", letterSpacing: "-0.02em" }}>
            SMART CAMPUS
          </h1>

          <p style={{ fontSize: "1rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: "24px" }}>
            CSMSS Chh. Shahu College of Engineering • Integrated Academic, Faculty, Student & Parent Communication Portal
          </p>

          {/* Student Online Registration Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "16px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "20px"
            }}
          >
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "white" }}>
                New Student Enrollment Form
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>
                Fill your student profile & parent contact information online
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowRegisterPage(true)}
              className="btn btn-primary btn-sm"
              style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
            >
              <UserPlus size={16} />
              <span>Enroll Now</span>
            </button>
          </div>

          {/* DEVELOPED BY ADITYA SHINDE BRANDING BADGE */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(30, 64, 175, 0.3) 100%)",
              border: "1.5px solid rgba(96, 165, 250, 0.4)",
              backdropFilter: "blur(12px)",
              borderRadius: "18px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
              boxShadow: "0 10px 30px -5px rgba(37, 99, 235, 0.3)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)"
                }}
              >
                <Code size={24} />
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "#93c5fd", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  SYSTEM ARCHITECT & DEVELOPER
                </div>
                <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "white", letterSpacing: "0.01em" }}>
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

        </div>

        {/* Right Authentication Card */}
        <div
          style={{
            background: "white",
            color: "#0f172a",
            borderRadius: "24px",
            padding: "38px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
            border: "1px solid #e2e8f0"
          }}
        >
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
                type={selectedRole === "admin" ? "password" : "text"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={fields.passPlaceholder}
                style={{ padding: "10px 14px" }}
                required
              />
              <small style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>
                {selectedRole === "admin" ? "Default admin password is admin123" : "Format: YYYY-MM-DD or DD-MM-YYYY"}
              </small>
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
    </div>
  );
}
