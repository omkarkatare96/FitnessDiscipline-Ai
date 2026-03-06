import { useState } from "react";
import {
  Zap, AlertTriangle, CheckCircle, XCircle, TrendingUp,
  Droplets, Brain, Activity, Heart, User, Ruler, Weight,
} from "lucide-react";
import {
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { saveReadinessCheck } from "../../firebase/firestoreService";

// ─── Slider Component ──────────────────────────────────────────────────────────
interface SliderProps {
  label: string;
  emoji: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  min?: number;
  max?: number;
  leftLabel?: string;
  rightLabel?: string;
}

function Slider({ label, emoji, value, onChange, color, min = 0, max = 10, leftLabel, rightLabel }: SliderProps) {
  return (
    <div
      style={{
        background: "linear-gradient(160deg, #0E1117, #080B12)",
        borderRadius: 16,
        padding: "18px 22px",
        border: "1px solid rgba(255,255,255,0.07)",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = color + "44")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{emoji}</span>
          <div>
            <div style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 700 }}>{label}</div>
            {leftLabel && <div style={{ color: "#64748B", fontSize: 10 }}>{leftLabel}</div>}
          </div>
        </div>
        <div
          style={{
            background: `${color}18`,
            border: `2px solid ${color}55`,
            borderRadius: 12,
            padding: "5px 14px",
            color: color,
            fontSize: 22,
            fontWeight: 900,
            minWidth: 54,
            textAlign: "center",
          }}
        >
          {value}<span style={{ fontSize: 10, color: color + "88", fontWeight: 400 }}>/{max}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
        {Array.from({ length: max - min }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 3,
              background: i < value - min ? color : "#1a1f2e",
              boxShadow: i < value - min ? `0 0 4px ${color}66` : "none",
              transition: "all 0.15s",
            }}
          />
        ))}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="fitness-slider"
        style={{ width: "100%", height: 6, appearance: "none", background: "transparent", outline: "none", cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ color: "#4B5563", fontSize: 10 }}>{leftLabel || min}</span>
        <span style={{ color: "#4B5563", fontSize: 10 }}>{rightLabel || max}</span>
      </div>
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type Intensity = "Light" | "Moderate" | "Intense" | "Rest";
type Gender = "male" | "female";

interface ReadinessResult {
  score: number;
  intensity: Intensity;
  color: string;
  label: string;
  recommendation: string;
  workoutSuggestion: string;
  recoveryTips: string[];
  recommendedMuscle: string;
  exercises: number;
  sets: number;
  reps: number;
}

// ─── Readiness Calculation ─────────────────────────────────────────────────────
function calcReadiness(
  sleep: number,
  fatigue: number,
  mood: number,
  hydration: number,
  stress: number,
  soreness: number,
  motivation: number,
): ReadinessResult {
  // Weighted scoring across 7 metrics
  const sleepScore     = (sleep / 10) * 22;
  const fatigueScore   = ((10 - fatigue) / 9) * 18;
  const moodScore      = (mood / 10) * 12;
  const hydrationScore = (hydration / 10) * 14;
  const stressScore    = ((10 - stress) / 9) * 14;
  const sorenessScore  = ((10 - soreness) / 9) * 10;
  const motivScore     = (motivation / 10) * 10;
  const score = Math.round(sleepScore + fatigueScore + moodScore + hydrationScore + stressScore + sorenessScore + motivScore);

  const muscleGroups = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Full Body"];
  const recommendedMuscle = muscleGroups[Math.floor(Math.random() * muscleGroups.length)];

  if (fatigue >= 8 || sleep <= 3 || soreness >= 9) {
    return { score: Math.min(score, 30), intensity: "Rest", color: "#FF4757", label: "Critical Recovery Needed",
      recommendation: "Your body is severely under-recovered. Today is a mandatory rest day. Light walk and stretching only.",
      workoutSuggestion: "10-min walk + full body stretch", recommendedMuscle: "Core (light)",
      exercises: 2, sets: 2, reps: 10,
      recoveryTips: ["Sleep 9+ hours tonight", "Increase hydration by 500ml", "Avoid caffeine after 2 PM", "Cold/contrast shower"] };
  } else if (score >= 75) {
    return { score, intensity: "Intense", color: "#00E87A", label: "Peak Readiness",
      recommendation: "You're fully primed. Push maximum intensity — heavy compounds, PRs, HIIT. Make it count.",
      workoutSuggestion: "Heavy compound session or HIIT", recommendedMuscle,
      exercises: 6, sets: 5, reps: 5,
      recoveryTips: ["Pre-workout 30 min before", "Load up on carbs", "Target 8+ hours sleep tonight", "Post-workout protein within 30 min"] };
  } else if (score >= 50) {
    return { score, intensity: "Moderate", color: "#F59E0B", label: "Moderate Readiness",
      recommendation: "Solid energy but not peak. Keep intensity at 70–80%. Focus on volume and form quality.",
      workoutSuggestion: "Moderate volume training at 75%", recommendedMuscle,
      exercises: 4, sets: 3, reps: 12,
      recoveryTips: ["Warm up 10 min thoroughly", "Reduce max weight by 10%", "Stay hydrated throughout", "Prioritize sleep tonight"] };
  } else {
    return { score, intensity: "Light", color: "#FF6B35", label: "Low Readiness",
      recommendation: "Take it easy. Opt for light movement, mobility work, or a short 20-min walk. Fuel recovery.",
      workoutSuggestion: "Mobility, yoga, or light cardio", recommendedMuscle: "Core",
      exercises: 3, sets: 2, reps: 15,
      recoveryTips: ["20-min yoga session", "Foam roll key muscle groups", "Extra protein & veggies today", "Nap if possible (20 min)"] };
  }
}

// ─── BMR Calculation (Mifflin-St Jeor) ───────────────────────────────────────
function calcBMR(weight: number, height: number, age: number, gender: Gender): number {
  if (gender === "male") {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
}

const intensityConfig: Record<Intensity, { icon: React.ReactNode; gradient: string }> = {
  Rest:     { icon: <XCircle size={14} />,      gradient: "linear-gradient(135deg, #FF475722, #FF000011)" },
  Light:    { icon: <AlertTriangle size={14} />, gradient: "linear-gradient(135deg, #FF6B3522, #F59E0B11)" },
  Moderate: { icon: <TrendingUp size={14} />,   gradient: "linear-gradient(135deg, #F59E0B22, #FBBF2411)" },
  Intense:  { icon: <Zap size={14} />,          gradient: "linear-gradient(135deg, #00E87A22, #00C2FF11)" },
};

const CHART_COLORS = ["#00E87A", "#00C2FF", "#A78BFA", "#FF6B35", "#F59E0B", "#FF4757", "#10B981"];

// ─── Custom Tooltip for charts ─────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }: { active?: boolean; payload?: {value: number; name: string}[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0E1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px" }}>
      {label && <div style={{ color: "#94A3B8", fontSize: 11, marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: "#F0F4FF", fontSize: 13, fontWeight: 700 }}>
          {p.name}: {p.value} {p.name === "BMR" ? "kcal" : "/ 10"}
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export function ReadinessCheck() {
  const { user } = useAuth();

  // Original metrics
  const [sleep, setSleep]     = useState(7);
  const [fatigue, setFatigue] = useState(4);
  const [mood, setMood]       = useState(6);

  // New metrics
  const [hydration, setHydration] = useState(7);
  const [stress, setStress]       = useState(4);
  const [soreness, setSoreness]   = useState(3);
  const [motivation, setMotivation] = useState(7);

  // BMR inputs
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge]       = useState(25);
  const [gender, setGender] = useState<Gender>("male");

  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"metrics" | "bmr">("metrics");

  const bmr = calcBMR(weight, height, age, gender);
  const tdeeLight    = Math.round(bmr * 1.375);
  const tdeeModerate = Math.round(bmr * 1.55);
  const tdeeActive   = Math.round(bmr * 1.725);

  const calculate = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const r = calcReadiness(sleep, fatigue, mood, hydration, stress, soreness, motivation);
      setResult(r);
      setLoading(false);
      if (user) {
        saveReadinessCheck({
          userId: user.uid,
          sleep, fatigue, mood,
          score: r.score,
          intensity: r.intensity,
          // Extended fields passed as extra — Firestore stores any key-value
          ...({ hydration, stress, motivation, muscleSoreness: soreness, bmr, recommendation: r.recommendedMuscle } as object),
        }).catch(err => console.error("Failed to save readiness check:", err));
      }
    }, 800);
  };

  // Chart data
  const radarData = [
    { metric: "Sleep",      value: sleep,                full: 10 },
    { metric: "Energy",     value: 10 - fatigue,         full: 10 },
    { metric: "Mood",       value: mood,                 full: 10 },
    { metric: "Hydration",  value: hydration,            full: 10 },
    { metric: "Low Stress", value: 10 - stress,          full: 10 },
    { metric: "Recovery",   value: 10 - soreness,        full: 10 },
    { metric: "Motivation", value: motivation,            full: 10 },
  ];

  const preview = calcReadiness(sleep, fatigue, mood, hydration, stress, soreness, motivation);
  const pieData = [
    { name: "Readiness", value: preview.score },
    { name: "Gap",       value: 100 - preview.score },
  ];

  const bmrBarData = [
    { name: "BMR",       value: bmr,         fill: "#00E87A" },
    { name: "Light",     value: tdeeLight,    fill: "#00C2FF" },
    { name: "Moderate",  value: tdeeModerate, fill: "#F59E0B" },
    { name: "Active",    value: tdeeActive,   fill: "#FF6B35" },
  ];

  const r = 54;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Header */}
      <div>
        <h2 style={{ color: "#F0F4FF", fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 6 }}>Readiness Check</h2>
        <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>7-metric AI analysis + BMR calculator + personalized daily training report</p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", background: "#0E1117", borderRadius: 14, padding: 4, border: "1px solid rgba(255,255,255,0.07)", gap: 4 }}>
        {(["metrics", "bmr"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: "10px", borderRadius: 10, border: "none",
              background: activeTab === tab ? "linear-gradient(135deg, #00E87A22, #00C2FF22)" : "transparent",
              color: activeTab === tab ? "#F0F4FF" : "#4B5563",
              fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid #00E87A" : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tab === "metrics" ? "🎯  Readiness Metrics" : "🔥  BMR Calculator"}
          </button>
        ))}
      </div>

      {/* ── METRICS TAB ── */}
      {activeTab === "metrics" && (
        <>
          {/* Section: Body & Recovery */}
          <div style={{ background: "#080B12", borderRadius: 14, padding: "14px 18px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
              💪 Body & Recovery
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              <Slider label="Sleep Quality" emoji="😴" value={sleep} onChange={setSleep} color="#00C2FF" leftLabel="Terrible" rightLabel="Perfect" />
              <Slider label="Fatigue Level" emoji="😤" value={fatigue} onChange={setFatigue} color="#FF6B35" min={1} leftLabel="Fresh" rightLabel="Drained" />
              <Slider label="Muscle Soreness" emoji="🦵" value={soreness} onChange={setSoreness} color="#FF4757" leftLabel="No Soreness" rightLabel="Very Sore" />
            </div>
          </div>

          {/* Section: Mind & Energy */}
          <div style={{ background: "#080B12", borderRadius: 14, padding: "14px 18px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
              🧠 Mind & Energy
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              <Slider label="Mood" emoji="😊" value={mood} onChange={setMood} color="#A78BFA" leftLabel="Demotivated" rightLabel="Fired Up" />
              <Slider label="Stress Level" emoji="😰" value={stress} onChange={setStress} color="#F59E0B" leftLabel="Calm" rightLabel="Very Stressed" />
              <Slider label="Motivation" emoji="⚡" value={motivation} onChange={setMotivation} color="#00E87A" leftLabel="Zero Drive" rightLabel="Unstoppable" />
            </div>
          </div>

          {/* Section: Nutrition */}
          <div style={{ background: "#080B12", borderRadius: 14, padding: "14px 18px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
              💧 Nutrition & Hydration
            </div>
            <Slider label="Hydration Level" emoji="💧" value={hydration} onChange={setHydration} color="#00C2FF" leftLabel="Dehydrated" rightLabel="Well Hydrated" />
          </div>

          {/* Live Radar Preview */}
          <div style={{ background: "#0E1117", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              Live Recovery Radar
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: "1 1 260px" }}>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke="#1a1f2e" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748B", fontSize: 11 }} />
                    <Radar name="You" dataKey="value" stroke="#00E87A" fill="#00E87A" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip content={<DarkTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ color: "#64748B", fontSize: 12 }}>
                  Est. Score: <span style={{ color: preview.color, fontWeight: 800, fontSize: 16 }}>{preview.score}/100</span>
                </span>
                <span style={{ color: "#64748B", fontSize: 12 }}>
                  Intensity: <span style={{ color: preview.color, fontWeight: 700 }}>{preview.intensity}</span>
                </span>
                {radarData.map(d => (
                  <div key={d.metric} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                    <span style={{ color: "#4B5563", fontSize: 11 }}>{d.metric}</span>
                    <span style={{ color: "#94A3B8", fontSize: 11, fontWeight: 700 }}>{d.value}/10</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── BMR TAB ── */}
      {activeTab === "bmr" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* BMR Inputs */}
          <div style={{ background: "#0E1117", borderRadius: 16, padding: "22px 24px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 800, marginBottom: 18 }}>Body Metrics</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
              {/* Weight */}
              <div>
                <label style={{ color: "#64748B", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                  <Weight size={11} /> Weight (kg)
                </label>
                <input
                  type="number" min={30} max={250} value={weight}
                  onChange={e => setWeight(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px 14px", background: "#080B12", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#F0F4FF", fontSize: 16, fontWeight: 800, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              {/* Height */}
              <div>
                <label style={{ color: "#64748B", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                  <Ruler size={11} /> Height (cm)
                </label>
                <input
                  type="number" min={100} max={250} value={height}
                  onChange={e => setHeight(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px 14px", background: "#080B12", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#F0F4FF", fontSize: 16, fontWeight: 800, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              {/* Age */}
              <div>
                <label style={{ color: "#64748B", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                  <User size={11} /> Age
                </label>
                <input
                  type="number" min={10} max={100} value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px 14px", background: "#080B12", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#F0F4FF", fontSize: 16, fontWeight: 800, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              {/* Gender */}
              <div>
                <label style={{ color: "#64748B", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                  <Heart size={11} /> Gender
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["male", "female"] as Gender[]).map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      style={{
                        flex: 1, padding: "10px 8px", borderRadius: 10, border: "none",
                        background: gender === g ? "linear-gradient(135deg, #00E87A22, #00C2FF22)" : "#080B12",
                        color: gender === g ? "#00E87A" : "#4B5563",
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                        borderBottom: gender === g ? "2px solid #00E87A" : "2px solid transparent",
                        transition: "all 0.2s", textTransform: "capitalize",
                      }}
                    >
                      {g === "male" ? "♂ Male" : "♀ Female"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BMR Result + Bar Chart */}
          <div style={{ background: "#0E1117", borderRadius: 16, padding: "22px 24px", border: "1px solid #00E87A22" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Basal Metabolic Rate</div>
                <div style={{ color: "#00E87A", fontSize: 44, fontWeight: 900, lineHeight: 1.1 }}>{bmr.toLocaleString()}</div>
                <div style={{ color: "#64748B", fontSize: 13 }}>kcal / day at complete rest</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Light Activity", val: tdeeLight, color: "#00C2FF" },
                  { label: "Moderate Activity", val: tdeeModerate, color: "#F59E0B" },
                  { label: "Very Active", val: tdeeActive, color: "#FF6B35" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                    <span style={{ color: "#64748B", fontSize: 12 }}>{row.label}</span>
                    <span style={{ color: row.color, fontWeight: 800, fontSize: 13 }}>{row.val.toLocaleString()} kcal</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bmrBarData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `${v}`} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="value" name="BMR" radius={[6, 6, 0, 0]}>
                  {bmrBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Calculate Button ── */}
      <button
        onClick={calculate}
        disabled={loading}
        style={{
          padding: "15px",
          background: loading ? "#1a1f2e" : "linear-gradient(135deg, #00E87A, #00C2FF)",
          borderRadius: 14, border: "none",
          color: loading ? "#64748B" : "#020912",
          fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.3s", letterSpacing: 0.5,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 32px rgba(0,232,122,0.5)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
      >
        {loading ? (
          <>
            <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #64748B", borderTopColor: "#00E87A", animation: "spin 0.8s linear infinite" }} />
            Analyzing 7 metrics...
          </>
        ) : (
          <>
            <Zap size={16} fill="#020912" />
            Calculate Full Readiness Score
          </>
        )}
      </button>

      {/* ── RESULT ── */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "slideUp 0.5s ease" }}>

          {/* Score ring + label */}
          <div
            style={{
              borderRadius: 20, overflow: "hidden",
              border: `1px solid ${result.color}44`,
              boxShadow: `0 0 40px ${result.color}15`,
            }}
          >
            <div
              style={{
                background: intensityConfig[result.intensity].gradient,
                borderBottom: `1px solid ${result.color}22`,
                padding: "28px 32px",
                display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap",
              }}
            >
              {/* Score Ring */}
              <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
                <svg width="130" height="130" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
                  <defs>
                    <linearGradient id="scoreGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={result.color} />
                      <stop offset="100%" stopColor={result.color + "88"} />
                    </linearGradient>
                  </defs>
                  <circle cx="65" cy="65" r={r} fill="none" stroke="#1a1f2e" strokeWidth="10" />
                  <circle cx="65" cy="65" r={r} fill="none"
                    stroke="url(#scoreGrad2)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={circ - (result.score / 100) * circ}
                    style={{ transition: "stroke-dashoffset 1.2s ease" }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ color: result.color, fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{result.score}</div>
                  <div style={{ color: "#64748B", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>/ 100</div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: `${result.color}18`, border: `1px solid ${result.color}44`,
                  borderRadius: 20, padding: "5px 14px", color: result.color,
                  fontSize: 12, fontWeight: 800, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1,
                }}>
                  {intensityConfig[result.intensity].icon} {result.label}
                </div>
                <p style={{ color: "#D1D5DB", fontSize: 14, lineHeight: 1.7, margin: "0 0 14px 0" }}>{result.recommendation}</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0E1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 14px" }}>
                  <span style={{ color: result.color }}><CheckCircle size={14} /></span>
                  <span style={{ color: "#94A3B8", fontSize: 12 }}>Suggested: <strong style={{ color: "#F0F4FF", fontWeight: 600 }}>{result.workoutSuggestion}</strong></span>
                </div>
              </div>
            </div>

            {/* Intensity gauge */}
            <div style={{ background: "#080B12", padding: "14px 32px" }}>
              <div style={{ color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Workout Intensity Gauge</div>
              <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", height: 8 }}>
                {(["Rest", "Light", "Moderate", "Intense"] as Intensity[]).map(lvl => {
                  const lc = { Rest: "#FF4757", Light: "#FF6B35", Moderate: "#F59E0B", Intense: "#00E87A" };
                  return (
                    <div key={lvl} style={{ flex: 1, background: result.intensity === lvl ? lc[lvl] : "#1a1f2e", boxShadow: result.intensity === lvl ? `0 0 10px ${lc[lvl]}88` : "none", transition: "all 0.3s" }} />
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {(["Rest", "Light", "Moderate", "Intense"] as Intensity[]).map(lvl => {
                  const lc = { Rest: "#FF4757", Light: "#FF6B35", Moderate: "#F59E0B", Intense: "#00E87A" };
                  return <span key={lvl} style={{ fontSize: 10, color: result.intensity === lvl ? lc[lvl] : "#4B5563", fontWeight: result.intensity === lvl ? 700 : 400 }}>{lvl}</span>;
                })}
              </div>
            </div>
          </div>

          {/* ── Daily Report Card ── */}
          <div style={{ background: "linear-gradient(135deg, #0E1117, #080B12)", borderRadius: 18, border: `1px solid ${result.color}33`, overflow: "hidden" }}>
            <div style={{ background: `${result.color}12`, borderBottom: `1px solid ${result.color}22`, padding: "14px 24px", display: "flex", alignItems: "center", gap: 10 }}>
              <Activity size={16} color={result.color} />
              <span style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 800 }}>Today's Training Recommendation</span>
            </div>
            <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 16 }}>
              {[
                { label: "Muscle Group",  value: result.recommendedMuscle, icon: "💪", color: result.color },
                { label: "Intensity",     value: result.intensity,          icon: "⚡", color: result.color },
                { label: "Exercises",     value: `${result.exercises}`,      icon: "🏋️", color: "#00C2FF" },
                { label: "Sets",          value: `${result.sets}`,           icon: "🔁", color: "#A78BFA" },
                { label: "Reps",          value: `${result.reps}`,           icon: "📊", color: "#F59E0B" },
                { label: "BMR Today",     value: `${bmr} kcal`,              icon: "🔥", color: "#FF6B35" },
              ].map(item => (
                <div key={item.label} style={{ background: "#080B12", borderRadius: 12, padding: "14px 12px", border: `1px solid ${item.color}22`, textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ color: item.color, fontSize: 16, fontWeight: 900, lineHeight: 1 }}>{item.value}</div>
                  <div style={{ color: "#4B5563", fontSize: 10, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Visual Charts Row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {/* Readiness Pie Chart */}
            <div style={{ background: "#0E1117", borderRadius: 16, padding: "18px 16px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Readiness Score</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"  cy="50%"
                    innerRadius={50} outerRadius={75}
                    startAngle={90} endAngle={-270}
                    dataKey="value"
                  >
                    <Cell fill={result.color} />
                    <Cell fill="#1a1f2e" />
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: "center", marginTop: -16 }}>
                <div style={{ color: result.color, fontSize: 28, fontWeight: 900 }}>{result.score}%</div>
                <div style={{ color: "#64748B", fontSize: 11 }}>{result.label}</div>
              </div>
            </div>

            {/* Radar Chart */}
            <div style={{ background: "#0E1117", borderRadius: 16, padding: "18px 16px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Recovery Radar</div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
                  <PolarGrid stroke="#1a1f2e" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748B", fontSize: 10 }} />
                  <Radar name="Score" dataKey="value" stroke={result.color} fill={result.color} fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip content={<DarkTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recovery Tips */}
          <div style={{ background: "#0A0E16", borderRadius: 16, padding: "18px 24px 22px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>💡 Recovery Recommendations</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {result.recoveryTips.map((tip, i) => (
                <div key={i} style={{ background: "#0E1117", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: result.color, flexShrink: 0 }} />
                  <span style={{ color: "#94A3B8", fontSize: 12 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fitness-slider { -webkit-appearance: none; }
        .fitness-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
          background: #F0F4FF; cursor: pointer; border: 2px solid rgba(255,255,255,0.4);
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        .fitness-slider::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #F0F4FF; cursor: pointer; border: 2px solid rgba(255,255,255,0.4);
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 0.5; }
      `}</style>
    </div>
  );
}
