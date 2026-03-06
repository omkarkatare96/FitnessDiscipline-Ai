import { useState, useEffect, useRef } from "react";
import { RefreshCw, Droplets, Dumbbell, Moon, ChevronRight, Trophy, Send, MessageCircle, Bot, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { saveAIChat, getUserAIChats, type AIChatEntry } from "../../firebase/firestoreService";
import { useToast } from "../../context/ToastContext";

// ─── Constants ─────────────────────────────────────────────────────────────────
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;

const MUSCLE_PAIN_KEYWORDS = [
  "pain", "hurt", "sore", "injury", "ache", "strain", "sprain", "tear", "cramp",
  "shoulder", "knee", "back", "elbow", "wrist", "ankle", "hip", "neck",
  "bicep", "tricep", "hamstring", "quad", "calf", "shin", "rotator",
];

function detectsMuscleIssue(msg: string): boolean {
  const lower = msg.toLowerCase();
  return MUSCLE_PAIN_KEYWORDS.some(k => lower.includes(k));
}

const PHYSIOTHERAPIST_SYSTEM_PROMPT = `You are a professional fitness physiotherapist and certified strength & conditioning coach working for FitDiscipline AI.
When a user mentions ANY muscle pain, injury, soreness, or discomfort:
1. Acknowledge the pain empathetically
2. Clearly state which exercises to AVOID immediately
3. Recommend safe alternative exercises that don't aggravate the area
4. Provide specific recovery protocol (ice/heat, rest duration, stretches)
5. Advise when to see a professional if symptoms persist

Otherwise, you are a world-class fitness coach. Respond concisely and with high value.
Always format your response clearly. Keep it under 120 words. Use emojis sparingly.`;

const GENERAL_COACH_PROMPT = `You are a world-class fitness coach and nutrition expert for FitDiscipline AI.
Give concise, high-value advice on training, nutrition, recovery, and mindset.
Keep responses under 80 words. Be direct, motivating, and science-backed.`;

const FALLBACK_RESPONSES: Record<string, string> = {
  pain: "For muscle pain: Rest the area for 24–48 hrs. Apply ice (first 24h) then heat. Avoid heavy loading on the affected muscle. Try light mobility work around the joint. Consult a physio if pain persists beyond 5 days or is sharp/radiating. 🩺",
  general: "Consistency beats perfection every single time. Show up, put in quality reps, fuel well, and sleep 7–9 hours. The results will follow inevitably. 💪",
};

// ─── OpenRouter API Call ────────────────────────────────────────────────────────
async function callOpenRouter(userMessage: string): Promise<string> {
  const isPainQuery = detectsMuscleIssue(userMessage);

  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "your_openrouter_api_key_here") {
    // Graceful fallback — no API key set
    await new Promise(r => setTimeout(r, 700));
    return isPainQuery ? FALLBACK_RESPONSES.pain : FALLBACK_RESPONSES.general;
  }

  const systemPrompt = isPainQuery ? PHYSIOTHERAPIST_SYSTEM_PROMPT : GENERAL_COACH_PROMPT;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://fitdiscipline.app",
      "X-Title": "FitDiscipline AI",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage },
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenRouter error:", err);
    return isPainQuery ? FALLBACK_RESPONSES.pain : FALLBACK_RESPONSES.general;
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content as string)?.trim() || FALLBACK_RESPONSES.general;
}

// ─── Static data ───────────────────────────────────────────────────────────────
const quotes = [
  { text: "Champions are made in the moments when they want to quit but don't. Every rep you complete is a vote for the person you're becoming.", author: "FitDiscipline AI" },
  { text: "Your body can stand almost anything. It's your mind that you have to convince. Train your discipline and the results will follow inevitably.", author: "FitDiscipline AI" },
  { text: "Consistency is the true north of all high performers. Show up when it's hard. The extraordinary life is built one disciplined day at a time.", author: "FitDiscipline AI" },
  { text: "The iron never lies. It reveals exactly who you are and who you're capable of becoming. Every session is a chance to write a better story.", author: "FitDiscipline AI" },
  { text: "Rest is not quitting. Recovery is part of the plan. Your muscles grow in the silence between the storms. Honor the process completely.", author: "FitDiscipline AI" },
];

const notifications = [
  { icon: <Droplets size={18} color="#00C2FF" />, title: "Hydration Alert 💧", description: "You've hit 60% of your daily water goal. Drink 2 more glasses before your workout.", color: "#00C2FF", action: "Log Water", time: "2 mins ago" },
  { icon: <Dumbbell size={18} color="#FF6B35" />, title: "Workout Reminder 🏋️", description: "Push Day is scheduled for today at 6:00 PM. Your readiness score is 78 — perfect for a heavy session.", color: "#FF6B35", action: "Start Now", time: "15 mins ago" },
  { icon: <Moon size={18} color="#A78BFA" />, title: "Sleep Reminder 😴", description: "Based on your patterns, wind down by 10:30 PM tonight to hit your 8-hour sleep goal.", color: "#A78BFA", action: "Set Reminder", time: "1 hr ago" },
];

const milestones = [
  { icon: "🥉", title: "First Week",       description: "Complete 7 consecutive days",  unlocked: true,  color: "#CD7F32" },
  { icon: "🥈", title: "Two Weeks Strong", description: "Complete 14 consecutive days", unlocked: false, color: "#9CA3AF" },
  { icon: "🥇", title: "Monthly Champion", description: "Complete 30 consecutive days", unlocked: false, color: "#F59E0B" },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export function AICoach() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [quoteIdx, setQuoteIdx]     = useState(0);
  const [rotating, setRotating]     = useState(false);
  const [dismissed, setDismissed]   = useState<number[]>([]);
  const [chatInput, setChatInput]   = useState("");
  const [chatMessages, setChatMessages] = useState<AIChatEntry[]>([]);
  const [chatLoading, setChatLoading]   = useState(false);
  const [isPainMode, setIsPainMode]     = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const hasApiKey = OPENROUTER_API_KEY && OPENROUTER_API_KEY !== "your_openrouter_api_key_here";

  useEffect(() => {
    if (!user) return;
    getUserAIChats(user.uid)
      .then(setChatMessages)
      .catch(err => console.error("Could not load chat history:", err));
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const nextQuote = () => {
    setRotating(true);
    setTimeout(() => {
      setQuoteIdx((quoteIdx + 1) % quotes.length);
      setRotating(false);
    }, 300);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !user || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatLoading(true);

    const painQuery = detectsMuscleIssue(userMsg);
    setIsPainMode(painQuery);

    try {
      const aiResponse = await callOpenRouter(userMsg);

      await saveAIChat({ userId: user.uid, userMessage: userMsg, aiResponse });
      setChatMessages(prev => [...prev, { userId: user.uid, userMessage: userMsg, aiResponse }]);

      // Notify user about AI recommendation
      showToast({
        type: painQuery ? "warning" : "ai",
        title: painQuery ? "⚕️ Recovery Advice" : "🤖 AI Coach responded",
        message: aiResponse.slice(0, 80) + (aiResponse.length > 80 ? "…" : ""),
        icon: painQuery ? "🩺" : "💬",
      });
    } catch (err) {
      console.error("Failed to get AI response:", err);
    } finally {
      setChatLoading(false);
    }
  };

  const streakDays  = 12;
  const totalCircles = 14;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h2 style={{ color: "#F0F4FF", fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 6 }}>AI Coach</h2>
        <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Your personal AI-powered fitness physiotherapist and accountability system</p>
      </div>

      {/* API Key warning */}
      {!hasApiKey && (
        <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <AlertCircle size={15} color="#F59E0B" />
          <span style={{ color: "#F59E0B", fontSize: 12 }}>
            OpenRouter API key not set. Add <code style={{ background: "rgba(255,255,255,0.07)", padding: "1px 6px", borderRadius: 4 }}>VITE_OPENROUTER_API_KEY</code> to your <strong>.env</strong> file for real AI responses. Using smart fallbacks for now.
          </span>
        </div>
      )}

      {/* Hero Quote Card */}
      <div style={{ borderRadius: 20, padding: "32px 36px 28px", background: "linear-gradient(135deg, rgba(0,232,122,0.12) 0%, rgba(0,194,255,0.12) 50%, rgba(139,92,246,0.12) 100%)", border: "1px solid rgba(0,232,122,0.2)", position: "relative", overflow: "hidden", boxShadow: "0 0 50px rgba(0,232,122,0.07)" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(0,194,255,0.1)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(0,232,122,0.08)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 5, left: 20, fontSize: 120, color: "rgba(0,232,122,0.1)", lineHeight: 1, fontFamily: "serif", pointerEvents: "none" }}>"</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <span style={{ background: "rgba(0,232,122,0.12)", border: "1px solid rgba(0,232,122,0.3)", borderRadius: 20, padding: "4px 14px", color: "#00E87A", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>✨ Daily Wisdom</span>
            <button onClick={nextQuote} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "7px 12px", cursor: "pointer", color: "#94A3B8", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#F0F4FF"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#94A3B8"; }}
            >
              <RefreshCw size={12} style={{ transform: rotating ? "rotate(360deg)" : "none", transition: "transform 0.3s" }} /> Refresh
            </button>
          </div>
          <p style={{ color: "#F0F4FF", fontSize: 18, lineHeight: 1.75, fontWeight: 500, marginBottom: 20, opacity: rotating ? 0 : 1, transition: "opacity 0.3s", maxWidth: 700, margin: "0 0 20px 0" }}>"{quotes[quoteIdx].text}"</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #00E87A, #00C2FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
            <span style={{ color: "#64748B", fontSize: 13 }}>{quotes[quoteIdx].author}</span>
            <div style={{ display: "flex", gap: 5, marginLeft: "auto" }}>
              {quotes.map((_, i) => (
                <div key={i} onClick={() => setQuoteIdx(i)} style={{ width: i === quoteIdx ? 18 : 6, height: 6, borderRadius: 3, background: i === quoteIdx ? "#00E87A" : "rgba(255,255,255,0.15)", transition: "all 0.3s", cursor: "pointer" }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Streak Timeline */}
        <div style={{ background: "linear-gradient(160deg, #0E1117, #080B12)", borderRadius: 16, padding: 22, border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: 22 }}>🔥</span>
            <div>
              <div style={{ color: "#F0F4FF", fontSize: 15, fontWeight: 700 }}>{streakDays}-Day Streak</div>
              <div style={{ color: "#64748B", fontSize: 11 }}>2 more to unlock Silver!</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {Array.from({ length: totalCircles }).map((_, i) => {
              const filled = i < streakDays;
              const isToday = i === streakDays - 1;
              return (
                <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: filled ? "linear-gradient(135deg, #00E87A, #00a855)" : "#1a1f2e", border: isToday ? "2px solid #FF6B35" : "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isToday ? "0 0 12px #FF6B3588" : filled ? "0 0 6px rgba(0,232,122,0.3)" : "none", transition: "all 0.3s" }}>
                  {filled ? <span style={{ color: "#020912", fontSize: 13, fontWeight: 800 }}>✓</span> : <span style={{ color: "#374151", fontSize: 10 }}>{i + 1}</span>}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
            {[{ label: "Current", value: "12", color: "#FF6B35" }, { label: "Best", value: "21", color: "#00E87A" }, { label: "Total Days", value: "47", color: "#00C2FF" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ color: s.color, fontSize: 20, fontWeight: 900 }}>{s.value}</div>
                <div style={{ color: "#64748B", fontSize: 10 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div style={{ background: "linear-gradient(160deg, #0E1117, #080B12)", borderRadius: 16, padding: 22, border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Trophy size={17} color="#F59E0B" />
            <div style={{ color: "#F0F4FF", fontSize: 15, fontWeight: 700 }}>Milestones</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {milestones.map((m, i) => (
              <div key={i} style={{ background: m.unlocked ? `${m.color}10` : "#080B12", borderRadius: 12, padding: "12px 14px", border: m.unlocked ? `1px solid ${m.color}33` : "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 12, opacity: m.unlocked ? 1 : 0.5 }}>
                <span style={{ fontSize: 26 }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: m.unlocked ? "#F0F4FF" : "#4B5563", fontSize: 13, fontWeight: 700 }}>{m.title}</div>
                  <div style={{ color: "#64748B", fontSize: 11, marginTop: 1 }}>{m.description}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: m.unlocked ? `${m.color}18` : "rgba(255,255,255,0.04)", color: m.unlocked ? m.color : "#4B5563", border: `1px solid ${m.unlocked ? m.color + "33" : "transparent"}` }}>
                  {m.unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications panel */}
      <div style={{ background: "linear-gradient(160deg, #0E1117, #080B12)", borderRadius: 16, padding: 22, border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Smart Notifications</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map((n, i) => {
            if (dismissed.includes(i)) return null;
            return (
              <div key={i} style={{ background: "#080B12", borderRadius: 14, padding: "14px 18px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "flex-start", gap: 12, borderLeft: `4px solid ${n.color}` }}
                onMouseEnter={e => (e.currentTarget.style.background = "#0A0E16")}
                onMouseLeave={e => (e.currentTarget.style.background = "#080B12")}
              >
                <div style={{ background: `${n.color}14`, borderRadius: 10, padding: 9, flexShrink: 0 }}>{n.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                    <span style={{ color: "#F0F4FF", fontSize: 13, fontWeight: 700 }}>{n.title}</span>
                    <span style={{ color: "#4B5563", fontSize: 10 }}>{n.time}</span>
                  </div>
                  <p style={{ color: "#64748B", fontSize: 12, lineHeight: 1.6, margin: 0 }}>{n.description}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                  <button style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${n.color}44`, background: `${n.color}12`, color: n.color, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${n.color}22`)}
                    onMouseLeave={e => (e.currentTarget.style.background = `${n.color}12`)}
                  >{n.action} <ChevronRight size={11} /></button>
                  <button onClick={() => setDismissed([...dismissed, i])} style={{ padding: "4px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: "#4B5563", fontSize: 10, cursor: "pointer" }}>Dismiss</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Chat Panel */}
      <div style={{ background: "linear-gradient(160deg, #0E1117, #080B12)", borderRadius: 16, border: `1px solid ${isPainMode ? "rgba(245,158,11,0.2)" : "rgba(0,232,122,0.15)"}`, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
          {isPainMode
            ? <><span style={{ fontSize: 18 }}>🩺</span><div style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 700 }}>Muscle Recovery Advisor</div></>
            : <><MessageCircle size={16} color="#00E87A" /><div style={{ color: "#F0F4FF", fontSize: 14, fontWeight: 700 }}>Chat with AI Coach</div></>
          }
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {isPainMode && (
              <span style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, padding: "2px 10px", color: "#F59E0B", fontSize: 10, fontWeight: 700 }}>⚕️ Recovery Mode</span>
            )}
            <span style={{ background: hasApiKey ? "rgba(0,232,122,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${hasApiKey ? "rgba(0,232,122,0.25)" : "rgba(245,158,11,0.25)"}`, borderRadius: 20, padding: "2px 10px", color: hasApiKey ? "#00E87A" : "#F59E0B", fontSize: 10, fontWeight: 700 }}>
              {hasApiKey ? "🟢 AI Online" : "⚡ Fallback Mode"}
            </span>
          </div>
        </div>

        {/* Suggested prompts for pain */}
        {chatMessages.length === 0 && (
          <div style={{ padding: "14px 20px 0", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              "My shoulder hurts after bench press",
              "I have knee pain during squats",
              "Lower back soreness from deadlifts",
              "Best recovery for bicep strain",
              "How to build muscle fast?",
              "What should I eat post-workout?",
            ].map((q, i) => (
              <button key={i}
                onClick={() => { setChatInput(q); }}
                style={{ background: "#080B12", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "6px 14px", color: "#64748B", fontSize: 11, cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#F0F4FF"; e.currentTarget.style.borderColor = "rgba(0,232,122,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#64748B"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >{q}</button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div style={{ maxHeight: 320, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {chatMessages.length === 0 && (
            <div style={{ textAlign: "center", color: "#4B5563", fontSize: 12, padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
              Ask me about fitness, nutrition, recovery, or any muscle pain!
            </div>
          )}
          {chatMessages.map((msg, i) => {
            const isPainMsg = detectsMuscleIssue(msg.userMessage);
            return (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                  <div style={{ background: "rgba(0,232,122,0.12)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: "14px 14px 4px 14px", padding: "8px 14px", maxWidth: "75%", color: "#F0F4FF", fontSize: 13, lineHeight: 1.5 }}>
                    {msg.userMessage}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: isPainMsg ? "linear-gradient(135deg, #F59E0B, #FF6B35)" : "linear-gradient(135deg, #00E87A, #00C2FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                    {isPainMsg ? "🩺" : "🤖"}
                  </div>
                  <div style={{ background: "#080B12", border: `1px solid ${isPainMsg ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)"}`, borderRadius: "4px 14px 14px 14px", padding: "8px 14px", maxWidth: "75%", color: "#94A3B8", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {msg.aiResponse}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 20px 18px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder={isPainMode ? "Describe your injury or pain in detail..." : "Ask about fitness, nutrition, or recovery..."}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSendChat(); }}
            style={{ flex: 1, background: "#080B12", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 14px", color: "#F0F4FF", fontSize: 13, outline: "none", fontFamily: "'Inter', sans-serif" }}
          />
          <button
            onClick={handleSendChat}
            disabled={!chatInput.trim() || chatLoading}
            style={{ width: 42, height: 42, borderRadius: 12, border: "none", background: chatInput.trim() && !chatLoading ? "linear-gradient(135deg, #00E87A, #00C2FF)" : "#1a1f2e", cursor: chatInput.trim() && !chatLoading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}
          >
            {chatLoading
              ? <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #3a3f4e", borderTopColor: "#00E87A", animation: "chatSpin 0.7s linear infinite" }} />
              : <Send size={16} color={chatInput.trim() ? "#020912" : "#4B5563"} />
            }
          </button>
        </div>
      </div>

      <style>{`@keyframes chatSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}