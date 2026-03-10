import { useState, useEffect, useRef } from "react";
import { RefreshCw, Droplets, Dumbbell, Moon, ChevronRight, Trophy, Send, MessageCircle, Bot, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { saveAIChat, getUserAIChats, type AIChatEntry } from "../../firebase/firestoreService";
import { useToast } from "../../context/ToastContext";

// ─── Constants ─────────────────────────────────────────────────────────────────
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;

// ─── Body Part Detection ────────────────────────────────────────────────────────
const BODY_PARTS = ["knee", "neck", "shoulder", "back", "ankle", "elbow", "wrist", "hip"] as const;
type BodyPart = typeof BODY_PARTS[number];

function detectBodyPart(msg: string): BodyPart | null {
  const lower = msg.toLowerCase();
  return BODY_PARTS.find(p => lower.includes(p)) ?? null;
}

const MUSCLE_PAIN_KEYWORDS = [
  "pain", "hurt", "sore", "injury", "ache", "strain", "sprain", "tear", "cramp",
  "shoulder", "knee", "back", "elbow", "wrist", "ankle", "hip", "neck",
  "bicep", "tricep", "hamstring", "quad", "calf", "shin", "rotator",
];

function detectsMuscleIssue(msg: string): boolean {
  const lower = msg.toLowerCase();
  return MUSCLE_PAIN_KEYWORDS.some(k => lower.includes(k));
}

// ─── Body-Part-Specific System Prompts ─────────────────────────────────────────
function buildInjuryPrompt(part: BodyPart): string {
  const partDescriptions: Record<BodyPart, string> = {
    knee:     "knee injury (could be patellar tendinitis, IT band syndrome, or meniscus strain)",
    neck:     "neck injury (could be cervical muscle strain, whiplash, or tech neck)",
    shoulder: "shoulder injury (could be rotator cuff strain, impingement, or AC joint issue)",
    back:     "lower back injury (could be muscle strain, disc herniation, or SI joint dysfunction)",
    ankle:    "ankle injury (could be lateral ligament sprain, Achilles tendinitis, or peroneal strain)",
    elbow:    "elbow injury (could be tennis elbow, golfer's elbow, or tricep tendinitis)",
    wrist:    "wrist injury (could be carpal tunnel, TFCC tear, or extensor tendinitis)",
    hip:      "hip injury (could be hip flexor strain, bursitis, or labral irritation)",
  };

  return `You are a professional sports physiotherapist for FitDiscipline AI. The user has a ${partDescriptions[part]}.
Respond with EXACTLY this structure and nothing else. Use the exact emoji headers:

🔍 **Injury Analysis**
[2 concise sentences about what is likely happening and why]

⚡ **Immediate Recovery Steps**
• [step 1]
• [step 2]
• [step 3]
• [step 4]

🏃 **Recommended Exercises / Mobility Work**
• [exercise 1 with brief instruction]
• [exercise 2 with brief instruction]
• [exercise 3 with brief instruction]

🚫 **What To Avoid**
• [thing to avoid 1]
• [thing to avoid 2]
• [thing to avoid 3]

⏱️ **Recovery Time Estimate**
[1 sentence with realistic timeline]

📺 **YouTube Physiotherapy Videos**
• [${part} physiotherapy exercises](https://www.youtube.com/results?search_query=${encodeURIComponent(part + " physiotherapy exercises recovery")})
• [${part} injury rehabilitation](https://www.youtube.com/results?search_query=${encodeURIComponent(part + " injury rehabilitation exercises")})
• [${part} pain relief stretches](https://www.youtube.com/results?search_query=${encodeURIComponent(part + " pain relief stretches")})

Be specific to the ${part}. Do not give generic advice.`;
}

const GENERAL_COACH_PROMPT = `You are a world-class fitness coach and nutrition expert for FitDiscipline AI.
Give concise, high-value advice on training, nutrition, recovery, and mindset.
Keep responses under 80 words. Be direct, motivating, and science-backed.`;

const PHYSIOTHERAPIST_SYSTEM_PROMPT = `You are a professional fitness physiotherapist for FitDiscipline AI.
When a user mentions muscle pain or injury without specifying a body part:
1. Acknowledge the pain empathetically
2. List exercises to AVOID immediately
3. Recommend safe recovery protocol (RICE, rest, gentle mobility)
4. Advise when to see a professional
Respond in bullet points. Keep it under 120 words.`;

// ─── Body-Part-Specific Fallback Responses ─────────────────────────────────────
const SPECIFIC_FALLBACKS: Record<BodyPart, string> = {
  knee: `🔍 **Injury Analysis**
Knee pain in athletes typically involves patellar tendinitis, IT band tightness, or runner's knee. Overuse and poor biomechanics are common culprits.

⚡ **Immediate Recovery Steps**
• Apply ice for 15–20 mins every 2–3 hours for the first 48 hours
• Elevate the leg and rest — avoid weight-bearing activities
• Use a compression bandage to reduce swelling
• Take anti-inflammatories (ibuprofen) if not contraindicated

🏃 **Recommended Exercises / Mobility Work**
• Straight leg raises (lying flat, no knee bend)
• Seated calf raises to maintain circulation
• Gentle hamstring stretches (no locking the knee)

🚫 **What To Avoid**
• Deep squats and lunges until fully pain-free
• Running and high-impact cardio
• Kneeling or full knee flexion under load

⏱️ **Recovery Time Estimate**
Mild strains: 1–2 weeks. Moderate tendinitis: 4–6 weeks with consistent rehab.

📺 **YouTube Physiotherapy Videos**
• [Knee Pain Rehab Exercises](https://www.youtube.com/results?search_query=knee+physiotherapy+exercises+recovery)
• [IT Band Syndrome Relief](https://www.youtube.com/results?search_query=IT+band+syndrome+rehabilitation)
• [Patellar Tendinitis Stretches](https://www.youtube.com/results?search_query=patellar+tendinitis+pain+relief+stretches)`,

  neck: `🔍 **Injury Analysis**
Neck pain is usually caused by cervical muscle strain, poor posture (tech neck), or a sudden movement. The trapezius and SCM muscles are most commonly involved.

⚡ **Immediate Recovery Steps**
• Apply heat (not ice) to relax tight cervical muscles
• Perform gentle chin tucks every hour while seated
• Sleep with a supportive pillow aligned with your spine
• Avoid holding your phone between ear and shoulder

🏃 **Recommended Exercises / Mobility Work**
• Slow neck rotations (left/right) keeping shoulders relaxed
• Levator scapulae stretch: ear to shoulder, hold 30 sec each side
• Upper trapezius release with gentle self-massage

🚫 **What To Avoid**
• Heavy overhead pressing or shrugs
• Sleeping on your stomach
• Sudden jerking head movements or looking down for long periods

⏱️ **Recovery Time Estimate**
Muscle strain: 3–7 days of rest and heat therapy. Postural issues: 2–4 weeks of consistent correction.

📺 **YouTube Physiotherapy Videos**
• [Neck Pain Physiotherapy](https://www.youtube.com/results?search_query=neck+physiotherapy+exercises+recovery)
• [Cervical Strain Rehab](https://www.youtube.com/results?search_query=cervical+strain+rehabilitation+exercises)
• [Tech Neck Relief Stretches](https://www.youtube.com/results?search_query=neck+pain+relief+stretches)`,

  shoulder: `🔍 **Injury Analysis**
Shoulder pain after pressing exercises typically indicates rotator cuff impingement or infraspinatus strain. The subacromial space narrows under fatigue.

⚡ **Immediate Recovery Steps**
• Ice the shoulder for 15 mins post-training for the first 48 hours
• Rest from all overhead and pressing movements immediately
• Sleep on your non-affected side with a pillow supporting the arm
• Begin pendulum swings to keep the joint mobile without load

🏃 **Recommended Exercises / Mobility Work**
• Band external rotations (light resistance, elbow at side)
• Wall slides for scapular control
• Cross-body shoulder stretch: 30 sec hold each side

🚫 **What To Avoid**
• Bench press, overhead press, and pull-ups until pain-free
• Sleeping on the affected shoulder
• Any movement that causes sharp pain at end range

⏱️ **Recovery Time Estimate**
Minor impingement: 2–3 weeks. Partial rotator cuff strain: 6–12 weeks with targeted rehab.

📺 **YouTube Physiotherapy Videos**
• [Shoulder Impingement Rehab](https://www.youtube.com/results?search_query=shoulder+physiotherapy+exercises+recovery)
• [Rotator Cuff Strengthening](https://www.youtube.com/results?search_query=rotator+cuff+rehabilitation+exercises)
• [Shoulder Mobility Stretches](https://www.youtube.com/results?search_query=shoulder+pain+relief+stretches)`,

  back: `🔍 **Injury Analysis**
Lower back pain from lifting usually involves erector spinae strain or thoracolumbar fascia irritation. Disc involvement is possible if pain radiates to the leg.

⚡ **Immediate Recovery Steps**
• Apply heat to the lumbar region for 20 mins to relax spasming muscles
• Walk gently for 10–15 mins — complete rest worsens most back injuries
• Sleep on your side with a pillow between your knees
• Avoid sitting for more than 30 minutes without a short walk

🏃 **Recommended Exercises / Mobility Work**
• Cat-cow stretch: 10 slow reps to restore spinal mobility
• Bird-dog: alternating arm/leg extension keeping the back neutral
• Glute bridges: activates glutes and reduces back muscle compensation

🚫 **What To Avoid**
• Deadlifts, heavy squats, and any loaded hip hinge
• Sitting for prolonged periods without lumbar support
• Twisting movements under load (cable rotations, Russian twists)

⏱️ **Recovery Time Estimate**
Acute muscle strain: 1–2 weeks. Disc-related pain: 4–8 weeks with professional guidance.

📺 **YouTube Physiotherapy Videos**
• [Lower Back Pain Relief](https://www.youtube.com/results?search_query=lower+back+physiotherapy+exercises+recovery)
• [Back Injury Rehabilitation](https://www.youtube.com/results?search_query=back+injury+rehabilitation+exercises)
• [Spine Mobility Stretches](https://www.youtube.com/results?search_query=lower+back+pain+relief+stretches)`,

  ankle: `🔍 **Injury Analysis**
Ankle sprains most often affect the lateral ligaments (ATFL). Achilles tendinitis is common from sudden training load increases or poor footwear.

⚡ **Immediate Recovery Steps**
• RICE immediately: Rest, Ice (15 min on/off), Compress, Elevate
• Avoid weight-bearing for 24 hours if swelling is significant
• Use a compression bandage or ankle sleeve for support
• Begin alphabet ankle mobility exercises after 48 hours if pain allows

🏃 **Recommended Exercises / Mobility Work**
• Seated ankle circles (both directions, 10 reps each)
• Single-leg balance on a flat surface (progress to unstable)
• Towel scrunches to strengthen intrinsic foot muscles

🚫 **What To Avoid**
• Running, jumping, or court sports until fully stable
• High heels or unsupportive footwear
• Ignoring the injury — incomplete rehab leads to chronic instability

⏱️ **Recovery Time Estimate**
Grade 1 sprain: 1–2 weeks. Grade 2: 3–6 weeks. Achilles tendinitis: 4–8 weeks.

📺 **YouTube Physiotherapy Videos**
• [Ankle Sprain Rehab](https://www.youtube.com/results?search_query=ankle+physiotherapy+exercises+recovery)
• [Ankle Injury Rehabilitation](https://www.youtube.com/results?search_query=ankle+injury+rehabilitation+exercises)
• [Achilles Tendon Stretches](https://www.youtube.com/results?search_query=ankle+pain+relief+stretches)`,

  elbow: `🔍 **Injury Analysis**
Elbow pain in gym athletes usually presents as lateral epicondylitis (tennis elbow) or medial epicondylitis (golfer's elbow) from repetitive gripping and curling motions.

⚡ **Immediate Recovery Steps**
• Apply ice to the painful area for 15 mins after activity
• Use a counterforce strap (epicondylitis brace) during the day
• Rest from heavy gripping, curling, and pressing movements
• Gentle forearm stretches: wrist extension and flexion stretches

🏃 **Recommended Exercises / Mobility Work**
• Eccentric wrist curls (slow lowering phase, 3×15 light weight)
• Forearm pronation/supination with light dumbbell
• Wrist flexor and extensor stretches: 30 sec holds

🚫 **What To Avoid**
• Barbell curls and heavy dumbbell curls with a painful grip
• Push-ups and dips if they aggravate the medial elbow
• Repetitive gripping activities (tennis, rock climbing) until pain-free

⏱️ **Recovery Time Estimate**
Mild tendinitis: 3–4 weeks. Chronic epicondylitis: 6–12 weeks of consistent eccentric rehab.

📺 **YouTube Physiotherapy Videos**
• [Tennis Elbow Rehab](https://www.youtube.com/results?search_query=elbow+physiotherapy+exercises+recovery)
• [Elbow Injury Rehabilitation](https://www.youtube.com/results?search_query=elbow+injury+rehabilitation+exercises)
• [Forearm Stretch Routine](https://www.youtube.com/results?search_query=elbow+pain+relief+stretches)`,

  wrist: `🔍 **Injury Analysis**
Wrist pain during pressing or gripping often stems from TFCC irritation, extensor tendinitis, or carpal tunnel syndrome. Improper wrist alignment under load is a key cause.

⚡ **Immediate Recovery Steps**
• Splint or brace the wrist in neutral position for rest
• Ice for 15 mins after any aggravating activity
• Perform gentle wrist circles to maintain mobility without load
• Check your grip width on pressing movements — too narrow increases wrist stress

🏃 **Recommended Exercises / Mobility Work**
• Prayer stretch: palms together, lower hands until you feel the stretch
• Reverse prayer stretch: backs of hands together, raise gently
• Wrist roller with light weight to strengthen forearm

🚫 **What To Avoid**
• Heavy bench press or overhead press with wrist wraps as a crutch
• Typing or writing for prolonged periods without breaks
• Push-up variations until the wrist is pain-free

⏱️ **Recovery Time Estimate**
Extensor tendinitis: 2–4 weeks. TFCC irritation: 6–8 weeks minimum.

📺 **YouTube Physiotherapy Videos**
• [Wrist Pain Rehab](https://www.youtube.com/results?search_query=wrist+physiotherapy+exercises+recovery)
• [Wrist Injury Rehabilitation](https://www.youtube.com/results?search_query=wrist+injury+rehabilitation+exercises)
• [Wrist Pain Relief Stretches](https://www.youtube.com/results?search_query=wrist+pain+relief+stretches)`,

  hip: `🔍 **Injury Analysis**
Hip pain in athletes usually involves hip flexor strain (iliopsoas), greater trochanteric bursitis, or hip impingement (FAI). Tight hip flexors from sitting are a major contributing factor.

⚡ **Immediate Recovery Steps**
• Apply ice to the joint for 15–20 mins if there is swelling or sharp pain
• Rest from squats and lunges; switch to upper body training
• Perform gentle supine hip flexor stretches 3× daily
• Avoid sitting for more than 45 minutes at a stretch

🏃 **Recommended Exercises / Mobility Work**
• 90/90 hip stretch: seated on floor, both knees at 90° — hold 2 min per side
• Clamshells with a resistance band (side-lying, 3×15)
• Pigeon pose stretch for piriformis and external rotators

🚫 **What To Avoid**
• Heavy squats, deadlifts, and hip thrusts until pain-free
• Deep hip flexion under load (front squats, leg press too low)
• Running with a long stride until the hip flexor is resolved

⏱️ **Recovery Time Estimate**
Hip flexor strain: 2–4 weeks. Bursitis: 4–8 weeks with anti-inflammatory management.

📺 **YouTube Physiotherapy Videos**
• [Hip Flexor Rehab](https://www.youtube.com/results?search_query=hip+physiotherapy+exercises+recovery)
• [Hip Injury Rehabilitation](https://www.youtube.com/results?search_query=hip+injury+rehabilitation+exercises)
• [Hip Mobility Stretches](https://www.youtube.com/results?search_query=hip+pain+relief+stretches)`,
};

const GENERIC_PAIN_FALLBACK = "For muscle pain: Rest the area for 24–48 hrs. Apply ice (first 24h) then heat. Avoid heavy loading on the affected muscle. Try light mobility work around the joint. Consult a physio if pain persists beyond 5 days or is sharp/radiating. 🩺";
const GENERAL_FALLBACK = "Consistency beats perfection every single time. Show up, put in quality reps, fuel well, and sleep 7–9 hours. The results will follow inevitably. 💪";

// ─── OpenRouter API Call ────────────────────────────────────────────────────────
async function callOpenRouter(userMessage: string): Promise<string> {
  const bodyPart = detectBodyPart(userMessage);
  const isPainQuery = bodyPart !== null || detectsMuscleIssue(userMessage);

  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "your_openrouter_api_key_here") {
    await new Promise(r => setTimeout(r, 700));
    if (bodyPart) return SPECIFIC_FALLBACKS[bodyPart];
    return isPainQuery ? GENERIC_PAIN_FALLBACK : GENERAL_FALLBACK;
  }

  let systemPrompt: string;
  if (bodyPart) {
    systemPrompt = buildInjuryPrompt(bodyPart);
  } else if (isPainQuery) {
    systemPrompt = PHYSIOTHERAPIST_SYSTEM_PROMPT;
  } else {
    systemPrompt = GENERAL_COACH_PROMPT;
  }

  try {
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
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenRouter error:", err);
      if (bodyPart) return SPECIFIC_FALLBACKS[bodyPart];
      return isPainQuery ? GENERIC_PAIN_FALLBACK : GENERAL_FALLBACK;
    }

    const data = await res.json();
    return (data.choices?.[0]?.message?.content as string)?.trim() || GENERAL_FALLBACK;
  } catch (err) {
    console.error("OpenRouter fetch failed:", err);
    if (bodyPart) return SPECIFIC_FALLBACKS[bodyPart];
    return isPainQuery ? GENERIC_PAIN_FALLBACK : GENERAL_FALLBACK;
  }
}

// ─── Formatted AI Response Component ──────────────────────────────────────────
function FormattedAIResponse({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: 4 }} />;

        // Section header: line contains **...**
        if (/\*\*(.+?)\*\*/.test(trimmed)) {
          const clean = trimmed.replace(/\*\*(.*?)\*\*/g, "$1");
          return (
            <div key={i} style={{
              color: "#F0F4FF",
              fontSize: 12,
              fontWeight: 800,
              marginTop: i === 0 ? 0 : 8,
              letterSpacing: 0.3,
              borderBottom: "1px solid rgba(245,158,11,0.15)",
              paddingBottom: 3,
            }}>
              {clean}
            </div>
          );
        }

        // YouTube link: • [label](url)
        const linkMatch = trimmed.match(/^•\s*\[(.+?)\]\((https?:\/\/.+?)\)$/);
        if (linkMatch) {
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ color: "#FF4757", fontSize: 14, marginTop: 1, flexShrink: 0 }}>▶</span>
              <a
                href={linkMatch[2]}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#00C2FF",
                  fontSize: 12,
                  textDecoration: "none",
                  lineHeight: 1.5,
                  borderBottom: "1px solid rgba(0,194,255,0.25)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#7FE0FF")}
                onMouseLeave={e => (e.currentTarget.style.color = "#00C2FF")}
              >
                {linkMatch[1]}
              </a>
            </div>
          );
        }

        // Bullet point: starts with •
        if (trimmed.startsWith("•")) {
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#F59E0B", flexShrink: 0, marginTop: 6,
              }} />
              <span style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.6 }}>
                {trimmed.slice(1).trim()}
              </span>
            </div>
          );
        }

        // Plain text
        return (
          <div key={i} style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.6 }}>
            {trimmed}
          </div>
        );
      })}
    </div>
  );
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
              "Elbow pain from curling",
              "My ankle is sore after running",
              "Neck pain from sitting all day",
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
                  <div style={{ background: "#080B12", border: `1px solid ${isPainMsg ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: "4px 14px 14px 14px", padding: "12px 16px", maxWidth: "82%" }}>
                    {isPainMsg
                      ? <FormattedAIResponse text={msg.aiResponse} />
                      : <span style={{ color: "#94A3B8", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{msg.aiResponse}</span>
                    }
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