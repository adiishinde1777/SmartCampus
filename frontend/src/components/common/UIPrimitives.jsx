import React from "react";
import { X } from "lucide-react";

export function Modal({ isOpen, onClose, title, children, maxWidth = "600px", footer }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-surface)"
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px"
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "24px", maxHeight: "calc(85vh - 140px)", overflowY: "auto" }}>
          {children}
        </div>

        {footer && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid var(--border-subtle)",
              background: "var(--bg-surface-secondary)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px"
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatCard({ label, value, subtext, icon: Icon, variant = "primary", onClick }) {
  return (
    <div className={`stat-card ${variant}`} onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <div className="stat-card-header">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className={`stat-icon-wrapper ${variant}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {subtext && <div className="stat-subtext">{subtext}</div>}
    </div>
  );
}

export function Badge({ children, variant = "info", icon: Icon }) {
  return (
    <span className={`badge badge-${variant}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
