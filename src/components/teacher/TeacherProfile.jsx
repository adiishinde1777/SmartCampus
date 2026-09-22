import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Building2,
  Edit,
  Camera
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";
import EditProfileModal from "../common/EditProfileModal";

export default function TeacherProfile() {
  const { currentUser, subjects } = useSmartCampus();
  const teacher = currentUser;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const mySubjects = subjects.filter((s) => s.teacherId === teacher?.id || s.teacherName === teacher?.name);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "960px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "gap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Faculty Profile
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Official academic credentials, assigned subjects, and departmental details
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
            <img
              src={teacher?.avatar}
              alt={teacher?.name}
              style={{ width: "100%", height: "100%", borderRadius: "20px", objectFit: "cover", border: "4px solid #e2e8f0" }}
            />
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
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "800" }}>{teacher?.name}</h3>
              <Badge variant="purple">Faculty / Evaluator</Badge>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              {teacher?.designation} • Department of <strong>{teacher?.departmentName}</strong>
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <span>Faculty ID: <strong>{teacher?.facultyId || "FAC-VLSI-104"}</strong></span>
              <span>•</span>
              <span>Divisions: <strong>{Array.isArray(teacher?.assignedDivisions) ? teacher?.assignedDivisions.join(", ") : teacher?.assignedDivisions || "Sem 5 - Div A"}</strong></span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "16px", color: "var(--text-main)" }}>
              Contact Information
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={16} color="var(--primary-600)" />
                <span>{teacher?.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={16} color="var(--primary-600)" />
                <span>{teacher?.phone}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Building2 size={16} color="var(--primary-600)" />
                <span>Staff Room: Cabin 302, 3rd Floor, Engineering Block</span>
              </div>
            </div>
          </div>

          <div style={{ background: "var(--bg-surface-secondary)", padding: "18px", borderRadius: "12px" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-main)" }}>
              Teaching Load & Assigned Courses
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {mySubjects.map((sub) => (
                <div key={sub.id} style={{ background: "white", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "600", fontSize: "0.85rem" }}>{sub.name}</span>
                  <Badge variant="gray">{sub.code}</Badge>
                </div>
              ))}
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
