import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Activity,
  Smile,
  Dumbbell,
  Calendar,
  Bot,
  Menu,
  X,
  Salad,
  PlayCircle,
  Zap,
  LogOut,
} from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { ReadinessCheck } from "./components/ReadinessCheck";
import { MoodWorkout } from "./components/MoodWorkout";
import { MuscleTrainer } from "./components/MuscleTrainer";
import { RescheduleEngine } from "./components/RescheduleEngine";
import { AICoach } from "./components/AICoach";
import { MealRecommendation } from "./components/MealRecommendation";
import { WorkoutVideos } from "./components/WorkoutVideos";
import { AuthPage } from "./components/auth/AuthPage";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { NotificationToast } from "./components/ui/NotificationToast";

type Page = "dashboard" | "readiness" | "mood" | "muscle" | "reschedule" | "coach" | "nutrition" | "videos";

const navItems: { id: Page; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={17} />, color: "#00C2FF" },
  { id: "readiness", label: "Readiness", icon: <Activity size={17} />, color: "#00E87A" },
  { id: "mood", label: "Mood Workout", icon: <Smile size={17} />, color: "#FF6B35" },
  { id: "muscle", label: "Muscle Trainer", icon: <Dumbbell size={17} />, color: "#FF4757" },
  { id: "reschedule", label: "Reschedule", icon: <Calendar size={17} />, color: "#A78BFA" },
  { id: "coach", label: "AI Coach", icon: <Bot size={17} />, color: "#F59E0B" },
  { id: "nutrition", label: "Nutrition Hub", icon: <Salad size={17} />, color: "#00E87A" },
  { id: "videos", label: "Workout Library", icon: <PlayCircle size={17} />, color: "#00C2FF" },
];

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  readiness: "Readiness Check",
  mood: "Mood Workout",
  muscle: "Muscle Trainer",
  reschedule: "Reschedule Engine",
  coach: "AI Coach",
  nutrition: "Nutrition Hub",
  videos: "Workout Library",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const mobileNavItems = navItems.slice(0, 6);

export default function App() {
  const { user, loading, signOut } = useAuth();
  const { showToast } = useToast();
  const [page, setPage] = useState<Page>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [didGreet, setDidGreet] = useState(false);

  // Fire login toast once when user loads
  useEffect(() => {
    if (user && !didGreet) {
      setDidGreet(true);
      showToast({
        type: "success",
        title: "Welcome back! 💪",
        message: `Good to see you, ${user.displayName || "Athlete"}. Let's crush it today!`,
        icon: "🏋️",
      });
    }
  }, [user, didGreet, showToast]);

  // Show loading spinner while Firebase resolves auth state
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#06080F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #1a1f2e", borderTopColor: "#00E87A", animation: "appSpin 0.9s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ color: "#4B5563", fontSize: 13 }}>Loading FitDiscipline...</div>
        </div>
        <style>{`@keyframes appSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Protected route gate — show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Get display name initials and real name
  const displayName = user.displayName || "Athlete";
  const firstLetter = displayName.charAt(0).toUpperCase();

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "readiness": return <ReadinessCheck />;
      case "mood": return <MoodWorkout />;
      case "muscle": return <MuscleTrainer />;
      case "reschedule": return <RescheduleEngine />;
      case "coach": return <AICoach />;
      case "nutrition": return <MealRecommendation />;
      case "videos": return <WorkoutVideos />;
    }
  };

  const activeColor = navItems.find(n => n.id === page)?.color || "#00E87A";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06080F",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        color: "#F0F4FF",
      }}
    >
      {/* Global notification toasts */}
      <NotificationToast />

      {/* ── Desktop Sidebar ── */}
      <aside
        style={{
          width: 244,
          background: "#080B12",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 40,
          flexShrink: 0,
        }}
        className="sidebar-desktop"
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px 22px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: "linear-gradient(135deg, #00E87A, #00C2FF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 24px rgba(0,232,122,0.4)",
                flexShrink: 0,
              }}
            >
              <Dumbbell size={18} color="#020912" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.3 }}>
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

          {/* Glow decoration */}
          <div
            style={{
              marginTop: 16,
              background: "rgba(0,232,122,0.06)",
              border: "1px solid rgba(0,232,122,0.15)",
              borderRadius: 10,
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Zap size={12} color="#00E87A" />
            <span style={{ color: "#00E87A", fontSize: 11, fontWeight: 600 }}>12-Day Streak Active 🔥</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
          {/* Group 1 */}
          <div style={{ color: "#4B5563", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 8px 8px" }}>
            Training
          </div>
          {navItems.slice(0, 6).map(item => (
            <NavButton key={item.id} item={item} active={page === item.id} onClick={() => setPage(item.id)} />
          ))}
          <div style={{ color: "#4B5563", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "12px 8px 8px" }}>
            Lifestyle
          </div>
          {navItems.slice(6).map(item => (
            <NavButton key={item.id} item={item} active={page === item.id} onClick={() => setPage(item.id)} />
          ))}
        </nav>

        {/* User card at bottom */}
        <div
          style={{
            padding: "14px 14px 18px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              background: "#0E1117",
              borderRadius: 14,
              padding: "12px 14px",
              border: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00E87A, #00C2FF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 800,
                color: "#020912",
                flexShrink: 0,
              }}
            >
              {firstLetter}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ color: "#F0F4FF", fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
              <div style={{ color: "#64748B", fontSize: 10 }}>{user.email}</div>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign out"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#4B5563", display: "flex", alignItems: "center", padding: 4, borderRadius: 6, transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#FF4757")}
              onMouseLeave={e => (e.currentTarget.style.color = "#4B5563")}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div
        style={{
          flex: 1,
          marginLeft: 244,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
        className="main-with-sidebar"
      >
        {/* Top Header */}
        <header
          style={{
            background: "rgba(6,8,15,0.92)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div>
            <h1
              style={{
                color: "#F0F4FF",
                fontSize: 18,
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.3,
                letterSpacing: -0.3,
              }}
            >
              {getGreeting()}, {displayName.split(" ")[0]} 💪
            </h1>
            <div style={{ color: "#4B5563", fontSize: 11, marginTop: 1 }}>{formatDate()}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Current page badge */}
            <span
              style={{
                background: `${activeColor}12`,
                border: `1px solid ${activeColor}33`,
                borderRadius: 20,
                padding: "5px 14px",
                color: activeColor,
                fontSize: 11,
                fontWeight: 700,
              }}
              className="header-badge"
            >
              {pageTitles[page]}
            </span>

            {/* Streak pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,107,53,0.1)",
                border: "1px solid rgba(255,107,53,0.25)",
                borderRadius: 20,
                padding: "6px 13px",
              }}
            >
              <span style={{ fontSize: 13 }}>🔥</span>
              <span style={{ color: "#FF6B35", fontSize: 13, fontWeight: 800 }}>12</span>
            </div>

            {/* Avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00E87A, #00C2FF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 800,
                color: "#020912",
                border: `2px solid ${activeColor}44`,
                cursor: "pointer",
                transition: "border-color 0.3s",
              }}
            >
              {firstLetter}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#94A3B8",
                cursor: "pointer",
                padding: "7px 8px",
                display: "none",
                alignItems: "center",
              }}
              className="mobile-menu-btn"
            >
              <Menu size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: "24px 28px",
            overflowX: "hidden",
          }}
          className="main-content"
        >
          {renderPage()}
        </main>
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileMenuOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.8)" }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            style={{
              width: 260,
              height: "100%",
              background: "#080B12",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #00E87A, #00C2FF)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Dumbbell size={16} color="#020912" />
                </div>
                <span style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 800 }}>FitDiscipline AI</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: "transparent", border: "none", color: "#64748B", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>
            <nav style={{ flex: 1, padding: "14px 10px" }}>
              {navItems.map(item => (
                <NavButton
                  key={item.id}
                  item={item}
                  active={page === item.id}
                  onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                />
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav
        style={{
          display: "none",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#080B12",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          zIndex: 50,
          padding: "6px 4px 8px",
        }}
        className="mobile-tab-bar"
      >
        {mobileNavItems.map(item => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "5px 2px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: active ? item.color : "#4B5563",
                transition: "color 0.2s",
                position: "relative",
              }}
            >
              {active && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 20,
                    height: 2,
                    borderRadius: 2,
                    background: item.color,
                    boxShadow: `0 0 6px ${item.color}`,
                  }}
                />
              )}
              {item.icon}
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 400 }}>{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .main-with-sidebar { margin-left: 0 !important; padding-bottom: 72px; }
          .main-content { padding: 14px !important; }
          .mobile-tab-bar { display: flex !important; }
          .header-badge { display: none !important; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #06080F; }
        ::-webkit-scrollbar-thumb { background: #1a1f2e; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #2d3748; }
        ::selection { background: rgba(0,232,122,0.25); }
      `}</style>
    </div>
  );
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: { id: Page; label: string; icon: React.ReactNode; color: string };
  active: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        border: "none",
        background: active
          ? `${item.color}14`
          : hovered
          ? "rgba(255,255,255,0.04)"
          : "transparent",
        color: active ? item.color : hovered ? "#94A3B8" : "#4B5563",
        cursor: "pointer",
        marginBottom: 2,
        position: "relative",
        transition: "all 0.18s",
        textAlign: "left",
        fontSize: 13,
        fontWeight: active ? 700 : 400,
      }}
    >
      {active && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 3,
            height: 20,
            borderRadius: "0 3px 3px 0",
            background: item.color,
            boxShadow: `0 0 8px ${item.color}`,
          }}
        />
      )}
      <span
        style={{
          flexShrink: 0,
          color: active ? item.color : hovered ? "#94A3B8" : "#4B5563",
          transition: "color 0.18s",
        }}
      >
        {item.icon}
      </span>
      <span>{item.label}</span>
    </button>
  );
}
