import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Upload,
  FileText,
  Download,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  Cpu,
  HelpCircle,
  Copy,
  Check,
  X
} from "lucide-react";
import { Badge, Modal } from "../common/UIPrimitives";

export default function StudentAssignments() {
  const { currentUser, assignments, submitAssignment } = useSmartCampus();

  const [selectedAsg, setSelectedAsg] = useState(null);
  const [submissionFileName, setSubmissionFileName] = useState("");
  const [submissionSnippet, setSubmissionSnippet] = useState("");
  const [honorCodeAgreed, setHonorCodeAgreed] = useState(false);
  const [simulatedScore, setSimulatedScore] = useState(null);
  const [isSimulatedCopy, setIsSimulatedCopy] = useState(false);
  const [scanRunning, setScanRunning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const student = currentUser;
  const studentSem = Number(student?.semester) || 1;
  const isFirstYear = student?.year === "First Year" || studentSem <= 2;
  const studentDept = student?.departmentId || "dept-vlsi";

  const relevantAssignments = assignments.filter((asg) => {
    if (isFirstYear) {
      return asg.departmentId === "common" || asg.semester === studentSem || asg.subjectId?.startsWith("sub-fy");
    }
    return (asg.departmentId === studentDept && asg.semester === studentSem) || (!asg.departmentId && !asg.semester);
  });

  const handleOpenSubmit = (asg) => {
    setSelectedAsg(asg);
    setSubmissionFileName(`${student?.name.replace(/\s+/g, "_")}_${asg.subjectName.replace(/\s+/g, "_")}_Solution.pdf`);
    setSubmissionSnippet("");
    setHonorCodeAgreed(false);
    setIsSimulatedCopy(false);
    setScanResult(null);
    setScanRunning(false);
  };

  const runOriginalityPreScan = () => {
    setScanRunning(true);
    setScanResult(null);

    setTimeout(() => {
      setScanRunning(false);
      // Check if file name or snippet suggests a copy
      const lower = submissionFileName.toLowerCase();
      const isCopy = isSimulatedCopy || lower.includes("sneha") || lower.includes("rohan") || lower.includes("copy") || (submissionSnippet && submissionSnippet.includes("module sync_counter"));

      if (isCopy) {
        setScanResult({
          score: 92,
          status: "High Similarity Alert",
          matchWith: "Sneha Sharma (Roll: VL3102)",
          flagged: true,
          details: "Significant code token & syntactic overlap detected against repository submission #ASG-01-VL3102."
        });
      } else {
        setScanResult({
          score: 3,
          status: "Verified Original Work",
          flagged: false,
          details: "No suspicious overlap found across 72 departmental submissions. Unique token signature confirmed."
        });
      }
    }, 700);
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!selectedAsg) return;

    submitAssignment(selectedAsg.id, student.id, submissionFileName, {
      submissionSnippet,
      honorCodeAgreed,
      isSimulatedCopy,
      simulatedScore: scanResult?.score || (isSimulatedCopy ? 92 : 3)
    });

    setSelectedAsg(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
              Course Assignments & Project Submissions
            </h2>
            {isFirstYear && (
              <span className="badge badge-purple" style={{ fontSize: "0.75rem" }}>
                Common First Year (Sem {studentSem})
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Automated Academic Integrity & Anti-Copy Protection System active for all engineering submissions
          </p>
        </div>
      </div>

      {/* ANTI-COPY PROTECTION & INTEGRITY POLICY BANNER */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
          border: "1.5px solid #bfdbfe",
          padding: "20px 24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#2563eb",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <ShieldCheck size={26} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1e3a8a", margin: 0 }}>
                Smart Campus Anti-Copying & Plagiarism Protection System
              </h4>
              <Badge variant="success">Active Security Protocol</Badge>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#334155", marginTop: "6px", lineHeight: 1.5 }}>
              To ensure fair evaluation and prevent students from copying friends' assignments, Smart Campus applies three layers of protection:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginTop: "12px" }}>
              <div style={{ background: "white", padding: "10px 14px", borderRadius: "8px", border: "1px solid #dbeafe" }}>
                <strong style={{ fontSize: "0.82rem", color: "#1d4ed8", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Cpu size={14} /> 1. Individualized Problem Seed
                </strong>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "3px" }}>
                  Assigned circuit numerical values (e.g. Vdd, clock frequency) are seeded from your PRN / Roll Number: <strong>{student?.rollNo || "VL3101"}</strong>.
                </div>
              </div>

              <div style={{ background: "white", padding: "10px 14px", borderRadius: "8px", border: "1px solid #dbeafe" }}>
                <strong style={{ fontSize: "0.82rem", color: "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Fingerprint size={14} /> 2. Automated Similarity Engine
                </strong>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "3px" }}>
                  Every uploaded file and RTL code is fingerprinted and cross-checked against peer submissions. Matches {">"} 35% are flagged to faculty.
                </div>
              </div>

              <div style={{ background: "white", padding: "10px 14px", borderRadius: "8px", border: "1px solid #dbeafe" }}>
                <strong style={{ fontSize: "0.82rem", color: "#7c3aed", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldAlert size={14} /> 3. Digital Watermark Seal
                </strong>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "3px" }}>
                  All submissions are stamped with a cryptographic signature and nanosecond timestamp to definitively prove original authorship.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
        {relevantAssignments.map((asg) => {
          const submission = asg.submissions?.find((s) => s.studentId === student?.id);
          const isSubmitted = Boolean(submission);
          const isReviewed = submission?.status === "Reviewed";
          const isPlagiarized = submission?.status === "Flagged Copied" || (submission?.plagiarismScore > 35);

          return (
            <div
              key={asg.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderTop: `4px solid ${isPlagiarized ? "#ef4444" : isReviewed ? "#10b981" : isSubmitted ? "#3b82f6" : "#f59e0b"}`
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <Badge variant="purple">{asg.subjectName}</Badge>
                  {isPlagiarized ? (
                    <Badge variant="danger" icon={ShieldAlert}>Flagged Copied (0 Marks)</Badge>
                  ) : isReviewed ? (
                    <Badge variant="success" icon={CheckCircle2}>Graded: {submission.marks}/{asg.totalPoints}</Badge>
                  ) : isSubmitted ? (
                    <Badge variant="info" icon={CheckCircle2}>Submitted</Badge>
                  ) : (
                    <Badge variant="warning" icon={Clock}>Pending Submission</Badge>
                  )}
                </div>

                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>
                  {asg.title}
                </h3>

                <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "16px" }}>
                  {asg.description}
                </p>

                {/* Individualized Problem Parameters Badge */}
                <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", padding: "10px 12px", borderRadius: "8px", fontSize: "0.78rem", marginBottom: "14px" }}>
                  <div style={{ fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Cpu size={14} color="var(--primary-600)" />
                    Your Seeded Parameters (Roll: {student?.rollNo || "VL3101"}):
                  </div>
                  <div style={{ color: "#475569", marginTop: "4px", fontFamily: "monospace", fontSize: "0.75rem" }}>
                    V_dd = {(1.2 + ((student?.rollNo ? parseInt(student.rollNo.replace(/\D/g, "") || "1") : 1) % 5) * 0.15).toFixed(2)}V • F_clk = {(50 + ((student?.rollNo ? parseInt(student.rollNo.replace(/\D/g, "") || "1") : 1) % 8) * 10)} MHz
                  </div>
                </div>

                <div style={{ background: "var(--bg-surface-secondary)", padding: "12px", borderRadius: "8px", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Faculty:</span>
                    <strong>{asg.teacherName}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Deadline:</span>
                    <strong style={{ color: "#b91c1c" }}>{asg.deadline}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Total Points:</span>
                    <strong>{asg.totalPoints} Marks</strong>
                  </div>
                </div>

                {isSubmitted && (
                  <div
                    style={{
                      background: isPlagiarized ? "#fef2f2" : "#ecfdf5",
                      border: `1px solid ${isPlagiarized ? "#fecaca" : "#a7f3d0"}`,
                      padding: "12px 14px",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      marginBottom: "16px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: "700", color: isPlagiarized ? "#991b1b" : "#065f46" }}>
                        Uploaded: {submission.file}
                      </div>
                      <Badge variant={isPlagiarized ? "danger" : "success"}>
                        {submission.plagiarismScore || 3}% Match
                      </Badge>
                    </div>

                    <div style={{ color: isPlagiarized ? "#b91c1c" : "#047857", marginTop: "4px" }}>
                      Submitted on: {submission.submittedOn}
                    </div>

                    {/* Digital Seal */}
                    <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: `1px solid ${isPlagiarized ? "#fecaca" : "#a7f3d0"}`, fontSize: "0.72rem", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Fingerprint size={12} color={isPlagiarized ? "#ef4444" : "#10b981"} />
                      <span>Seal: <code>{submission.digitalSignature || "CSMSS-SIG-VERIFIED"}</code></span>
                    </div>

                    {submission.feedback && (
                      <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: `1px solid ${isPlagiarized ? "#fecaca" : "#a7f3d0"}`, color: isPlagiarized ? "#991b1b" : "#065f46" }}>
                        <strong>Feedback:</strong> {submission.feedback}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => alert(`Downloading official brief: ${asg.attachments?.[0] || "assignment_brief.pdf"}`)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Download size={14} /> Brief PDF
                </button>

                {!isSubmitted ? (
                  <button
                    onClick={() => handleOpenSubmit(asg)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Upload size={14} /> Submit Work
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenSubmit(asg)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    Resubmit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Modal with Anti-Copy Scanner & Honor Code */}
      <Modal
        isOpen={Boolean(selectedAsg)}
        onClose={() => setSelectedAsg(null)}
        title={`Submit Assignment: ${selectedAsg?.title}`}
      >
        <form onSubmit={handleConfirmSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Upload your original solution for <strong>{selectedAsg?.subjectName}</strong>. Submissions are automatically scanned for plagiarism against all peers.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Attached Document Filename</label>
            <input
              type="text"
              className="form-control"
              value={submissionFileName}
              onChange={(e) => {
                setSubmissionFileName(e.target.value);
                setScanResult(null);
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Solution Summary / Code Excerpt (Optional)
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Paste Verilog HDL code, SPICE netlist, or calculation summary for live originality check..."
              value={submissionSnippet}
              onChange={(e) => {
                setSubmissionSnippet(e.target.value);
                setScanResult(null);
              }}
            />
          </div>

          {/* Interactive Pre-scan / Anti-Copy Simulator */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "0.82rem", color: "#1e293b" }}>
                <Fingerprint size={16} color="var(--primary-600)" />
                Pre-Upload Anti-Plagiarism Verification Scan:
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSimulatedCopy(true);
                    setSubmissionFileName("Sneha_Sharma_VLSI_Assignment1_Copy.pdf");
                    setSubmissionSnippet("module counter_4bit(clk, rst_n, count);\ninput clk, rst_n;\noutput reg [3:0] count;\nalways @(posedge clk or negedge rst_n) begin\n  if(!rst_n) count <= 4'b0000;\n  else count <= count + 1'b1;\nend\nendmodule");
                    setTimeout(() => runOriginalityPreScan(), 100);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.72rem", padding: "4px 8px" }}
                >
                  ⚡ Test Copied File (Demo)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSimulatedCopy(false);
                    runOriginalityPreScan();
                  }}
                  disabled={scanRunning}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: "0.72rem", padding: "4px 10px" }}
                >
                  {scanRunning ? "Scanning..." : "Scan Originality"}
                </button>
              </div>
            </div>

            {scanRunning && (
              <div style={{ padding: "12px", background: "white", borderRadius: "6px", textAlign: "center", fontSize: "0.8rem", color: "var(--primary-600)" }}>
                🔍 Comparing document tokens against 72 class submissions & question seed...
              </div>
            )}

            {scanResult && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: scanResult.flagged ? "#fef2f2" : "#ecfdf5",
                  border: `1px solid ${scanResult.flagged ? "#fca5a5" : "#86efac"}`,
                  fontSize: "0.8rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ color: scanResult.flagged ? "#991b1b" : "#065f46" }}>
                    {scanResult.flagged ? "⚠️ High Plagiarism Risk Detected!" : "✓ Originality Verified (Safe to Submit)"}
                  </strong>
                  <Badge variant={scanResult.flagged ? "danger" : "success"}>
                    {scanResult.score}% Similarity
                  </Badge>
                </div>
                <p style={{ margin: "4px 0 0 0", color: scanResult.flagged ? "#7f1d1d" : "#047857", fontSize: "0.76rem" }}>
                  {scanResult.details} {scanResult.matchWith && `Matched source: ${scanResult.matchWith}.`}
                </p>
              </div>
            )}
          </div>

          {/* Academic Integrity Honor Code Oath */}
          <div
            style={{
              padding: "12px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px"
            }}
          >
            <input
              type="checkbox"
              id="honorOath"
              checked={honorCodeAgreed}
              onChange={(e) => setHonorCodeAgreed(e.target.checked)}
              style={{ marginTop: "3px", width: "16px", height: "16px", cursor: "pointer" }}
              required
            />
            <label htmlFor="honorOath" style={{ fontSize: "0.78rem", color: "#92400e", lineHeight: 1.45, cursor: "pointer" }}>
              <strong>Academic Integrity Honor Declaration:</strong> I hereby solemnly certify that this assignment submission is entirely my own original work. I understand that submitting a peer's solution or allowing someone to copy my work results in immediate zero marks and disciplinary action under University Academic Conduct Code.
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedAsg(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!honorCodeAgreed}
              style={{ opacity: !honorCodeAgreed ? 0.6 : 1 }}
            >
              <Fingerprint size={16} /> Digitally Sign & Submit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
