import React, { useState } from "react";
import api from "../../services/api";
import { saveUserToFirestore } from "../../services/firebase";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  GraduationCap,
  User,
  Phone,
  Mail,
  Building2,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  Send,
  AlertCircle,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Users,
  Smartphone,
  Key
} from "lucide-react";
export default function TeacherRegisterPage({ initialRole = "teacher", onBackToLogin }) {
  const { departments, addUser } = useSmartCampus();

  const defaultDept = departments[0] || {
    id: "dept-vlsi",
    name: "Electronic Engineering (VLSI Design And Technology)",
    divisions: ["A"]
  };

  const [role, setRole] = useState(
    initialRole === "principal" ? "principal" : initialRole === "hod" ? "hod" : "teacher"
  );
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    dob: "",
    password: "",
    confirmPassword: "",
    departmentId: defaultDept.id,
    departmentName: defaultDept.name,
    designation: initialRole === "principal" ? "Principal & Director" : initialRole === "hod" ? "Head of Department" : "Assistant Professor",
    assignedDivisions: "Div A"
  });

  // College Security Key (Required: csmss$2533 for Teacher, HOD, and Principal)
  const [staffPasskey, setStaffPasskey] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const selectedDept = departments.find((d) => d.id === formData.departmentId) || defaultDept;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    const dept = departments.find((d) => d.id === deptId) || defaultDept;
    setFormData((prev) => ({
      ...prev,
      departmentId: deptId,
      departmentName: dept.name
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("Please fill in your Full Name and Mobile Number.");
      return;
    }

    const cleanPhone = (formData.phone || "").replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit Indian Mobile Number.");
      return;
    }

    // MANDATORY SECURITY KEY CHECK: Teacher, HOD, and Principal require csmss$2533
    const enteredPasskey = (staffPasskey || "").trim().toLowerCase();
    if (enteredPasskey !== "csmss$2533") {
      setError("⛔ Invalid Security Key! Teachers, HODs, and Principal must enter the authorized college security key: csmss$2533");
      return;
    }

    if (!formData.password.trim()) {
      setError("Please set a password for your account.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = formData.phone.trim();
      const payload = {
        role,
        name: formData.name.trim(),
        phone: cleanPhone,
        email: formData.email.trim(),
        dob: formData.dob || "1988-01-01",
        password: formData.password.trim(),
        departmentId: formData.departmentId,
        departmentName: selectedDept.name,
        designation: role === "hod" ? "Head of Department" : formData.designation,
        assignedDivisions: formData.assignedDivisions,
        isVerified: true
      };

      // 1. Submit to Backend MySQL API if available
      let registeredFaculty = payload;
      try {
        const res = await api.submitFacultyRegistration(payload);
        if (res?.faculty) {
          registeredFaculty = res.faculty;
          addUser(res.faculty);
        } else {
          addUser(payload);
        }
      } catch (apiErr) {
        console.warn("[Faculty Register API Fallback to Local State]", apiErr.message);
        addUser(payload);
      }

      // 2. Persist faculty profile to Firebase Firestore Cloud Database
      saveUserToFirestore(registeredFaculty).catch((fsErr) =>
        console.warn("[Firestore Faculty Register Warning]", fsErr.message)
      );

      // 2. Dispatch Welcome & Login Credentials SMS via API & log
      const welcomeSms = `CSMSS SmartCampus: Dear ${formData.name.trim()}, your ${role.toUpperCase()} account is activated! Login Username: ${cleanPhone}, Password: ${formData.password.trim()}. Portal: CSMSS Chh. Shahu College of Engineering.`;
      try {
        await api.sendSms({
          recipientPhone: cleanPhone,
          recipientRole: role,
          studentName: formData.name.trim(),
          message: welcomeSms
        });
      } catch (smsErr) {
        console.warn("[Welcome SMS Warning]", smsErr.message);
      }

      setSuccessData({
        name: formData.name.trim(),
        phone: cleanPhone,
        password: formData.password.trim(),
        role,
        department: selectedDept.name,
        designation: role === "hod" ? "Head of Department" : formData.designation
      });
    } catch (err) {
      setError(err.message || "Failed to register account. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (successData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at 10% 20%, #0f172a 0%, #1e1b4b 50%, #020617 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          color: "white"
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            width: "100%",
            background: "white",
            color: "#0f172a",
            borderRadius: "20px",
            padding: "36px 30px",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#ecfdf5",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto"
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a" }}>
            Faculty Account Registered!
          </h2>
          <p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: "6px" }}>
            Welcome to CSMSS Chh. Shahu College of Engineering Faculty Portal. An activation SMS with your login credentials has been sent to your mobile.
          </p>

          <div
            style={{
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: "12px",
              padding: "18px 20px",
              marginTop: "20px",
              textAlign: "left",
              fontSize: "0.85rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#64748b" }}>Faculty Name:</span>
              <strong style={{ color: "#0f172a" }}>{successData.name}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#64748b" }}>Assigned Role:</span>
              <span
                style={{
                  background: "#dbeafe",
                  color: "#1e40af",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontWeight: "700"
                }}
              >
                {successData.role.toUpperCase()}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#64748b" }}>Login Username:</span>
              <strong style={{ color: "#1d4ed8" }}>{successData.phone}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#64748b" }}>Login Password:</span>
              <strong style={{ color: "#059669" }}>{successData.password}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Department:</span>
              <span style={{ color: "#0f172a", fontWeight: "600" }}>{successData.department}</span>
            </div>
          </div>

          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "10px",
              padding: "12px 16px",
              marginTop: "16px",
              fontSize: "0.82rem",
              color: "#1e40af",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textAlign: "left"
            }}
          >
            <Send size={18} style={{ flexShrink: 0 }} />
            <span>
              SMS Sent to <strong>+91 {successData.phone}</strong> with your login ID and password.
            </span>
          </div>

          <button
            onClick={onBackToLogin}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "24px", fontWeight: "700", padding: "12px" }}
          >
            Proceed to Faculty Sign In
          </button>
        </div>
      </div>
    );
  }

  // REGISTRATION FORM
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #111827 100%)",
        padding: "32px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white"
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          width: "100%",
          background: "white",
          color: "#0f172a",
          borderRadius: "20px",
          padding: "36px 32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)"
        }}
      >
        {/* Top Back Link & Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={onBackToLogin}
            style={{
              background: "none",
              border: "none",
              color: "#4f46e5",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.88rem",
              fontWeight: "700"
            }}
          >
            <ArrowLeft size={16} /> Back to Sign In
          </button>
          <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#64748b" }}>
            CSMSS Campus ERP Portal
          </span>
        </div>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#ede9fe",
              padding: "6px 14px",
              borderRadius: "20px",
              color: "#6d28d9",
              fontSize: "0.78rem",
              fontWeight: "800",
              marginBottom: "8px"
            }}
          >
            <Users size={15} /> FACULTY & HOD ONBOARDING
          </div>
          <h2 style={{ fontSize: "1.7rem", fontWeight: "800", color: "#0f172a" }}>
            Teacher / HOD Self-Registration
          </h2>
          <p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: "4px" }}>
            Join the academic faculty directory of CSMSS Chh. Shahu College of Engineering
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              padding: "12px 16px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              marginBottom: "20px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Role Choice */}
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <label className="form-label" style={{ fontWeight: "700", marginBottom: "8px" }}>
              Select Academic / Administrative Role *
            </label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  setRole("teacher");
                  setFormData((prev) => ({ ...prev, designation: "Assistant Professor" }));
                }}
                className={`btn btn-md ${role === "teacher" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, minWidth: "140px", fontWeight: "700" }}
              >
                👨‍🏫 Teacher / Faculty
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("hod");
                  setFormData((prev) => ({ ...prev, designation: "Head of Department" }));
                }}
                className={`btn btn-md ${role === "hod" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, minWidth: "140px", fontWeight: "700" }}
              >
                🏛️ Head of Department (HOD)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("principal");
                  setFormData((prev) => ({ ...prev, designation: "Principal & Director" }));
                }}
                className={`btn btn-md ${role === "principal" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, minWidth: "140px", fontWeight: "700" }}
              >
                🎓 Principal & Director
              </button>
            </div>
          </div>

          {/* Section 1: Personal & Contact Information */}
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>
              1. Personal & Contact Information
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Full Name with Title *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Prof. Nilesh Patil or Dr. Honade"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@csmss.engg.edu"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Mobile Phone Number */}
            <div className="form-group" style={{ marginTop: "14px" }}>
              <label className="form-label" style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                <Smartphone size={16} color="#4f46e5" />
                <span>Mobile Phone Number (Login ID) *</span>
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", fontWeight: "700", color: "#64748b" }}>
                  +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength={10}
                  placeholder="10-digit Mobile Number"
                  className="form-control"
                  style={{ paddingLeft: "44px" }}
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <small style={{ color: "#64748b", fontSize: "0.72rem", marginTop: "4px", display: "block" }}>
                This mobile number will be used to log in to the faculty/administration portal.
              </small>
            </div>
          </div>

          {/* Section 2: Department & Academic Designation */}
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>
              2. Academic Branch & Designation
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  className="form-control"
                  value={formData.departmentId}
                  onChange={handleDepartmentChange}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Designation *</label>
                {role === "principal" ? (
                  <input
                    type="text"
                    disabled
                    className="form-control"
                    value="Principal & Director"
                  />
                ) : role === "hod" ? (
                  <input
                    type="text"
                    disabled
                    className="form-control"
                    value="Head of Department (HOD)"
                  />
                ) : (
                  <select
                    name="designation"
                    className="form-control"
                    value={formData.designation}
                    onChange={handleChange}
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Adjunct Faculty">Adjunct Faculty</option>
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Divisions</label>
                <input
                  type="text"
                  name="assignedDivisions"
                  placeholder="e.g. Div A, Div B"
                  className="form-control"
                  value={formData.assignedDivisions}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Institute Faculty & Principal Security Key */}
          <div style={{ background: "#fefce8", border: "1.5px solid #fde047", padding: "18px", borderRadius: "12px" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "800", color: "#854d0e", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Key size={16} /> 3. College Security Verification Key (csmss$2533) *
            </h4>
            <p style={{ fontSize: "0.8rem", color: "#713f12", marginBottom: "12px", lineHeight: 1.4 }}>
              To ensure unauthorized users or students cannot register as staff, enter the official college security key <strong>csmss$2533</strong> (applicable for Teacher, HOD, and Principal).
            </p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Enter Security Key: csmss$2533"
                className="form-control"
                style={{ fontWeight: "700", fontFamily: "monospace", letterSpacing: "1px" }}
                value={staffPasskey}
                onChange={(e) => setStaffPasskey(e.target.value)}
                required
              />
            </div>
            <small style={{ color: "#a16207", fontSize: "0.72rem", marginTop: "4px", display: "block" }}>
              Authorized Key: <strong>csmss$2533</strong>
            </small>
          </div>

          {/* Section 4: Password Security */}
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>
              4. Set Account Password
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Create a strong password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748b"
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  placeholder="Re-enter password"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "14px",
              fontWeight: "800",
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #4f46e5, #4338ca)",
              cursor: "pointer"
            }}
          >
            {loading ? "Registering Account..." : `Complete & Activate ${role.toUpperCase()} Account`}
          </button>
        </form>
      </div>
    </div>
  );
}
