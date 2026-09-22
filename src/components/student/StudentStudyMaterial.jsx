import React, { useState, useMemo } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  BookOpen,
  Download,
  FileText,
  Search,
  Filter,
  Layers,
  GraduationCap,
  ExternalLink,
  Sparkles,
  Bookmark,
  CheckCircle2,
  FolderDown,
  Info,
  ShieldCheck,
  Video,
  PlayCircle,
  HelpCircle,
  FileCode,
  Paperclip,
  X
} from "lucide-react";

export default function StudentStudyMaterial() {
  const {
    currentUser,
    studyMaterials,
    classAssignments,
    getSubjectsForDepartmentAndSemester,
    getStudyMaterialsForStudent,
    addToast
  } = useSmartCampus();

  const [selectedSemester, setSelectedSemester] = useState(currentUser?.semester || 5);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedAudience, setSelectedAudience] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  const isFirstYear = currentUser?.year === "First Year" || currentUser?.year === "FE" || selectedSemester <= 2;

  // Subjects for the selected semester safely resolved
  const semesterSubjects = useMemo(() => {
    if (typeof getSubjectsForDepartmentAndSemester === "function" && currentUser?.departmentId) {
      try {
        const res = getSubjectsForDepartmentAndSemester(currentUser.departmentId, selectedSemester);
        return Array.isArray(res) ? res : [];
      } catch (e) {
        console.warn("Could not retrieve semester subjects:", e);
      }
    }
    return [];
  }, [getSubjectsForDepartmentAndSemester, currentUser?.departmentId, selectedSemester]);

  // Student's TG Batch info if available
  const studentTgInfo = useMemo(() => {
    if (!currentUser || !classAssignments) return null;
    for (const ca of classAssignments) {
      if (ca.departmentId === currentUser.departmentId && ca.division === currentUser.division) {
        for (const batch of ca.tgBatches || []) {
          if ((batch.studentIds || []).includes(currentUser.id)) {
            return {
              batchName: batch.batchName,
              teacherName: batch.teacherName,
              className: ca.className
            };
          }
        }
      }
    }
    return null;
  }, [currentUser, classAssignments]);

  // Retrieve authorized materials using context helper or filter logic
  const authorizedMaterials = useMemo(() => {
    if (getStudyMaterialsForStudent) {
      return getStudyMaterialsForStudent(currentUser);
    }
    return studyMaterials || [];
  }, [getStudyMaterialsForStudent, currentUser, studyMaterials]);

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return (authorizedMaterials || []).filter((item) => {
      // Semester match
      const matchSem = item.semester ? item.semester === Number(selectedSemester) : true;
      
      // Subject match
      const matchSubject = selectedSubject === "all" || item.subjectId === selectedSubject;

      // Type match
      const matchType = selectedType === "all" || item.materialType === selectedType || item.type === selectedType;

      // Audience match
      const matchAudience = selectedAudience === "all" || item.targetAudience === selectedAudience;

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q) ||
        item.subjectName?.toLowerCase().includes(q);

      return matchSem && matchSubject && matchType && matchAudience && matchQuery;
    });
  }, [authorizedMaterials, selectedSemester, selectedSubject, selectedType, selectedAudience, searchQuery]);

  const handleDownload = (item) => {
    if (item.materialType === "Video Links" || item.type === "Video Links") {
      if (item.videoUrl) {
        window.open(item.videoUrl, "_blank");
      } else {
        addToast({
          type: "info",
          title: "Video Lecture",
          message: `Opening reference link for "${item.title}"`
        });
      }
      return;
    }

    addToast({
      type: "success",
      title: "Downloading Material",
      message: `Started downloading "${item.title}" (${item.fileSize || "1.8 MB"})`
    });
  };

  const materialTypes = [
    "all",
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

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <h1 className="view-title" style={{ margin: 0 }}>Digital Study Repository & Notes</h1>
              {isFirstYear ? (
                <span className="badge badge-purple" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                  <Layers size={13} /> Common First Year Repository
                </span>
              ) : (
                <span className="badge badge-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                  <BookOpen size={13} /> {currentUser?.branch || "Engineering"} - Sem {selectedSemester}
                </span>
              )}
            </div>
            <p className="view-subtitle" style={{ margin: 0 }}>
              Access faculty lecture slides, Class Teacher blueprints, TG batch remedial guides, and previous question banks.
            </p>
          </div>

          {/* Semester Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-surface)", padding: "4px 8px", borderRadius: "10px", border: "1.5px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600, paddingRight: "4px" }}>Semester:</span>
            {[3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                className={`btn btn-sm ${selectedSemester === sem ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "4px 10px", fontSize: "0.78rem", fontWeight: "700" }}
                onClick={() => { setSelectedSemester(sem); setSelectedSubject("all"); }}
              >
                Sem {sem}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mentorship / TG Batch Banner */}
      {studentTgInfo && (
        <div style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff"
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "0.95rem" }}>
                Teacher Guardian Mentorship: {studentTgInfo.batchName} ({studentTgInfo.className})
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Assigned Mentor: <strong>{studentTgInfo.teacherName}</strong> • Special remedial modules and counseling resources available below.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setSelectedAudience(selectedAudience === "tg-batch" ? "all" : "tg-batch")}
              style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              <ShieldCheck size={14} /> {selectedAudience === "tg-batch" ? "Showing All" : "Filter TG Notes"}
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div
        className="card"
        style={{
          padding: "18px 22px",
          marginBottom: "1.5rem",
          background: "var(--bg-surface)",
          border: "1.5px solid var(--border-subtle)",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", alignItems: "center" }}>
          {/* Search Input */}
          <div style={{ position: "relative", minWidth: "240px" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--primary-600)",
                pointerEvents: "none"
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search title, unit, or faculty..."
              style={{
                paddingLeft: "42px",
                paddingRight: searchQuery ? "38px" : "14px",
                height: "44px",
                borderRadius: "10px",
                border: "1.5px solid var(--border-subtle)",
                fontSize: "0.88rem",
                boxShadow: "none"
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Subject Filter */}
          <div>
            <select
              className="form-control"
              style={{ height: "44px", borderRadius: "10px", fontSize: "0.84rem", border: "1.5px solid var(--border-subtle)" }}
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="all">All Subjects (Sem {selectedSemester})</option>
              {(semesterSubjects || []).map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Material Type Filter */}
          <div>
            <select
              className="form-control"
              style={{ height: "44px", borderRadius: "10px", fontSize: "0.84rem", border: "1.5px solid var(--border-subtle)" }}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {(materialTypes || []).map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All Material Types" : t}
                </option>
              ))}
            </select>
          </div>

          {/* Target Audience Filter */}
          <div>
            <select
              className="form-control"
              style={{ height: "44px", borderRadius: "10px", fontSize: "0.84rem", border: "1.5px solid var(--border-subtle)" }}
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
            >
              <option value="all">All Audiences</option>
              <option value="all-students">Campus / Dept Wide</option>
              <option value="class">Class Teacher Exclusives</option>
              <option value="tg-batch">TG Mentorship Batch Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {(filteredMaterials || []).map((item) => {
          const typeName = item.materialType || item.type || "Lecture Notes";
          const isVideo = typeName === "Video Links" || !!item.videoUrl;

          return (
            <div
              key={item.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "1.25rem",
                transition: "transform 0.2s, box-shadow 0.2s",
                border: "1px solid var(--border-subtle)",
                borderTop: item.targetAudience === "tg-batch" ? "3px solid #10b981" : item.targetAudience === "class" ? "3px solid #6366f1" : "1px solid var(--border-subtle)"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", gap: "0.5rem" }}>
                  <span className={`badge ${
                    typeName.includes("Notes") ? "badge-success" :
                    typeName.includes("Assignment") ? "badge-warning" :
                    typeName.includes("Video") ? "badge-info" :
                    typeName.includes("Manual") ? "badge-purple" : "badge-primary"
                  }`}>
                    {typeName}
                  </span>
                  
                  {item.targetAudience === "tg-batch" ? (
                    <span className="badge badge-success" style={{ fontSize: "0.72rem" }}>
                      <ShieldCheck size={11} style={{ marginRight: "0.2rem" }} /> TG Batch
                    </span>
                  ) : item.targetAudience === "class" ? (
                    <span className="badge badge-purple" style={{ fontSize: "0.72rem" }}>
                      <GraduationCap size={11} style={{ marginRight: "0.2rem" }} /> Class Special
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                      {item.fileSize || "1.5 MB"}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.35rem" }}>
                  {item.title}
                </h3>
                <div style={{ fontSize: "0.82rem", color: "var(--primary-600)", fontWeight: 600, marginBottom: "0.5rem" }}>
                  {item.subjectName || "Core Engineering"}
                </div>
                <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.4, marginBottom: "1rem" }}>
                  {item.description}
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                    By <strong style={{ color: "var(--text-main)" }}>{item.author || item.teacherName || "Faculty"}</strong>
                  </span>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                    {item.uploadedDate || item.createdAt || "Recent"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {isVideo ? (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
                      onClick={() => setActiveVideoModal(item)}
                    >
                      <PlayCircle size={15} /> Watch Video Lecture
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
                        onClick={() => handleDownload(item)}
                      >
                        <FolderDown size={14} /> Download File
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                        onClick={() => {
                          addToast({
                            type: "info",
                            title: "Document Preview",
                            message: `Opening interactive reader for "${item.title}"`
                          });
                        }}
                        title="Document Preview"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredMaterials.length === 0 && (
          <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem" }}>
            <FileText size={48} style={{ color: "var(--text-light)", margin: "0 auto 1rem auto" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.5rem" }}>
              No study materials matching criteria
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto 1.5rem auto" }}>
              Try clearing your search query, switching the subject, or selecting All Audiences.
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchQuery("");
                setSelectedSubject("all");
                setSelectedType("all");
                setSelectedAudience("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {activeVideoModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100,
          padding: "1rem"
        }}>
          <div className="card" style={{ maxWidth: "600px", width: "100%", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Video size={20} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{activeVideoModal.title}</h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveVideoModal(null)}>✕</button>
            </div>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)", marginBottom: "1.25rem" }}>
              {activeVideoModal.description}
            </p>
            <div style={{
              background: "#000",
              borderRadius: "8px",
              padding: "2.5rem 1rem",
              textAlign: "center",
              marginBottom: "1.25rem",
              color: "#fff"
            }}>
              <PlayCircle size={48} style={{ color: "#6366f1", marginBottom: "0.5rem" }} />
              <div>Stream Ready • High Definition (1080p)</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", marginTop: "0.25rem" }}>
                Host: {activeVideoModal.videoUrl || "Smart Campus Video CDN"}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button className="btn btn-secondary" onClick={() => setActiveVideoModal(null)}>Close</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  window.open(activeVideoModal.videoUrl || "https://www.youtube.com", "_blank");
                  setActiveVideoModal(null);
                }}
              >
                Open in Full Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

