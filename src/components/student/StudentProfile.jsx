import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Heart,
  GraduationCap,
  Users,
  ShieldCheck,
  Award,
  Edit,
  Camera,
  Upload
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";
import EditProfileModal from "../common/EditProfileModal";

export default function StudentProfile() {
  const { currentUser, switchStudentSemester } = useSmartCampus();
  const student = currentUser;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "960px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Student Academic Profile
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Registered institutional credentials and parent contact link
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Edit size={14} />
          <span>Edit Profile & Photo</span>
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="card">
        <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap", paddingBottom: "24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ position: "relative", width: "100px", height: "100px" }}>
            {student?.avatar ? (
              <img
                src={student.avatar}
                alt={student?.name}
                style={{ width: "100%", height: "100%", borderRadius: "20px", objectFit: "cover", border: "4px solid #e2e8f0" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontWeight: "800",
                  border: "4px solid #e2e8f0",
                  boxShadow: "0 8px 16px -4px rgba(37, 99, 235, 0.25)"
                }}
              >
                {student?.name ? student.name.split(" ").slice(0, 2).map((n) => n[0]).join("") : "AS"}
              </div>
            )}
            <button
              onClick={() => setIsEditModalOpen(true)}
              title="Upload photo from device gallery"
              style={{
                position: "absolute",
                bottom: "-6px",
                right: "-6px",
                background: "#2563eb",
                color: "white",
                border: "2px solid white",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <Camera size={14} />
            </button>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "800", margin: 0 }}>{student?.name}</h3>
              <Badge variant="success">Active Student</Badge>
              {(student?.year === "First Year" || student?.semester <= 2) && (
                <span className="badge badge-purple" style={{ fontSize: "0.75rem" }}>
                  Common First Year Scheme
                </span>
              )}
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "4px 0" }}>
              Roll No: <strong>{student?.rollNo}</strong> {student?.prn && <>• PRN: <strong style={{ fontFamily: "monospace", color: "var(--color-primary)" }}>{student.prn}</strong></>} • {student?.departmentName}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px", fontSize: "0.82rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
              <span>Class: <strong>{student?.className || "TE VLSI – Semester 5"}</strong></span>
              <span>•</span>
              <span>Batch: <strong>{student?.batch || "TA2"} ({student?.tgBatch || "TG-2"})</strong></span>
              <span>•</span>
              <span>Class Teacher: <strong>{student?.classTeacher || "PROF. G R BHALEKAR"}</strong></span>
              <span>•</span>
              <span>Cumulative CGPA: <strong style={{ color: "var(--primary-700)" }}>{student?.cgpa} / 10.0</strong></span>
            </div>
          </div>
        </div>

        {/* First Year Common Curriculum Status Banner */}
        {(student?.year === "First Year" || student?.semester <= 2) && (
          <div style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            marginTop: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div>
              <div style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "0.95rem" }}>
                AICTE Model Common First Year Curriculum
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>
                Branch {student?.departmentName} inherits the unified central curriculum. Updates to subjects apply instantly across all branches.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Current Term:</span>
              <button
                className={`btn btn-sm ${student?.semester === 1 ? "btn-primary" : "btn-secondary"}`}
                onClick={() => switchStudentSemester && switchStudentSemester(1)}
              >
                Sem I
              </button>
              <button
                className={`btn btn-sm ${student?.semester === 2 ? "btn-primary" : "btn-secondary"}`}
                onClick={() => switchStudentSemester && switchStudentSemester(2)}
              >
                Sem II
              </button>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
          {/* Contact Details */}
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "16px", color: "var(--text-main)" }}>
              Student Contact Information
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={16} color="var(--primary-600)" />
                <span>{student?.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={16} color="var(--primary-600)" />
                <span>{student?.phone}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MapPin size={16} color="var(--primary-600)" />
                <span>{student?.address}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Heart size={16} color="#ef4444" />
                <span>Blood Group: <strong>{student?.bloodGroup}</strong></span>
              </div>
            </div>
          </div>

          {/* Linked Parent Information */}
          <div style={{ background: "var(--bg-surface-secondary)", padding: "18px", borderRadius: "12px" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-main)" }}>
              Linked Parent / Guardian
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Primary Guardian:</span>
                <strong style={{ display: "block" }}>{student?.parentName}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Alerts Contact Number:</span>
                <strong style={{ display: "block", color: "#047857" }}>{student?.parentPhone} (SMS & WhatsApp Sync)</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Guardian Email:</span>
                <span style={{ display: "block" }}>{student?.parentEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
