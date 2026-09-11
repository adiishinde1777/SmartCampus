import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  GraduationCap,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  BookOpen,
  Users,
  Building2,
  HeartHandshake,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export default function LoginPage() {
  const { login, switchUser, users, systemSettings } = useSmartCampus();

  const [email, setEmail] = useState("rahul.patil@campus.edu");
  const [password, setPassword] = useState("password123");
  const [selectedRole, setSelectedRole] = useState("student");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    const res = login(email, password, selectedRole);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleQuickLogin = (role) => {
    const matchedUser = users.find((u) => u.role === role);
    if (matchedUser) {
      setEmail(matchedUser.email);
      setPassword("password123");
      setSelectedRole(role);
      switchUser(matchedUser.id);
    }
  };

  const demoAccounts = [
    { role: "student", name: "Rahul Patil", title: "Student (Sem 5)", id: "stu-1", icon: GraduationCap, color: "#2563eb", bg: "#eff6ff" },
    { role: "teacher", name: "Prof. R. K. Patil", title: "Associate Professor", id: "tea-1", icon: BookOpen, color: "#7c3aed", bg: "#f5f3ff" },
    { role: "parent", name: "Suresh Patil", title: "Parent (Father of Rahul)", id: "par-1", icon: HeartHandshake, color: "#059669", bg: "#ecfdf5" },
    { role: "hod", name: "Dr. V. S. Rao", title: "HOD (Comp Engg)", id: "hod-1", icon: Users, color: "#d97706", bg: "#fffbeb" },
    { role: "principal", name: "Dr. S. K. Mehta", title: "Principal & Director", id: "prin-1", icon: Building2, color: "#dc2626", bg: "#fef2f2" },
    { role: "admin", name: "Admin Officer", title: "System Manager", id: "adm-1", icon: ShieldCheck, color: "#0891b2", bg: "#ecfeff" }
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 10% 20%, #0f172a 0%, #1e1b4b 50%, #020617 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        color: "white"
      }}
    >
      <div style={{ maxWidth: "1080px", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center" }}>
        
        {/* Left Hero Pitch */}
        <div style={{ padding: "20px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", padding: "6px 14px", borderRadius: "30px", marginBottom: "20px" }}>
            <Sparkles size={16} color="#60a5fa" />
            <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#93c5fd", letterSpacing: "0.05em" }}>
              ENTERPRISE CAMPUS AUTOMATION
            </span>
          </div>

          <h1 style={{ fontSize: "2.8rem", fontWeight: "800", lineHeight: 1.15, color: "white", marginBottom: "16px" }}>
            SMART CAMPUS
          </h1>

          <p style={{ fontSize: "1.15rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: "28px" }}>
            Academic, Attendance & Parent Communication Management System.
          </p>

          {/* Philosophy Banner */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "32px"
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              The Core Engine Loop
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "800", fontSize: "0.95rem", color: "white", flexWrap: "wrap" }}>
              <span>Track</span> ➔ <span>Alert</span> ➔ <span>Analyse</span> ➔ <span style={{ color: "#4ade80" }}>Act</span>
            </div>
          </div>

          {/* Role quick switcher buttons */}
          <div>
            <p style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: "600", marginBottom: "12px" }}>
              ⚡ 1-Click Instant Demo Portals:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    onClick={() => handleQuickLogin(acc.role)}
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "white",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(37, 99, 235, 0.25)";
                      e.currentTarget.style.borderColor = "#60a5fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: acc.bg,
                        color: acc.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: "700" }}>{acc.role.toUpperCase()}</div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{acc.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Login Card */}
        <div
          style={{
            background: "white",
            color: "var(--text-main)",
            borderRadius: "20px",
            padding: "36px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            border: "1px solid #e2e8f0"
          }}
        >
          <div style={{ marginBottom: "24px", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#0f172a" }}>Sign In to Portal</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Select your academic role and enter credentials
            </p>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "16px", fontWeight: "600" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Role Selector</label>
              <select
                className="form-control"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  const matched = users.find((u) => u.role === e.target.value);
                  if (matched) setEmail(matched.email);
                }}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher / Faculty</option>
                <option value="parent">Parent / Guardian</option>
                <option value="hod">Head of Department (HOD)</option>
                <option value="principal">Principal & Director</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Email or User ID</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul.patil@campus.edu"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label">Password</label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert("Demo Password for all accounts: password123"); }}
                  style={{ fontSize: "0.78rem", color: "var(--primary-600)", fontWeight: "600", textDecoration: "none" }}
                >
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <span>Authenticate & Enter</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #e2e8f0", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
            Demo Mode Active • Pre-configured credentials loaded
          </div>
        </div>

      </div>
    </div>
  );
}
