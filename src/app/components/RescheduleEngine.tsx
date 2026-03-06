import { useState } from "react";
import { CheckCircle, XCircle, RefreshCw, Merge, AlertTriangle, Clock, Dumbbell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { saveRescheduledWorkout } from "../../firebase/firestoreService";
import { useToast } from "../../context/ToastContext";

type DayStatus = "done" | "missed" | "upcoming";

interface Day {
  id: string;
  day: string;
  date: number;
  workout: string;
  status: DayStatus;
  muscleGroups: string[];
  exercises: string[];
  estimatedMinutes: number;
}

// ─── Exercise database per workout type ─────────────────────────────────────
const workoutExercises: Record<string, { exercises: string[]; muscles: string[]; minutes: number }> = {
  "Push Day": {
    exercises: ["Bench Press 4×8", "Incline DB Press 4×10", "OHP 3×10", "Cable Flyes 3×12", "Tricep Pushdown 3×15"],
    muscles: ["Chest", "Shoulders", "Triceps"],
    minutes: 50,
  },
  "Pull Day": {
    exercises: ["Barbell Row 4×8", "Weighted Pull-Ups 4×6", "Lat Pulldown 3×12", "Face Pulls 3×15", "Barbell Curl 3×10"],
    muscles: ["Back", "Biceps", "Rear Delts"],
    minutes: 50,
  },
  "Legs": {
    exercises: ["Back Squat 5×5", "Romanian Deadlift 4×8", "Leg Press 3×15", "Lunges 3×12", "Calf Raises 4×20"],
    muscles: ["Quads", "Glutes", "Hamstrings", "Calves"],
    minutes: 55,
  },
  "Full Body": {
    exercises: ["Deadlift 4×5", "Bench Press 3×8", "Pull-Ups 3×8", "OHP 3×10", "Goblet Squat 3×12"],
    muscles: ["Chest", "Back", "Legs", "Shoulders"],
    minutes: 60,
  },
  "Active Rest": {
    exercises: ["10-min Walk", "Full Body Stretch", "Foam Roll"],
    muscles: [],
    minutes: 20,
  },
  "Rest Day": {
    exercises: [],
    muscles: [],
    minutes: 0,
  },
};

// ─── Merge Logic ─────────────────────────────────────────────────────────────
interface MergedPlan {
  exercises: string[];
  removed: string[];
  notes: string;
  estimatedMinutes: number;
}

function createMergedPlan(missed: Day, target: Day): MergedPlan {
  const missedData = workoutExercises[missed.workout] || { exercises: [], muscles: [], minutes: 0 };
  const targetData  = workoutExercises[target.workout] || { exercises: [], muscles: [], minutes: 30 };

  // Check for overlapping muscle groups — avoid heavy same-muscle overload
  const overlapMuscles = missedData.muscles.filter(m => targetData.muscles.includes(m));
  const isSameMuscle = overlapMuscles.length >= 2;

  let mergedExercises: string[] = [];
  let removed: string[] = [];

  const budgetMinutes = 60;
  let usedMinutes = targetData.minutes;

  if (isSameMuscle) {
    // Same muscle group — only add 2 "light pump" exercises from missed
    const toAdd = missedData.exercises.slice(0, 2);
    mergedExercises = [...targetData.exercises, ...toAdd];
    removed = missedData.exercises.slice(2);
  } else {
    // Different muscle groups — safe to merge, respect 60 min cap
    const missedMinutesPerEx = Math.round(missedData.minutes / Math.max(missedData.exercises.length, 1));
    const remaining = budgetMinutes - usedMinutes;
    const canAdd = Math.max(0, Math.floor(remaining / (missedMinutesPerEx || 1)));

    const toAdd = missedData.exercises.slice(0, canAdd);
    removed = missedData.exercises.slice(canAdd);
    mergedExercises = [...targetData.exercises, ...toAdd];
    usedMinutes = Math.min(budgetMinutes, usedMinutes + toAdd.length * missedMinutesPerEx);
  }

  const notes = isSameMuscle
    ? `⚠️ Same muscle overlap (${overlapMuscles.join(", ")}). Only light volume added from ${missed.workout} to avoid overtraining.`
    : `✅ Safe merge — no muscle overlap. Added ${missed.workout} exercises within 60 min budget.`;

  return { exercises: mergedExercises, removed, notes, estimatedMinutes: usedMinutes };
}

// ─── Data ────────────────────────────────────────────────────────────────────
const initialDays: Day[] = [
  { id: "mon", day: "Mon", date: 24, workout: "Push Day", status: "done", muscleGroups: ["Chest", "Shoulders", "Triceps"], exercises: workoutExercises["Push Day"].exercises, estimatedMinutes: 50 },
  { id: "tue", day: "Tue", date: 25, workout: "Pull Day", status: "done", muscleGroups: ["Back", "Biceps"], exercises: workoutExercises["Pull Day"].exercises, estimatedMinutes: 50 },
  { id: "wed", day: "Wed", date: 26, workout: "Legs", status: "missed", muscleGroups: ["Quads", "Glutes", "Hamstrings"], exercises: workoutExercises["Legs"].exercises, estimatedMinutes: 55 },
  { id: "thu", day: "Thu", date: 27, workout: "Push Day", status: "done", muscleGroups: ["Chest", "Shoulders", "Triceps"], exercises: workoutExercises["Push Day"].exercises, estimatedMinutes: 50 },
  { id: "fri", day: "Fri", date: 28, workout: "Active Rest", status: "missed", muscleGroups: [], exercises: workoutExercises["Active Rest"].exercises, estimatedMinutes: 20 },
  { id: "sat", day: "Sat", date: 29, workout: "Full Body", status: "upcoming", muscleGroups: ["Chest", "Back", "Legs", "Shoulders"], exercises: workoutExercises["Full Body"].exercises, estimatedMinutes: 60 },
  { id: "sun", day: "Sun", date: 30, workout: "Rest Day", status: "upcoming", muscleGroups: [], exercises: [], estimatedMinutes: 0 },
];

const muscleProgress = [
  { name: "Chest",     percent: 80,  color: "#FF4757" },
  { name: "Back",      percent: 100, color: "#00C2FF" },
  { name: "Shoulders", percent: 70,  color: "#A78BFA" },
  { name: "Legs",      percent: 50,  color: "#F59E0B" },
  { name: "Arms",      percent: 90,  color: "#00E87A" },
];

const statusStyles: Record<DayStatus, { bg: string; border: string; dotColor: string }> = {
  done:     { bg: "rgba(0,232,122,0.08)", border: "#00E87A", dotColor: "#00E87A" },
  missed:   { bg: "rgba(255,71,87,0.08)", border: "#FF4757", dotColor: "#FF4757" },
  upcoming: { bg: "linear-gradient(160deg, #0E1117, #080B12)", border: "rgba(255,255,255,0.07)", dotColor: "#64748B" },
};

// ─── Component ───────────────────────────────────────────────────────────────
export function RescheduleEngine() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [days, setDays] = useState<Day[]>(initialDays);
  const [selected, setSelected] = useState<string | null>("wed");
  const [mergePlans, setMergePlans] = useState<Record<string, { target: Day; plan: MergedPlan }>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const selectedDay = days.find(d => d.id === selected);
  const missedDays = days.filter(d => d.status === "missed");
  const doneDays   = days.filter(d => d.status === "done");
  const upcomingDays = days.filter(d => d.status === "upcoming" && d.workout !== "Rest Day");

  const markStatus = (status: DayStatus) => {
    if (!selected) return;
    setDays(days.map(d => (d.id === selected ? { ...d, status } : d)));
    setMergePlans(prev => { const next = { ...prev }; delete next[selected]; return next; });
  };

  const generateMerges = () => {
    if (missedDays.length === 0) return;
    setIsGenerating(true);
    setTimeout(() => {
      const newPlans: Record<string, { target: Day; plan: MergedPlan }> = {};
      missedDays.forEach((missed, i) => {
        const target = upcomingDays[i % upcomingDays.length];
        if (target) {
          newPlans[missed.id] = { target, plan: createMergedPlan(missed, target) };
        }
      });
      setMergePlans(newPlans);
      setIsGenerating(false);
      showToast({ type: "info", title: "Merge Plan Ready", message: `Smart plan generated for ${missedDays.length} missed session${missedDays.length > 1 ? "s" : ""}.`, icon: "🔀" });
    }, 900);
  };

  const saveMerge = async (missedId: string) => {
    const entry = mergePlans[missedId];
    if (!entry || !user) return;
    const missed = missedDays.find(d => d.id === missedId)!;
    try {
      await saveRescheduledWorkout({
        userId: user.uid,
        missedDay: `${missed.day} Mar ${missed.date}`,
        missedWorkout: missed.workout,
        mergedIntoDay: `${entry.target.day} Mar ${entry.target.date}`,
        mergedExercises: entry.plan.exercises,
        removedExercises: entry.plan.removed,
        estimatedDuration: entry.plan.estimatedMinutes,
        notes: entry.plan.notes,
      });
      setSavedIds(prev => new Set([...prev, missedId]));
      showToast({ type: "success", title: "Workout Saved! 🏋️", message: `Merged ${missed.workout} → ${entry.target.workout} saved to your plan.` });
    } catch (err) {
      console.error("Failed to save rescheduled workout:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Header */}
      <div>
        <h2 style={{ color: "#F0F4FF", fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 6 }}>Reschedule Engine</h2>
        <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Smart workout merge system — missed sessions get intelligently combined with upcoming days</p>
      </div>

      {/* Weekly Calendar */}
      <div style={{ background: "linear-gradient(160deg, #0E1117, #080B12)", borderRadius: 16, padding: 22, border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 700, marginBottom: 14 }}>This Week — Mar 24–30, 2026</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {days.map(d => {
            const s = statusStyles[d.status];
            const isSel = selected === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelected(d.id)}
                style={{
                  flex: "0 0 auto", minWidth: 90, padding: "12px 8px", borderRadius: 14,
                  background: isSel ? (d.status === "done" ? "rgba(0,232,122,0.15)" : d.status === "missed" ? "rgba(255,71,87,0.15)" : "#1a1f2e") : "#0A0E16",
                  border: isSel ? `2px solid ${s.border}` : `2px solid ${s.border}44`,
                  cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  transition: "all 0.2s", boxShadow: isSel ? `0 0 16px ${s.border}33` : "none",
                }}
              >
                <span style={{ color: "#64748B", fontSize: 11, fontWeight: 600 }}>{d.day}</span>
                <span style={{ color: "#F0F4FF", fontSize: 20, fontWeight: 900 }}>{d.date}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  {d.status === "done"     && <CheckCircle size={13} color="#00E87A" />}
                  {d.status === "missed"   && <XCircle size={13} color="#FF4757" />}
                  {d.status === "upcoming" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#64748B" }} />}
                </div>
                <span style={{ color: s.dotColor, fontSize: 9, fontWeight: 700, textAlign: "center", lineHeight: 1.3, maxWidth: 74 }}>{d.workout}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day details */}
      {selectedDay && (
        <div style={{ background: "linear-gradient(160deg, #0E1117, #080B12)", borderRadius: 16, padding: "18px 22px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ color: "#64748B", fontSize: 11, marginBottom: 3 }}>Selected: {selectedDay.day}, Mar {selectedDay.date}</div>
              <div style={{ color: "#F0F4FF", fontSize: 17, fontWeight: 800 }}>{selectedDay.workout}</div>
              {selectedDay.muscleGroups.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {selectedDay.muscleGroups.map(m => (
                    <span key={m} style={{ background: "rgba(0,194,255,0.1)", border: "1px solid rgba(0,194,255,0.25)", borderRadius: 20, padding: "2px 10px", color: "#00C2FF", fontSize: 10, fontWeight: 700 }}>{m}</span>
                  ))}
                </div>
              )}
              {selectedDay.estimatedMinutes > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748B", fontSize: 11, marginTop: 8 }}>
                  <Clock size={11} /> {selectedDay.estimatedMinutes} min session
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => markStatus("done")} style={{ padding: "10px 18px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #00E87A, #00a855)", color: "#020912", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 20px rgba(0,232,122,0.5)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
              ><CheckCircle size={14} /> Mark Completed</button>
              <button onClick={() => markStatus("missed")} style={{ padding: "10px 18px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #FF4757, #cc1a2a)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 20px rgba(255,71,87,0.5)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
              ><XCircle size={14} /> Mark Missed</button>
            </div>
          </div>

          {/* Exercise list for selected day */}
          {selectedDay.exercises.length > 0 && (
            <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
              <div style={{ color: "#64748B", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Today's Exercises</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selectedDay.exercises.map((ex, i) => (
                  <div key={i} style={{ background: "#080B12", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "5px 12px", color: "#94A3B8", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <Dumbbell size={11} color="#64748B" /> {ex}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Smart Merge Button */}
      {missedDays.length > 0 && (
        <button
          onClick={generateMerges}
          disabled={isGenerating}
          style={{
            padding: "14px", borderRadius: 14, border: "none",
            background: isGenerating ? "#1a1f2e" : "linear-gradient(135deg, #00E87A, #00C2FF)",
            color: isGenerating ? "#64748B" : "#020912",
            fontSize: 14, fontWeight: 800, cursor: isGenerating ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "box-shadow 0.2s",
          }}
          onMouseEnter={e => { if (!isGenerating) e.currentTarget.style.boxShadow = "0 0 28px rgba(0,232,122,0.5)"; }}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
        >
          {isGenerating ? (
            <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #64748B", borderTopColor: "#00E87A", animation: "spin 0.8s linear infinite" }} /> Generating smart merge plan...</>
          ) : (
            <><Merge size={16} /> Generate Smart Merge Plan ({missedDays.length} missed session{missedDays.length > 1 ? "s" : ""})</>
          )}
        </button>
      )}

      {/* Merge Results */}
      {Object.keys(mergePlans).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {missedDays.map(missed => {
            const entry = mergePlans[missed.id];
            if (!entry) return null;
            const { target, plan } = entry;
            const isSaved = savedIds.has(missed.id);
            const hasOverlap = plan.notes.startsWith("⚠️");

            return (
              <div key={missed.id} style={{ background: "linear-gradient(160deg, #0E1117, #080B12)", borderRadius: 18, border: `1px solid ${hasOverlap ? "#F59E0B33" : "#00E87A33"}`, overflow: "hidden", animation: "slideUp 0.4s ease" }}>
                {/* Header */}
                <div style={{ background: hasOverlap ? "rgba(245,158,11,0.08)" : "rgba(0,232,122,0.07)", borderBottom: `1px solid ${hasOverlap ? "#F59E0B22" : "#00E87A22"}`, padding: "14px 22px", display: "flex", alignItems: "center", gap: 10 }}>
                  {hasOverlap ? <AlertTriangle size={16} color="#F59E0B" /> : <Merge size={16} color="#00E87A" />}
                  <div>
                    <span style={{ color: "#FF4757", fontWeight: 700, fontSize: 13 }}>{missed.workout}</span>
                    <span style={{ color: "#64748B", fontSize: 13 }}> → merged into → </span>
                    <span style={{ color: "#00E87A", fontWeight: 700, fontSize: 13 }}>{target.workout} ({target.day})</span>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 12 }}>
                    <Clock size={12} /> {plan.estimatedMinutes} min
                  </div>
                </div>

                <div style={{ padding: "18px 22px" }}>
                  {/* Notes */}
                  <div style={{ background: hasOverlap ? "rgba(245,158,11,0.06)" : "rgba(0,232,122,0.06)", border: `1px solid ${hasOverlap ? "#F59E0B22" : "#00E87A22"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: hasOverlap ? "#F59E0B" : "#00E87A", fontSize: 12, lineHeight: 1.6 }}>
                    {plan.notes}
                  </div>

                  {/* Merged exercises */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Merged Exercise Plan</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {plan.exercises.map((ex, i) => (
                        <div key={i} style={{ background: "#080B12", border: "1px solid rgba(0,232,122,0.15)", borderRadius: 8, padding: "5px 12px", color: "#94A3B8", fontSize: 12 }}>
                          <span style={{ color: "#00E87A", marginRight: 4 }}>✓</span>{ex}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Removed exercises */}
                  {plan.removed.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Removed to Stay Under 60 min</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {plan.removed.map((ex, i) => (
                          <div key={i} style={{ background: "#080B12", border: "1px solid rgba(255,71,87,0.15)", borderRadius: 8, padding: "5px 12px", color: "#4B5563", fontSize: 12 }}>
                            <span style={{ color: "#FF4757", marginRight: 4 }}>✗</span>{ex}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save button */}
                  <button
                    onClick={() => saveMerge(missed.id)}
                    disabled={isSaved || !user}
                    style={{
                      padding: "10px 20px", borderRadius: 12, border: "none",
                      background: isSaved ? "rgba(0,232,122,0.1)" : "linear-gradient(135deg, #00E87A, #00C2FF)",
                      color: isSaved ? "#00E87A" : "#020912",
                      fontSize: 13, fontWeight: 800, cursor: isSaved ? "default" : "pointer",
                      display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
                    }}
                  >
                    {isSaved ? <><CheckCircle size={14} /> Saved to Firestore</> : "💾 Save Merged Plan"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Muscle Progress Bars */}
      <div style={{ background: "linear-gradient(160deg, #0E1117, #080B12)", borderRadius: 16, padding: 22, border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 700, marginBottom: 3 }}>Weekly Volume Progress</div>
        <div style={{ color: "#64748B", fontSize: 12, marginBottom: 18 }}>{doneDays.length}/{days.length} sessions completed this week</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {muscleProgress.map((mp, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#D1D5DB", fontSize: 13, fontWeight: 500 }}>{mp.name}</span>
                <span style={{ color: mp.color, fontSize: 13, fontWeight: 800 }}>{mp.percent}%</span>
              </div>
              <div style={{ background: "#1a1f2e", borderRadius: 6, height: 7 }}>
                <div style={{ background: `linear-gradient(90deg, ${mp.color}, ${mp.color}88)`, borderRadius: 6, height: 7, width: `${mp.percent}%`, transition: "width 1s ease", boxShadow: mp.percent >= 100 ? `0 0 10px ${mp.color}88` : "none" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}