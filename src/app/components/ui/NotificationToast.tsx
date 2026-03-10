import { useEffect, useState } from "react";
import { useToast, type Toast } from "../../../context/ToastContext";
import { X, CheckCircle, Info, AlertTriangle } from "lucide-react";

const typeConfig: Record<Toast["type"], { border: string; glow: string; icon: React.ReactNode }> = {
  success: { border: "#00E87A", glow: "#00E87A22", icon: <CheckCircle size={16} color="#00E87A" /> },
  info:    { border: "#00C2FF", glow: "#00C2FF22", icon: <Info size={16} color="#00C2FF" /> },
  warning: { border: "#F59E0B", glow: "#F59E0B22", icon: <AlertTriangle size={16} color="#F59E0B" /> },
  ai:      { border: "#A78BFA", glow: "#A78BFA22", icon: <span style={{ fontSize: 16 }}>🤖</span> },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  const cfg = typeConfig[toast.type];

  useEffect(() => {
    // Slight delay to trigger slide-in animation
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 350);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        background: "linear-gradient(160deg, #0E1117, #080B12)",
        border: `1px solid ${cfg.border}55`,
        borderLeft: `3px solid ${cfg.border}`,
        borderRadius: 14,
        padding: "14px 16px",
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${cfg.glow}`,
        minWidth: 300,
        maxWidth: 380,
        transform: visible ? "translateX(0)" : "translateX(110%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.18,0.89,0.32,1.28), opacity 0.35s ease",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onClick={handleDismiss}
    >
      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 2,
          background: cfg.border,
          animation: "toastProgress 5s linear forwards",
          borderRadius: 2,
        }}
      />

      {/* Icon */}
      <div
        style={{
          background: cfg.glow,
          borderRadius: 8,
          padding: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {toast.icon ? <span style={{ fontSize: 15 }}>{toast.icon}</span> : cfg.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ color: "#F0F4FF", fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{toast.title}</div>
        <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.5 }}>{toast.message}</div>
      </div>

      {/* Close */}
      <button
        onClick={e => { e.stopPropagation(); handleDismiss(); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#4B5563", padding: 2, marginLeft: 4, flexShrink: 0 }}
        onMouseEnter={e => (e.currentTarget.style.color = "#94A3B8")}
        onMouseLeave={e => (e.currentTarget.style.color = "#4B5563")}
      >
        <X size={14} />
      </button>

      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export function NotificationToast() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {toasts.map(toast => (
        <div key={toast.id} style={{ pointerEvents: "all" }}>
          <ToastItem toast={toast} onDismiss={() => dismissToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}
