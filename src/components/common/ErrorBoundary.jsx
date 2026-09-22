import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "40px 24px",
            maxWidth: "600px",
            margin: "40px auto",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #fee2e2",
            boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.15)"
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#fee2e2",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto"
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#991b1b", marginBottom: "8px" }}>
            View Rendering Issue Detected
          </h2>
          <p style={{ fontSize: "0.88rem", color: "#64748b", marginBottom: "20px", lineHeight: "1.5" }}>
            An unexpected error occurred while displaying this section. Your data is secure. You can reload this view or switch to another tab.
          </p>
          {this.state.error?.message && (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                color: "#475569",
                fontFamily: "monospace",
                marginBottom: "20px",
                textAlign: "left",
                overflowX: "auto"
              }}
            >
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", margin: "0 auto" }}
          >
            <RefreshCw size={16} /> Reload Section
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
