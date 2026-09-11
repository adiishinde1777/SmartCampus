import React, { useState } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  HeartHandshake,
  Briefcase,
  Edit,
  Camera
} from "lucide-react";
import { Badge } from "../common/UIPrimitives";
import EditProfileModal from "../common/EditProfileModal";

export default function ParentProfile() {
  const { currentUser, users } = useSmartCampus();
  const parent = currentUser;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const ward = users.find((u) => u.id === parent?.studentId) || users[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "960px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>
            Parent / Guardian Profile
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Registered parent details and connected student ward
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
          <div style={{ position: "relative", width: "90px", height: "90px" }}>
            <img
              src={parent?.avatar}
              alt={parent?.name}
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "4px solid #e2e8f0" }}
            />
            <button
              onClick={() => setIsEditModalOpen(true)}
              title="Upload photo from device gallery"
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
              <h3 style={{ fontSize: "1.5rem", fontWeight: "800" }}>{parent?.name}</h3>
              <Badge variant="success">Parent / Guardian</Badge>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Relation: <strong>{parent?.relation}</strong> • Occupation: <strong>{parent?.occupation}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "16px" }}>Contact Information</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={16} color="var(--primary-600)" />
                <span>{parent?.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={16} color="var(--primary-600)" />
                <span>{parent?.phone} (Active Alerts)</span>
              </div>
            </div>
          </div>

          <div style={{ background: "var(--bg-surface-secondary)", padding: "18px", borderRadius: "12px" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px" }}>Enrolled Ward</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src={ward?.avatar}
                alt={ward?.name}
                style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div>
                <strong style={{ fontSize: "0.95rem" }}>{ward?.name}</strong>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{ward?.rollNo} • {ward?.departmentName}</div>
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
