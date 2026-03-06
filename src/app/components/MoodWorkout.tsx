import { useState } from "react";
import { Flame, Leaf, Drumstick, Clock } from "lucide-react";

const MEAL1 = "https://images.unsplash.com/photo-1570696516183-6920e22fb86f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwYnJlYWtmYXN0JTIwZWdncyUyMGF2b2NhZG8lMjB0b2FzdCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcyNzc2MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080";
const MEAL2 = "https://images.unsplash.com/photo-1761315600943-d8a5bb0c499f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMHNhbGFkJTIwbHVuY2glMjBmaXRuZXNzJTIwbWVhbHxlbnwxfHx8fDE3NzI3NzYxMDl8MA&ixlib=rb-4.1.0&q=80&w=1080";
const MEAL3 = "https://images.unsplash.com/photo-1652769710760-c7a93ad559c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwc2hha2UlMjBzbW9vdGhpZSUyMGJvd2wlMjBmaXRuZXNzJTIwc25hY2t8ZW58MXx8fHwxNzcyNzc2MTA5fDA&ixlib=rb-4.1.0&q=80&w=1080";
const MEAL4 = "https://images.unsplash.com/photo-1588551650401-234f93734337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMHByZXAlMjBudXRyaXRpb24lMjBmb29kJTIwYm93bHxlbnwxfHx8fDE3NzI3NzYxMDV8MA&ixlib=rb-4.1.0&q=80&w=1080";

type Mood = "exhausted" | "stressed" | "neutral" | "good" | "energized";

const moods: { id: Mood; emoji: string; label: string; color: string }[] = [
  { id: "exhausted", emoji: "😴", label: "Exhausted", color: "#64748B" },
  { id: "stressed", emoji: "😟", label: "Stressed", color: "#FF6B35" },
  { id: "neutral", emoji: "😐", label: "Neutral", color: "#00C2FF" },
  { id: "good", emoji: "😊", label: "Good", color: "#00E87A" },
  { id: "energized", emoji: "🔥", label: "Energized", color: "#F59E0B" },
];

type Difficulty = "Easy" | "Medium" | "Hard" | "Beast";
interface Exercise { name: string; sets: string; difficulty: Difficulty; tip: string }
interface MealSuggestion {
  name: string;
  desc: string;
  calories: number;
  protein: number;
  type: "Veg" | "Non-Veg";
  img: string;
  color: string;
  timing: string;
}

const difficultyColor: Record<Difficulty, string> = {
  Easy: "#00E87A",
  Medium: "#00C2FF",
  Hard: "#FF6B35",
  Beast: "#FF4757",
};

const workouts: Record<Mood, { title: string; subtitle: string; exercises: Exercise[] }> = {
  exhausted: {
    title: "Recovery & Stretch",
    subtitle: "Listen to your body — gentle movement only",
    exercises: [
      { name: "Child's Pose", sets: "3×60s hold", difficulty: "Easy", tip: "Breathe deeply, hold for full duration" },
      { name: "Cat-Cow Stretch", sets: "3×15 reps", difficulty: "Easy", tip: "Move with your breath, no rushing" },
      { name: "Lying Hip Flexor", sets: "2×45s each", difficulty: "Easy", tip: "Keep spine neutral throughout" },
    ],
  },
  stressed: {
    title: "Stress Relief Flow",
    subtitle: "Release tension through mindful movement",
    exercises: [
      { name: "Box Breathing Walk", sets: "10 min", difficulty: "Easy", tip: "4s in, 4s hold, 4s out, 4s hold" },
      { name: "Neck & Shoulder Rolls", sets: "3×20 reps", difficulty: "Easy", tip: "Slow and controlled, feel the release" },
      { name: "Standing Forward Fold", sets: "3×45s hold", difficulty: "Easy", tip: "Let gravity do the work" },
      { name: "Light Dumbbell Rows", sets: "3×12 reps", difficulty: "Medium", tip: "Use 50% of normal weight" },
    ],
  },
  neutral: {
    title: "Standard Training",
    subtitle: "Solid session at normal intensity",
    exercises: [
      { name: "Barbell Squat", sets: "4×8 reps", difficulty: "Medium", tip: "Keep chest up, knees tracking toes" },
      { name: "Romanian Deadlift", sets: "3×10 reps", difficulty: "Medium", tip: "Hinge at hips, feel the hamstring stretch" },
      { name: "Dumbbell Press", sets: "3×12 reps", difficulty: "Medium", tip: "Full range of motion on every rep" },
      { name: "Cable Rows", sets: "3×12 reps", difficulty: "Medium", tip: "Squeeze shoulder blades at peak" },
    ],
  },
  good: {
    title: "Full Power Workout",
    subtitle: "You're in the zone — maximize today",
    exercises: [
      { name: "Heavy Bench Press", sets: "5×5 reps", difficulty: "Hard", tip: "Aim for 85–90% of 1RM, spotter up" },
      { name: "Weighted Pull-Ups", sets: "4×6 reps", difficulty: "Hard", tip: "Full dead hang, chin over bar" },
      { name: "Barbell Squat", sets: "4×8 reps", difficulty: "Hard", tip: "Go below parallel, controlled descent" },
      { name: "Overhead Press", sets: "4×8 reps", difficulty: "Hard", tip: "Core tight, no lower-back arch" },
      { name: "HIIT Finisher", sets: "4×30s", difficulty: "Hard", tip: "Max effort burpees or sprint intervals" },
    ],
  },
  energized: {
    title: "BEAST MODE 🔥",
    subtitle: "Unleash everything — this is your day",
    exercises: [
      { name: "Power Clean", sets: "5×3 reps", difficulty: "Beast", tip: "Explosive pull, fast elbows — elite form only" },
      { name: "Squat to Box Jump", sets: "5×5 reps", difficulty: "Beast", tip: "Full squat depth, max height jump" },
      { name: "Weighted Dips", sets: "4×8 reps", difficulty: "Beast", tip: "Add 25kg+ belt weight, go deep" },
      { name: "Heavy Deadlift", sets: "3×3 reps", difficulty: "Beast", tip: "Heavy triple — 90–95% 1RM, brace hard" },
      { name: "Muscle-Up", sets: "3×5 reps", difficulty: "Beast", tip: "False grip, explosive pull, lock out fully" },
      { name: "Battle Ropes Tabata", sets: "8×20s", difficulty: "Beast", tip: "No breaks, 10s rest — give everything" },
    ],
  },
};

const mealSuggestions: Record<Mood, { title: string; subtitle: string; meals: MealSuggestion[] }> = {
  exhausted: {
    title: "Restore & Repair",
    subtitle: "Anti-inflammatory, easy-to-digest foods for deep recovery",
    meals: [
      { name: "Warm Bone Broth Soup", desc: "Collagen-rich, anti-inflammatory. Gut healing + joint recovery.", calories: 180, protein: 12, type: "Non-Veg", img: MEAL4, color: "#FF6B35", timing: "Any time" },
      { name: "Banana & Almond Butter", desc: "Magnesium + potassium combo fights muscle fatigue instantly.", calories: 280, protein: 8, type: "Veg", img: MEAL3, color: "#00E87A", timing: "Snack" },
      { name: "Turmeric Lentil Dal", desc: "Anti-inflammatory turmeric + protein-packed lentils for sleep.", calories: 420, protein: 22, type: "Veg", img: MEAL4, color: "#00C2FF", timing: "Dinner" },
    ],
  },
  stressed: {
    title: "Calm & Center",
    subtitle: "Adaptogen-rich foods that lower cortisol and calm the nervous system",
    meals: [
      { name: "Ashwagandha Oat Bowl", desc: "Ashwagandha adaptogen + oats lower cortisol in 30 minutes.", calories: 380, protein: 18, type: "Veg", img: MEAL1, color: "#A78BFA", timing: "Breakfast" },
      { name: "Dark Chocolate & Berries", desc: "Magnesium in dark chocolate reduces anxiety and muscle tension.", calories: 220, protein: 4, type: "Veg", img: MEAL3, color: "#FF6B35", timing: "Snack" },
      { name: "Salmon with Asparagus", desc: "Omega-3 DHA directly reduces cortisol and improves mood.", calories: 520, protein: 44, type: "Non-Veg", img: MEAL2, color: "#00E87A", timing: "Dinner" },
    ],
  },
  neutral: {
    title: "Balanced Performance",
    subtitle: "Steady energy, balanced macros for consistent output",
    meals: [
      { name: "Protein Egg Breakfast", desc: "4 eggs, avocado toast, cherry tomatoes. Complete morning fuel.", calories: 520, protein: 42, type: "Non-Veg", img: MEAL1, color: "#FF6B35", timing: "Breakfast" },
      { name: "Chicken & Brown Rice", desc: "Classic muscle-building combo with complete amino acid profile.", calories: 580, protein: 50, type: "Non-Veg", img: MEAL2, color: "#00E87A", timing: "Lunch" },
      { name: "Greek Yogurt Parfait", desc: "Casein protein + probiotics. Pre or post-workout snack.", calories: 290, protein: 24, type: "Veg", img: MEAL3, color: "#00C2FF", timing: "Snack" },
    ],
  },
  good: {
    title: "Fuel the Machine",
    subtitle: "High protein, high energy meals for intense training days",
    meals: [
      { name: "Power Protein Bowl", desc: "Grilled chicken, quinoa, roasted veggies. Pre-workout king.", calories: 680, protein: 56, type: "Non-Veg", img: MEAL2, color: "#00E87A", timing: "Pre-Workout" },
      { name: "Overnight Oats + Whey", desc: "Slow & fast carbs + protein. 90-min pre-session fuel.", calories: 480, protein: 36, type: "Veg", img: MEAL1, color: "#F59E0B", timing: "Breakfast" },
      { name: "Acai Recovery Bowl", desc: "Antioxidant-rich post-workout meal. Reduce inflammation fast.", calories: 380, protein: 18, type: "Veg", img: MEAL3, color: "#A78BFA", timing: "Post-Workout" },
    ],
  },
  energized: {
    title: "BEAST FUEL 🔥",
    subtitle: "Maximum performance nutrition for your hardest sessions",
    meals: [
      { name: "Pre-WO Carb Surge", desc: "Rice + banana + creatine. Load glycogen stores to max.", calories: 550, protein: 18, type: "Veg", img: MEAL4, color: "#F59E0B", timing: "90 min pre-workout" },
      { name: "Elite Protein Stack", desc: "Ground beef, sweet potato, eggs. 60g protein hit post-session.", calories: 720, protein: 62, type: "Non-Veg", img: MEAL2, color: "#FF4757", timing: "Post-Workout" },
      { name: "Mass Gainer Smoothie", desc: "Oats, banana, milk, whey, peanut butter. 800kcal in a glass.", calories: 820, protein: 45, type: "Veg", img: MEAL3, color: "#00E87A", timing: "Pre-Workout" },
    ],
  },
};

export function MoodWorkout() {
  const [selected, setSelected] = useState<Mood>("good");

  const workout = workouts[selected];
  const mealData = mealSuggestions[selected];
  const mood = moods.find(m => m.id === selected)!;
  const moodColor = mood.color;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h2 style={{ color: "#F0F4FF", fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 6 }}>Mood-Based Training</h2>
        <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Your mood shapes your workout AND nutrition. Select how you feel.</p>
      </div>

      {/* Mood Cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {moods.map(m => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            style={{
              flex: "1 1 100px",
              minWidth: 100,
              padding: "18px 12px",
              borderRadius: 18,
              border: selected === m.id ? `2px solid ${m.color}` : "2px solid rgba(255,255,255,0.07)",
              background: selected === m.id ? `${m.color}14` : "linear-gradient(160deg, #0E1117, #080B12)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              transition: "all 0.25s",
              boxShadow: selected === m.id ? `0 0 28px ${m.color}33` : "none",
              transform: selected === m.id ? "translateY(-2px)" : "none",
            }}
          >
            <span style={{ fontSize: 30 }}>{m.emoji}</span>
            <span style={{ color: selected === m.id ? m.color : "#64748B", fontSize: 13, fontWeight: 700 }}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Workout Section */}
      <div
        style={{
          background: `linear-gradient(135deg, ${moodColor}14, transparent)`,
          borderRadius: 16,
          padding: "18px 22px",
          border: `1px solid ${moodColor}33`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
            Workout Plan
          </div>
          <div style={{ color: "#F0F4FF", fontSize: 20, fontWeight: 800 }}>{workout.title}</div>
          <div style={{ color: "#64748B", fontSize: 13, marginTop: 3 }}>{workout.subtitle}</div>
        </div>
        <div
          style={{
            background: `${moodColor}14`,
            border: `1px solid ${moodColor}44`,
            borderRadius: 16,
            padding: "12px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ color: moodColor, fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{workout.exercises.length}</div>
          <div style={{ color: "#64748B", fontSize: 11 }}>Exercises</div>
        </div>
      </div>

      {/* Exercise Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
        {workout.exercises.map((ex, i) => (
          <div
            key={`${selected}-ex-${i}`}
            style={{
              background: "linear-gradient(160deg, #0E1117, #080B12)",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.07)",
              transition: "all 0.25s",
              animation: "fadeIn 0.3s ease forwards",
              animationDelay: `${i * 0.07}s`,
              opacity: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = moodColor + "44";
              e.currentTarget.style.boxShadow = `0 8px 30px ${moodColor}18`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ height: 3, background: `linear-gradient(90deg, ${difficultyColor[ex.difficulty]}, transparent)` }} />
            <div style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 700 }}>{ex.name}</div>
                  <div style={{ color: "#FF6B35", fontSize: 13, fontWeight: 800, marginTop: 3 }}>{ex.sets}</div>
                </div>
                <span
                  style={{
                    background: `${difficultyColor[ex.difficulty]}18`,
                    color: difficultyColor[ex.difficulty],
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 20,
                    border: `1px solid ${difficultyColor[ex.difficulty]}44`,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {ex.difficulty}
                </span>
              </div>
              <div
                style={{
                  background: "#080B12",
                  borderRadius: 8,
                  padding: "8px 12px",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span style={{ color: "#64748B", fontSize: 12 }}>💡 {ex.tip}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "4px 0",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        <span style={{ color: "#64748B", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>🥗 MOOD-BASED NUTRITION</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Meal Suggestions */}
      <div>
        <div
          style={{
            background: `linear-gradient(135deg, rgba(0,232,122,0.1), transparent)`,
            borderRadius: 16,
            padding: "16px 22px",
            border: "1px solid rgba(0,232,122,0.18)",
            marginBottom: 16,
          }}
        >
          <div style={{ color: "#00E87A", fontSize: 13, fontWeight: 700, marginBottom: 3 }}>
            🥗 {mealData.title} — Mood: {mood.label}
          </div>
          <div style={{ color: "#64748B", fontSize: 13 }}>{mealData.subtitle}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {mealData.meals.map((meal, i) => (
            <div
              key={`${selected}-meal-${i}`}
              style={{
                background: "linear-gradient(160deg, #0E1117, #080B12)",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.07)",
                transition: "all 0.25s",
                animation: "fadeIn 0.35s ease forwards",
                animationDelay: `${i * 0.1}s`,
                opacity: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = meal.color + "44";
                e.currentTarget.style.boxShadow = `0 8px 24px ${meal.color}18`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Image */}
              <div style={{ position: "relative", height: 130, overflow: "hidden" }}>
                <img
                  src={meal.img}
                  alt={meal.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65)" }}
                />
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, #0E1117, transparent 50%)` }} />
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: meal.color }} />
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(0,0,0,0.65)",
                    borderRadius: 20,
                    padding: "3px 9px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Flame size={10} color="#FF6B35" />
                  <span style={{ color: "#F0F4FF", fontSize: 10, fontWeight: 700 }}>{meal.calories} kcal</span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: meal.type === "Veg" ? "rgba(0,232,122,0.2)" : "rgba(255,71,87,0.2)",
                    border: `1px solid ${meal.type === "Veg" ? "#00E87A55" : "#FF475755"}`,
                    borderRadius: 20,
                    padding: "3px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    color: meal.type === "Veg" ? "#00E87A" : "#FF4757",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {meal.type === "Veg" ? <Leaf size={9} /> : <Drumstick size={9} />}
                  {meal.type}
                </div>
              </div>

              <div style={{ padding: "12px 16px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ color: "#F0F4FF", fontSize: 13, fontWeight: 700, flex: 1 }}>{meal.name}</div>
                  <span
                    style={{
                      background: `${meal.color}14`,
                      border: `1px solid ${meal.color}33`,
                      borderRadius: 20,
                      padding: "2px 8px",
                      color: meal.color,
                      fontSize: 9,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      marginLeft: 8,
                    }}
                  >
                    {meal.timing}
                  </span>
                </div>
                <p style={{ color: "#64748B", fontSize: 11, lineHeight: 1.5, margin: "0 0 10px 0" }}>{meal.desc}</p>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: "#00E87A" }} />
                    <span style={{ color: "#64748B", fontSize: 11 }}>
                      <span style={{ color: "#00E87A", fontWeight: 700 }}>{meal.protein}g</span> protein
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={10} color="#64748B" />
                    <span style={{ color: "#64748B", fontSize: 11 }}>{meal.timing}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
