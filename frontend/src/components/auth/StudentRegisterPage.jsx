import React, { useState } from "react";
import api from "../../services/api";
import { saveUserToFirestore } from "../../services/firebase";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  getAcademicSession,
  getYearPrefix,
  getYearDisplay,
  getStudentClassTitle
} from "../../utils/academicSession";
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
  ShieldCheck,
  Lock,
  Smartphone,
  Info
} from "lucide-react";

export default function StudentRegisterPage({ onBackToLogin }) {
  const { departments, addUser, addRegisteredUsers } = useSmartCampus();

  const defaultDept = departments[0] || { id: "dept-vlsi", code: "VLSI", name: "Electronic Engineering (VLSI Design And Technology)", divisions: ["A"] };

  const [formData, setFormData] = useState({
    name: "",
    prn: "",
    dob: "",
    rollNo: "",
    gender: "Male",
    bloodGroup: "O+",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    departmentId: defaultDept.id,
    departmentName: defaultDept.name,
    year: "1st Year",
    semester: 1,
    division: defaultDept.divisions?.[0] || "A",
    batch: "A1",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    parentOccupation: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const selectedDept = departments.find((d) => d.id === formData.departmentId) || defaultDept;
  const availableDivisions = selectedDept?.divisions?.length ? selectedDept.divisions : ["A"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    const dept = departments.find((d) => d.id === deptId) || defaultDept;
    const firstDiv = dept.divisions?.[0] || "A";
    setFormData((prev) => ({
      ...prev,
      departmentId: deptId,
      departmentName: dept.name,
      division: firstDiv
    }));
  };

  const handleYearChange = (e) => {
    const chosenYear = e.target.value;
    let sem = 1;
    if (chosenYear === "2nd Year") sem = 3;
    if (chosenYear === "3rd Year") sem = 5;
    if (chosenYear === "4th Year") sem = 7;
    setFormData((prev) => ({
      ...prev,
      year: chosenYear,
      semester: sem
    }));
  };

  const currentAcademicSession = getAcademicSession(formData.year, formData.semester);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. ALL QUESTIONS / FIELDS ARE STRICTLY COMPULSORY
    if (!formData.name.trim()) {
      setError("विद्यार्थ्याचे पूर्ण नाव भरणे बंधनकारक आहे. (Student Full Name is compulsory).");
      return;
    }

    if (!formData.email.trim()) {
      setError("विद्यार्थ्याचा ईमेल / Gmail आयडी भरणे बंधनकारक आहे. (Student Gmail / Email address is compulsory).");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("कृपया वैध Gmail / ईमेल आयडी प्रविष्ट करा. (Please enter a valid Gmail / Email address).");
      return;
    }

    const cleanPhone = (formData.phone || "").replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError("विद्यार्थ्याचा १० अंकी मोबाईल नंबर भरणे बंधनकारक आहे. (Student 10-digit Mobile Number is compulsory).");
      return;
    }

    if (!formData.password) {
      setError("विद्यार्थी लॉगिन पासवर्ड तयार करणे बंधनकारक आहे. (Please create a password for student account).");
      return;
    }

    if (!formData.confirmPassword) {
      setError("कृपया पासवर्ड कन्फर्म करा. (Please confirm your password).");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("पासवर्ड जुळत नाहीत. कृपया पुन्हा तपासा. (Student passwords do not match. Please re-enter).");
      return;
    }

    if (!formData.prn.trim()) {
      setError("विद्यार्थी PRN नंबर भरणे बंधनकारक आहे. (Student PRN Number is compulsory).");
      return;
    }

    if (!formData.rollNo.trim()) {
      setError("हजेरी / रोल नंबर भरणे बंधनकारक आहे. (Student Roll Number is compulsory).");
      return;
    }

    if (!formData.dob) {
      setError("जन्मतारीख निवडणे बंधनकारक आहे. (Student Date of Birth is compulsory).");
      return;
    }

    if (!formData.departmentId) {
      setError("कृपया विभाग / शाखा निवडा. (Please select Department / Branch).");
      return;
    }

    if (!formData.year) {
      setError("कृपया शैक्षणिक वर्ष निवडा. (Please select Academic Year).");
      return;
    }

    if (!formData.division) {
      setError("कृपया डिव्हिजन निवडा. (Please select Division).");
      return;
    }

    if (!formData.address.trim()) {
      setError("निवासाचा पूर्ण पत्ता भरणे बंधनकारक आहे. (Residential Address is compulsory).");
      return;
    }

    if (!formData.parentName.trim()) {
      setError("पालकांचे पूर्ण नाव भरणे बंधनकारक आहे. (Parent / Guardian Full Name is compulsory).");
      return;
    }

    const cleanParentPhone = (formData.parentPhone || "").replace(/\D/g, "").slice(-10);
    if (!cleanParentPhone || cleanParentPhone.length !== 10) {
      setError("पालकांचा १० अंकी मोबाईल नंबर भरणे बंधनकारक आहे. (Parent 10-digit Mobile Number is compulsory).");
      return;
    }

    if (!formData.parentEmail.trim()) {
      setError("पालकांचा ईमेल आयडी भरणे बंधनकारक आहे. (Parent Email ID is compulsory).");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail.trim())) {
      setError("कृपया वैध पालक ईमेल आयडी प्रविष्ट करा. (Please enter a valid Parent Email address).");
      return;
    }

    if (!formData.parentOccupation.trim()) {
      setError("पालकांचा व्यवसाय / नोकरी भरणे बंधनकारक आहे. (Parent Occupation / Profession is compulsory).");
      return;
    }

    setLoading(true);

    try {
      const yrPrefix = getYearPrefix(formData.year, formData.semester);
      const session = getAcademicSession(formData.year, formData.semester);
      const computedClassName = `${yrPrefix} ${selectedDept.code || selectedDept.name} – Semester ${formData.semester} (${formData.year}) – Div ${formData.division}`;
      const studentId = `stu-${cleanPhone}`;
      const parentId = `par-${cleanParentPhone}`;

      const studentPayload = {
        id: studentId,
        parentId: parentId,
        role: "student",
        name: formData.name.trim(),
        prn: formData.prn.trim(),
        dob: formData.dob,
        rollNo: formData.rollNo.trim(),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        phone: cleanPhone,
        email: formData.email.trim(),
        password: formData.password.trim(),
        address: formData.address.trim(),
        departmentId: formData.departmentId,
        departmentName: selectedDept.name,
        departmentCode: selectedDept.code || "",
        year: formData.year,
        semester: Number(formData.semester),
        division: formData.division,
        batch: formData.batch || `${formData.division}1`,
        className: computedClassName,
        academicSession: session,
        parentName: formData.parentName.trim(),
        parentPhone: cleanParentPhone,
        parentEmail: formData.parentEmail.trim(),
        parentOccupation: formData.parentOccupation.trim()
      };

      // 1. Persist student & parent into MySQL database (idempotent ON DUPLICATE KEY UPDATE)
      let res = null;
      try {
        res = await api.submitStudentRegistration(studentPayload);
      } catch (dbErr) {
        console.warn("[MySQL Student Registration Fallback]", dbErr.message);
      }

      // 2. Direct Firestore storage with NULL password for parent (Teacher sets password later)
      const studentToStore = res?.student ? { ...res.student, id: studentId } : studentPayload;
      saveUserToFirestore(studentToStore).catch((err) => console.warn('[Firestore Student Register Warning]', err.message));
      
      const parentToStore = {
        ...(res?.parent || {}),
        id: parentId,
        role: "parent",
        name: formData.parentName.trim(),
        phone: cleanParentPhone,
        email: formData.parentEmail.trim(),
        studentId: studentId,
        studentName: formData.name.trim(),
        departmentId: formData.departmentId,
        departmentName: selectedDept.name,
        password: null, // Strictly NULL until Class Teacher sets it!
        canLogin: false,
        isPasswordSet: false
      };

      saveUserToFirestore(parentToStore).catch((err) => console.warn('[Firestore Parent Register Warning]', err.message));

      // 3. Update live React context users
      if (addRegisteredUsers) {
        addRegisteredUsers(studentToStore, parentToStore);
      } else {
        addUser(studentPayload);
      }

      setSuccessData({
        name: formData.name.trim(),
        studentPhone: cleanPhone,
        studentEmail: formData.email.trim(),
        parentName: formData.parentName.trim(),
        parentPhone: cleanParentPhone,
        department: selectedDept.name,
        year: formData.year,
        semester: formData.semester,
        division: formData.division,
        className: computedClassName,
        academicSession: session
      });
    } catch (err) {
      setError(err.message || "नोंदणी सबमिट करण्यात त्रुटी आली. कृपया सर्व माहिती तपासा. (Failed to submit registration).");
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
            maxWidth: "640px",
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
              margin: "0 auto 16px"
            }}
          >
            <CheckCircle2 size={38} />
          </div>

          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a" }}>
            Registration Successful! 🎉
          </h2>
          <p style={{ color: "#64748b", marginTop: "6px", fontSize: "0.9rem" }}>
            विद्यार्थी नोंदणी यशस्वीरीत्या पूर्ण झाली आहे. (Student enrollment successfully saved).
          </p>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "18px",
              margin: "20px 0",
              textAlign: "left",
              fontSize: "0.85rem",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div>
              <span style={{ color: "#64748b" }}>विद्यार्थ्याचे नाव (Student):</span> <strong>{successData.name}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>ईमेल (Gmail):</span> <strong>{successData.studentEmail}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>शाखा व वर्ग (Class):</span> <strong>{successData.className}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>शैक्षणिक सत्र (Academic Session):</span> <strong style={{ color: "#2563eb" }}>{successData.academicSession}</strong>
            </div>
            
            <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "8px", marginTop: "4px" }}>
              <span style={{ color: "#64748b" }}>📱 विद्यार्थी लॉगिन आयडी:</span> <strong style={{ color: "#2563eb" }}>{successData.studentPhone}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>👨‍👩‍👧 पालक लॉगिन आयडी:</span> <strong style={{ color: "#059669" }}>{successData.parentPhone}</strong>
            </div>
            <div style={{ background: "#fef3c7", padding: "10px 12px", borderRadius: "8px", border: "1px solid #fde68a", fontSize: "0.8rem", color: "#92400e", marginTop: "4px" }}>
              🔒 <strong>पालक पासवर्ड सूचना (Parent Password Notice):</strong> पालकांचा पासवर्ड वर्गशिक्षकांकडून (Class Teacher) दिला जाईल. वर्गशिक्षकांनी पासवर्ड सेट केल्यानंतरच पालक लॉगिन करू शकतील.
            </div>
          </div>

          <button
            onClick={onBackToLogin}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <ArrowLeft size={18} />
            <span>Proceed to Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="login-page-container"
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 10% 20%, #0f172a 0%, #1e1b4b 50%, #020617 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px 16px",
        color: "white"
      }}
    >
      <div className="register-form-card" style={{ maxWidth: "840px", width: "100%" }}>
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "24px", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" }}>
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
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <GraduationCap size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Student Enrollment & Onboarding Form
              </h2>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0" }}>
                CSMSS Chh. Shahu College of Engineering • सर्व माहिती भरणे अनिवार्य आहे (All fields compulsory)
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <User size={18} color="#2563eb" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                  1. Student Profile & Credentials
                </h3>
              </div>
              <span style={{ fontSize: "0.76rem", background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: "8px", fontWeight: "700" }}>
                * All Fields Compulsory
              </span>
            </div>

            <div className="register-form-grid">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Student Full Name *</label>
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

              {/* STUDENT GMAIL / EMAIL FIELD */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Mail size={15} color="#2563eb" />
                  <span>Student Gmail / Email ID *</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="e.g. studentname@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group register-full-col">
                <label className="form-label" style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Smartphone size={16} color="#2563eb" />
                  <span>Student Mobile Number (Login Username) *</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", fontWeight: "700", color: "#64748b" }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    placeholder="10-digit Student Mobile Number"
                    className="form-control"
                    style={{ paddingLeft: "44px" }}
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <small style={{ color: "#64748b", fontSize: "0.72rem", marginTop: "4px", display: "block" }}>
                  💡 This mobile number will be used to log in to the Student Portal.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Create Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Choose any secure password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Student PRN Number *</label>
                <input
                  type="text"
                  name="prn"
                  className="form-control"
                  placeholder="e.g. 24025331733722"
                  value={formData.prn}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Roll Number *</label>
                <input
                  type="text"
                  name="rollNo"
                  className="form-control"
                  placeholder="e.g. VL3152 or CS2104"
                  value={formData.rollNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  className="form-control"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Department / Branch *</label>
                <select
                  name="departmentId"
                  className="form-control"
                  value={formData.departmentId}
                  onChange={handleDepartmentChange}
                  required
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Academic Year *</label>
                <select
                  name="year"
                  className="form-control"
                  value={formData.year}
                  onChange={handleYearChange}
                  required
                >
                  <option value="1st Year">1st Year (First Year - FE) • Session 2026-2030</option>
                  <option value="2nd Year">2nd Year (Second Year - SE) • Session 2025-2029</option>
                  <option value="3rd Year">3rd Year (Third Year - TE) • Session 2024-2028</option>
                  <option value="4th Year">4th Year (Final Year - BE) • Session 2023-2027</option>
                </select>
                <div style={{ marginTop: "4px", fontSize: "0.74rem", color: "#2563eb", fontWeight: "600" }}>
                  📅 Academic Batch Session: <strong>{currentAcademicSession}</strong>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Division *</label>
                <select
                  name="division"
                  className="form-control"
                  value={formData.division}
                  onChange={handleChange}
                  required
                >
                  {availableDivisions.map((div) => (
                    <option key={div} value={div}>
                      Division {div}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "14px" }}>
              <label className="form-label" style={{ fontWeight: "700" }}>Residential Address *</label>
              <textarea
                name="address"
                className="form-control"
                rows={2}
                placeholder="Full residential address, City, District, Pincode"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* SECTION 2: Parent / Guardian Information */}
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <HeartHandshake size={18} color="#f59e0b" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                  2. Parent / Guardian Contact Information
                </h3>
              </div>
              <span style={{ fontSize: "0.78rem", background: "#fef3c7", color: "#b45309", padding: "3px 10px", borderRadius: "12px", fontWeight: "600" }}>
                Password issued by Class Teacher
              </span>
            </div>

            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.82rem", color: "#475569", marginBottom: "16px" }}>
              ℹ️ <strong>पालक पासवर्ड सूचना (Parent Password Policy):</strong> पालकांचे लॉगिन युझरनेम त्यांचा मोबाईल नंबर असेल. पालकांचा पासवर्ड वर्गशिक्षकांकडून (Class Teacher) त्यांच्या पोर्टलवरून दिला जाईल. वर्गशिक्षकांनी पासवर्ड सेट केल्यानंतरच पालकांना लॉगिन करता येईल.
            </div>

            <div className="register-form-grid">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Parent / Guardian Full Name *</label>
                <input
                  type="text"
                  name="parentName"
                  className="form-control"
                  placeholder="e.g. Santosh B. Shinde"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Parent Mobile Number (Login Username) *</label>
                <input
                  type="tel"
                  name="parentPhone"
                  maxLength={10}
                  className="form-control"
                  placeholder="10-digit Parent Mobile"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  required
                />
                <small style={{ color: "#64748b", fontSize: "0.74rem" }}>
                  💡 This mobile number will be used for Parent Portal Login & SMS alerts
                </small>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Parent Email ID *</label>
                <input
                  type="email"
                  name="parentEmail"
                  className="form-control"
                  placeholder="e.g. parent@gmail.com"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Parent Occupation / Profession *</label>
                <input
                  type="text"
                  name="parentOccupation"
                  className="form-control"
                  placeholder="e.g. Farmer / Business / Government Service"
                  value={formData.parentOccupation}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "20px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onBackToLogin}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: "220px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {loading ? (
                <>Submitting Registration...</>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Enrollment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
