import React, { useState } from "react";
import api from "../../services/api";
import {
  GraduationCap,
  User,
  Calendar,
  Phone,
  Mail,
  Building2,
  BookOpen,
  HeartHandshake,
  CheckCircle2,
  ArrowLeft,
  Send,
  AlertCircle,
  ShieldCheck
} from "lucide-react";

export default function StudentRegisterPage({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    prn: "",
    dob: "",
    rollNo: "",
    gender: "Male",
    bloodGroup: "O+",
    phone: "",
    email: "",
    address: "",
    departmentId: "dept-vlsi",
    departmentName: "Electronic Engineering (VLSI Design And Technology)",
    semester: 5,
    year: "3rd Year",
    division: "A",
    batch: "TA1",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    parentOccupation: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.prn || !formData.dob) {
      setError("Please fill in all required fields: Name, PRN, and Date of Birth.");
      return;
    }

    if (!formData.parentName || !formData.parentPhone) {
      setError("Parent Name and Parent Mobile Number are required for communication.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitStudentRegistration(formData);
      setSuccessData({
        name: formData.name,
        prn: formData.prn,
        dob: formData.dob
      });
    } catch (err) {
      setError(err.message || "Failed to submit registration. Please check your data.");
    } finally {
      setLoading(false);
    }
  };

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
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "#ecfdf5",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px"
            }}
          >
            <CheckCircle2 size={40} />
          </div>

          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a" }}>
            Registration Successful!
          </h2>
          <p style={{ color: "#64748b", marginTop: "8px", fontSize: "0.95rem" }}>
            Your student profile and parent details have been securely recorded in the college database.
          </p>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "20px",
              margin: "24px 0",
              textAlign: "left"
            }}
          >
            <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
              Your Authorized Login Credentials:
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#64748b" }}>Username (PRN):</span>
              <strong style={{ fontFamily: "monospace", fontSize: "1.05rem" }}>{successData.prn}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Password (Birthdate):</span>
              <strong style={{ fontFamily: "monospace", fontSize: "1.05rem" }}>{successData.dob}</strong>
            </div>
          </div>

          <div style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "24px" }}>
            🔒 Parent Portal is linked with parent's mobile number. Faculty can verify and review your details.
          </div>

          <button
            onClick={onBackToLogin}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <ArrowLeft size={18} />
            <span>Go to Student Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 10% 20%, #0f172a 0%, #1e1b4b 50%, #020617 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "32px 16px",
        color: "white"
      }}
    >
      <div
        style={{
          maxWidth: "840px",
          width: "100%",
          background: "white",
          color: "#0f172a",
          borderRadius: "24px",
          padding: "36px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)"
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <GraduationCap size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Student Enrollment & Onboarding Form
              </h2>
              <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "2px 0 0" }}>
                CSMSS Chh. Shahu College of Engineering • Academic Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToLogin}
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={16} /> Back to Sign In
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "12px 16px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* SECTION 1: Student Information */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <User size={18} color="#2563eb" />
              <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                1. Student Information
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Aditya Santosh Shinde"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">PRN Number (Permanent Reg. No.) *</label>
                <input
                  type="text"
                  name="prn"
                  className="form-control"
                  placeholder="e.g. 24025331378056"
                  value={formData.prn}
                  onChange={handleChange}
                  required
                />
                <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
                  💡 This will be your permanent Student Login Username
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth (DOB) *</label>
                <input
                  type="date"
                  name="dob"
                  className="form-control"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
                <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
                  💡 This will be your Student Login Password
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input
                  type="text"
                  name="rollNo"
                  className="form-control"
                  placeholder="e.g. VL3152"
                  value={formData.rollNo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student Mobile Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="e.g. student@campus.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <select
                  name="departmentId"
                  className="form-control"
                  value={formData.departmentId}
                  onChange={(e) => {
                    const dName = e.target.value === "dept-vlsi"
                      ? "Electronic Engineering (VLSI Design And Technology)"
                      : e.target.value === "dept-cs"
                      ? "Computer Science and Engineering"
                      : "Engineering";
                    setFormData((prev) => ({ ...prev, departmentId: e.target.value, departmentName: dName }));
                  }}
                >
                  <option value="dept-vlsi">VLSI Design & Technology</option>
                  <option value="dept-cs">Computer Science & Engineering</option>
                  <option value="dept-mech">Mechanical Engineering</option>
                  <option value="dept-civil">Civil Engineering</option>
                  <option value="dept-ee">Electrical Engineering</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Semester & Division</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <select
                    name="semester"
                    className="form-control"
                    value={formData.semester}
                    onChange={handleChange}
                  >
                    <option value={1}>Sem 1 (1st Year)</option>
                    <option value={3}>Sem 3 (2nd Year)</option>
                    <option value={5}>Sem 5 (3rd Year)</option>
                    <option value={7}>Sem 7 (4th Year)</option>
                  </select>
                  <select
                    name="division"
                    className="form-control"
                    value={formData.division}
                    onChange={handleChange}
                  >
                    <option value="A">Div A</option>
                    <option value="B">Div B</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "12px" }}>
              <label className="form-label">Residential Address</label>
              <textarea
                name="address"
                className="form-control"
                rows={2}
                placeholder="Full residential address, City, Pincode"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* SECTION 2: Parent / Guardian Information */}
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <HeartHandshake size={18} color="#f59e0b" />
              <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                2. Parent / Guardian Details
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Parent / Guardian Full Name *</label>
                <input
                  type="text"
                  name="parentName"
                  className="form-control"
                  placeholder="e.g. Santosh Shinde"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Parent Mobile Number *</label>
                <input
                  type="tel"
                  name="parentPhone"
                  className="form-control"
                  placeholder="e.g. 9422000000"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  required
                />
                <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
                  Used for absence SMS alerts & parent authentication
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Parent Email</label>
                <input
                  type="email"
                  name="parentEmail"
                  className="form-control"
                  placeholder="e.g. parent@gmail.com"
                  value={formData.parentEmail}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Occupation / Profession</label>
                <input
                  type="text"
                  name="parentOccupation"
                  className="form-control"
                  placeholder="e.g. Business / Government Service"
                  value={formData.parentOccupation}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Privacy note */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                padding: "12px 16px",
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              <ShieldCheck size={20} color="#16a34a" />
              <div style={{ fontSize: "0.8rem", color: "#166534" }}>
                <strong>Privacy Protected:</strong> Parent Portal login uses the parent's registered mobile number and student's birthdate. Only teachers, administrators, and parents have authorization to manage parent profile settings.
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <Send size={18} />
            <span>{loading ? "Submitting Registration..." : "Submit Enrollment Record to Database"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
