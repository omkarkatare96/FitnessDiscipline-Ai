import { useState, useEffect } from "react";
import { Play, Droplets, Moon, Zap, Flame, Footprints } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getUserWorkouts, type WorkoutEntry } from "../../firebase/firestoreService";

const weekData = [
  { day: "Mon", mins: 45, done: true },
  { day: "Tue", mins: 0, done: false },
  { day: "Wed", mins: 60, done: true },
  { day: "Thu", mins: 55, done: true },
  { day: "Fri", mins: 0, done: false },
  { day: "Sat", mins: 70, done: true },
  { day: "Sun", mins: 30, done: true },
];

const weekSteps = [6200, 4500, 9800, 8100, 3000, 11200, 7400];

const exercises = [
  { name: "Bench Press", sets: "4×8", reps: "80kg" },
  { name: "Incline Dumbbell", sets: "3×10", reps: "24kg" },
  { name: "Cable Flyes", sets: "3×12", reps: "15kg" },
];

function RadialProgress({ score }: { score: number }) {
  const r = 90;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="220" height="220" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <defs>
          <linearGradient id="ringGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E87A" />
            <stop offset="100%" stopColor="#00C2FF" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="110" cy="110" r={r} fill="none" stroke="#1a1f2e" strokeWidth="14" />
        <circle
          cx="110" cy="110" r={r} fill="none"
          stroke="url(#ringGrad2)" strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          filter="url(#glow)"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div style={{ position: "relative", textAlign: "center" }}>
        <span style={{ display: "block", fontSize: 44, fontWeight: 900, color: "#F0F4FF", lineHeight: 1, letterSpacing: -2 }}>{score}</span>
        <span style={{ display: "block", fontSize: 12, color: "#64748B", marginTop: 4, textTransform: "uppercase", letterSpacing: 2 }}>Score</span>
        <span style={{ display: "block", fontSize: 11, color: "#00E87A", marginTop: 4 }}>↑ +3 pts this week</span>
      </div>
    </div>
  );
}

function StepRing({ steps, goal }: { steps: number; goal: number }) {
  const pct = Math.min(steps / goal, 1);
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;
  return (
    <div style={{ position: "relative", width: 92, height: 92, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="92" height="92" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <defs>
          <linearGradient id="stepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E87A" />
            <stop offset="100%" stopColor="#00C2FF" />
          </linearGradient>
        </defs>
        <circle cx="46" cy="46" r={r} fill="none" stroke="#1a1f2e" strokeWidth="8" />
        <circle
          cx="46" cy="46" r={r} fill="none"
          stroke="url(#stepGrad)" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 800, lineHeight: 1 }}>{Math.round(pct * 100)}%</div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [score] = useState(78);
  const [steps] = useState(7400);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const stepGoal = 10000;
  const stepCalories = Math.round(steps * 0.04);
  const stepMax = 12000;

  // Load user's workout history from Firestore
  useEffect(() => {
    if (!user) return;
    getUserWorkouts(user.uid)
      .then(setWorkouts)
      .catch((err) => console.error("Failed to load workouts:", err));
  }, [user]);

  // Count workouts completed this week (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const weeklyWorkouts = workouts.filter((w) => {
    if (!w.createdAt) return false;
    // Firestore Timestamp has .toDate()
    const ts = (w.createdAt as unknown as { toDate: () => Date }).toDate?.();
    return ts && ts >= sevenDaysAgo;
  });
  const uniqueWorkoutDays = new Set(
    weeklyWorkouts.map((w) => {
      const ts = (w.createdAt as unknown as { toDate: () => Date }).toDate?.();
      return ts?.toDateString();
    })
  ).size;

  const statCards = [
    {
      icon: <Flame size={18} color="#FF6B35" />,
      label: "Current Streak",
      value: "12 Days",
      sub: "Best: 21 days",
      accent: "#FF6B35",
      bg: "rgba(255,107,53,0.1)",
    },
    {
      icon: <Droplets size={18} color="#00C2FF" />,
      label: "Hydration",
      value: "1.8L / 3L",
      isBar: true,
      progress: 60,
      accent: "#00C2FF",
      bg: "rgba(0,194,255,0.1)",
    },
    {
      icon: <Moon size={18} color="#A78BFA" />,
      label: "Sleep",
      value: "7.2 hrs",
      sub: "Goal: 8 hrs",
      accent: "#A78BFA",
      bg: "rgba(167,139,250,0.1)",
    },
    {
      icon: <Zap size={18} color="#00E87A" />,
      label: "Workouts This Week",
      value: uniqueWorkoutDays > 0 ? `${uniqueWorkoutDays}/7 days` : "2,140 kcal",
      sub: uniqueWorkoutDays > 0 ? `${weeklyWorkouts.length} exercises logged` : "Goal: 2,500",
      accent: "#00E87A",
      bg: "rgba(0,232,122,0.1)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
        {statCards.map((c, i) => (
          <div
            key={i}
            style={{
              background: "linear-gradient(160deg, #0E1117 0%, #080B12 100%)",
              borderRadius: 18,
              padding: "18px 20px",
              border: "1px solid rgba(255,255,255,0.07)",
              transition: "all 0.25s",
              cursor: "default",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = c.accent + "55";
              e.currentTarget.style.boxShadow = `0 0 28px ${c.accent}22`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Accent glow spot */}
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: c.bg,
                filter: "blur(20px)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10, position: "relative" }}>
              <div
                style={{
                  background: c.bg,
                  border: `1px solid ${c.accent}33`,
                  borderRadius: 10,
                  padding: 8,
                  display: "flex",
                }}
              >
                {c.icon}
              </div>
              <span style={{ color: "#64748B", fontSize: 12, fontWeight: 500 }}>{c.label}</span>
            </div>
            <div style={{ color: "#F0F4FF", fontSize: 20, fontWeight: 800, letterSpacing: -0.5, position: "relative" }}>{c.value}</div>
            {c.isBar ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ background: "#1a1f2e", borderRadius: 6, height: 5 }}>
                  <div
                    style={{
                      background: `linear-gradient(90deg, ${c.accent}, ${c.accent}88)`,
                      borderRadius: 6,
                      height: 5,
                      width: `${c.progress}%`,
                      transition: "width 1.2s ease",
                      boxShadow: `0 0 8px ${c.accent}66`,
                    }}
                  />
                </div>
                <span style={{ color: "#64748B", fontSize: 10, marginTop: 3, display: "block" }}>{c.progress}% of daily goal</span>
              </div>
            ) : (
              <div style={{ color: "#64748B", fontSize: 11, marginTop: 3, position: "relative" }}>{c.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* Step Counter Card — full width */}
      <div
        style={{
          background: "linear-gradient(135deg, #0E1117, #080B12)",
          borderRadius: 18,
          padding: "22px 28px",
          border: "1px solid rgba(0,232,122,0.2)",
          boxShadow: "0 0 30px rgba(0,232,122,0.06)",
          display: "flex",
          gap: 28,
          flexWrap: "wrap",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* BG glow */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(0,232,122,0.06)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />

        {/* Icon + Label */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 160 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(0,232,122,0.12)",
              border: "1px solid rgba(0,232,122,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Footprints size={20} color="#00E87A" />
          </div>
          <div>
            <div style={{ color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Daily Steps</div>
            <div style={{ color: "#F0F4FF", fontSize: 26, fontWeight: 900, letterSpacing: -1, lineHeight: 1.2 }}>
              {steps.toLocaleString()}
            </div>
            <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>Goal: {stepGoal.toLocaleString()}</div>
          </div>
        </div>

        {/* Progress Ring */}
        <StepRing steps={steps} goal={stepGoal} />

        {/* Stats */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "Calories", value: `${stepCalories}`, unit: "kcal", color: "#FF6B35" },
            { label: "Distance", value: "5.2", unit: "km", color: "#00C2FF" },
            { label: "Active Time", value: "48", unit: "min", color: "#A78BFA" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ color: s.color, fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: "#64748B", fontSize: 10 }}>{s.unit}</div>
              <div style={{ color: "#4B5563", fontSize: 10 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mini Weekly Step Graph */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ color: "#64748B", fontSize: 11, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            This Week
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 52 }}>
            {weekData.map((d, i) => {
              const h = weekSteps[i] > 0 ? Math.max((weekSteps[i] / stepMax) * 100, 8) : 8;
              const isToday = i === 6;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div
                    title={`${weekSteps[i].toLocaleString()} steps`}
                    style={{
                      width: "100%",
                      height: `${h}%`,
                      borderRadius: "4px 4px 2px 2px",
                      background: isToday
                        ? "linear-gradient(180deg, #00E87A, #00C2FF)"
                        : weekSteps[i] >= stepGoal
                        ? "rgba(0,232,122,0.5)"
                        : "#1a1f2e",
                      transition: "all 0.6s ease",
                      boxShadow: isToday ? "0 0 8px rgba(0,232,122,0.5)" : "none",
                      minHeight: 4,
                    }}
                  />
                  <span style={{ color: isToday ? "#00E87A" : "#4B5563", fontSize: 9, fontWeight: isToday ? 700 : 400 }}>{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        {/* Radial Progress */}
        <div
          style={{
            background: "linear-gradient(160deg, #0E1117 0%, #080B12 100%)",
            borderRadius: 18,
            padding: 26,
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ alignSelf: "flex-start" }}>
            <div style={{ color: "#F0F4FF", fontSize: 15, fontWeight: 700 }}>Discipline Score</div>
            <div style={{ color: "#64748B", fontSize: 12 }}>This week's performance</div>
          </div>
          <RadialProgress score={score} />
          <div style={{ display: "flex", gap: 0, width: "100%" }}>
            {[
              { label: "Days Trained", value: "5/7", color: "#00C2FF" },
              { label: "Total Mins", value: "260", color: "#00E87A" },
              { label: "Workouts", value: "5", color: "#FF6B35" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "10px 0",
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                <div style={{ color: s.color, fontSize: 17, fontWeight: 800 }}>{s.value}</div>
                <div style={{ color: "#64748B", fontSize: 10, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Bar Chart */}
        <div
          style={{
            background: "linear-gradient(160deg, #0E1117 0%, #080B12 100%)",
            borderRadius: 18,
            padding: 26,
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ color: "#F0F4FF", fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Weekly Activity</div>
          <div style={{ color: "#64748B", fontSize: 12, marginBottom: 22 }}>Workout minutes per day</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 110 }}>
            {weekData.map((d, i) => {
              const maxMins = 80;
              const h = d.mins > 0 ? Math.max((d.mins / maxMins) * 100, 8) : 8;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  {d.mins > 0 && <div style={{ color: "#64748B", fontSize: 9 }}>{d.mins}</div>}
                  <div
                    style={{
                      width: "100%",
                      height: `${h}%`,
                      borderRadius: "5px 5px 2px 2px",
                      background: d.done
                        ? "linear-gradient(180deg, #00E87A, #00C2FF88)"
                        : "#1a1f2e",
                      transition: "height 0.8s ease",
                      minHeight: 6,
                      boxShadow: d.done ? "0 0 8px rgba(0,232,122,0.25)" : "none",
                    }}
                  />
                  <div style={{ color: d.done ? "#4B5563" : "#2D3748", fontSize: 10 }}>{d.day}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
            {[
              { label: "Completed", bg: "#00E87A" },
              { label: "Missed", bg: "#1a1f2e" },
            ].map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.bg }} />
                <span style={{ color: "#64748B", fontSize: 11 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Plan + AI Quote */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: "linear-gradient(160deg, #0E1117 0%, #080B12 100%)",
              borderRadius: 18,
              padding: 22,
              border: "1px solid rgba(255,255,255,0.07)",
              flex: 1,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ color: "#64748B", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5 }}>Today's Plan</div>
                <div style={{ color: "#F0F4FF", fontSize: 17, fontWeight: 800, letterSpacing: -0.3 }}>PUSH DAY 💪</div>
              </div>
              <span
                style={{
                  background: "rgba(0,194,255,0.12)",
                  color: "#00C2FF",
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 20,
                  border: "1px solid rgba(0,194,255,0.25)",
                  fontWeight: 600,
                }}
              >
                Chest + Shoulders
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {exercises.map((ex, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#080B12",
                    borderRadius: 10,
                    padding: "10px 14px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,232,122,0.2)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 3, height: 18, borderRadius: 2, background: "#00E87A" }} />
                    <span style={{ color: "#D1D5DB", fontSize: 13 }}>{ex.name}</span>
                  </div>
                  <span style={{ color: "#FF6B35", fontSize: 12, fontWeight: 700 }}>
                    {ex.sets} · {ex.reps}
                  </span>
                </div>
              ))}
            </div>
            <button
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #00E87A, #00C2FF)",
                borderRadius: 12,
                border: "none",
                color: "#020912",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "box-shadow 0.2s, transform 0.1s",
                letterSpacing: 0.3,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 0 28px rgba(0,232,122,0.5)";
                e.currentTarget.style.transform = "scale(1.01)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Play size={15} fill="#020912" />
              Start Workout
            </button>
          </div>

          {/* AI Quote */}
          <div
            style={{
              borderRadius: 18,
              padding: 20,
              background: "linear-gradient(135deg, rgba(0,232,122,0.12), rgba(0,194,255,0.12))",
              border: "1px solid rgba(0,232,122,0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -15,
                left: 8,
                fontSize: 90,
                color: "rgba(0,232,122,0.1)",
                lineHeight: 1,
                fontFamily: "serif",
              }}
            >
              "
            </div>
            <div style={{ color: "#64748B", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>⚡ AI Insight</div>
            <div style={{ color: "#D1D5DB", fontSize: 13, lineHeight: 1.6, position: "relative" }}>
              Your consistency this week is exceptional. Push day will maximize weekly volume target — push limits today!
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00E87A", boxShadow: "0 0 6px #00E87A" }} />
              <span style={{ color: "#00E87A", fontSize: 11, fontWeight: 600 }}>FitDiscipline AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
