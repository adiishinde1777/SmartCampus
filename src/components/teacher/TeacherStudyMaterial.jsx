import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Library,
  BookOpen,
  PlusCircle,
  Download,
  Trash2,
  Video,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  Users,
  ShieldCheck,
  Send
} from "lucide-react";
import { Badge, Modal, StatCard } from "../common/UIPrimitives";

export default function TeacherStudyMaterial() {
  const {
    currentUser,
    subjects,
    departments,
    classAssignments,
    studyMaterials,
    uploadStudyMaterial,
    deleteStudyMaterial,
    getTeacherResponsibilities,
    addToast
  } = useSmartCampus();

  const teacher = currentUser;
  const responsibilities = getTeacherResponsibilities(teacher?.id);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [selectedAudienceFilter, setSelectedAudienceFilter] = useState("all");

  const materialTypes = [
    "Lecture Notes",
    "PDF Notes",
    "PPT",
    "Assignments",
    "Question Papers",
    "Practical Manuals",
    "Important Questions",
    "Reference Material",
    "Video Links",
    "Other Study Material"
  ];

  // Upload Form State
  const [form, setForm] = useState({
    title: "",
    subjectId: subjects[0]?.id || "sub-vlsi501",
    departmentId: teacher?.departmentId || "dept-vlsi",
    year: "Third Year",
    semester: 5,
    division: "A",
    materialType: "Lecture Notes",
    description: "",
    fileUrl: "",
    videoUrl: "",
    targetAudience: "class", // "all" | "department" | "class" | "tg-batch"
    classAssignmentId: classAssignments?.[0]?.id || "ca-vlsi-te-5",
    tgBatchId: responsibilities.tgBatches?.[0]?.id || ""
  });

  // Materials uploaded by this teacher (or all for demo/remedial)
  const myMaterials = (studyMaterials || []).filter(
    (m) => m.uploadedById === teacher?.id || m.uploadedBy === teacher?.name || m.uploadedBy === "Prof. T. A. Mohije"
  );

  const filteredMaterials = myMaterials.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.title.toLowerCase().includes(term) ||
      m.subjectName?.toLowerCase().includes(term) ||
      m.description?.toLowerCase().includes(term);

    const matchesType = selectedTypeFilter === "all" || m.materialType === selectedTypeFilter || m.type === selectedTypeFilter;
    const matchesAudience = selectedAudienceFilter === "all" || m.targetAudience === selectedAudienceFilter;

    return matchesSearch && matchesType && matchesAudience;
  });

  const handleOpenUpload = () => {
    setForm({
      title: "",
      subjectId: subjects[0]?.id || "sub-vlsi501",
      departmentId: teacher?.departmentId || "dept-vlsi",
      year: "Third Year",
      semester: 5,
      division: "A",
      materialType: "Lecture Notes",
      description: "",
      fileUrl: "",
      videoUrl: "",
      targetAudience: "class",
      classAssignmentId: classAssignments?.[0]?.id || "ca-vlsi-te-5",
      tgBatchId: responsibilities.tgBatches?.[0]?.id || ""
    });
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const sub = subjects.find((s) => s.id === form.subjectId) || { name: "Engineering Subject" };
    const dept = departments.find((d) => d.id === form.departmentId) || { name: "Engineering Dept" };

    // Determine upload role
    let uploadedByRole = "Subject Teacher";
    if (form.targetAudience === "class") uploadedByRole = "Class Teacher";
    if (form.targetAudience === "tg-batch") uploadedByRole = "Teacher Guardian";

    uploadStudyMaterial({
      title: form.title,
      subjectId: form.subjectId,
      subjectName: sub.name,
      departmentId: form.departmentId,
      departmentName: dept.name,
      year: form.year,
      semester: Number(form.semester),
      division: form.division,
      materialType: form.materialType,
      type: form.materialType,
      description: form.description,
      fileUrl: form.fileUrl || "#",
      videoUrl: form.videoUrl || "",
      fileSize: form.videoUrl ? "Online Stream" : "3.2 MB",
      uploadedBy: teacher?.name || "Faculty",
      uploadedById: teacher?.id || "tea-1",
      uploadedByRole,
      targetAudience: form.targetAudience,
      classAssignmentId: form.classAssignmentId,
      tgBatchId: form.targetAudience === "tg-batch" ? form.tgBatchId : undefined
    });

    setIsUploadModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #065f46 0%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(6, 95, 70, 0.35)"
        }}
      >
        <div style={{ maxWidth: "680px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(16, 185, 129, 0.25)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              padding: "4px 12px",
              borderRadius: "20px",
              marginBottom: "10px"
            }}
          >
            <Library size={14} color="#6ee7b7" />
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#a7f3d0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Faculty Academic Resource Repository
            </span>
          </div>
          <h2 style={{ fontSize: "1.85rem", fontWeight: "800", color: "white", marginBottom: "8px" }}>
            Study Material & Notes Management Portal
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: 1.5 }}>
            Publish lecture notes, solved question papers, PPTs, practical manuals, and video lectures. Direct targeting to your Subject Students, Class Cohort, or designated TG Batch.
          </p>
        </div>

        <button
          onClick={handleOpenUpload}
          className="btn btn-primary btn-lg"
          style={{
            background: "linear-gradient(135deg, #059669, #047857)",
            boxShadow: "0 4px 15px rgba(5, 150, 105, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <PlusCircle size={18} />
          <span>Upload New Study Material</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <StatCard
          label="Published Materials"
          value={myMaterials.length}
          subtext="Available in Digital Library"
          icon={BookOpen}
          variant="success"
        />
        <StatCard
          label="Lecture Notes & PPTs"
          value={myMaterials.filter((m) => m.materialType?.includes("Notes") || m.materialType?.includes("PPT")).length}
          subtext="Classroom Syllabus Aids"
          icon={FileText}
          variant="primary"
        />
        <StatCard
          label="Question Banks & Manuals"
          value={myMaterials.filter((m) => m.materialType?.includes("Question") || m.materialType?.includes("Manual")).length}
          subtext="Exam & Practical Guides"
          icon={Layers}
          variant="purple"
        />
        <StatCard
          label="Targeted TG Remedials"
          value={myMaterials.filter((m) => m.targetAudience === "tg-batch").length}
          subtext="Exclusive Mentee Resources"
          icon={ShieldCheck}
          variant="warning"
        />
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Filter size={15} color="var(--text-muted)" />
              <select
                className="form-control"
                style={{ width: "auto", fontSize: "0.85rem" }}
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
              >
                <option value="all">All 10 Material Types</option>
                {materialTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <select
              className="form-control"
              style={{ width: "auto", fontSize: "0.85rem" }}
              value={selectedAudienceFilter}
              onChange={(e) => setSelectedAudienceFilter(e.target.value)}
            >
              <option value="all">All Audiences</option>
              <option value="class">Class Only</option>
              <option value="tg-batch">TG Batch Only</option>
              <option value="all">Entire College / Dept</option>
            </select>
          </div>

          <div style={{ position: "relative", minWidth: "240px" }}>
            <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search title, subject, notes..."
              className="form-control"
              style={{ paddingLeft: "30px", fontSize: "0.85rem" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title & Subject</th>
                <th>Material Type</th>
                <th>Target Audience</th>
                <th>Upload Role</th>
                <th>Published Date</th>
                <th>Size / Stream</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No study materials match your search filters.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            background: item.videoUrl ? "rgba(220, 38, 38, 0.1)" : "rgba(37, 99, 235, 0.1)",
                            color: item.videoUrl ? "#dc2626" : "var(--color-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}
                        >
                          {item.videoUrl ? <Video size={18} /> : <FileText size={18} />}
                        </div>
                        <div>
                          <strong style={{ fontSize: "0.92rem", color: "var(--text-main)" }}>{item.title}</strong>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            {item.subjectName} • Sem {item.semester || 5}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={item.videoUrl ? "danger" : "primary"}>
                        {item.materialType || item.type || "Notes"}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        variant={
                          item.targetAudience === "tg-batch"
                            ? "purple"
                            : item.targetAudience === "class"
                            ? "info"
                            : "secondary"
                        }
                      >
                        {item.targetAudience === "tg-batch"
                          ? "🛡️ TG Batch Only"
                          : item.targetAudience === "class"
                          ? "🎓 Class Cohort"
                          : "👥 All Enrolled"}
                      </Badge>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--text-main)" }}>
                        {item.uploadedByRole || "Faculty"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {item.uploadedDate || "Recent"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", fontFamily: "monospace" }}>
                        {item.fileSize || "3.2 MB"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        {item.videoUrl ? (
                          <a
                            href={item.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-ghost btn-sm"
                            title="Open Video Lecture"
                            style={{ color: "#dc2626" }}
                          >
                            <ExternalLink size={15} />
                          </a>
                        ) : (
                          <button
                            onClick={() => addToast("Downloading Material", `Downloading ${item.title}...`, "success")}
                            className="btn btn-ghost btn-sm"
                            title="Download Document"
                          >
                            <Download size={15} color="var(--primary-600)" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteStudyMaterial(item.id)}
                          className="btn btn-ghost btn-sm"
                          title="Delete Material"
                        >
                          <Trash2 size={15} color="var(--danger-solid)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: UPLOAD STUDY MATERIAL */}
      {/* ========================================================= */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Academic Study Material & Notes"
        maxWidth="680px"
      >
        <form onSubmit={handleUploadSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Material Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Unit 2: CMOS Inverter Sizing & Delay Analysis"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Subject / Course *</label>
              <select
                className="form-control"
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Material Type (10 Categories) *</label>
              <select
                className="form-control"
                value={form.materialType}
                onChange={(e) => setForm({ ...form, materialType: e.target.value })}
                style={{ fontWeight: "600" }}
              >
                {materialTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Department</label>
              <select
                className="form-control"
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Semester & Division</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  className="form-control"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
                <select
                  className="form-control"
                  value={form.division}
                  onChange={(e) => setForm({ ...form, division: e.target.value })}
                >
                  <option value="A">Div A</option>
                  <option value="B">Div B</option>
                  <option value="C">Div C</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Description / Key Concepts Covered</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Outline topics covered, key formulas, or homework problems..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Target Audience Selector */}
          <div
            style={{
              background: "var(--bg-surface-secondary)",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div style={{ fontSize: "0.82rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px" }}>
              Target Audience / Access Permissions *
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="targetAudience"
                  checked={form.targetAudience === "class"}
                  onChange={() => setForm({ ...form, targetAudience: "class" })}
                />
                <span><strong>Selected Class Cohort</strong> (e.g. TE VLSI Div A)</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="targetAudience"
                  checked={form.targetAudience === "tg-batch"}
                  onChange={() => setForm({ ...form, targetAudience: "tg-batch" })}
                />
                <span><strong>My TG Mentee Batch</strong> (Remedial questions & exclusive batch notes)</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="targetAudience"
                  checked={form.targetAudience === "all"}
                  onChange={() => setForm({ ...form, targetAudience: "all" })}
                />
                <span><strong>All Enrolled Students</strong> (Universal Open Repository)</span>
              </label>
            </div>
          </div>

          {/* Conditional Video or File link */}
          {form.materialType === "Video Links" ? (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Video Stream Link (YouTube / NPTEL / Drive URL) *</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                required
              />
            </div>
          ) : (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">File Attachment / PDF Link</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. /materials/sem5/vlsi501_unit2.pdf (or simulated upload)"
                value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" onClick={() => setIsUploadModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: "flex", gap: "6px" }}>
              <Send size={15} /> Publish Material & Notify Students
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
