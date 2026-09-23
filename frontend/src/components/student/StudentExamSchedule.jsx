import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  CalendarDays,
  Clock,
  MapPin,
  FileCheck,
  AlertCircle,
  Download,
  Award,
  BookOpen,
  Printer,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Info,
  X,
  User,
  QrCode
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function StudentExamSchedule() {
  const { exams, currentUser, addToast } = useSmartCampus();

  const student = currentUser;
  const studentSem = Number(student?.semester) || 5;
  const isFirstYear = student?.year === "First Year" || studentSem <= 2;
  const studentDept = student?.departmentId || "dept-vlsi";

  const [activeSyllabusModal, setActiveSyllabusModal] = useState(null);
  const [showHallTicketModal, setShowHallTicketModal] = useState(false);

  // Filter exams for student's active semester/cohort
  const relevantExams = exams.filter((ex) => {
    if (isFirstYear) {
      return ex.departmentId === "common" || ex.semester === studentSem || ex.id?.startsWith("ex-fy");
    }
    return (ex.departmentId === studentDept && ex.semester === studentSem) || (!ex.departmentId && !ex.semester);
  });

  // Sort chronologically by date
  const sortedExams = [...relevantExams].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate days remaining helper
  const getDaysRemaining = (examDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exDate = new Date(examDateStr);
    exDate.setHours(0, 0, 0, 0);
    const diffTime = exDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: "Completed", variant: "gray" };
    if (diffDays === 0) return { label: "Today", variant: "danger" };
    if (diffDays === 1) return { label: "Tomorrow", variant: "warning" };
    return { label: `In ${diffDays} Days`, variant: "info" };
  };

  const handlePrintAdmitCard = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* 1. Official Examination Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e293b 100%)",
          borderRadius: "18px",
          padding: "26px 30px",
          color: "white",
          boxShadow: "0 10px 30px -5px rgba(30, 27, 75, 0.4)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  background: "rgba(99, 102, 241, 0.3)",
                  color: "#c7d2fe",
                  border: "1px solid rgba(165, 180, 252, 0.3)",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontWeight: "700",
                  textTransform: "uppercase"
                }}
              >
                Controller of Examinations
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#6ee7b7",
                  border: "1px solid rgba(110, 231, 183, 0.3)",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontWeight: "700"
                }}
              >
                Mid-Semester Examination 2026–27
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#fcd34d",
                  border: "1px solid rgba(252, 211, 77, 0.3)",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontWeight: "700"
                }}
              >
                Center: CSMSS Engineering Campus
              </span>
            </div>

            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", margin: "0 0 6px 0", letterSpacing: "-0.01em" }}>
              Official Examination Timetable & Seating Allotment
            </h1>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#cbd5e1" }}>
              Department of {student?.departmentName || "Electronic Engineering (VLSI Design And Technology)"} • Semester {studentSem}
            </p>
          </div>

          {/* Candidate Exam Identity Card Badge */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
              padding: "14px 18px",
              minWidth: "260px"
            }}
          >
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>
              Candidate Seating Desk
            </div>
            <div style={{ fontSize: "1rem", fontWeight: "700", color: "#f8fafc", marginBottom: "4px" }}>
              {student?.name} ({student?.rollNo || "VLSI3152"})
            </div>
            <div style={{ fontSize: "0.78rem", color: "#cbd5e1", marginBottom: "8px" }}>
              PRN: <strong style={{ fontFamily: "monospace", color: "#e2e8f0" }}>{student?.prn || "20240101901"}</strong>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <span style={{ background: "rgba(34, 197, 94, 0.25)", color: "#86efac", padding: "2px 8px", borderRadius: "6px", fontWeight: "700", fontSize: "0.72rem" }}>
                Seat No: 501-VLSI-42
              </span>
              <span style={{ background: "rgba(59, 130, 246, 0.25)", color: "#bfdbfe", padding: "2px 8px", borderRadius: "6px", fontWeight: "700", fontSize: "0.72rem" }}>
                Hall B-204
              </span>
            </div>
          </div>
        </div>

        {/* Action Button Strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#e2e8f0" }}>
            <CalendarDays size={16} color="#a5b4fc" />
            <span>Total Papers Scheduled: <strong>{sortedExams.length} Theory Papers</strong></span>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowHallTicketModal(true)}
              className="btn btn-primary btn-sm"
              style={{ background: "#6366f1", borderColor: "#4f46e5" }}
            >
              <FileCheck size={14} />
              <span>View & Print Official Hall Ticket</span>
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)", color: "white" }}
            >
              <Printer size={14} />
              <span>Print Timetable Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Official Examination Code of Conduct & Guidelines */}
      <div
        style={{
          display: "flex",
          gap: "14px",
          alignItems: "center",
          background: "rgba(59, 130, 246, 0.05)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          padding: "14px 18px",
          borderRadius: "12px"
        }}
      >
        <AlertCircle size={22} color="var(--primary-600)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
          <strong>Examination Instructions for Candidates:</strong> Reporting time is strictly <strong>30 minutes prior</strong> to commencement (09:30 AM). Physical College Identity Card and printed Hall Ticket are mandatory for entry. Electronic smart devices and programmable calculators are strictly prohibited.
        </div>
      </div>

      {/* 3. Chronological Examination Schedule Table */}
      <div className="card" style={{ padding: "18px" }}>
        <div className="card-header" style={{ marginBottom: "16px" }}>
          <div>
            <div className="card-title">
              <CalendarDays size={18} color="var(--primary-600)" />
              Chronological Examination Schedule
            </div>
            <div className="card-subtitle">
              Arranged in order of exam dates with morning shifts, venue allocations, and syllabus scopes
            </div>
          </div>
          <Badge variant="purple">{sortedExams.length} Papers</Badge>
        </div>

        <div className="table-container">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: "var(--bg-surface-secondary)", borderBottom: "2px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", width: "150px" }}>Date & Day</th>
                <th style={{ padding: "12px 14px", textAlign: "left" }}>Course Code & Title</th>
                <th style={{ padding: "12px 14px", textAlign: "left", width: "180px" }}>Session & Timings</th>
                <th style={{ padding: "12px 14px", textAlign: "left", width: "160px" }}>Seating Venue</th>
                <th style={{ padding: "12px 14px", textAlign: "center", width: "110px" }}>Marks</th>
                <th style={{ padding: "12px 14px", textAlign: "center", width: "110px" }}>Timeline</th>
                <th style={{ padding: "12px 14px", textAlign: "center", width: "140px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedExams.map((ex, idx) => {
                const dateObj = new Date(ex.date);
                const dayStr = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                const formattedDate = dateObj.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
                const daysRem = getDaysRemaining(ex.date);

                return (
                  <tr
                    key={ex.id || idx}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      background: idx % 2 === 0 ? "var(--bg-surface)" : "var(--bg-surface-secondary)"
                    }}
                  >
                    {/* Date & Day */}
                    <td style={{ padding: "14px", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: "800", color: "var(--text-main)", fontSize: "0.92rem" }}>
                        {formattedDate}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                        {dayStr} (Paper #{idx + 1})
                      </span>
                    </td>

                    {/* Course Code & Title */}
                    <td style={{ padding: "14px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                        <span style={{ fontWeight: "800", color: "var(--text-main)", fontSize: "0.95rem" }}>
                          {ex.subject}
                        </span>
                        <Badge variant="purple">{ex.code}</Badge>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {ex.examType || "Mid-Term Examination"} • Scope: {ex.syllabus ? ex.syllabus.substring(0, 45) + "..." : "Modules 1-4"}
                      </div>
                    </td>

                    {/* Session & Timings */}
                    <td style={{ padding: "14px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "700", color: "var(--primary-700)" }}>
                        <Clock size={13} />
                        <span>{ex.time}</span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: "2px", fontWeight: "600" }}>
                        Reporting: 09:30 AM
                      </div>
                    </td>

                    {/* Seating Venue */}
                    <td style={{ padding: "14px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "700" }}>
                        <MapPin size={13} color="var(--primary-600)" />
                        <span>{ex.room || "Hall B-204"}</span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        Desk #42 • Block B
                      </div>
                    </td>

                    {/* Total Marks */}
                    <td style={{ padding: "14px", textAlign: "center", verticalAlign: "middle" }}>
                      <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                        {ex.totalMarks || 50}
                      </strong>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Marks</div>
                    </td>

                    {/* Countdown / Status */}
                    <td style={{ padding: "14px", textAlign: "center", verticalAlign: "middle" }}>
                      <Badge variant={daysRem.variant}>{daysRem.label}</Badge>
                    </td>

                    {/* Action */}
                    <td style={{ padding: "14px", textAlign: "center", verticalAlign: "middle" }}>
                      <button
                        onClick={() => setActiveSyllabusModal(ex)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                      >
                        <FileText size={12} /> Syllabus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Syllabus & Weightage Modal */}
      {activeSyllabusModal && (
        <Modal
          isOpen={!!activeSyllabusModal}
          onClose={() => setActiveSyllabusModal(null)}
          title={`${activeSyllabusModal.subject} (${activeSyllabusModal.code}) — Exam Blueprint`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "4px" }}>
            <div style={{ background: "var(--bg-surface-secondary)", padding: "14px", borderRadius: "10px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Date & Time:</span>
                <strong>{activeSyllabusModal.date} • {activeSyllabusModal.time}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Exam Duration & Marks:</span>
                <strong>2 Hours • {activeSyllabusModal.totalMarks || 50} Marks</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Exam Hall & Seat:</span>
                <strong>{activeSyllabusModal.room} • Desk #42</strong>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "6px", color: "var(--text-main)" }}>
                Prescribed Examination Syllabus Scope:
              </h4>
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", padding: "12px", borderRadius: "8px", fontSize: "0.85rem", lineHeight: "1.5" }}>
                {activeSyllabusModal.syllabus}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "6px", color: "var(--text-main)" }}>
                Question Paper Structure:
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                <li><strong>Section A:</strong> 10 Objective / Multiple Choice Questions (10 Marks)</li>
                <li><strong>Section B:</strong> 4 Short Answer Questions (Attempt any 3 out of 4) (15 Marks)</li>
                <li><strong>Section C:</strong> 2 Long Analytical / Derivation Questions (25 Marks)</li>
              </ul>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <button onClick={() => setActiveSyllabusModal(null)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. Official Hall Ticket / Admit Card Modal */}
      {showHallTicketModal && (
        <Modal
          isOpen={showHallTicketModal}
          onClose={() => setShowHallTicketModal(false)}
          title="Official Examination Hall Ticket / Admit Card"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "4px" }}>
            {/* Printable Admit Card Document Container */}
            <div
              id="printable-hall-ticket"
              style={{
                border: "2px solid #0f172a",
                borderRadius: "10px",
                padding: "20px",
                background: "white",
                color: "#0f172a"
              }}
            >
              {/* College Header */}
              <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: "12px", marginBottom: "14px" }}>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "900", letterSpacing: "0.02em" }}>
                  CSMSS CHH. SHAHU COLLEGE OF ENGINEERING
                </h3>
                <div style={{ fontSize: "0.78rem", fontWeight: "600", color: "#475569" }}>
                  Kanchanwadi, Chhatrapati Sambhajinagar — Autonomous Institute
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: "800", marginTop: "6px", textTransform: "uppercase", background: "#f1f5f9", padding: "4px", borderRadius: "4px" }}>
                  Examination Admit Card / Hall Ticket (Autumn Session 2026)
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "16px", marginBottom: "16px", fontSize: "0.82rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div><strong>Candidate Name:</strong> {student?.name}</div>
                  <div><strong>Seat Number:</strong> 501-VLSI-42</div>
                  <div><strong>Permanent Reg No (PRN):</strong> {student?.prn || "20240101901"}</div>
                  <div><strong>Class Roll No:</strong> {student?.rollNo || "VLSI3152"}</div>
                  <div><strong>Branch / Discipline:</strong> VLSI Design & Tech</div>
                  <div><strong>Semester / Year:</strong> Semester 5 (TE)</div>
                  <div><strong>Exam Center:</strong> Center 089 (Main Block)</div>
                  <div><strong>Allotted Room:</strong> Hall B-204 (Desk #42)</div>
                </div>

                {/* Candidate Photo & Barcode Mockup */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <img
                    src={student?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                    alt="Candidate"
                    style={{ width: "80px", height: "80px", objectFit: "cover", border: "1px solid #94a3b8", borderRadius: "4px" }}
                  />
                  <div style={{ fontSize: "0.6rem", fontWeight: "700", textAlign: "center", fontFamily: "monospace" }}>
                    *501VLSI42*
                  </div>
                </div>
              </div>

              {/* Exam Papers Table inside Hall Ticket */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", border: "1px solid #cbd5e1", marginBottom: "16px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #cbd5e1" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", borderRight: "1px solid #cbd5e1" }}>Paper Code</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", borderRight: "1px solid #cbd5e1" }}>Course Title</th>
                    <th style={{ padding: "6px 8px", textAlign: "center", borderRight: "1px solid #cbd5e1" }}>Date</th>
                    <th style={{ padding: "6px 8px", textAlign: "center", borderRight: "1px solid #cbd5e1" }}>Session Time</th>
                    <th style={{ padding: "6px 8px", textAlign: "center" }}>Invigilator Sign</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedExams.map((ex) => (
                    <tr key={ex.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "6px 8px", borderRight: "1px solid #cbd5e1", fontWeight: "700" }}>{ex.code}</td>
                      <td style={{ padding: "6px 8px", borderRight: "1px solid #cbd5e1" }}>{ex.subject}</td>
                      <td style={{ padding: "6px 8px", textAlign: "center", borderRight: "1px solid #cbd5e1" }}>{ex.date}</td>
                      <td style={{ padding: "6px 8px", textAlign: "center", borderRight: "1px solid #cbd5e1" }}>{ex.time}</td>
                      <td style={{ padding: "6px 8px", textAlign: "center", color: "#94a3b8" }}>______________</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "14px", fontSize: "0.78rem" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ height: "30px", borderBottom: "1px dashed #64748b", width: "140px" }} />
                  <div style={{ marginTop: "4px", fontWeight: "700" }}>Candidate's Signature</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "700", color: "#047857" }}>✓ Verified Electronic Seal</div>
                  <div style={{ height: "14px" }} />
                  <div style={{ fontWeight: "700" }}>Controller of Examinations</div>
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={handlePrintAdmitCard}
                className="btn btn-primary"
              >
                <Printer size={16} /> Print Official Admit Card
              </button>
              <button onClick={() => setShowHallTicketModal(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
