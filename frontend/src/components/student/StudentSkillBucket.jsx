import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Code2,
  Plus,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FileText,
  Upload,
  ExternalLink,
  Trash2,
  Edit2,
  AlertCircle,
  Tag,
  BookOpen,
  Target,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles,
  Info,
  Check
} from "lucide-react";
import { Modal, Badge } from "../common/UIPrimitives";
import {
  TECHNICAL_OPTIONS,
  SKILL_LEVELS,
  EXPERIENCE_LEVELS,
  getSkillEmoji
} from "../../data/talentAndHealthData";

export default function StudentSkillBucket({ onNavigate }) {
  const {
    currentUser,
    studentSkills = [],
    addStudentSkill,
    updateStudentSkill,
    deleteStudentSkill
  } = useSmartCampus();

  const student = currentUser;

  // Tabs: 'skills' | 'courses' | 'exams' | 'readiness'
  const [activeTab, setActiveTab] = useState("skills");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("All");

  // Add/Edit Technical Skill Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);

  const [formData, setFormData] = useState({
    category: "Technical",
    skill: "Python",
    customSkill: "",
    skillLevel: "Intermediate",
    experienceLevel: "College Level",
    experienceDescription: "",
    achievements: [""],
    certificateUrl: "",
    certificateName: ""
  });

  // Course Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseFormData, setCourseFormData] = useState({
    courseName: "",
    coursePlatform: "Coursera",
    courseStatus: "Completed",
    completionDate: "May 2026",
    certificateUrl: "",
    certificateName: ""
  });

  // Exam Modal State
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [examFormData, setExamFormData] = useState({
    examName: "GATE",
    examStatus: "Appeared",
    examYear: "2026",
    examPaper: "Computer Science & IT (CS)",
    examScore: "",
    examRank: "",
    experienceDescription: ""
  });

  // Certificate Preview Modal State
  const [certPreviewModalOpen, setCertPreviewModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  // Filter skills for current student
  const mySkillsRaw = (studentSkills || []).filter((s) => s.studentId === student?.id);

  // Technical skills only (exclude cultural, sports, courses, exams)
  const myTechSkills = mySkillsRaw.filter(
    (s) =>
      s.type !== "course" &&
      s.type !== "exam" &&
      !s.courseStatus &&
      !s.examStatus &&
      (s.category === "Technical" || !s.category || TECHNICAL_OPTIONS.includes(s.skill))
  );

  const displayedSkills = selectedLevelFilter === "All"
    ? myTechSkills
    : myTechSkills.filter((s) => s.skillLevel === selectedLevelFilter);

  const myCourses = mySkillsRaw.filter(
    (s) => s.type === "course" || Boolean(s.courseStatus) || Boolean(s.courseName)
  );

  const myExams = mySkillsRaw.filter(
    (s) =>
      s.type === "exam" ||
      Boolean(s.examStatus) ||
      (s.examName && s.examName.toLowerCase().includes("gate")) ||
      (s.skill && s.skill.toLowerCase().includes("gate"))
  );

  const approvedCount = myTechSkills.filter((s) => s.approvalStatus === "Approved").length;
  const pendingCount = myTechSkills.filter((s) => s.approvalStatus === "Pending").length;
  const rejectedCount = myTechSkills.filter((s) => s.approvalStatus === "Rejected").length;

  const handleOpenAddModal = () => {
    setEditingSkillId(null);
    setFormData({
      category: "Technical",
      skill: TECHNICAL_OPTIONS[0],
      customSkill: "",
      skillLevel: "Intermediate",
      experienceLevel: "College Level",
      experienceDescription: "",
      achievements: [""],
      certificateUrl: "",
      certificateName: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (skillObj) => {
    setEditingSkillId(skillObj.id);
    const isStandard = TECHNICAL_OPTIONS.includes(skillObj.skill);

    setFormData({
      category: "Technical",
      skill: isStandard ? skillObj.skill : "Other",
      customSkill: isStandard ? "" : skillObj.skill,
      skillLevel: skillObj.skillLevel || "Intermediate",
      experienceLevel: skillObj.experienceLevel || "College Level",
      experienceDescription: skillObj.experienceDescription || "",
      achievements: skillObj.achievements && skillObj.achievements.length > 0 ? skillObj.achievements : [""],
      certificateUrl: skillObj.certificateUrl || "",
      certificateName: skillObj.certificateName || ""
    });
    setIsModalOpen(true);
  };

  const handleAchievementChange = (index, value) => {
    const updated = [...formData.achievements];
    updated[index] = value;
    setFormData({ ...formData, achievements: updated });
  };

  const handleAddAchievementField = () => {
    setFormData({ ...formData, achievements: [...formData.achievements, ""] });
  };

  const handleRemoveAchievementField = (index) => {
    const updated = formData.achievements.filter((_, i) => i !== index);
    setFormData({ ...formData, achievements: updated.length > 0 ? updated : [""] });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller document.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData({
        ...formData,
        certificateUrl: uploadEvent.target.result,
        certificateName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitSkill = (e) => {
    e.preventDefault();
    const finalSkillName = formData.skill === "Other"
      ? (formData.customSkill.trim() || "Technical Skill")
      : formData.skill;

    const cleanedAchievements = formData.achievements
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const payload = {
      studentId: student?.id || "stu-1",
      studentName: student?.name || "Aditya Shinde",
      departmentId: student?.departmentId || "dept-vlsi",
      departmentName: student?.departmentName || "Electronic Engineering (VLSI Design And Technology)",
      year: student?.year || "Third Year",
      semester: student?.semester || 5,
      division: student?.division || "A",
      rollNo: student?.rollNo || "VL3152",
      prn: student?.prn || student?.prnNo || "24025331378056",
      category: "Technical",
      skill: finalSkillName,
      customSkill: formData.skill === "Other" ? formData.customSkill : "",
      skillLevel: formData.skillLevel,
      experienceLevel: formData.experienceLevel,
      experienceDescription: formData.experienceDescription,
      achievements: cleanedAchievements,
      certificateUrl: formData.certificateUrl,
      certificateName: formData.certificateName,
      approvalStatus: "Pending", // Must be verified by department teacher
      submittedAt: new Date().toISOString()
    };

    if (editingSkillId) {
      updateStudentSkill(editingSkillId, payload);
    } else {
      addStudentSkill(payload);
    }
    setIsModalOpen(false);
  };

  // Course Handlers
  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    setCourseFormData({
      courseName: "",
      coursePlatform: "Coursera",
      courseStatus: "Completed",
      completionDate: "May 2026",
      certificateUrl: "",
      certificateName: ""
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (c) => {
    setEditingCourseId(c.id);
    setCourseFormData({
      courseName: c.courseName || c.skill,
      coursePlatform: c.coursePlatform || "Coursera",
      courseStatus: c.courseStatus || (c.certificateUrl ? "Completed" : "Ongoing"),
      completionDate: c.completionDate || "",
      certificateUrl: c.certificateUrl || "",
      certificateName: c.certificateName || ""
    });
    setIsCourseModalOpen(true);
  };

  const handleCourseFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setCourseFormData((prev) => ({
        ...prev,
        certificateUrl: uploadEvent.target.result,
        certificateName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitCourse = (e) => {
    e.preventDefault();
    const payload = {
      studentId: student?.id || "stu-1",
      studentName: student?.name || "Aditya Shinde",
      departmentId: student?.departmentId || "dept-vlsi",
      departmentName: student?.departmentName || "Electronic Engineering (VLSI Design And Technology)",
      year: student?.year || "Third Year",
      division: student?.division || "A",
      rollNo: student?.rollNo || "VL3152",
      prn: student?.prn || student?.prnNo || "24025331378056",
      phone: student?.phone || "",
      email: student?.email || "",
      type: "course",
      category: "Course",
      skill: courseFormData.courseName,
      courseName: courseFormData.courseName,
      coursePlatform: courseFormData.coursePlatform,
      courseStatus: courseFormData.courseStatus,
      completionDate: courseFormData.completionDate,
      certificateUrl: courseFormData.certificateUrl,
      certificateName: courseFormData.certificateName,
      approvalStatus: "Approved"
    };

    if (editingCourseId) {
      updateStudentSkill(editingCourseId, payload);
    } else {
      addStudentSkill(payload);
    }
    setIsCourseModalOpen(false);
  };

  // Exam Handlers
  const handleOpenAddExam = () => {
    setEditingExamId(null);
    setExamFormData({
      examName: "GATE",
      examStatus: "Appeared",
      examYear: "2026",
      examPaper: "Computer Science & IT (CS)",
      examScore: "",
      examRank: "",
      experienceDescription: ""
    });
    setIsExamModalOpen(true);
  };

  const handleOpenEditExam = (eItem) => {
    setEditingExamId(eItem.id);
    setExamFormData({
      examName: eItem.examName || eItem.skill || "GATE",
      examStatus: eItem.examStatus || "Appeared",
      examYear: eItem.examYear || "2026",
      examPaper: eItem.examPaper || "Computer Science & IT (CS)",
      examScore: eItem.examScore || "",
      examRank: eItem.examRank || "",
      experienceDescription: eItem.experienceDescription || ""
    });
    setIsExamModalOpen(true);
  };

  const handleSubmitExam = (e) => {
    e.preventDefault();
    const payload = {
      studentId: student?.id || "stu-1",
      studentName: student?.name || "Aditya Shinde",
      departmentId: student?.departmentId || "dept-vlsi",
      departmentName: student?.departmentName || "Electronic Engineering (VLSI Design And Technology)",
      year: student?.year || "Third Year",
      division: student?.division || "A",
      rollNo: student?.rollNo || "VL3152",
      prn: student?.prn || student?.prnNo || "24025331378056",
      phone: student?.phone || "",
      email: student?.email || "",
      type: "exam",
      category: "Competitive Exam",
      skill: `${examFormData.examName} (${examFormData.examStatus})`,
      examName: examFormData.examName,
      examStatus: examFormData.examStatus,
      examYear: examFormData.examYear,
      examPaper: examFormData.examPaper,
      examScore: examFormData.examScore,
      examRank: examFormData.examRank,
      experienceDescription: examFormData.experienceDescription,
      approvalStatus: "Approved"
    };

    if (editingExamId) {
      updateStudentSkill(editingExamId, payload);
    } else {
      addStudentSkill(payload);
    }
    setIsExamModalOpen(false);
  };

  const handleDelete = (id, label) => {
    if (window.confirm(`Are you sure you want to remove "${label}" from your skill bucket?`)) {
      deleteStudentSkill(id);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Hero Pitch Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
          color: "white",
          padding: "26px 30px",
          borderRadius: "18px",
          boxShadow: "0 10px 25px -5px rgba(30, 27, 75, 0.4)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99, 102, 241, 0.25)", border: "1px solid rgba(99, 102, 241, 0.4)", padding: "5px 12px", borderRadius: "20px", marginBottom: "12px" }}>
              <Code2 size={16} color="#a5b4fc" />
              <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#c7d2fe", letterSpacing: "0.04em" }}>
                INTERNSHIP & CAMPUS PLACEMENT SKILL BUCKET
              </span>
            </div>

            <h1 style={{ fontSize: "1.7rem", fontWeight: "800", color: "white", margin: 0 }}>
              Technical Skill Bucket (तांत्रिक कौशल्ये संच)
            </h1>

            <p style={{ fontSize: "0.92rem", color: "#cbd5e1", marginTop: "8px", maxWidth: "700px", lineHeight: "1.5" }}>
              Register your programming languages, VLSI, AI/ML, cloud, framework competencies, certification courses & GATE details for internships and campus placement drives.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "14px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#a5b4fc" }}>
                <CheckCircle2 size={16} color="#34d399" />
                <span>Verified by Class Teacher</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#a5b4fc" }}>
                <Briefcase size={16} color="#fbbf24" />
                <span>Visible to Visiting Tech Companies</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#a5b4fc" }}>
                <ShieldCheck size={16} color="#60a5fa" />
                <span>Direct Radar in HOD & Principal Login</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "220px" }}>
            <button
              onClick={handleOpenAddModal}
              className="btn btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 20px",
                fontWeight: "700",
                fontSize: "0.92rem",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)"
              }}
            >
              <Plus size={18} />
              <span>+ Add Technical Skill</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate("talent")}
              className="btn btn-secondary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 16px",
                fontWeight: "600",
                fontSize: "0.84rem",
                background: "rgba(255, 255, 255, 0.12)",
                color: "white",
                borderColor: "rgba(255, 255, 255, 0.2)"
              }}
            >
              <Sparkles size={16} color="#fcd34d" />
              <span>Go to Event Talents (कला व क्रीडा)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div className="card" style={{ padding: "18px", borderLeft: "4px solid #10b981", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)" }}>{approvedCount}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>Faculty Approved Skills</div>
          </div>
        </div>

        <div className="card" style={{ padding: "18px", borderLeft: "4px solid #f59e0b", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)" }}>{pendingCount}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>Pending Teacher Review</div>
          </div>
        </div>

        <div className="card" style={{ padding: "18px", borderLeft: "4px solid #3b82f6", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)" }}>{myCourses.length}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>Certifications & Courses</div>
          </div>
        </div>

        <div className="card" style={{ padding: "18px", borderLeft: "4px solid #8b5cf6", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Target size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)" }}>{myExams.length}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>GATE / Tech Exams</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="card">
        <div className="card-header" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTab("skills")}
              style={{
                padding: "12px 18px",
                border: "none",
                background: "transparent",
                fontWeight: activeTab === "skills" ? "800" : "600",
                color: activeTab === "skills" ? "var(--primary-600)" : "var(--text-muted)",
                borderBottom: activeTab === "skills" ? "3px solid var(--primary-600)" : "3px solid transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Code2 size={17} />
              <span>Technical Skills ({myTechSkills.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("courses")}
              style={{
                padding: "12px 18px",
                border: "none",
                background: "transparent",
                fontWeight: activeTab === "courses" ? "800" : "600",
                color: activeTab === "courses" ? "var(--primary-600)" : "var(--text-muted)",
                borderBottom: activeTab === "courses" ? "3px solid var(--primary-600)" : "3px solid transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Award size={17} />
              <span>Certifications & Courses ({myCourses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("exams")}
              style={{
                padding: "12px 18px",
                border: "none",
                background: "transparent",
                fontWeight: activeTab === "exams" ? "800" : "600",
                color: activeTab === "exams" ? "var(--primary-600)" : "var(--text-muted)",
                borderBottom: activeTab === "exams" ? "3px solid var(--primary-600)" : "3px solid transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Target size={17} />
              <span>GATE & Competitive Exams ({myExams.length})</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SUBTAB 1: TECHNICAL SKILLS */}
        {/* ============================================================== */}
        {activeTab === "skills" && (
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)" }}>Level:</span>
                {["All", "Beginner", "Intermediate", "Advanced", "Expert"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevelFilter(lvl)}
                    className="btn btn-sm"
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.76rem",
                      background: selectedLevelFilter === lvl ? "var(--primary-600)" : "var(--bg-subtle)",
                      color: selectedLevelFilter === lvl ? "white" : "var(--text-muted)",
                      borderColor: selectedLevelFilter === lvl ? "var(--primary-600)" : "var(--border-color)",
                      fontWeight: selectedLevelFilter === lvl ? "700" : "500"
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <button
                onClick={handleOpenAddModal}
                className="btn btn-primary btn-sm"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Plus size={15} /> Add Technical Skill
              </button>
            </div>

            {displayedSkills.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
                <Code2 size={42} style={{ margin: "0 auto 12px auto", opacity: 0.3 }} />
                <h4 style={{ fontWeight: "700", margin: "0 0 6px 0", color: "var(--text-main)" }}>
                  No Technical Skills in Bucket Yet
                </h4>
                <p style={{ fontSize: "0.86rem", maxWidth: "460px", margin: "0 auto 16px auto" }}>
                  Add your programming languages, VLSI frameworks, AI/ML libraries, or web development skills to be showcased for company internships.
                </p>
                <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
                  + Add Your First Technical Skill
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {displayedSkills.map((s) => {
                  const isApproved = s.approvalStatus === "Approved";
                  const isRejected = s.approvalStatus === "Rejected";

                  return (
                    <div
                      key={s.id}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-surface)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        position: "relative",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "1.6rem" }}>{getSkillEmoji(s.skill)}</span>
                          <div>
                            <div style={{ fontWeight: "800", fontSize: "1.05rem", color: "var(--text-main)" }}>
                              {s.skill}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>
                              {s.skillLevel} • {s.experienceLevel}
                            </div>
                          </div>
                        </div>

                        <div>
                          {isApproved ? (
                            <span style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", padding: "3px 8px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <CheckCircle2 size={12} /> Approved
                            </span>
                          ) : isRejected ? (
                            <span style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "3px 8px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <XCircle size={12} /> Rejected
                            </span>
                          ) : (
                            <span style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", padding: "3px 8px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Clock size={12} /> Pending Faculty Review
                            </span>
                          )}
                        </div>
                      </div>

                      {s.experienceDescription && (
                        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0", lineHeight: "1.4" }}>
                          {s.experienceDescription}
                        </p>
                      )}

                      {s.achievements && s.achievements.length > 0 && s.achievements[0] !== "" && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {s.achievements.map((ach, i) => (
                            <span
                              key={i}
                              style={{
                                background: "rgba(99, 102, 241, 0.08)",
                                color: "var(--primary-700)",
                                fontSize: "0.74rem",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontWeight: "600"
                              }}
                            >
                              🏆 {ach}
                            </span>
                          ))}
                        </div>
                      )}

                      {s.certificateUrl && (
                        <div style={{ marginTop: "4px" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCert(s);
                              setCertPreviewModalOpen(true);
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "4px 8px", fontSize: "0.75rem", color: "var(--primary-600)", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <FileText size={13} />
                            <span>View Proof / Certificate</span>
                          </button>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px", paddingTop: "8px", borderTop: "1px solid var(--border-color)" }}>
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "4px 8px", fontSize: "0.75rem", color: "var(--primary-600)" }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.skill)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#ef4444" }}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SUBTAB 2: COURSES & CERTIFICATIONS */}
        {/* ============================================================== */}
        {activeTab === "courses" && (
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ margin: "0", fontSize: "1.1rem", fontWeight: "800" }}>Online Certifications & NPTEL Courses</h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Verified course certifications give recruiters confidence in your domain knowledge.
                </p>
              </div>
              <button onClick={handleOpenAddCourse} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Plus size={15} /> Add Course / Certification
              </button>
            </div>

            {myCourses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                <Award size={38} style={{ opacity: 0.3, margin: "0 auto 10px auto" }} />
                <p>No certification courses added yet. Click above to add Coursera, NPTEL, Udemy certificates.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {myCourses.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-surface)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "0.98rem", color: "var(--text-main)" }}>
                          {c.courseName || c.skill}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--primary-600)", fontWeight: "600" }}>
                          Platform: {c.coursePlatform || "Online"}
                        </div>
                      </div>
                      <Badge variant={c.courseStatus === "Completed" ? "success" : "purple"}>
                        {c.courseStatus || "Completed"}
                      </Badge>
                    </div>

                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                      Completed / Expected: {c.completionDate || "2026"}
                    </div>

                    {c.certificateUrl && (
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCert(c);
                            setCertPreviewModalOpen(true);
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "4px 6px", fontSize: "0.75rem", color: "var(--primary-600)" }}
                        >
                          <FileText size={12} /> View Certificate
                        </button>
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid var(--border-color)" }}>
                      <button onClick={() => handleOpenEditCourse(c)} className="btn btn-ghost btn-sm" style={{ padding: "3px 6px", fontSize: "0.74rem" }}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => handleDelete(c.id, c.courseName || c.skill)} className="btn btn-ghost btn-sm" style={{ padding: "3px 6px", fontSize: "0.74rem", color: "#ef4444" }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SUBTAB 3: GATE & COMPETITIVE EXAMS */}
        {/* ============================================================== */}
        {activeTab === "exams" && (
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ margin: "0", fontSize: "1.1rem", fontWeight: "800" }}>GATE & Technical Competitive Exams</h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Highlight your GATE readiness, scores, and all-India ranks for R&D internships and PSU opportunities.
                </p>
              </div>
              <button onClick={handleOpenAddExam} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Plus size={15} /> Add GATE / Tech Exam
              </button>
            </div>

            {myExams.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                <Target size={38} style={{ opacity: 0.3, margin: "0 auto 10px auto" }} />
                <p>No competitive exams registered yet. Click above to add your GATE preparation or scores.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {myExams.map((eItem) => (
                  <div
                    key={eItem.id}
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-surface)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: "800", fontSize: "1.05rem", color: "var(--text-main)" }}>
                          {eItem.examName || eItem.skill}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          Paper: {eItem.examPaper || "Computer Science / VLSI"}
                        </div>
                      </div>
                      <Badge variant={eItem.examStatus === "Appeared" || eItem.examStatus === "Qualified" ? "success" : "purple"}>
                        {eItem.examStatus || "Preparing"}
                      </Badge>
                    </div>

                    <div style={{ display: "flex", gap: "14px", fontSize: "0.8rem", color: "var(--text-main)", marginTop: "4px" }}>
                      <div><strong>Year:</strong> {eItem.examYear || "2026"}</div>
                      {eItem.examScore && <div><strong>Score:</strong> {eItem.examScore}</div>}
                      {eItem.examRank && <div><strong>Rank:</strong> {eItem.examRank}</div>}
                    </div>

                    {eItem.experienceDescription && (
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                        {eItem.experienceDescription}
                      </p>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid var(--border-color)" }}>
                      <button onClick={() => handleOpenEditExam(eItem)} className="btn btn-ghost btn-sm" style={{ padding: "3px 6px", fontSize: "0.74rem" }}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => handleDelete(eItem.id, eItem.examName || eItem.skill)} className="btn btn-ghost btn-sm" style={{ padding: "3px 6px", fontSize: "0.74rem", color: "#ef4444" }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT TECHNICAL SKILL */}
      {/* ============================================================== */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSkillId ? "Edit Technical Skill" : "Add Technical Skill to Bucket"}
          maxWidth="600px"
        >
          <form onSubmit={handleSubmitSkill} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", padding: "12px", borderRadius: "8px", fontSize: "0.82rem", color: "#312e81" }}>
              💡 <strong>Placement Note:</strong> This technical skill will be submitted for teacher verification. Once approved, it will be visible to HOD and Principal for company campus visits and internship shortlisting.
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Technical Skill Name *</label>
              <select
                className="form-control"
                value={formData.skill}
                onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                required
              >
                {TECHNICAL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{getSkillEmoji(opt)} {opt}</option>
                ))}
              </select>
            </div>

            {formData.skill === "Other" && (
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Specify Custom Technical Skill *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Next.js, Kubernetes, Verilog, FPGA, TensorFlow..."
                  value={formData.customSkill}
                  onChange={(e) => setFormData({ ...formData, customSkill: e.target.value })}
                  required
                />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Proficiency Level *</label>
                <select
                  className="form-control"
                  value={formData.skillLevel}
                  onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                >
                  {SKILL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Experience Depth</label>
                <select
                  className="form-control"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                >
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Projects / Internship Description</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Mention key projects built using this skill, GitHub repos, or internship experience..."
                value={formData.experienceDescription}
                onChange={(e) => setFormData({ ...formData, experienceDescription: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Achievements & Hackathons</label>
              {formData.achievements.map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 1st Prize in Smart India Hackathon, Top 5% in Coding Contest..."
                    value={ach}
                    onChange={(e) => handleAchievementChange(i, e.target.value)}
                  />
                  {formData.achievements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievementField(i)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: "#ef4444" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddAchievementField}
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--primary-600)", fontWeight: "600", fontSize: "0.78rem" }}
              >
                + Add Another Achievement
              </button>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Upload Certificate / Proof (Optional)</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="form-control"
                onChange={handleFileUpload}
              />
              {formData.certificateName && (
                <small style={{ color: "#059669", display: "block", marginTop: "4px" }}>
                  ✓ Attached: {formData.certificateName}
                </small>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingSkillId ? "Update Skill" : "Submit for Faculty Approval"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT COURSE */}
      {/* ============================================================== */}
      {isCourseModalOpen && (
        <Modal
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          title={editingCourseId ? "Edit Course" : "Add Course / Certification"}
          maxWidth="550px"
        >
          <form onSubmit={handleSubmitCourse} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Course Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Machine Learning by Andrew Ng, NPTEL VLSI Design..."
                value={courseFormData.courseName}
                onChange={(e) => setCourseFormData({ ...courseFormData, courseName: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Platform</label>
                <select
                  className="form-control"
                  value={courseFormData.coursePlatform}
                  onChange={(e) => setCourseFormData({ ...courseFormData, coursePlatform: e.target.value })}
                >
                  <option value="Coursera">Coursera</option>
                  <option value="NPTEL">NPTEL / Swayam</option>
                  <option value="Udemy">Udemy</option>
                  <option value="edX">edX</option>
                  <option value="Infosys Springboard">Infosys Springboard</option>
                  <option value="College Workshop">College Workshop</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Status</label>
                <select
                  className="form-control"
                  value={courseFormData.courseStatus}
                  onChange={(e) => setCourseFormData({ ...courseFormData, courseStatus: e.target.value })}
                >
                  <option value="Completed">Completed</option>
                  <option value="Ongoing">Ongoing / Enrolled</option>
                  <option value="Interested">Planned / Interested</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Completion Date</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. May 2026"
                value={courseFormData.completionDate}
                onChange={(e) => setCourseFormData({ ...courseFormData, completionDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "700" }}>Certificate Upload (Optional)</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="form-control"
                onChange={handleCourseFileUpload}
              />
              {courseFormData.certificateName && (
                <small style={{ color: "#059669", display: "block", marginTop: "4px" }}>
                  ✓ File: {courseFormData.certificateName}
                </small>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <button type="button" onClick={() => setIsCourseModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Course
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT EXAM */}
      {/* ============================================================== */}
      {isExamModalOpen && (
        <Modal
          isOpen={isExamModalOpen}
          onClose={() => setIsExamModalOpen(false)}
          title={editingExamId ? "Edit Competitive Exam" : "Add GATE / Technical Exam"}
          maxWidth="550px"
        >
          <form onSubmit={handleSubmitExam} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Exam Name *</label>
                <select
                  className="form-control"
                  value={examFormData.examName}
                  onChange={(e) => setExamFormData({ ...examFormData, examName: e.target.value })}
                >
                  <option value="GATE">GATE</option>
                  <option value="GRE">GRE</option>
                  <option value="CAT">CAT</option>
                  <option value="CDAC CCAT">CDAC C-CAT</option>
                  <option value="UPSC / ESE">UPSC / ESE</option>
                  <option value="Other Technical Exam">Other Technical Exam</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Status *</label>
                <select
                  className="form-control"
                  value={examFormData.examStatus}
                  onChange={(e) => setExamFormData({ ...examFormData, examStatus: e.target.value })}
                >
                  <option value="Preparing">Preparing / Studying</option>
                  <option value="Registered">Registered for Exam</option>
                  <option value="Appeared">Appeared (Result Awaited)</option>
                  <option value="Qualified">Qualified / Scored</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Paper / Branch</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. CS / IT, EC, DA, EE..."
                  value={examFormData.examPaper}
                  onChange={(e) => setExamFormData({ ...examFormData, examPaper: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Year</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 2026 or 2027"
                  value={examFormData.examYear}
                  onChange={(e) => setExamFormData({ ...examFormData, examYear: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Score / Marks (If Qualified)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 680 / 1000"
                  value={examFormData.examScore}
                  onChange={(e) => setExamFormData({ ...examFormData, examScore: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">All India Rank (AIR)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. AIR 452"
                  value={examFormData.examRank}
                  onChange={(e) => setExamFormData({ ...examFormData, examRank: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <button type="button" onClick={() => setIsExamModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Exam Record
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Certificate Viewer Modal */}
      {certPreviewModalOpen && selectedCert && (
        <Modal
          isOpen={certPreviewModalOpen}
          onClose={() => setCertPreviewModalOpen(false)}
          title={`Certificate: ${selectedCert.skill || selectedCert.courseName}`}
          maxWidth="700px"
        >
          <div style={{ textAlign: "center", padding: "10px" }}>
            {selectedCert.certificateUrl?.startsWith("data:image") ? (
              <img
                src={selectedCert.certificateUrl}
                alt="Certificate"
                style={{ maxWidth: "100%", maxHeight: "500px", borderRadius: "8px", objectFit: "contain" }}
              />
            ) : (
              <iframe
                src={selectedCert.certificateUrl}
                title="Certificate PDF"
                style={{ width: "100%", height: "450px", border: "none", borderRadius: "8px" }}
              />
            )}
            <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setCertPreviewModalOpen(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
