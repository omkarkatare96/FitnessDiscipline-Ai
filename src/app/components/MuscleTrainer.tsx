import { useState } from "react";
import { Save, Check, ExternalLink } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { addWorkout } from "../../firebase/firestoreService";
import { getExerciseMedia } from "../../data/exercises";

type Muscle = "Chest" | "Back" | "Shoulders" | "Biceps" | "Triceps" | "Legs" | "Core" | "Full Body";
type Level = "Beginner" | "Intermediate" | "Advanced";

const muscles: Muscle[] = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Core", "Full Body"];

const muscleColors: Record<Muscle, string> = {
  Chest: "#EF4444",
  Back: "#3B82F6",
  Shoulders: "#8B5CF6",
  Biceps: "#F97316",
  Triceps: "#10B981",
  Legs: "#F59E0B",
  Core: "#06B6D4",
  "Full Body": "#EC4899",
};

const muscleEmoji: Record<Muscle, string> = {
  Chest: "💪",
  Back: "🦋",
  Shoulders: "🔝",
  Biceps: "💪",
  Triceps: "🦾",
  Legs: "🦵",
  Core: "🎯",
  "Full Body": "⚡",
};

type ExData = { name: string; sets: string; difficulty: "Beginner" | "Intermediate" | "Advanced"; tip: string; calories: number };

// ── Visual Media Card ──────────────────────────────────────────────────────────
function ExerciseMediaCard({ name, color }: { name: string; color: string }) {
  const media = getExerciseMedia(name);

  if (!media) {
    // Fallback placeholder
    return (
      <div
        style={{
          height: 160,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${color}14, ${color}08)`,
          border: `1px solid ${color}22`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 36 }}>🏋️</div>
        <span style={{ color: "#4B5563", fontSize: 11 }}>Visual guide coming soon</span>
      </div>
    );
  }

  if (media.mediaType === "video") {
    return (
      <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 12, background: "#000", position: "relative", paddingBottom: "52%" }}>
        <iframe
          src={`${media.mediaUrl}?rel=0&modestbranding=1`}
          title={name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
        />
      </div>
    );
  }

  // image or gif
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 12, position: "relative" }}>
      <img
        src={media.mediaUrl}
        alt={name}
        loading="lazy"
        style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      {media.mediaType === "gif" && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: "rgba(0,0,0,0.65)", borderRadius: 6,
          padding: "2px 7px", color: "#00E87A", fontSize: 10, fontWeight: 800,
          backdropFilter: "blur(4px)",
        }}>GIF</div>
      )}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 48,
        background: "linear-gradient(to top, #0E1117, transparent)",
      }} />
    </div>
  );
}

const exerciseDB: Record<Muscle, Record<Level, ExData[]>> = {
  Chest: {
    Beginner: [
      { name: "Push-Ups", sets: "3×15", difficulty: "Beginner", tip: "Keep core tight, full range", calories: 40 },
      { name: "Incline Push-Ups", sets: "3×12", difficulty: "Beginner", tip: "Hands elevated, lower chest focus", calories: 35 },
      { name: "Dumbbell Floor Press", sets: "3×12", difficulty: "Beginner", tip: "Control the descent, pause at bottom", calories: 45 },
      { name: "Cable Crossover Low", sets: "3×15", difficulty: "Beginner", tip: "Squeeze at top of movement", calories: 38 },
      { name: "Chest Stretch Hold", sets: "3×30s", difficulty: "Beginner", tip: "Feel the stretch across pecs", calories: 15 },
    ],
    Intermediate: [
      { name: "Barbell Bench Press", sets: "4×10", difficulty: "Intermediate", tip: "Retract shoulder blades, arch back slightly", calories: 65 },
      { name: "Dumbbell Incline Press", sets: "4×10", difficulty: "Intermediate", tip: "30–45° incline, full ROM", calories: 60 },
      { name: "Cable Flyes", sets: "3×12", difficulty: "Intermediate", tip: "Slight elbow bend, arc motion", calories: 45 },
      { name: "Dips (Chest Lean)", sets: "3×10", difficulty: "Intermediate", tip: "Lean forward to hit lower chest", calories: 55 },
      { name: "Decline Push-Ups", sets: "3×15", difficulty: "Intermediate", tip: "Feet elevated, upper chest focus", calories: 50 },
    ],
    Advanced: [
      { name: "Heavy Bench Press", sets: "5×5", difficulty: "Advanced", tip: "85–90% 1RM, spotter required", calories: 90 },
      { name: "Incline DB Press Heavy", sets: "4×8", difficulty: "Advanced", tip: "Controlled negative, explosive press", calories: 75 },
      { name: "Weighted Dips", sets: "4×8", difficulty: "Advanced", tip: "25kg+ added, full depth", calories: 80 },
      { name: "Guillotine Press", sets: "3×8", difficulty: "Advanced", tip: "Upper chest focus, careful form", calories: 70 },
      { name: "Plyometric Push-Ups", sets: "4×8", difficulty: "Advanced", tip: "Explosive, hands leave ground", calories: 65 },
    ],
  },
  Back: {
    Beginner: [
      { name: "Lat Pulldown", sets: "3×12", difficulty: "Beginner", tip: "Pull to upper chest, don't lean back too far", calories: 45 },
      { name: "Seated Cable Row", sets: "3×12", difficulty: "Beginner", tip: "Keep back straight, squeeze at end", calories: 42 },
      { name: "Dumbbell Row", sets: "3×10 each", difficulty: "Beginner", tip: "Elbow close to body, full extension", calories: 48 },
      { name: "Face Pulls", sets: "3×15", difficulty: "Beginner", tip: "Pull to forehead, external rotation", calories: 35 },
      { name: "Superman Hold", sets: "3×30s", difficulty: "Beginner", tip: "Lift chest and legs, hold at top", calories: 25 },
    ],
    Intermediate: [
      { name: "Barbell Rows", sets: "4×10", difficulty: "Intermediate", tip: "Hinge 45°, pull to lower chest", calories: 70 },
      { name: "Weighted Pull-Ups", sets: "4×6", difficulty: "Intermediate", tip: "Dead hang start, chin over bar", calories: 65 },
      { name: "T-Bar Row", sets: "4×10", difficulty: "Intermediate", tip: "Chest supported, elbows flare out", calories: 68 },
      { name: "Meadows Row", sets: "3×10 each", difficulty: "Intermediate", tip: "Landmine attachment, elbow flare", calories: 60 },
      { name: "Straight Arm Pulldown", sets: "3×15", difficulty: "Intermediate", tip: "Feel the lat stretch fully", calories: 42 },
    ],
    Advanced: [
      { name: "Deadlift", sets: "4×5", difficulty: "Advanced", tip: "Brace hard, hip hinge, vertical bar path", calories: 110 },
      { name: "Weighted Pull-Ups", sets: "4×5", difficulty: "Advanced", tip: "Add 20kg+, full ROM", calories: 85 },
      { name: "Yates Row", sets: "4×8", difficulty: "Advanced", tip: "Slight upright torso, heavy weight", calories: 80 },
      { name: "Rack Pulls", sets: "3×5", difficulty: "Advanced", tip: "Knee height pins, overload the back", calories: 95 },
      { name: "Single Arm Cable Row", sets: "3×10 each", difficulty: "Advanced", tip: "Full rotation, maximum stretch", calories: 60 },
    ],
  },
  Shoulders: {
    Beginner: [
      { name: "Dumbbell Lateral Raise", sets: "3×15", difficulty: "Beginner", tip: "Lead with elbows, slight forward lean", calories: 35 },
      { name: "Front Raise", sets: "3×12", difficulty: "Beginner", tip: "Alternate arms, controlled descent", calories: 32 },
      { name: "Seated DB Press", sets: "3×12", difficulty: "Beginner", tip: "Full lockout at top", calories: 48 },
      { name: "Face Pulls", sets: "3×15", difficulty: "Beginner", tip: "External rotation focus", calories: 30 },
      { name: "Rear Delt Fly", sets: "3×15", difficulty: "Beginner", tip: "Hinged forward, feel rear delts", calories: 33 },
    ],
    Intermediate: [
      { name: "Barbell OHP", sets: "4×8", difficulty: "Intermediate", tip: "Full lockout, tuck elbows slightly", calories: 65 },
      { name: "Arnold Press", sets: "4×10", difficulty: "Intermediate", tip: "Rotate through full arc", calories: 58 },
      { name: "Cable Lateral Raise", sets: "3×15", difficulty: "Intermediate", tip: "Cable keeps tension throughout", calories: 40 },
      { name: "Upright Row", sets: "3×12", difficulty: "Intermediate", tip: "Wide grip, pull to chin", calories: 50 },
      { name: "Plate Front Raise", sets: "3×12", difficulty: "Intermediate", tip: "Arms nearly parallel to floor", calories: 38 },
    ],
    Advanced: [
      { name: "Heavy OHP", sets: "5×5", difficulty: "Advanced", tip: "85% 1RM, bar path over mid-foot", calories: 90 },
      { name: "Push Press", sets: "4×6", difficulty: "Advanced", tip: "Leg drive to initiate, full lockout", calories: 85 },
      { name: "Behind Neck Press", sets: "3×8", difficulty: "Advanced", tip: "Warm up thoroughly, careful with neck", calories: 72 },
      { name: "1-Arm DB Press", sets: "3×8 each", difficulty: "Advanced", tip: "Anti-rotation core challenge", calories: 60 },
      { name: "Handstand Push-Ups", sets: "3×6", difficulty: "Advanced", tip: "Wall supported, full ROM", calories: 75 },
    ],
  },
  Biceps: {
    Beginner: [
      { name: "Dumbbell Curl", sets: "3×15", difficulty: "Beginner", tip: "Supinate at top, full extension", calories: 35 },
      { name: "Hammer Curl", sets: "3×12", difficulty: "Beginner", tip: "Neutral grip, brachialis focus", calories: 33 },
      { name: "Resistance Band Curl", sets: "3×15", difficulty: "Beginner", tip: "Slow negative, 3 seconds down", calories: 28 },
      { name: "Concentration Curl", sets: "3×12 each", difficulty: "Beginner", tip: "Elbow on inner thigh, peak squeeze", calories: 30 },
      { name: "Cable Curl", sets: "3×15", difficulty: "Beginner", tip: "Constant tension, don't swing", calories: 36 },
    ],
    Intermediate: [
      { name: "Barbell Curl", sets: "4×10", difficulty: "Intermediate", tip: "EZ-bar or straight, no body swing", calories: 52 },
      { name: "Incline DB Curl", sets: "4×10", difficulty: "Intermediate", tip: "Full stretch at bottom on incline", calories: 48 },
      { name: "21s", sets: "3×21", difficulty: "Intermediate", tip: "7 low, 7 high, 7 full reps", calories: 58 },
      { name: "Preacher Curl", sets: "3×10", difficulty: "Intermediate", tip: "Pad supports upper arm fully", calories: 45 },
      { name: "Cross Body Hammer", sets: "3×12 each", difficulty: "Intermediate", tip: "Curl across body to opposite shoulder", calories: 40 },
    ],
    Advanced: [
      { name: "Drag Curl", sets: "4×8", difficulty: "Advanced", tip: "Bar drags up torso, elbows back", calories: 60 },
      { name: "Spider Curl", sets: "4×10", difficulty: "Advanced", tip: "Chest on incline bench, arms hang free", calories: 55 },
      { name: "Cheat Curl Heavy", sets: "3×6", difficulty: "Advanced", tip: "Slight body momentum, slow negative", calories: 70 },
      { name: "Cable Concentration", sets: "3×12", difficulty: "Advanced", tip: "Single cable, elbow braced on knee", calories: 48 },
      { name: "Zottman Curl", sets: "3×10", difficulty: "Advanced", tip: "Supinate up, pronate down", calories: 52 },
    ],
  },
  Triceps: {
    Beginner: [
      { name: "Tricep Pushdown", sets: "3×15", difficulty: "Beginner", tip: "Lock elbows to sides, squeeze at bottom", calories: 38 },
      { name: "Overhead DB Extension", sets: "3×12", difficulty: "Beginner", tip: "Keep elbows close to head", calories: 40 },
      { name: "Diamond Push-Ups", sets: "3×12", difficulty: "Beginner", tip: "Hands form diamond shape", calories: 42 },
      { name: "Bench Dips", sets: "3×15", difficulty: "Beginner", tip: "Feet flat, elbows stay behind you", calories: 38 },
      { name: "Kickback", sets: "3×15 each", difficulty: "Beginner", tip: "Hinge 45°, full extension at top", calories: 30 },
    ],
    Intermediate: [
      { name: "Close-Grip Bench", sets: "4×10", difficulty: "Intermediate", tip: "Hands shoulder-width, elbows tucked", calories: 65 },
      { name: "Skull Crushers", sets: "4×10", difficulty: "Intermediate", tip: "EZ-bar, lower to forehead, elbow stable", calories: 60 },
      { name: "Rope Pushdown", sets: "3×12", difficulty: "Intermediate", tip: "Split rope at bottom, twist outward", calories: 42 },
      { name: "Dips (Tricep Upright)", sets: "3×10", difficulty: "Intermediate", tip: "Upright torso, elbows back", calories: 55 },
      { name: "Single Arm Pushdown", sets: "3×12 each", difficulty: "Intermediate", tip: "Isolate each arm fully", calories: 38 },
    ],
    Advanced: [
      { name: "Weighted Dips", sets: "4×8", difficulty: "Advanced", tip: "Upright body, 20kg+ added", calories: 80 },
      { name: "JM Press", sets: "4×8", difficulty: "Advanced", tip: "Hybrid of press and skull crusher", calories: 72 },
      { name: "Board Press", sets: "3×6", difficulty: "Advanced", tip: "2-board lockout focus for triceps", calories: 85 },
      { name: "Tate Press", sets: "3×10", difficulty: "Advanced", tip: "DBs to chest, elbows flare out", calories: 65 },
      { name: "Overhead Cable Extension", sets: "3×12", difficulty: "Advanced", tip: "Full stretch overhead, squeeze at top", calories: 55 },
    ],
  },
  Legs: {
    Beginner: [
      { name: "Goblet Squat", sets: "3×15", difficulty: "Beginner", tip: "Chest up, knees out, deep squat", calories: 52 },
      { name: "Leg Press", sets: "3×15", difficulty: "Beginner", tip: "Feet hip-width, full ROM", calories: 58 },
      { name: "Romanian Deadlift", sets: "3×12", difficulty: "Beginner", tip: "Hinge at hips, feel hamstring stretch", calories: 55 },
      { name: "Walking Lunges", sets: "3×10 each", difficulty: "Beginner", tip: "Step forward, knee at 90°", calories: 48 },
      { name: "Calf Raise", sets: "3×20", difficulty: "Beginner", tip: "Full stretch at bottom, squeeze at top", calories: 28 },
    ],
    Intermediate: [
      { name: "Barbell Squat", sets: "4×8", difficulty: "Intermediate", tip: "Break parallel, bar over mid-foot", calories: 82 },
      { name: "Leg Curl", sets: "4×12", difficulty: "Intermediate", tip: "Pause at top, slow negative", calories: 45 },
      { name: "Leg Extension", sets: "3×15", difficulty: "Intermediate", tip: "Don't lock out, squeeze at top", calories: 42 },
      { name: "Bulgarian Split Squat", sets: "3×10 each", difficulty: "Intermediate", tip: "Rear foot elevated, torso upright", calories: 68 },
      { name: "Standing Calf Raise", sets: "4×15", difficulty: "Intermediate", tip: "Full ROM, pause at stretch", calories: 35 },
    ],
    Advanced: [
      { name: "Heavy Squat", sets: "5×5", difficulty: "Advanced", tip: "90%+ 1RM, belt and wraps recommended", calories: 110 },
      { name: "Hack Squat", sets: "4×8", difficulty: "Advanced", tip: "Deep ROM, don't lock out", calories: 90 },
      { name: "Nordic Hamstring Curl", sets: "3×6", difficulty: "Advanced", tip: "Eccentric focus, very difficult", calories: 65 },
      { name: "Front Squat", sets: "4×6", difficulty: "Advanced", tip: "Clean grip, elbows high, upright torso", calories: 95 },
      { name: "Leg Press Drop Set", sets: "3 drops×15", difficulty: "Advanced", tip: "Drop 20% each time, no rest", calories: 88 },
    ],
  },
  Core: {
    Beginner: [
      { name: "Plank Hold", sets: "3×45s", difficulty: "Beginner", tip: "Straight body line, squeeze glutes", calories: 20 },
      { name: "Dead Bug", sets: "3×10 each", difficulty: "Beginner", tip: "Lower back flat, controlled movement", calories: 22 },
      { name: "Crunch", sets: "3×20", difficulty: "Beginner", tip: "Exhale at top, don't pull neck", calories: 25 },
      { name: "Leg Raise", sets: "3×15", difficulty: "Beginner", tip: "Straight legs, lower slowly", calories: 30 },
      { name: "Bird Dog", sets: "3×10 each", difficulty: "Beginner", tip: "Extend opposite arm and leg", calories: 18 },
    ],
    Intermediate: [
      { name: "Ab Wheel Rollout", sets: "3×10", difficulty: "Intermediate", tip: "Keep hips low, engage lats", calories: 45 },
      { name: "Hanging Knee Raise", sets: "3×15", difficulty: "Intermediate", tip: "No momentum, pause at top", calories: 42 },
      { name: "Cable Crunch", sets: "4×15", difficulty: "Intermediate", tip: "Round spine, pull with abs not arms", calories: 40 },
      { name: "Russian Twist", sets: "3×20", difficulty: "Intermediate", tip: "Feet off ground, touch each side", calories: 38 },
      { name: "Pallof Press", sets: "3×12 each", difficulty: "Intermediate", tip: "Anti-rotation, engage entire core", calories: 35 },
    ],
    Advanced: [
      { name: "Dragon Flag", sets: "3×6", difficulty: "Advanced", tip: "Full body lever, extremely difficult", calories: 65 },
      { name: "Hanging Leg Raise", sets: "4×12", difficulty: "Advanced", tip: "Legs straight to horizontal or above", calories: 58 },
      { name: "L-Sit Hold", sets: "3×20s", difficulty: "Advanced", tip: "Legs parallel to floor, push down", calories: 50 },
      { name: "Weighted Plank", sets: "3×45s", difficulty: "Advanced", tip: "Plate on back, full tension", calories: 42 },
      { name: "Ab Wheel Standing", sets: "3×8", difficulty: "Advanced", tip: "Full extension from standing", calories: 70 },
    ],
  },
  "Full Body": {
    Beginner: [
      { name: "Squat to Press", sets: "3×12", difficulty: "Beginner", tip: "Squat deep, press at top of rise", calories: 58 },
      { name: "Dumbbell Deadlift", sets: "3×12", difficulty: "Beginner", tip: "Hip hinge, keep DBs close to legs", calories: 55 },
      { name: "Push-Up to Row", sets: "3×10", difficulty: "Beginner", tip: "On DBs, push up then alternate row", calories: 52 },
      { name: "Step-Up with Curl", sets: "3×10 each", difficulty: "Beginner", tip: "Step up, curl at top", calories: 48 },
      { name: "Mountain Climbers", sets: "3×30s", difficulty: "Beginner", tip: "Hips level, fast knees to chest", calories: 45 },
    ],
    Intermediate: [
      { name: "Barbell Complex", sets: "5×6 each", difficulty: "Intermediate", tip: "Row, clean, press, squat — no rest", calories: 90 },
      { name: "Kettlebell Swing", sets: "4×15", difficulty: "Intermediate", tip: "Hip hinge power, not arm lift", calories: 75 },
      { name: "Man Maker", sets: "3×8", difficulty: "Intermediate", tip: "Push-up, row L, row R, clean, press", calories: 85 },
      { name: "Thrusters", sets: "4×10", difficulty: "Intermediate", tip: "Squat to full press, explosive", calories: 80 },
      { name: "Burpee Pull-Up", sets: "3×8", difficulty: "Intermediate", tip: "Jump to bar, pull up at top", calories: 88 },
    ],
    Advanced: [
      { name: "Snatch", sets: "5×3", difficulty: "Advanced", tip: "Olympic lift — requires coaching first", calories: 100 },
      { name: "Clean & Press", sets: "5×5", difficulty: "Advanced", tip: "Power clean into push press", calories: 98 },
      { name: "Turkish Get-Up", sets: "3×5 each", difficulty: "Advanced", tip: "Slow and deliberate, heavy KB", calories: 88 },
      { name: "Barbell Complex Heavy", sets: "4×5 each", difficulty: "Advanced", tip: "75%+ 1RM, minimal rest", calories: 110 },
      { name: "Ring Muscle-Up", sets: "3×5", difficulty: "Advanced", tip: "Explosive transition, lock out fully", calories: 85 },
    ],
  },
};

const levelColors: Record<Level, string> = { Beginner: "#00E87A", Intermediate: "#00C2FF", Advanced: "#FF4757" };

export function MuscleTrainer() {
  const { user } = useAuth();
  const [selectedMuscle, setSelectedMuscle] = useState<Muscle>("Chest");
  const [selectedLevel, setSelectedLevel] = useState<Level>("Intermediate");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const exercises = exerciseDB[selectedMuscle][selectedLevel];
  const color = muscleColors[selectedMuscle];
  const totalSets = exercises.reduce((acc, ex) => {
    const match = ex.sets.match(/(\d+)×/);
    return acc + (match ? parseInt(match[1]) : 3);
  }, 0);
  const totalCalories = exercises.reduce((acc, ex) => acc + ex.calories, 0);
  const estTime = exercises.length * 8;

  const handleSaveWorkout = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      // Save each exercise as individual workout entries
      for (const ex of exercises) {
        await addWorkout({
          userId: user.uid,
          exercise: ex.name,
          sets: ex.sets,
          muscleGroup: selectedMuscle,
          level: selectedLevel,
          calories: ex.calories,
          completed: false,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save workout:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h2 style={{ color: "#F0F4FF", fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 6 }}>Muscle Trainer</h2>
        <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Select a muscle group and difficulty to get your exercise plan</p>
      </div>

      {/* Muscle Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {muscles.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMuscle(m)}
            style={{
              padding: "14px 8px",
              borderRadius: 14,
              border: selectedMuscle === m ? `2px solid ${muscleColors[m]}` : "2px solid rgba(255,255,255,0.07)",
              background: selectedMuscle === m ? `${muscleColors[m]}14` : "linear-gradient(160deg, #0E1117, #080B12)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s",
              boxShadow: selectedMuscle === m ? `0 0 20px ${muscleColors[m]}28` : "none",
              transform: selectedMuscle === m ? "translateY(-2px)" : "none",
            }}
          >
            <span style={{ fontSize: 20 }}>{muscleEmoji[m]}</span>
            <span style={{ color: selectedMuscle === m ? muscleColors[m] : "#64748B", fontSize: 11, fontWeight: 700 }}>{m}</span>
          </button>
        ))}
      </div>

      {/* Level Toggle */}
      <div
        style={{
          background: "#0E1117",
          borderRadius: 14,
          padding: 5,
          display: "flex",
          gap: 4,
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {(["Beginner", "Intermediate", "Advanced"] as Level[]).map(l => (
          <button
            key={l}
            onClick={() => setSelectedLevel(l)}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "none",
              background: selectedLevel === l ? levelColors[l] : "transparent",
              color: selectedLevel === l ? (l === "Advanced" ? "#fff" : "#020912") : "#64748B",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: selectedLevel === l ? `0 0 16px ${levelColors[l]}44` : "none",
              letterSpacing: 0.3,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Exercise Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {exercises.map((ex, i) => (
          <div
            key={`${selectedMuscle}-${selectedLevel}-${i}`}
            style={{
              background: "linear-gradient(160deg, #0E1117, #080B12)",
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.07)",
              transition: "all 0.25s",
              animation: "slideUp 0.3s ease forwards",
              animationDelay: `${i * 0.07}s`,
              opacity: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = color + "44";
              e.currentTarget.style.boxShadow = `0 10px 32px ${color}18`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Color accent bar */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />

            <div style={{ padding: "14px 16px" }}>
              {/* Visual media guide */}
              <ExerciseMediaCard name={ex.name} color={color} />

              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 800 }}>{ex.name}</div>
                  <div style={{ color: "#FF6B35", fontSize: 13, fontWeight: 800, marginTop: 2 }}>{ex.sets}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span
                    style={{
                      background: `${levelColors[ex.difficulty]}18`,
                      color: levelColors[ex.difficulty],
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 20,
                      border: `1px solid ${levelColors[ex.difficulty]}44`,
                    }}
                  >
                    {ex.difficulty}
                  </span>
                  {/* YouTube tutorial search link */}
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " exercise tutorial form")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Find tutorial on YouTube"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(255,71,87,0.12)",
                      border: "1px solid rgba(255,71,87,0.25)",
                      color: "#FF4757",
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,71,87,0.25)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,71,87,0.12)"; }}
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Tip */}
              <div
                style={{
                  background: "#080B12",
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginBottom: 10,
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span style={{ color: "#64748B", fontSize: 12 }}>💡 {ex.tip}</span>
              </div>

              {/* Bottom badges */}
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ background: "rgba(255,107,53,0.1)", borderRadius: 8, padding: "3px 10px", color: "#FF6B35", fontSize: 10, fontWeight: 700 }}>🔥 ~{ex.calories} kcal</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Stats Bar */}
      <div
        style={{
          background: "linear-gradient(135deg, #0E1117, #080B12)",
          borderRadius: 16,
          padding: "18px 24px",
          border: `1px solid ${color}33`,
          boxShadow: `0 0 30px ${color}0a`,
          display: "flex",
          justifyContent: "space-around",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {[
          { label: "Total Sets", value: totalSets.toString(), suffix: "sets", color: color },
          { label: "Est. Duration", value: estTime.toString(), suffix: "mins", color: "#00C2FF" },
          { label: "Calories Burned", value: `~${totalCalories}`, suffix: "kcal", color: "#FF6B35" },
          { label: "Exercises", value: exercises.length.toString(), suffix: "movements", color: "#A78BFA" },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ color: stat.color, fontSize: 22, fontWeight: 900 }}>{stat.value}</div>
            <div style={{ color: "#64748B", fontSize: 11 }}>{stat.label}</div>
            <div style={{ color: "#4B5563", fontSize: 10 }}>{stat.suffix}</div>
          </div>
        ))}

        {/* Save Workout Button */}
        <button
          onClick={handleSaveWorkout}
          disabled={saving}
          style={{
            padding: "10px 20px",
            borderRadius: 12,
            border: saved ? "1px solid #00E87A66" : `1px solid ${color}44`,
            background: saved ? "rgba(0,232,122,0.12)" : `${color}14`,
            color: saved ? "#00E87A" : color,
            fontSize: 13,
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            transition: "all 0.25s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.boxShadow = `0 0 16px ${color}33`; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
        >
          {saved ? <Check size={14} /> : saving ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #3a3f4e", borderTopColor: color, animation: "saveSpin 0.7s linear infinite" }} /> : <Save size={14} />}
          {saved ? "Saved to Library!" : saving ? "Saving..." : "Save Workout"}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes saveSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}