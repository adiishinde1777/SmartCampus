import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = Info;
        let className = "toast";
        if (toast.type === "success") {
          Icon = CheckCircle2;
          className = "toast success";
        } else if (toast.type === "danger" || toast.type === "error") {
          Icon = AlertCircle;
          className = "toast danger";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          className = "toast warning";
        }

        return (
          <div key={toast.id} className={className}>
            <Icon size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: "700", fontSize: "0.88rem", marginBottom: "2px" }}>
                {toast.title}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#cbd5e1", lineHeight: 1.4 }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "2px"
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
