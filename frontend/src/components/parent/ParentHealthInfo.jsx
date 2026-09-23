import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Activity,
  ShieldCheck,
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Info,
  HeartPulse,
  Phone,
  User,
  Hospital
} from "lucide-react";
import { Modal, Badge } from "../common/UIPrimitives";
import {
  HEALTH_CONDITION_OPTIONS,
  VERIFICATION_STATUSES
} from "../../data/talentAndHealthData";

export default function ParentHealthInfo({ onNavigate }) {
  const {
    currentUser,
    users,
    studentHealthRecords,
    addHealthRecord,
    updateHealthRecord,
    logHealthAccess,
    addToast
  } = useSmartCampus();

  const parent = currentUser;
  const ward = users.find((u) => u.id === parent?.studentId) || users[0];

  // Records submitted for this student
  const wardHealthRecords = studentHealthRecords.filter(
    (h) => h.studentId === ward?.id || h.parentId === parent?.id
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);

  const [formData, setFormData] = useState({
    conditionCategory: "Allergy",
    customCondition: "",
    description: "",
    emergencyInstructions: "",
    regularMedication: "",
    doctorInformation: "",
    documentUrl: "",
    documentName: "",
    documentSize: ""
  });

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedRecordForPreview, setSelectedRecordForPreview] = useState(null);

  const handleOpenAddModal = () => {
    setEditingRecordId(null);
    setFormData({
      conditionCategory: HEALTH_CONDITION_OPTIONS[0],
      customCondition: "",
      description: "",
      emergencyInstructions: "",
      regularMedication: "",
      doctorInformation: "",
      documentUrl: "",
      documentName: "",
      documentSize: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec) => {
    setEditingRecordId(rec.id);
    const isStandard = HEALTH_CONDITION_OPTIONS.includes(rec.conditionCategory);
    setFormData({
      conditionCategory: isStandard ? rec.conditionCategory : "Other",
      customCondition: isStandard ? "" : rec.conditionCategory,
      description: rec.description || "",
      emergencyInstructions: rec.emergencyInstructions || "",
      regularMedication: rec.regularMedication || "",
      doctorInformation: rec.doctorInformation || "",
      documentUrl: rec.documentUrl || "",
      documentName: rec.documentName || "",
      documentSize: rec.documentSize || ""
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    const sizeStr = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(1) + " MB"
      : Math.round(file.size / 1024) + " KB";

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData({
        ...formData,
        documentUrl: uploadEvent.target.result,
        documentName: file.name,
        documentSize: sizeStr
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation: Proof is mandatory when condition requires documentation
    if (!formData.documentUrl && !editingRecordId) {
      addToast(
        "Document Required",
        "Please upload a doctor's certificate or medical document for verification.",
        "warning"
      );
      return;
    }

    const finalCategory = formData.conditionCategory === "Other"
      ? (formData.customCondition.trim() || "Other Health Condition")
      : formData.conditionCategory;

    const payload = {
      studentId: ward?.id || "stu-1",
      studentName: ward?.name || "Aditya Shinde",
      prn: ward?.prn || ward?.prnNo || "24025331378056",
      departmentId: ward?.departmentId || "dept-vlsi",
      departmentName: ward?.departmentName || "Electronic Engineering (VLSI Design And Technology)",
      year: ward?.year || "Third Year",
      semester: ward?.semester || 5,
      division: ward?.division || "A",
      parentId: parent?.id || "par-1",
      parentName: parent?.name || "Parent",
      parentContact: parent?.phone || "+91 98900 12345",
      conditionCategory: finalCategory,
      customCondition: formData.conditionCategory === "Other" ? formData.customCondition : "",
      description: formData.description,
      emergencyInstructions: formData.emergencyInstructions,
      regularMedication: formData.regularMedication,
      doctorInformation: formData.doctorInformation,
      documentUrl: formData.documentUrl,
      documentName: formData.documentName,
      documentSize: formData.documentSize
    };

    if (editingRecordId) {
      updateHealthRecord(editingRecordId, payload);
    } else {
      addHealthRecord(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.4)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" }}>
              CONFIDENTIAL PARENT HEALTH DECLARATION
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white" }}>
            Student Health & Safety Portal 🏥
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#a7f3d0", marginTop: "4px" }}>
            Securely submit and manage confidential medical records, emergency protocols, and official doctor certificates for your child.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {onNavigate && (
            <button
              onClick={() => onNavigate("doctor-letters")}
              className="btn btn-secondary btn-lg"
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.35)",
                fontWeight: "700"
              }}
            >
              <FileText size={18} /> Doctor's Letters Desk
            </button>
          )}
          <button
            onClick={handleOpenAddModal}
            className="btn btn-primary btn-lg"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)"
            }}
          >
            <Plus size={18} /> Declare Health Condition
          </button>
        </div>
      </div>

      {/* 2. Privacy & Access Control Alert */}
      <div
        style={{
          background: "var(--success-bg)",
          border: "1px solid var(--success-border)",
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          color: "var(--success-text)"
        }}
      >
        <ShieldCheck size={28} style={{ flexShrink: 0, color: "var(--success-solid)" }} />
        <div style={{ fontSize: "0.88rem", lineHeight: "1.5" }}>
          <strong>Strict Confidentiality Policy:</strong> This information is shared only with authorized college personnel (Head of Department and designated safety coordinators) for student safety and event-related support. It is never displayed on public student lists, general portals, or event pages.
        </div>
      </div>

      {/* 3. Auto-populated Ward & Parent Profile Card */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <User size={18} color="var(--primary-600)" />
          <h3 style={{ fontSize: "1rem", fontWeight: "700" }}>Verified Family & Academic Information (Auto-Populated)</h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Student (Ward) Name</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", marginTop: "2px" }}>{ward?.name || "Aditya Shinde"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>PRN / Student ID</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", marginTop: "2px" }}>{ward?.prn || ward?.prnNo || ward?.id || "24025331378056"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Department & Year</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", marginTop: "2px" }}>{ward?.departmentName || "Electronic Engineering (VLSI)"} • {ward?.year || "Third Year"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Parent Name & Relation</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", marginTop: "2px" }}>{parent?.name || "Parent"} ({parent?.relation || "Guardian"})</div>
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Parent Emergency Contact</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", marginTop: "2px" }}>{parent?.phone || "+91 98900 12345"}</div>
          </div>
        </div>
      </div>

      {/* 4. Submitted Records List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>
            Submitted Health Records ({wardHealthRecords.length})
          </h3>
        </div>

        {wardHealthRecords.length === 0 ? (
          <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <HeartPulse size={42} color="var(--text-light)" style={{ margin: "0 auto 12px auto" }} />
            <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>No Health Records Submitted</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "440px", margin: "8px auto 16px auto" }}>
              If your child has an allergy, asthma, migraine, sugar or any other physical condition requiring safety awareness, please submit medical details here.
            </p>
            <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
              <Plus size={14} /> Submit Health Record
            </button>
          </div>
        ) : (
          wardHealthRecords.map((rec) => {
            const isVerified = rec.verificationStatus === "Verified";
            const isPending = rec.verificationStatus === "Pending Verification";
            const isRejected = rec.verificationStatus === "Rejected";

            return (
              <div
                key={rec.id}
                className="card"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  borderLeft: isVerified
                    ? "4px solid var(--success-solid)"
                    : isPending
                    ? "4px solid var(--warning-solid)"
                    : "4px solid var(--danger-solid)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "0.78rem",
                          fontWeight: "800",
                          background: isVerified ? "var(--success-bg)" : isPending ? "var(--warning-bg)" : "var(--danger-bg)",
                          color: isVerified ? "var(--success-text)" : isPending ? "var(--warning-text)" : "var(--danger-text)"
                        }}
                      >
                        {rec.verificationStatus}
                      </span>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Declared on: {new Date(rec.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)" }}>
                      {rec.conditionCategory}
                    </h3>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleOpenEditModal(rec)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.78rem" }}
                    >
                      <Edit2 size={14} /> Update Info
                    </button>
                  </div>
                </div>

                {/* Condition Details Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Condition Description:
                    </div>
                    <p style={{ fontSize: "0.88rem", marginTop: "4px", lineHeight: "1.5" }}>
                      {rec.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#991b1b", textTransform: "uppercase" }}>
                      Emergency Instructions:
                    </div>
                    <p style={{ fontSize: "0.88rem", marginTop: "4px", color: "#7f1d1d", lineHeight: "1.5", background: "#fef2f2", padding: "8px 12px", borderRadius: "6px" }}>
                      {rec.emergencyInstructions}
                    </p>
                  </div>
                </div>

                {/* Additional Info: Medication, Doctor, Document */}
                <div
                  style={{
                    background: "var(--bg-surface-secondary)",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "24px",
                    fontSize: "0.82rem"
                  }}
                >
                  {rec.regularMedication && (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Regular Medication: </span>
                      <strong>{rec.regularMedication}</strong>
                    </div>
                  )}
                  {rec.doctorInformation && (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Doctor Contact: </span>
                      <strong>{rec.doctorInformation}</strong>
                    </div>
                  )}
                  {rec.documentName && (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Proof Document: </span>
                      <button
                        onClick={() => {
                          setSelectedRecordForPreview(rec);
                          setPreviewModalOpen(true);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--primary-600)",
                          fontWeight: "700",
                          cursor: "pointer",
                          textDecoration: "underline",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <FileText size={13} /> {rec.documentName} ({rec.documentSize || "PDF"})
                      </button>
                    </div>
                  )}
                </div>

                {/* Institutional Review Footer */}
                {rec.verifiedBy && (
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <span>
                      Reviewed by: <strong>{rec.verifiedBy}</strong> on {new Date(rec.verifiedAt).toLocaleDateString()}
                    </span>
                    {rec.reviewNotes && (
                      <span style={{ color: "var(--text-main)" }}>
                        Remarks: <em>"{rec.reviewNotes}"</em>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. ADD / EDIT HEALTH CONDITION MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecordId ? "Update Student Health Record" : "Declare Student Health Condition"}
        maxWidth="640px"
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Health Condition Category *</label>
            <select
              className="form-control"
              value={formData.conditionCategory}
              onChange={(e) => setFormData({ ...formData, conditionCategory: e.target.value })}
            >
              {HEALTH_CONDITION_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {formData.conditionCategory === "Other" && (
            <div className="form-group">
              <label className="form-label">Specify Condition Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Vertigo, Chronic Sinusitis, Joint Hyperextension..."
                required
                value={formData.customCondition}
                onChange={(e) => setFormData({ ...formData, customCondition: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Condition Description *</label>
            <textarea
              className="form-control"
              rows={3}
              required
              placeholder="e.g. Student may experience acute migraine episodes during prolonged exposure to bright strobing light or extreme heat."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: "#991b1b" }}>Emergency Protocol / Action Steps *</label>
            <textarea
              className="form-control"
              rows={2}
              required
              placeholder="e.g. Move student to quiet room, give oral rehydration. Notify parent immediately if symptoms exceed 20 mins."
              value={formData.emergencyInstructions}
              onChange={(e) => setFormData({ ...formData, emergencyInstructions: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Regular / SOS Medication</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Inhaler, Naproxen 250mg"
                value={formData.regularMedication}
                onChange={(e) => setFormData({ ...formData, regularMedication: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Doctor / Hospital Details</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dr. Patil, City Hospital (+91 98220...)"
                value={formData.doctorInformation}
                onChange={(e) => setFormData({ ...formData, doctorInformation: e.target.value })}
              />
            </div>
          </div>

          {/* Medical Document / Certificate Upload */}
          <div className="form-group">
            <label className="form-label">Upload Doctor's Certificate / Medical Letter *</label>
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
              <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>Upload Official Medical Proof</div>
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
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Health Declaration
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. DOCUMENT PREVIEW MODAL */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Official Medical Proof Document"
        maxWidth="600px"
      >
        {selectedRecordForPreview && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "14px" }}>
              Document: <strong>{selectedRecordForPreview.documentName}</strong> ({selectedRecordForPreview.documentSize})
            </p>

            {selectedRecordForPreview.documentUrl?.startsWith("data:image") || selectedRecordForPreview.documentUrl?.includes("unsplash.com") ? (
              <img
                src={selectedRecordForPreview.documentUrl}
                alt="Medical Proof"
                style={{ maxWidth: "100%", maxHeight: "420px", borderRadius: "8px", objectFit: "contain" }}
              />
            ) : (
              <div
                style={{
                  padding: "48px 24px",
                  background: "var(--bg-surface-secondary)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <FileText size={52} color="var(--primary-600)" style={{ margin: "0 auto 12px auto" }} />
                <div style={{ fontWeight: "700", fontSize: "1rem" }}>{selectedRecordForPreview.documentName}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Official Doctor Certificate on file with College Administration
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
