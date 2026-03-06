import { useState } from "react";
import { Dumbbell, Eye, EyeOff, Zap, Mail, Lock, User } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

type Mode = "login" | "signup";

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) { setError("Please enter your name."); setLoading(false); return; }
        await signUp(email, password, name.trim());
      } else {
        await signIn(email, password);
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Something went wrong.";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("Invalid email or password.");
      } else if (msg.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else if (msg.includes("weak-password")) {
        setError("Password must be at least 6 characters.");
      } else if (msg.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === "login" ? "signup" : "login");
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06080F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow orbs */}
      <div style={{ position: "absolute", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,232,122,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,194,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: "linear-gradient(135deg, #00E87A, #00C2FF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 32px rgba(0,232,122,0.4)",
              }}
            >
              <Dumbbell size={22} color="#020912" strokeWidth={2.5} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: "#F0F4FF", fontSize: 20, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.5 }}>
                FitDiscipline
              </div>
              <div
                style={{
                  background: "linear-gradient(90deg, #00E87A, #00C2FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                AI PRO
              </div>
            </div>
          </div>
          <p style={{ color: "#4B5563", fontSize: 13, margin: 0 }}>
            Your AI-powered fitness companion
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "linear-gradient(160deg, #0E1117, #080B12)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
            boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Tab switcher */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {(["login", "signup"] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                style={{
                  flex: 1,
                  padding: "16px",
                  border: "none",
                  background: "transparent",
                  color: mode === m ? "#F0F4FF" : "#4B5563",
                  fontSize: 14,
                  fontWeight: mode === m ? 700 : 500,
                  cursor: "pointer",
                  borderBottom: mode === m ? "2px solid #00E87A" : "2px solid transparent",
                  transition: "all 0.2s",
                  textTransform: "capitalize",
                  letterSpacing: 0.3,
                }}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: "28px 28px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Name (signup only) */}
            {mode === "signup" && (
              <div>
                <label style={{ display: "block", color: "#64748B", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={15} color="#4B5563" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    type="text"
                    placeholder="Alex Carter"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required={mode === "signup"}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ display: "block", color: "#64748B", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} color="#4B5563" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", color: "#64748B", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} color="#4B5563" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "Min 6 characters" : "••••••••"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "#4B5563", display: "flex" }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(255,71,87,0.1)",
                  border: "1px solid rgba(255,71,87,0.3)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "#FF4757",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                padding: "14px",
                background: loading ? "#1a1f2e" : "linear-gradient(135deg, #00E87A, #00C2FF)",
                borderRadius: 14,
                border: "none",
                color: loading ? "#64748B" : "#020912",
                fontSize: 15,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.3s",
                letterSpacing: 0.3,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 32px rgba(0,232,122,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #3a3f4e", borderTopColor: "#00E87A", animation: "authSpin 0.8s linear infinite" }} />
                  {mode === "signup" ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>
                  <Zap size={16} fill="#020912" />
                  {mode === "signup" ? "Create Account" : "Sign In"}
                </>
              )}
            </button>

            {/* Switch mode */}
            <p style={{ textAlign: "center", color: "#4B5563", fontSize: 12, margin: 0 }}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={switchMode}
                style={{ background: "transparent", border: "none", color: "#00E87A", fontWeight: 700, cursor: "pointer", fontSize: 12, padding: 0 }}
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </form>
        </div>

        {/* Bottom badge */}
        <p style={{ textAlign: "center", color: "#2D3748", fontSize: 11, marginTop: 20 }}>
          🔒 Secured with Firebase Authentication
        </p>
      </div>

      <style>{`
        @keyframes authSpin { to { transform: rotate(360deg); } }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 999px #0E1117 inset !important;
          -webkit-text-fill-color: #F0F4FF !important;
        }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px 11px 40px",
  background: "#080B12",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  color: "#F0F4FF",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  fontFamily: "'Inter', sans-serif",
};
