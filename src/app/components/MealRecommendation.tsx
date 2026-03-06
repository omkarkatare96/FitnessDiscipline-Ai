import { useState } from "react";
import { Flame, Clock, ChefHat, Leaf, Drumstick, Coffee, Sun, Moon, Apple, Heart, Play, Youtube } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { saveMealRecommendation } from "../../firebase/firestoreService";

const MEAL1 = "https://images.unsplash.com/photo-1570696516183-6920e22fb86f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwYnJlYWtmYXN0JTIwZWdncyUyMGF2b2NhZG8lMjB0b2FzdCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcyNzc2MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080";
const MEAL2 = "https://images.unsplash.com/photo-1761315600943-d8a5bb0c499f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMHNhbGFkJTIwbHVuY2glMjBmaXRuZXNzJTIwbWVhbHxlbnwxfHx8fDE3NzI3NzYxMDl8MA&ixlib=rb-4.1.0&q=80&w=1080";
const MEAL3 = "https://images.unsplash.com/photo-1652769710760-c7a93ad559c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwc2hha2UlMjBzbW9vdGhpZSUyMGJvd2wlMjBmaXRuZXNzJTIwc25hY2t8ZW58MXx8fHwxNzcyNzc2MTA5fDA&ixlib=rb-4.1.0&q=80&w=1080";
const MEAL4 = "https://images.unsplash.com/photo-1588551650401-234f93734337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMHByZXAlMjBudXRyaXRpb24lMjBmb29kJTIwYm93bHxlbnwxfHx8fDE3NzI3NzYxMDV8MA&ixlib=rb-4.1.0&q=80&w=1080";

// ── Nutrition Videos Dataset ─────────────────────────────────────────
interface NutritionVideo {
  id: number;
  title: string;
  description: string;
  muscleGroup: string;
  youtubeUrl: string;
  thumbnail: string;
  accentColor: string;
}

const nutritionVideos: NutritionVideo[] = [
  {
    id: 1,
    title: "How Much Protein Do You Actually Need?",
    description: "Science-backed breakdown of optimal protein intake for muscle building and fat loss.",
    muscleGroup: "Muscle Building",
    youtubeUrl: "https://www.youtube.com/watch?v=4J2SFxazP0I",
    thumbnail: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&q=80",
    accentColor: "#00E87A",
  },
  {
    id: 2,
    title: "Meal Prep for the Week in 1 Hour",
    description: "Step-by-step guide to prepping 5 days of clean, high-protein meals efficiently.",
    muscleGroup: "Meal Prep",
    youtubeUrl: "https://www.youtube.com/watch?v=pP-lN8iX61k",
    thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    accentColor: "#00C2FF",
  },
  {
    id: 3,
    title: "Best Pre-Workout Foods for Performance",
    description: "What to eat 1–2 hours before training to maximise energy, strength, and endurance.",
    muscleGroup: "Performance",
    youtubeUrl: "https://www.youtube.com/watch?v=u1MiJkBQqT0",
    thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
    accentColor: "#FF6B35",
  },
  {
    id: 4,
    title: "Clean Bulking Diet Plan Explained",
    description: "How to eat in a calorie surplus without gaining excess fat. Real food strategies.",
    muscleGroup: "Bulking",
    youtubeUrl: "https://www.youtube.com/watch?v=WY6-fJ-JO_k",
    thumbnail: "https://images.unsplash.com/photo-1547592180-85f173990888?w=600&q=80",
    accentColor: "#A78BFA",
  },
  {
    id: 5,
    title: "Fat Loss Nutrition: Simple Truths",
    description: "Calories, macros, and food quality for sustainable fat loss without crash dieting.",
    muscleGroup: "Fat Loss",
    youtubeUrl: "https://www.youtube.com/watch?v=DjBQLBeFMOk",
    thumbnail: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80",
    accentColor: "#FF4757",
  },
  {
    id: 6,
    title: "Post-Workout Recovery Nutrition",
    description: "The optimal post-workout meal window, protein + carb ratios, and recovery supplements.",
    muscleGroup: "Recovery",
    youtubeUrl: "https://www.youtube.com/watch?v=Xq8KqVrJRTE",
    thumbnail: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80",
    accentColor: "#F59E0B",
  },
];

// ── Nutrition Video Card component ───────────────────────────────────
function NutritionVideoCard({ v }: { v: NutritionVideo }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: "linear-gradient(160deg, #0E1117, #080B12)",
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${hovered ? v.accentColor + "55" : "rgba(255,255,255,0.07)"}`,
        transition: "all 0.3s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? `0 16px 40px ${v.accentColor}22` : "0 4px 20px rgba(0,0,0,0.3)",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => window.open(v.youtubeUrl, "_blank", "noopener,noreferrer")}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
        <img
          src={v.thumbnail}
          alt={v.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            filter: "brightness(0.6)",
          }}
        />
        {/* Gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #080B12, transparent 60%)" }} />
        {/* Accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${v.accentColor}, transparent)` }} />
        {/* Category badge */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          background: `${v.accentColor}22`, border: `1px solid ${v.accentColor}55`,
          borderRadius: 20, padding: "3px 10px",
          color: v.accentColor, fontSize: 10, fontWeight: 700,
          backdropFilter: "blur(6px)",
        }}>
          {v.muscleGroup}
        </div>
        {/* YouTube badge */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(255,0,0,0.85)", borderRadius: 6,
          padding: "3px 8px", color: "#fff", fontSize: 10, fontWeight: 800,
          backdropFilter: "blur(4px)",
        }}>▶ YouTube</div>
        {/* Play button */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: `translate(-50%, -50%) scale(${hovered ? 1.12 : 1})`,
          width: 44, height: 44, borderRadius: "50%",
          background: `linear-gradient(135deg, ${v.accentColor}, ${v.accentColor}aa)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 20px ${v.accentColor}88`,
          transition: "transform 0.2s",
        }}>
          <Play size={17} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ color: "#F0F4FF", fontSize: 13, fontWeight: 800, lineHeight: 1.35, marginBottom: 6 }}>
          {v.title}
        </div>
        <p style={{ color: "#64748B", fontSize: 11, lineHeight: 1.6, margin: 0 }}>
          {v.description}
        </p>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, color: v.accentColor, fontSize: 11, fontWeight: 700 }}>
          <Youtube size={12} />
          Watch on YouTube
        </div>
      </div>
    </div>
  );
}

type DietFilter = "All" | "Veg" | "Non-Veg";
type TimeFilter = "All" | "Breakfast" | "Lunch" | "Dinner" | "Snacks";

interface Meal {
  id: number;
  name: string;
  diet: "Veg" | "Non-Veg";
  time: TimeFilter;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  description: string;
  tags: string[];
  img: string;
  accentColor: string;
  goal: string;
}

const meals: Meal[] = [
  {
    id: 1,
    name: "Power Protein Breakfast",
    diet: "Non-Veg",
    time: "Breakfast",
    calories: 520,
    protein: 42,
    carbs: 38,
    fat: 18,
    prepTime: "15 min",
    description: "4 scrambled eggs, avocado toast on whole grain, cherry tomatoes, black coffee. The ultimate anabolic morning stack.",
    tags: ["High Protein", "Pre-Workout", "Muscle Build"],
    img: MEAL1,
    accentColor: "#FF6B35",
    goal: "Muscle Gain",
  },
  {
    id: 2,
    name: "Grilled Chicken Power Bowl",
    diet: "Non-Veg",
    time: "Lunch",
    calories: 650,
    protein: 55,
    carbs: 52,
    fat: 14,
    prepTime: "25 min",
    description: "200g grilled chicken breast, brown rice, mixed greens, quinoa, olive oil dressing. Maximum gains at midday.",
    tags: ["High Protein", "Post-Workout", "Lean Bulk"],
    img: MEAL2,
    accentColor: "#00E87A",
    goal: "Performance",
  },
  {
    id: 3,
    name: "Acai Recovery Smoothie Bowl",
    diet: "Veg",
    time: "Snacks",
    calories: 380,
    protein: 18,
    carbs: 54,
    fat: 9,
    prepTime: "8 min",
    description: "Acai base, banana, blueberries, granola, hemp seeds, almond butter. Anti-inflammatory recovery fuel.",
    tags: ["Anti-Inflammatory", "Recovery", "Quick Prep"],
    img: MEAL3,
    accentColor: "#8B5CF6",
    goal: "Recovery",
  },
  {
    id: 4,
    name: "Balanced Macro Dinner Plate",
    diet: "Veg",
    time: "Dinner",
    calories: 480,
    protein: 28,
    carbs: 45,
    fat: 16,
    prepTime: "20 min",
    description: "Lentil curry, roasted sweet potato, steamed broccoli, brown rice, turmeric dressing. Perfect evening macros.",
    tags: ["Balanced Macros", "Anti-Inflammatory", "Fat Loss"],
    img: MEAL4,
    accentColor: "#00C2FF",
    goal: "Fat Loss",
  },
  {
    id: 5,
    name: "Pre-Workout Energy Oats",
    diet: "Veg",
    time: "Breakfast",
    calories: 420,
    protein: 22,
    carbs: 68,
    fat: 8,
    prepTime: "5 min",
    description: "Overnight oats with banana, honey, chia seeds, whey protein mixed in. 90-min pre-workout meal.",
    tags: ["Pre-Workout", "High Carb", "Energy"],
    img: MEAL1,
    accentColor: "#F59E0B",
    goal: "Energy",
  },
  {
    id: 6,
    name: "Salmon & Veggie Dinner",
    diet: "Non-Veg",
    time: "Dinner",
    calories: 560,
    protein: 48,
    carbs: 28,
    fat: 28,
    prepTime: "30 min",
    description: "Pan-seared salmon fillet, asparagus, cauliflower rice, lemon butter. Omega-3 rich recovery dinner.",
    tags: ["Omega-3 Rich", "High Protein", "Keto-Friendly"],
    img: MEAL2,
    accentColor: "#FF4757",
    goal: "Recovery",
  },
  {
    id: 7,
    name: "Whey Protein Bar & Fruit",
    diet: "Veg",
    time: "Snacks",
    calories: 280,
    protein: 24,
    carbs: 30,
    fat: 6,
    prepTime: "2 min",
    description: "Chocolate whey protein bar, apple slices, 10 almonds. Fast macro top-up between meals.",
    tags: ["Quick Prep", "On-the-Go", "Muscle Build"],
    img: MEAL3,
    accentColor: "#10B981",
    goal: "Muscle Gain",
  },
  {
    id: 8,
    name: "Turkey & Rice Meal Prep",
    diet: "Non-Veg",
    time: "Lunch",
    calories: 580,
    protein: 50,
    carbs: 58,
    fat: 12,
    prepTime: "35 min",
    description: "Ground turkey, jasmine rice, steamed vegetables, low-sodium soy sauce. Classic bodybuilder staple.",
    tags: ["Meal Prep Friendly", "Lean Protein", "Bulk"],
    img: MEAL4,
    accentColor: "#00E87A",
    goal: "Muscle Gain",
  },
];

const dietIcons: Record<DietFilter, React.ReactNode> = {
  All: <ChefHat size={14} />,
  Veg: <Leaf size={14} />,
  "Non-Veg": <Drumstick size={14} />,
};
const timeIcons: Record<TimeFilter, React.ReactNode> = {
  All: <ChefHat size={14} />,
  Breakfast: <Coffee size={14} />,
  Lunch: <Sun size={14} />,
  Dinner: <Moon size={14} />,
  Snacks: <Apple size={14} />,
};

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ color: "#64748B", fontSize: 11 }}>{label}</span>
        <span style={{ color: color, fontSize: 11, fontWeight: 700 }}>{value}g</span>
      </div>
      <div style={{ background: "#1a1f2e", borderRadius: 4, height: 4 }}>
        <div
          style={{
            background: color,
            borderRadius: 4,
            height: 4,
            width: `${Math.min((value / max) * 100, 100)}%`,
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  const { user } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveMeal = async () => {
    if (!user || saving || saved) return;
    setSaving(true);
    try {
      await saveMealRecommendation({
        userId: user.uid,
        mealId: meal.id,
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        goal: meal.goal,
      });
      setSaved(true);
    } catch (err) {
      console.error("Failed to save meal:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #0E1117 0%, #080B12 100%)",
        borderRadius: 20,
        overflow: "hidden",
        border: `1px solid ${hovered ? meal.accentColor + "55" : "rgba(255,255,255,0.07)"}`,
        transition: "all 0.3s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? `0 16px 40px ${meal.accentColor}1a` : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        <img
          src={meal.img}
          alt={meal.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            filter: "brightness(0.7)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, #080B12, transparent 60%)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: meal.accentColor }} />

        {/* Diet badge */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: meal.diet === "Veg" ? "rgba(0,232,122,0.2)" : "rgba(255,71,87,0.2)",
            border: `1px solid ${meal.diet === "Veg" ? "#00E87A66" : "#FF475766"}`,
            borderRadius: 20,
            padding: "3px 10px",
            color: meal.diet === "Veg" ? "#00E87A" : "#FF4757",
            fontSize: 11,
            fontWeight: 700,
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {meal.diet === "Veg" ? <Leaf size={10} /> : <Drumstick size={10} />}
          {meal.diet}
        </div>

        {/* Calories */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(0,0,0,0.65)",
            borderRadius: 20,
            padding: "3px 10px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            backdropFilter: "blur(6px)",
          }}
        >
          <Flame size={11} color="#FF6B35" />
          <span style={{ color: "#F0F4FF", fontSize: 11, fontWeight: 700 }}>{meal.calories} kcal</span>
        </div>

        {/* Save */}
        <button
          onClick={handleSaveMeal}
          disabled={saving}
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            background: saved ? "rgba(255,71,87,0.3)" : "rgba(0,0,0,0.5)",
            border: `1px solid ${saved ? "#FF475766" : "rgba(255,255,255,0.2)"}`,
            borderRadius: "50%",
            width: 32,
            height: 32,
            cursor: saved || saving ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
            transition: "all 0.2s",
          }}
        >
          <Heart size={13} color={saved ? "#FF4757" : "#fff"} fill={saved ? "#FF4757" : "none"} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 18px 18px" }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h3 style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 800, margin: 0, lineHeight: 1.3 }}>{meal.name}</h3>
            <span
              style={{
                background: `${meal.accentColor}18`,
                border: `1px solid ${meal.accentColor}44`,
                borderRadius: 20,
                padding: "2px 8px",
                color: meal.accentColor,
                fontSize: 10,
                fontWeight: 700,
                whiteSpace: "nowrap",
                marginLeft: 8,
              }}
            >
              {meal.goal}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Clock size={10} color="#64748B" />
            <span style={{ color: "#64748B", fontSize: 11 }}>{meal.prepTime}</span>
          </div>
        </div>

        <p style={{ color: "#64748B", fontSize: 12, lineHeight: 1.6, margin: "0 0 12px 0" }}>{meal.description}</p>

        {/* Macro bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          <MacroBar label="Protein" value={meal.protein} max={60} color="#00E87A" />
          <MacroBar label="Carbs" value={meal.carbs} max={80} color="#00C2FF" />
          <MacroBar label="Fat" value={meal.fat} max={40} color="#FF6B35" />
        </div>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {meal.tags.map((t, i) => (
            <span
              key={i}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "3px 9px",
                color: "#64748B",
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MealRecommendation() {
  const [dietFilter, setDietFilter] = useState<DietFilter>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All");

  const filtered = meals.filter(m => {
    const d = dietFilter === "All" || m.diet === dietFilter;
    const t = timeFilter === "All" || m.time === timeFilter;
    return d && t;
  });

  const totalProtein = filtered.reduce((a, m) => a + m.protein, 0);
  const totalCalories = filtered.reduce((a, m) => a + m.calories, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: "linear-gradient(135deg, #00E87A22, #00C2FF22)",
              border: "1px solid #00E87A44",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChefHat size={18} color="#00E87A" />
          </div>
          <div>
            <h2 style={{ color: "#F0F4FF", fontSize: 24, fontWeight: 800, margin: 0 }}>Nutrition Hub</h2>
            <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>AI-curated meals for your fitness goals</p>
          </div>
        </div>
      </div>

      {/* Daily Summary Strip */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(0,232,122,0.12), rgba(0,194,255,0.12))",
          borderRadius: 16,
          padding: "18px 24px",
          border: "1px solid rgba(0,232,122,0.2)",
          display: "flex",
          gap: 32,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Total Calories", value: `${totalCalories} kcal`, icon: "🔥", color: "#FF6B35" },
          { label: "Total Protein", value: `${totalProtein}g`, icon: "💪", color: "#00E87A" },
          { label: "Meals Shown", value: filtered.length.toString(), icon: "🍽️", color: "#00C2FF" },
          { label: "Daily Goal", value: "2,400 kcal", icon: "🎯", color: "#8B5CF6" },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <span style={{ color: s.color, fontSize: 20, fontWeight: 800 }}>{s.value}</span>
            </div>
            <div style={{ color: "#64748B", fontSize: 11 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#0E1117",
          borderRadius: 16,
          padding: 20,
          border: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Diet filter */}
        <div>
          <span style={{ color: "#64748B", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 10 }}>
            Diet Preference
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {(["All", "Veg", "Non-Veg"] as DietFilter[]).map(d => (
              <button
                key={d}
                onClick={() => setDietFilter(d)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 20,
                  border:
                    dietFilter === d
                      ? d === "Veg"
                        ? "1px solid #00E87A66"
                        : d === "Non-Veg"
                        ? "1px solid #FF475766"
                        : "1px solid #00C2FF66"
                      : "1px solid rgba(255,255,255,0.08)",
                  background:
                    dietFilter === d
                      ? d === "Veg"
                        ? "#00E87A18"
                        : d === "Non-Veg"
                        ? "#FF475718"
                        : "#00C2FF18"
                      : "transparent",
                  color:
                    dietFilter === d
                      ? d === "Veg"
                        ? "#00E87A"
                        : d === "Non-Veg"
                        ? "#FF4757"
                        : "#00C2FF"
                      : "#64748B",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s",
                }}
              >
                {dietIcons[d]} {d}
              </button>
            ))}
          </div>
        </div>

        {/* Time filter */}
        <div>
          <span style={{ color: "#64748B", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 10 }}>
            Meal Time
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(["All", "Breakfast", "Lunch", "Dinner", "Snacks"] as TimeFilter[]).map(t => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 20,
                  border: timeFilter === t ? "1px solid #8B5CF666" : "1px solid rgba(255,255,255,0.08)",
                  background: timeFilter === t ? "#8B5CF618" : "transparent",
                  color: timeFilter === t ? "#A78BFA" : "#64748B",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s",
                }}
              >
                {timeIcons[t]} {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meals Grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#64748B",
            background: "#0E1117",
            borderRadius: 16,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
          <div style={{ color: "#F0F4FF", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No meals match your filters</div>
          <div>Try changing your diet or time preferences</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {filtered.map((meal, i) => (
            <div
              key={meal.id}
              style={{
                animation: "fadeSlide 0.35s ease forwards",
                animationDelay: `${i * 0.07}s`,
                opacity: 0,
              }}
            >
              <MealCard meal={meal} />
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ─── Nutrition Videos Section ─── */}
      <div style={{ paddingTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: "linear-gradient(135deg, #FF475722, #FF6B3522)",
              border: "1px solid #FF475744",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Youtube size={16} color="#FF4757" />
          </div>
          <div>
            <h3 style={{ color: "#F0F4FF", fontSize: 18, fontWeight: 800, margin: 0 }}>Nutrition Videos</h3>
            <p style={{ color: "#64748B", fontSize: 12, margin: 0 }}>Expert-curated guides — click to watch on YouTube</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {nutritionVideos.map((v) => (
            <NutritionVideoCard key={v.id} v={v} />
          ))}
        </div>
      </div>
    </div>
  );
}
