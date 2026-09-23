import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  FileText,
  Upload,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Hospital,
  User,
  Phone,
  Search,
  Filter,
  Eye,
  Trash2,
  Download,
  AlertCircle,
  Stethoscope,
  Activity,
  ArrowRight,
  ExternalLink,
  Edit2
} from "lucide-react";
import { Modal, Badge } from "../common/UIPrimitives";
import { DOCTOR_LETTER_TYPES } from "../../data/talentAndHealthData";

export default function ParentDoctorLetters({ onNavigate }) {
  const {
    currentUser,
    users,
    doctorLetters,
    uploadDoctorLetter,
    updateDoctorLetter,
    deleteDoctorLetter,
    addToast
  } = useSmartCampus();

  const parent = currentUser;
  const ward = users.find((u) => u.id === parent?.studentId) || users[0];

  // Letters belonging to this ward or submitted by this parent
  const wardLetters = (doctorLetters || []).filter(
    (l) => l.studentId === ward?.id || l.parentId === parent?.id
  );

  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingLetterId, setEditingLetterId] = useState(null);
  const [previewLetter, setPreviewLetter] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    letterType: DOCTOR_LETTER_TYPES[0],
    doctorName: "",
    regNo: "",
    hospitalClinic: "",
    doctorContact: "",
    issueDate: new Date().toISOString().split("T")[0],
    isLeaveRelated: true,
    leaveStartDate: new Date().toISOString().split("T")[0],
    leaveEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    totalDays: 3,
    diagnosis: "",
    recommendations: "",
    applyForLeaveCondonation: true,
    documentUrl: "",
    documentName: "",
    documentSize: ""
  });

  // Calculate days dynamically
  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const diff = Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const handleOpenUploadModal = () => {
    setEditingLetterId(null);
    setFormData({
      letterType: DOCTOR_LETTER_TYPES[0],
      doctorName: "",
      regNo: "",
      hospitalClinic: "",
      doctorContact: "",
      issueDate: new Date().toISOString().split("T")[0],
      isLeaveRelated: true,
      leaveStartDate: new Date().toISOString().split("T")[0],
      leaveEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalDays: 3,
      diagnosis: "",
      recommendations: "",
      applyForLeaveCondonation: true,
      documentUrl: "",
      documentName: "",
      documentSize: ""
    });
    setIsUploadModalOpen(true);
  };

  const handleOpenEditModal = (letter) => {
    setEditingLetterId(letter.id);
    setFormData({
      letterType: letter.letterType || DOCTOR_LETTER_TYPES[0],
      doctorName: letter.doctorName || "",
      regNo: letter.regNo || "",
      hospitalClinic: letter.hospitalClinic || "",
      doctorContact: letter.doctorContact || "",
      issueDate: letter.issueDate || new Date().toISOString().split("T")[0],
      isLeaveRelated: !!(letter.leaveStartDate || letter.totalDays),
      leaveStartDate: letter.leaveStartDate || new Date().toISOString().split("T")[0],
      leaveEndDate: letter.leaveEndDate || new Date().toISOString().split("T")[0],
      totalDays: letter.totalDays || 1,
      diagnosis: letter.diagnosis || "",
      recommendations: letter.recommendations || "",
      applyForLeaveCondonation: letter.applyForLeaveCondonation !== false,
      documentUrl: letter.documentUrl || "",
      documentName: letter.documentName || "",
      documentSize: letter.documentSize || ""
    });
    setIsUploadModalOpen(true);
  };

  // Helper to load realistic sample doctor certificate for instant testing
  const handleLoadSample = (sampleType = "fever") => {
    if (sampleType === "fever") {
      setFormData({
        letterType: "Medical Sick Leave / Absence Certificate",
        doctorName: "Dr. S. K. Deshmukh (MD, General Medicine)",
        regNo: "MMC-2014-09-8821",
        hospitalClinic: "Deshmukh Care Clinic, Nirala Bazaar",
        doctorContact: "+91 98221 66778",
        issueDate: new Date().toISOString().split("T")[0],
        isLeaveRelated: true,
        leaveStartDate: new Date().toISOString().split("T")[0],
        leaveEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        totalDays: 3,
        diagnosis: "Acute viral pyrexia with persistent high fever and severe body weakness.",
        recommendations: "Strict bed rest for 3 days. Prescribed antipyretics and rehydration. Fit to resume duties post-recovery.",
        applyForLeaveCondonation: true,
        documentUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
        documentName: "Dr_Deshmukh_Medical_Leave_Certificate.pdf",
        documentSize: "385 KB"
      });
    } else {
      setFormData({
        letterType: "Medical Fitness & Resumption Certificate",
        doctorName: "Dr. Sunita V. Kulkarni (MBBS, DCH)",
        regNo: "MMC-2015-04-1188",
        hospitalClinic: "Sanjeevani Clinic, Cidco",
        doctorContact: "+91 98231 44556",
        issueDate: new Date().toISOString().split("T")[0],
        isLeaveRelated: false,
        leaveStartDate: null,
        leaveEndDate: null,
        totalDays: null,
        diagnosis: "Complete recovery from seasonal allergy and bronchial inflammation.",
        recommendations: "Student is medically fit to resume full college attendance and laboratory practicals.",
        applyForLeaveCondonation: false,
        documentUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
        documentName: "Doctor_Fitness_Certificate.pdf",
        documentSize: "290 KB"
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    const sizeStr =
      file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + " MB"
        : Math.round(file.size / 1024) + " KB";

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData((prev) => ({
        ...prev,
        documentUrl: uploadEvent.target.result,
        documentName: file.name,
        documentSize: sizeStr
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.doctorName.trim()) {
      addToast("Doctor Name Required", "Please enter the treating doctor's name.", "warning");
      return;
    }

    if (!formData.documentUrl && !editingLetterId) {
      addToast(
        "Document Required",
        "Please attach the doctor's letter, prescription, or certificate.",
        "warning"
      );
      return;
    }

    const payload = {
      studentId: ward?.id || "stu-1",
      studentName: ward?.name || "Aditya Shinde",
      prn: ward?.prn || ward?.prnNo || "24025331378056",
      rollNo: ward?.rollNo || "VL3152",
      departmentId: ward?.departmentId || "dept-vlsi",
      departmentName: ward?.departmentName || "Electronic Engineering (VLSI Design And Technology)",
      year: ward?.year || "Third Year",
      semester: ward?.semester || 5,
      division: ward?.division || "A",
      letterType: formData.letterType,
      doctorName: formData.doctorName.trim(),
      regNo: formData.regNo.trim() || "MMC-Pending",
      hospitalClinic: formData.hospitalClinic.trim() || "Private Clinic",
      doctorContact: formData.doctorContact.trim(),
      issueDate: formData.issueDate,
      leaveStartDate: formData.isLeaveRelated ? formData.leaveStartDate : null,
      leaveEndDate: formData.isLeaveRelated ? formData.leaveEndDate : null,
      totalDays: formData.isLeaveRelated ? Number(formData.totalDays) : null,
      diagnosis: formData.diagnosis.trim() || "Medical consultation recorded.",
      recommendations: formData.recommendations.trim() || "Prescribed rest / care as advised by doctor.",
      applyForLeaveCondonation: formData.isLeaveRelated ? formData.applyForLeaveCondonation : false,
      documentUrl: formData.documentUrl || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
      documentName: formData.documentName || "Doctor_Medical_Certificate.pdf",
      documentSize: formData.documentSize || "350 KB"
    };

    if (editingLetterId) {
      updateDoctorLetter(editingLetterId, payload);
    } else {
      uploadDoctorLetter(payload);
    }

    setIsUploadModalOpen(false);
  };

  // Filtered letters
  const filteredLetters = wardLetters.filter((l) => {
    const matchesFilter =
      filterType === "All" ||
      (filterType === "Verified" && l.status === "Verified") ||
      (filterType === "Pending Review" && l.status === "Pending Review") ||
      (filterType === "Sick Leave" && l.letterType.toLowerCase().includes("sick")) ||
      (filterType === "Fitness" && l.letterType.toLowerCase().includes("fitness"));

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      l.doctorName?.toLowerCase().includes(query) ||
      l.hospitalClinic?.toLowerCase().includes(query) ||
      l.diagnosis?.toLowerCase().includes(query) ||
      l.letterType?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  // Summary counts
  const totalLetters = wardLetters.length;
  const verifiedCount = wardLetters.filter((l) => l.status === "Verified").length;
  const pendingCount = wardLetters.filter((l) => l.status === "Pending Review").length;
  const excusedDays = wardLetters
    .filter((l) => l.status === "Verified" && l.totalDays)
    .reduce((sum, item) => sum + (Number(item.totalDays) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "26px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "18px",
          boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.4)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: "700"
              }}
            >
              PARENT MEDICAL DESK
            </span>
            <span style={{ fontSize: "0.8rem", color: "#a7f3d0" }}>
              Ward: <strong>{ward?.name}</strong> ({ward?.rollNo})
            </span>
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "white" }}>
            Doctor's Letters & Medical Certificates 🩺
          </h2>
          <p style={{ fontSize: "0.92rem", color: "#a7f3d0", marginTop: "4px", maxWidth: "680px" }}>
            Upload authentic doctor notes, sick leave certificates, fitness letters, and prescription proofs.
            Verified certificates are directly processed by the Teacher Guardian (TG) and HOD for official attendance excusal.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={handleOpenUploadModal}
            className="btn btn-primary btn-lg"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
              fontWeight: "700"
            }}
          >
            <Plus size={18} /> Upload Doctor's Letter
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate("health-info")}
              className="btn btn-secondary btn-lg"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "white",
                borderColor: "rgba(255,255,255,0.3)"
              }}
            >
              <Activity size={18} /> Health Profile
            </button>
          )}
        </div>
      </div>

      {/* 2. Privacy & Institutional Condonation Policy Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
          border: "1px solid #a7f3d0",
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          color: "#065f46"
        }}
      >
        <ShieldCheck size={28} style={{ flexShrink: 0, color: "#059669" }} />
        <div style={{ fontSize: "0.88rem", lineHeight: "1.5" }}>
          <strong>Institutional Attendance Condonation Norms:</strong> As per college regulations,
          student absences resulting from illness can be excused if supported by an authentic doctor's letter
          with medical registration number. Uploading a certificate notifies your ward's Teacher Guardian (Prof. T. A. Mohije)
          and HOD (Dr. Shrikant Honade) for rapid review.
        </div>
      </div>

      {/* 3. Summary Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
            <FileText size={22} />
          </div>
          <div>
            <div className="stat-value">{totalLetters}</div>
            <div className="stat-label">Total Doctor Letters</div>
            <div className="stat-subtext">Submitted by parent</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ color: "#16a34a" }}>{verifiedCount}</div>
            <div className="stat-label">Verified & Approved</div>
            <div className="stat-subtext">Approved for attendance condonation</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ color: "#d97706" }}>{pendingCount}</div>
            <div className="stat-label">Pending Faculty Review</div>
            <div className="stat-subtext">Under review by TG / HOD</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#f3e8ff", color: "#9333ea" }}>
            <Calendar size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ color: "#9333ea" }}>{excusedDays} Day(s)</div>
            <div className="stat-label">Medical Leave Excused</div>
            <div className="stat-subtext">Official duty/medical condoned</div>
          </div>
        </div>
      </div>

      {/* 4. Controls: Filter Tabs & Search */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["All", "Verified", "Pending Review", "Sick Leave", "Fitness"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`btn btn-sm ${filterType === tab ? "btn-primary" : "btn-secondary"}`}
              style={{
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "0.82rem"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Search doctor, hospital, or diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "36px", fontSize: "0.85rem" }}
          />
        </div>
      </div>

      {/* 5. Doctor Letters List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredLetters.length === 0 ? (
          <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <Stethoscope size={48} color="var(--text-light)" style={{ margin: "0 auto 12px auto" }} />
            <h4 style={{ fontSize: "1.15rem", fontWeight: "700" }}>
              {wardLetters.length === 0
                ? "No Doctor's Letters Uploaded Yet"
                : "No Letters Matching Selected Filter"}
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "460px", margin: "8px auto 18px auto" }}>
              Upload your doctor's certificate or prescription to ensure medical leaves are officially verified
              and your child's attendance percentage remains protected.
            </p>
            <button onClick={handleOpenUploadModal} className="btn btn-primary btn-sm">
              <Plus size={16} /> Upload Doctor's Letter Now
            </button>
          </div>
        ) : (
          filteredLetters.map((letter) => {
            const isVerified = letter.status === "Verified";
            const isPending = letter.status === "Pending Review";
            const isRejected = letter.status === "Rejected";

            return (
              <div
                key={letter.id}
                className="card"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  borderLeft: isVerified
                    ? "5px solid #10b981"
                    : isPending
                    ? "5px solid #f59e0b"
                    : "5px solid #ef4444",
                  transition: "all 0.2s ease"
                }}
              >
                {/* Card Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "0.76rem",
                          fontWeight: "800",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          background: isVerified ? "#dcfce7" : isPending ? "#fef3c7" : "#fee2e2",
                          color: isVerified ? "#15803d" : isPending ? "#b45309" : "#b91c1c"
                        }}
                      >
                        {isVerified && <CheckCircle2 size={13} />}
                        {isPending && <Clock size={13} />}
                        {isRejected && <XCircle size={13} />}
                        {letter.status}
                      </span>

                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Issued on: <strong>{new Date(letter.issueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</strong>
                      </span>

                      {letter.totalDays && (
                        <span
                          style={{
                            background: "var(--bg-surface-secondary)",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            color: "var(--primary-700)"
                          }}
                        >
                          {letter.totalDays} Days Absence
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)" }}>
                      {letter.letterType}
                    </h3>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setPreviewLetter(letter)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: "0.8rem", background: "#059669", borderColor: "#047857" }}
                    >
                      <Eye size={14} /> View Certificate
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(letter)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.8rem" }}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to withdraw this doctor letter?")) {
                          deleteDoctorLetter(letter.id);
                        }
                      }}
                      className="btn btn-danger btn-sm"
                      style={{ fontSize: "0.8rem", padding: "6px 10px" }}
                      title="Withdraw Letter"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Doctor & Clinic Grid */}
                <div
                  style={{
                    background: "var(--bg-surface-secondary)",
                    borderRadius: "10px",
                    padding: "16px 20px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "14px",
                    fontSize: "0.85rem"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                      Treating Doctor
                    </div>
                    <div style={{ fontWeight: "800", color: "var(--text-main)", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Stethoscope size={15} color="var(--primary-600)" />
                      {letter.doctorName}
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "1px" }}>
                      Reg No: <strong>{letter.regNo}</strong>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                      Hospital / Clinic
                    </div>
                    <div style={{ fontWeight: "700", color: "var(--text-main)", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Hospital size={15} color="var(--primary-600)" />
                      {letter.hospitalClinic}
                    </div>
                    {letter.doctorContact && (
                      <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "1px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Phone size={12} /> {letter.doctorContact}
                      </div>
                    )}
                  </div>

                  {letter.leaveStartDate && (
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                        Absence Period
                      </div>
                      <div style={{ fontWeight: "700", color: "#065f46", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={15} color="#059669" />
                        {letter.leaveStartDate} to {letter.leaveEndDate || letter.leaveStartDate}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "1px" }}>
                        Duration: <strong>{letter.totalDays || 1} Day(s)</strong>
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                      Attached Proof
                    </div>
                    <div style={{ marginTop: "2px" }}>
                      <button
                        onClick={() => setPreviewLetter(letter)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--primary-600)",
                          fontWeight: "800",
                          cursor: "pointer",
                          textDecoration: "underline",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: 0,
                          fontSize: "0.85rem"
                        }}
                      >
                        <FileText size={14} /> {letter.documentName}
                      </button>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Size: {letter.documentSize || "PDF"}
                    </div>
                  </div>
                </div>

                {/* Diagnosis & Recommendations */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                  <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Diagnosis / Medical Assessment
                    </div>
                    <p style={{ fontSize: "0.88rem", marginTop: "4px", color: "var(--text-main)", lineHeight: "1.5" }}>
                      {letter.diagnosis}
                    </p>
                  </div>

                  <div style={{ background: "#f0fdf4", padding: "12px 16px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#065f46", textTransform: "uppercase" }}>
                      Doctor's Advice & Instructions
                    </div>
                    <p style={{ fontSize: "0.88rem", marginTop: "4px", color: "#047857", lineHeight: "1.5" }}>
                      {letter.recommendations}
                    </p>
                  </div>
                </div>

                {/* Faculty Reviewer Remarks Footer */}
                {letter.verifiedBy ? (
                  <div
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "8px",
                      fontSize: "0.82rem"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#166534" }}>
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span>
                        Verified by: <strong>{letter.verifiedBy}</strong> on{" "}
                        {new Date(letter.verifiedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    {letter.reviewNotes && (
                      <div style={{ color: "var(--text-muted)" }}>
                        Official Remarks: <em style={{ color: "var(--text-main)", fontWeight: "600" }}>"{letter.reviewNotes}"</em>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: "10px",
                      fontSize: "0.8rem",
                      color: "#b45309",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <Clock size={14} />
                    Queued for Teacher Guardian and HOD verification. Attendance will be excused upon approval.
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. UPLOAD / EDIT DOCTOR LETTER MODAL */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={editingLetterId ? "Edit Doctor's Letter Details" : "Upload Doctor's Letter & Medical Certificate"}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Student Banner */}
          <div
            style={{
              background: "var(--bg-surface-secondary)",
              padding: "10px 14px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.82rem"
            }}
          >
            <div>
              Student: <strong>{ward?.name}</strong> (PRN: {ward?.prn || "24025331378056"})
            </div>
            <div style={{ color: "var(--text-muted)" }}>
              {ward?.departmentName} • Roll: {ward?.rollNo}
            </div>
          </div>

          {/* Letter Type */}
          <div className="form-group">
            <label className="form-label">Certificate / Letter Purpose *</label>
            <select
              className="form-control"
              value={formData.letterType}
              onChange={(e) => setFormData({ ...formData, letterType: e.target.value })}
            >
              {DOCTOR_LETTER_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Doctor Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Doctor's Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dr. R. K. Deshpande (MD)"
                required
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Doctor Medical Reg. No. *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. MMC-2012-08-3490"
                required
                value={formData.regNo}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Hospital / Clinic Name & City *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. City Care Multispeciality Hospital"
                required
                value={formData.hospitalClinic}
                onChange={(e) => setFormData({ ...formData, hospitalClinic: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Doctor / Clinic Contact No.</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. +91 98220 54321"
                value={formData.doctorContact}
                onChange={(e) => setFormData({ ...formData, doctorContact: e.target.value })}
              />
            </div>
          </div>

          {/* Date & Absence details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Certificate Issue Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ display: "flex", alignItems: "center", marginTop: "24px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={formData.isLeaveRelated}
                  onChange={(e) => setFormData({ ...formData, isLeaveRelated: e.target.checked })}
                  style={{ width: "16px", height: "16px" }}
                />
                This letter is for Student Medical Absence
              </label>
            </div>
          </div>

          {formData.isLeaveRelated && (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Absence Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.leaveStartDate}
                    onChange={(e) => {
                      const start = e.target.value;
                      setFormData({
                        ...formData,
                        leaveStartDate: start,
                        totalDays: calculateDays(start, formData.leaveEndDate)
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Absence End Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.leaveEndDate}
                    onChange={(e) => {
                      const end = e.target.value;
                      setFormData({
                        ...formData,
                        leaveEndDate: end,
                        totalDays: calculateDays(formData.leaveStartDate, end)
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Days</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.totalDays}
                    onChange={(e) => setFormData({ ...formData, totalDays: e.target.value })}
                  />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#065f46", cursor: "pointer", fontWeight: "700" }}>
                <input
                  type="checkbox"
                  checked={formData.applyForLeaveCondonation}
                  onChange={(e) => setFormData({ ...formData, applyForLeaveCondonation: e.target.checked })}
                  style={{ width: "16px", height: "16px" }}
                />
                Automatically apply for Attendance Condonation for these dates
              </label>
            </div>
          )}

          {/* Diagnosis & Recommendations */}
          <div className="form-group">
            <label className="form-label">Diagnosis / Reason for Medical Advice *</label>
            <textarea
              className="form-control"
              rows={2}
              required
              placeholder="e.g. Acute migraine with severe photophobia, recommended complete vocal and screen rest."
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Doctor's Recommendation / Prescribed Rest</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Complete bed rest for 3 days; exempt from outdoor sports/drills."
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
            />
          </div>

          {/* Document Upload */}
          <div className="form-group">
            <label className="form-label">Upload Doctor Letter / Medical Certificate Proof *</label>
            <div
              style={{
                border: "2px dashed var(--border-strong)",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                background: "var(--bg-surface-secondary)"
              }}
            >
              <Upload size={24} color="var(--primary-600)" style={{ margin: "0 auto 6px auto" }} />
              <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>Upload Scanned Letter / Prescription</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                Accepted: PDF, JPG, JPEG, PNG (Max 5MB configured limit)
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                style={{ fontSize: "0.82rem" }}
              />

              {formData.documentName && (
                <div style={{ fontSize: "0.82rem", color: "var(--success-text)", fontWeight: "700", marginTop: "8px" }}>
                  Attached: {formData.documentName} ({formData.documentSize})
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: "700" }}>
              {editingLetterId ? "Save Changes" : "Submit Doctor's Letter"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. FULL DOCUMENT PREVIEW MODAL */}
      <Modal
        isOpen={!!previewLetter}
        onClose={() => setPreviewLetter(null)}
        title="Official Doctor's Certificate Viewer"
        maxWidth="640px"
      >
        {previewLetter && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Header info bar */}
            <div
              style={{
                background: "var(--bg-surface-secondary)",
                borderRadius: "8px",
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                fontSize: "0.82rem"
              }}
            >
              <div>
                <div><strong>{previewLetter.doctorName}</strong> ({previewLetter.regNo})</div>
                <div style={{ color: "var(--text-muted)" }}>{previewLetter.hospitalClinic}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "10px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    background: previewLetter.status === "Verified" ? "#dcfce7" : "#fef3c7",
                    color: previewLetter.status === "Verified" ? "#15803d" : "#b45309"
                  }}
                >
                  {previewLetter.status}
                </span>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Issued: {previewLetter.issueDate}
                </div>
              </div>
            </div>

            {/* Document Render Box */}
            <div
              style={{
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center",
                background: "#f8fafc",
                minHeight: "320px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {previewLetter.documentUrl?.startsWith("data:image") ||
              previewLetter.documentUrl?.includes("unsplash.com") ? (
                <img
                  src={previewLetter.documentUrl}
                  alt="Doctor Certificate Proof"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "380px",
                    borderRadius: "6px",
                    objectFit: "contain",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                />
              ) : (
                <div style={{ padding: "32px 16px" }}>
                  <FileText size={56} color="var(--primary-600)" style={{ margin: "0 auto 12px auto" }} />
                  <div style={{ fontWeight: "800", fontSize: "1.05rem" }}>{previewLetter.documentName}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Official PDF Document on Institutional File ({previewLetter.documentSize || "PDF"})
                  </div>
                </div>
              )}
            </div>

            {/* Letter Summary Details */}
            <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>Diagnosis: </span>
                <span>{previewLetter.diagnosis}</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>Advice: </span>
                <span>{previewLetter.recommendations}</span>
              </div>
              {previewLetter.reviewNotes && (
                <div style={{ background: "#f0fdf4", padding: "8px 12px", borderRadius: "6px", color: "#166534" }}>
                  <strong>Verified by {previewLetter.verifiedBy}:</strong> "{previewLetter.reviewNotes}"
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => addToast("Document Download", `Downloading ${previewLetter.documentName}...`, "info")}
              >
                <Download size={15} /> Download Copy
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setPreviewLetter(null)}
              >
                Close Viewer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
