import { useState } from "react";
import { Play, Clock, Target, Flame, ChevronDown, ChevronUp, Star, Filter } from "lucide-react";

const BENCH = "https://images.unsplash.com/photo-1651346847980-ab1c883e8cc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjB3b3Jrb3V0JTIwYmVuY2glMjBwcmVzcyUyMGV4ZXJjaXNlfGVufDF8fHx8MTc3Mjc3NjEwMnww&ixlib=rb-4.1.0&q=80&w=1080";
const SQUAT = "https://images.unsplash.com/photo-1734668487493-e33c2f561f13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJiZWxsJTIwc3F1YXQlMjBsZWdzJTIwdHJhaW5pbmclMjBneW18ZW58MXx8fHwxNzcyNzc2MTAyfDA&ixlib=rb-4.1.0&q=80&w=1080";
const PULLUP = "https://images.unsplash.com/photo-1519859660545-3dea8ddf683c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdWxsJTIwdXAlMjBjaGluJTIwdXAlMjBiYWNrJTIwZXhlcmNpc2UlMjBneW18ZW58MXx8fHwxNzcyNzc2MTA0fDA&ixlib=rb-4.1.0&q=80&w=1080";
const SHOULDER = "https://images.unsplash.com/photo-1597452329152-52f9eee96576?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdW1iYmVsbCUyMHNob3VsZGVyJTIwcHJlc3MlMjBvdmVyaGVhZCUyMHdvcmtvdXR8ZW58MXx8fHwxNzcyNzc2MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080";
const DEADLIFT = "https://images.unsplash.com/photo-1545612036-2872840642dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWFkbGlmdCUyMHBvd2VybGlmdGluZyUyMGd5bSUyMHRyYWluaW5nfGVufDF8fHx8MTc3Mjc3NjEwNXww&ixlib=rb-4.1.0&q=80&w=1080";
const PLANK = "https://images.unsplash.com/photo-1669614660460-22e8533a03f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFuayUyMGNvcmUlMjBhYnMlMjB3b3Jrb3V0JTIwZXhlcmNpc2V8ZW58MXx8fHwxNzcyNzc2MTA5fDA&ixlib=rb-4.1.0&q=80&w=1080";

type Category = "All" | "Chest" | "Back" | "Legs" | "Shoulders" | "Core" | "Full Body";
type Level = "All" | "Beginner" | "Intermediate" | "Advanced";

interface Video {
  id: number;
  title: string;
  muscle: string;
  category: Category;
  sets: string;
  reps: string;
  duration: string;
  calories: number;
  level: Exclude<Level, "All">;
  rating: number;
  tip: string;
  img: string;
  accentColor: string;
  steps: string[];
  youtubeUrl: string;
}

const videos: Video[] = [
  {
    id: 1,
    title: "Barbell Bench Press",
    muscle: "Chest · Triceps · Anterior Delt",
    category: "Chest",
    sets: "4 Sets",
    reps: "8–10 Reps",
    duration: "12 min",
    calories: 85,
    level: "Intermediate",
    rating: 4.9,
    accentColor: "#EF4444",
    img: BENCH,
    youtubeUrl: "https://www.youtube.com/watch?v=vcBig73ojpE",
    tip: "Retract shoulder blades before unracking. Bar path slightly diagonal — upper chest at top, lower chest at bottom.",
    steps: ["Set up with shoulder blades pinched and feet flat", "Lower bar to mid-chest with elbows at 45°", "Press explosively, fully lock out", "Control descent — 2s down, 1s pause, push"],
  },
  {
    id: 2,
    title: "Barbell Back Squat",
    muscle: "Quads · Glutes · Hamstrings",
    category: "Legs",
    sets: "5 Sets",
    reps: "5–8 Reps",
    duration: "18 min",
    calories: 120,
    level: "Advanced",
    rating: 5.0,
    accentColor: "#F59E0B",
    img: SQUAT,
    youtubeUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8",
    tip: "Break at hips and knees simultaneously. Chest up, knees track over toes. Drive through heels on ascent.",
    steps: ["Bar on upper traps, brace core and take breath", "Hinge hips back, bend knees to parallel or below", "Keep torso upright, knees out", "Drive through heels, squeeze glutes at top"],
  },
  {
    id: 3,
    title: "Weighted Pull-Ups",
    muscle: "Latissimus Dorsi · Biceps · Rear Delt",
    category: "Back",
    sets: "4 Sets",
    reps: "6–8 Reps",
    duration: "10 min",
    calories: 75,
    level: "Advanced",
    rating: 4.8,
    accentColor: "#00C2FF",
    img: PULLUP,
    youtubeUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    tip: "Start from a full dead hang. Drive elbows to hips — think 'elbows to back pockets'. Chin clears bar every rep.",
    steps: ["Hang with pronated grip, slightly wider than shoulder", "Retract scapula before initiating pull", "Drive elbows down and back until chin clears bar", "Lower with control — 3 second negative"],
  },
  {
    id: 4,
    title: "Overhead Shoulder Press",
    muscle: "Deltoids · Triceps · Upper Traps",
    category: "Shoulders",
    sets: "4 Sets",
    reps: "8–12 Reps",
    duration: "14 min",
    calories: 70,
    level: "Intermediate",
    rating: 4.7,
    accentColor: "#8B5CF6",
    img: SHOULDER,
    youtubeUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
    tip: "Keep core braced throughout. Don't arch lower back. Press straight up — bar travels slightly back to clear face.",
    steps: ["Grip just outside shoulder width, elbows forward", "Brace core, glutes tight — no lower back arch", "Press to full lockout overhead", "Lower controlled to front-rack position"],
  },
  {
    id: 5,
    title: "Conventional Deadlift",
    muscle: "Hamstrings · Glutes · Lower Back · Traps",
    category: "Full Body",
    sets: "4 Sets",
    reps: "3–5 Reps",
    duration: "20 min",
    calories: 140,
    level: "Advanced",
    rating: 5.0,
    accentColor: "#00E87A",
    img: DEADLIFT,
    youtubeUrl: "https://www.youtube.com/watch?v=op9kVnSso6Q",
    tip: "Bar over mid-foot, shoulder blades over bar. Think 'leg press the floor away' not 'pull the bar up'.",
    steps: ["Stance hip-width, grip just outside legs", "Hinge to bar, chest up, back flat, lats engaged", "Push floor away — hips and shoulders rise together", "Lock out hips at top, lower with control"],
  },
  {
    id: 6,
    title: "Plank Hold + Variations",
    muscle: "Core · Glutes · Shoulders",
    category: "Core",
    sets: "3 Sets",
    reps: "45–60 sec",
    duration: "8 min",
    calories: 35,
    level: "Beginner",
    rating: 4.6,
    accentColor: "#10B981",
    img: PLANK,
    youtubeUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
    tip: "Squeeze every muscle. Body is a rigid board from heels to head. No hips sagging or piking up.",
    steps: ["Forearms on ground, elbows under shoulders", "Squeeze abs, glutes, quads simultaneously", "Breathe steadily — don't hold breath", "Progress to RKC plank or plank with shoulder taps"],
  },
];

const categories: Category[] = ["All", "Chest", "Back", "Legs", "Shoulders", "Core", "Full Body"];
const levels: Level[] = ["All", "Beginner", "Intermediate", "Advanced"];

const levelColor: Record<string, string> = {
  Beginner: "#00E87A",
  Intermediate: "#00C2FF",
  Advanced: "#FF4757",
};

function StepsBadge({ steps, accentColor }: { steps: string[]; accentColor: string }) {
  return (
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: `${accentColor}22`,
              border: `1px solid ${accentColor}66`,
              color: accentColor,
              fontSize: 10,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            {i + 1}
          </div>
          <span style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.5 }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function VideoCard({ v }: { v: Video }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handlePlay = () => {
    window.open(v.youtubeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #0E1117 0%, #080B12 100%)",
        borderRadius: 20,
        overflow: "hidden",
        border: `1px solid ${hovered ? v.accentColor + "55" : "rgba(255,255,255,0.07)"}`,
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? `0 16px 40px ${v.accentColor}22` : "0 4px 20px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
        <img
          src={v.img}
          alt={v.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            filter: playing ? "brightness(0.4)" : "brightness(0.65)",
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to top, #080B12 0%, transparent 60%)`,
          }}
        />
        {/* Accent top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${v.accentColor}, transparent)`,
          }}
        />
        {/* Level badge */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: `${levelColor[v.level]}22`,
            border: `1px solid ${levelColor[v.level]}66`,
            borderRadius: 20,
            padding: "4px 10px",
            color: levelColor[v.level],
            fontSize: 11,
            fontWeight: 700,
            backdropFilter: "blur(6px)",
          }}
        >
          {v.level}
        </div>
        {/* Rating */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "rgba(0,0,0,0.6)",
            borderRadius: 20,
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            backdropFilter: "blur(6px)",
          }}
        >
          <Star size={11} color="#F59E0B" fill="#F59E0B" />
          <span style={{ color: "#F1F5F9", fontSize: 11, fontWeight: 700 }}>{v.rating}</span>
        </div>
        {/* Play button — opens YouTube in new tab */}
        <button
          onClick={handlePlay}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${v.accentColor}, ${v.accentColor}cc)`,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 24px ${v.accentColor}88`,
            transition: "all 0.2s",
            backdropFilter: "blur(4px)",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)"; }}
        >
          <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
        </button>
        {/* YouTube badge */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            background: "rgba(255,0,0,0.85)",
            borderRadius: 6,
            padding: "3px 8px",
            color: "white",
            fontSize: 10,
            fontWeight: 800,
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ▶ YouTube
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 20px 20px" }}>
        <div style={{ marginBottom: 10 }}>
          <h3
            style={{
              color: "#F0F4FF",
              fontSize: 16,
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.3,
              letterSpacing: 0.3,
            }}
          >
            {v.title}
          </h3>
          <div style={{ color: "#64748B", fontSize: 11, marginTop: 3 }}>{v.muscle}</div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          {[
            { icon: <Target size={11} />, label: v.sets, color: v.accentColor },
            { icon: <Flame size={11} />, label: v.reps, color: "#FF6B35" },
            { icon: <Clock size={11} />, label: v.duration, color: "#94A3B8" },
            { icon: <Flame size={11} />, label: `${v.calories} kcal`, color: "#FF4757" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: s.color }}>{s.icon}</span>
              <span style={{ color: "#94A3B8", fontSize: 11, fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div
          style={{
            background: `${v.accentColor}0D`,
            border: `1px solid ${v.accentColor}22`,
            borderRadius: 10,
            padding: "8px 12px",
            marginBottom: 12,
          }}
        >
          <span style={{ color: v.accentColor, fontSize: 11, fontWeight: 700 }}>💡 PRO TIP — </span>
          <span style={{ color: "#94A3B8", fontSize: 11 }}>{v.tip}</span>
        </div>

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "8px 12px",
            color: "#94A3B8",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.color = "#F0F4FF";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.color = "#94A3B8";
          }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Hide Step-by-Step" : "View Step-by-Step Form"}
        </button>

        {expanded && <StepsBadge steps={v.steps} accentColor={v.accentColor} />}
      </div>
    </div>
  );
}

export function WorkoutVideos() {
  const [catFilter, setCatFilter] = useState<Category>("All");
  const [levelFilter, setLevelFilter] = useState<Level>("All");

  const filtered = videos.filter(v => {
    const catOk = catFilter === "All" || v.category === catFilter;
    const lvlOk = levelFilter === "All" || v.level === levelFilter;
    return catOk && lvlOk;
  });

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
            <Play size={18} color="#00E87A" fill="#00E87A" />
          </div>
          <div>
            <h2 style={{ color: "#F0F4FF", fontSize: 24, fontWeight: 800, margin: 0 }}>Workout Library</h2>
            <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>
              {filtered.length} exercises with step-by-step form guides
            </p>
          </div>
        </div>
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
          gap: 14,
        }}
      >
        {/* Category filters */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Filter size={13} color="#64748B" />
            <span style={{ color: "#64748B", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
              Muscle Group
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 20,
                  border: catFilter === c ? "1px solid #00E87A66" : "1px solid rgba(255,255,255,0.08)",
                  background: catFilter === c ? "#00E87A18" : "transparent",
                  color: catFilter === c ? "#00E87A" : "#64748B",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Level filters */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Target size={13} color="#64748B" />
            <span style={{ color: "#64748B", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
              Difficulty
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {levels.map(l => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 20,
                  border:
                    levelFilter === l
                      ? `1px solid ${l === "All" ? "#00C2FF66" : levelColor[l] + "66"}`
                      : "1px solid rgba(255,255,255,0.08)",
                  background:
                    levelFilter === l
                      ? `${l === "All" ? "#00C2FF" : levelColor[l]}18`
                      : "transparent",
                  color:
                    levelFilter === l
                      ? l === "All"
                        ? "#00C2FF"
                        : levelColor[l]
                      : "#64748B",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Video Cards Grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#64748B",
            background: "#0E1117",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
          <div style={{ color: "#F0F4FF", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No exercises found</div>
          <div style={{ fontSize: 13 }}>Try adjusting your filters above</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filtered.map((v, i) => (
            <div
              key={v.id}
              style={{
                animation: "cardSlide 0.4s ease forwards",
                animationDelay: `${i * 0.07}s`,
                opacity: 0,
              }}
            >
              <VideoCard v={v} />
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes cardSlide {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
