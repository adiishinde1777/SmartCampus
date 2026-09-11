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
  const { currentUser } = useSmartCampus();
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
            <img
              src={student?.avatar}
              alt={student?.name}
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
              <h3 style={{ fontSize: "1.5rem", fontWeight: "800" }}>{student?.name}</h3>
              <Badge variant="success">Active Student</Badge>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Roll No: <strong>{student?.rollNo}</strong> • Department of <strong>{student?.departmentName}</strong>
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <span>Semester: <strong>{student?.semester}</strong> (Div {student?.division})</span>
              <span>•</span>
              <span>Cumulative CGPA: <strong style={{ color: "var(--primary-700)" }}>{student?.cgpa} / 10.0</strong></span>
            </div>
          </div>
        </div>

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
