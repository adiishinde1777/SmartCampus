import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  ShieldCheck,
  Edit,
  Camera,
  Upload
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";
import EditProfileModal from "../common/EditProfileModal";

export default function HODProfile() {
  const { currentUser } = useSmartCampus();
  const hod = currentUser;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "960px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Head of Department (HOD) Profile
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Departmental administration and executive academic credentials
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

      <div className="card">
        <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap", paddingBottom: "24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ position: "relative", width: "96px", height: "96px" }}>
            <img
              src={hod?.avatar}
              alt={hod?.name}
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "4px solid #e2e8f0" }}
            />
            <button
              onClick={() => setIsEditModalOpen(true)}
              title="Upload profile photo from gallery"
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
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
              <h3 style={{ fontSize: "1.5rem", fontWeight: "800" }}>{hod?.name}</h3>
              <Badge variant="warning">Head of Department</Badge>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              {hod?.designation} • <strong>{hod?.departmentName}</strong>
            </p>
            <div style={{ marginTop: "6px" }}>
              <button
                onClick={() => setIsEditModalOpen(true)}
                style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Upload size={12} /> Change photo from gallery / edit info
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "16px" }}>Contact Details</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={16} color="var(--primary-600)" />
                <span>{hod?.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={16} color="var(--primary-600)" />
                <span>{hod?.phone}</span>
              </div>
            </div>
          </div>

          <div style={{ background: "var(--bg-surface-secondary)", padding: "18px", borderRadius: "12px" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px" }}>Department Responsibility</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Overseeing Undergraduate Students, Faculty Members, Research Laboratories, and Academic Curriculum for {hod?.departmentName}.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
