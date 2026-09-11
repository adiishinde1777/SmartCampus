import React, { useState, useRef } from "react";
import { useSmartCampus } from "../../context/SmartCampusContext";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Save,
  X,
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  MapPin,
  Heart,
  Briefcase,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Modal, Badge } from "./UIPrimitives";

export default function EditProfileModal({ isOpen, onClose }) {
  const { currentUser, updateUser, departments, users } = useSmartCampus();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(() => ({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    password: currentUser?.password || "password123",
    avatar: currentUser?.avatar || "",
    address: currentUser?.address || "",
    bloodGroup: currentUser?.bloodGroup || "O+",
    designation: currentUser?.designation || "",
    occupation: currentUser?.occupation || "",
    relation: currentUser?.relation || "Father",
    rollNo: currentUser?.rollNo || "",
    semester: currentUser?.semester || 5,
    division: currentUser?.division || "A",
    parentName: currentUser?.parentName || "",
    parentPhone: currentUser?.parentPhone || "",
    parentEmail: currentUser?.parentEmail || "",
    collegeName: currentUser?.collegeName || "ABC Institute of Technology"
  }));

  const [showPassword, setShowPassword] = useState(false);
  const [photoSource, setPhotoSource] = useState("gallery"); // "gallery" | "preset" | "url"

  const presetAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  ];

  if (!currentUser) return null;

  // Handle Photo File Upload from Gallery/Device
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Selected image is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setFormData((prev) => ({ ...prev, avatar: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateUser(currentUser.id, formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Profile & Photo: ${currentUser.name} (${currentUser.role.toUpperCase()})`}
      maxWidth="680px"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-md">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="btn btn-primary btn-md" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Save size={16} />
            <span>Save Profile & Photo</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* ======================================================== */}
        {/* GALLERY / DEVICE PHOTO UPLOAD SECTION                   */}
        {/* ======================================================== */}
        <div
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
            border: "1.5px solid #bfdbfe",
            borderRadius: "14px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Camera size={18} color="var(--primary-600)" />
              <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                Profile Picture & Gallery Upload
              </strong>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Upload real photo from your device gallery
            </span>
          </div>

          <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Avatar Preview with Camera Overlay */}
            <div style={{ position: "relative", width: "88px", height: "88px" }}>
              <img
                src={formData.avatar || currentUser.avatar}
                alt={formData.name}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #2563eb",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Click to pick photo from gallery"
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  background: "#2563eb",
                  color: "white",
                  border: "2px solid white",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                }}
              >
                <Camera size={14} />
              </button>
            </div>

            {/* Upload Action Buttons */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "#2563eb" }}
                >
                  <Upload size={14} />
                  <span>Choose Photo from Gallery / Device</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPhotoSource(photoSource === "preset" ? "gallery" : "preset")}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.75rem" }}
                >
                  <Sparkles size={13} /> Choose from Presets
                </button>
              </div>

              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                Supports JPG, PNG, WEBP from your local computer, phone, or gallery.
              </div>
            </div>
          </div>

          {/* Preset Avatars Selector (Collapsible) */}
          {photoSource === "preset" && (
            <div style={{ background: "white", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-muted)" }}>
                Pick from Faculty & Student Avatars:
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {presetAvatars.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Avatar ${idx}`}
                    onClick={() => setFormData({ ...formData, avatar: url })}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      cursor: "pointer",
                      border: formData.avatar === url ? "3px solid #2563eb" : "2px solid transparent",
                      transform: formData.avatar === url ? "scale(1.1)" : "none",
                      transition: "all 0.15s ease"
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* CORE PROFILE FIELDS                                      */}
        {/* ======================================================== */}
        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-main)" }}>
            Profile Details
          </h4>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Account Password</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: "0.72rem", cursor: "pointer" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {/* Role Specific Inputs */}
            {currentUser.role === "student" && (
              <>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    className="form-control"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </>
            )}

            {(currentUser.role === "teacher" || currentUser.role === "hod" || currentUser.role === "principal" || currentUser.role === "admin") && (
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Designation / Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>
            )}

            {currentUser.role === "parent" && (
              <>
                <div className="form-group">
                  <label className="form-label">Occupation</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
