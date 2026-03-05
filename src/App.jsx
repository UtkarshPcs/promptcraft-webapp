import { useState, useRef, useEffect } from "react";
import { ArrowRight, Sparkles, RotateCcw, Copy, Check, ChevronRight, Zap, MessageSquare, Layers, Download, FileText, LayoutList } from "lucide-react";

const SYSTEM_PROMPT = `# Prompt Enhancer Skill

Transform weak prompts into powerful, LLM-optimized instructions that get dramatically better results.

---

## Core Philosophy

Most user prompts fail because they are:
- Too vague ("write me a summary" - of what? for whom? how long?)
- Missing context (no role, audience, format, constraints)
- Ambiguous intent (the user knows what they mean; the model doesn't)
- Single-shot (no structure to guide reasoning)
- Under-constrained (no output format, length, tone)

A 10x prompt fixes all of this systematically.

---

## Step 1: Gather Context (Rapid Interview)

Before enhancing, ask the user up to 3 quick questions if the prompt is too sparse. Do NOT ask more than 3. Ask them all at once.

Key things to uncover:
1. Goal - What outcome do they actually want?
2. Audience - Who will read/use the output?
3. Format - How should the output be structured?
4. Constraints - Tone, length, style, things to avoid?
5. Model - Are they using Claude, GPT-4, Gemini, open-source? (Affects prompt style)

If the prompt already contains enough context, skip directly to Step 2.

---

## Step 2: Analyze the Original Prompt

Before rewriting, briefly diagnose what's weak:
- No role assigned: "Write a bio" -> "You are a professional copywriter..."
- Missing audience: "Explain this concept" -> "Explain to a 10-year-old / senior engineer..."
- No format: "Summarize this" -> "Summarize in 3 bullet points with a 1-line TL;DR"
- Ambiguous task: "Make it better" -> "Rewrite to be more concise, professional, and action-oriented"
- No constraints: "Write an email" -> "Write a 150-word follow-up email, formal tone, no jargon"
- Missing examples: "Generate ideas" -> Provide 1-2 examples of the style/format desired
- No chain-of-thought: Complex reasoning task -> Add "Think step by step" or structured reasoning prompts

---

## Step 3: Apply Enhancement Techniques

Use the relevant techniques from this toolkit:

### Role Prompting
Assign a clear expert identity.
- BAD: "Write a marketing strategy"
- GOOD: "You are a senior growth marketer with 10 years of B2B SaaS experience. Write a..."

### Task Decomposition
Break complex asks into clear steps.
- BAD: "Analyze my business"
- GOOD: "Analyze my business in three parts: 1. Identify the top 3 strengths 2. Identify the top 3 risks 3. Recommend 2 actionable next steps"

### Format Specification
Always specify the exact desired output format.
- BAD: "Give me ideas"
- GOOD: "Generate exactly 5 ideas. For each, provide: Idea name (bold), 2-sentence description, One potential risk"

### Chain-of-Thought Anchoring
For reasoning tasks, require visible thinking.
- BAD: "Is this a good decision?"
- GOOD: "Reason through this decision step by step before giving your final recommendation."

### Constraint Injection
Add explicit boundaries.
- BAD: "Write a blog post about AI"
- GOOD: "Write a 600-word blog post about AI for non-technical founders. Tone: conversational, optimistic. Avoid: jargon, hype words like 'revolutionize'. Must include: one real-world example, one actionable takeaway."

### Few-Shot Examples
Show the model what good output looks like.
- "Here is an example of the style I want: [EXAMPLE INPUT]: ... [EXAMPLE OUTPUT]: ... Now do the same for: [ACTUAL INPUT]"

### Iterative Refinement Framing
For creative/complex tasks, invite iteration.
- "Generate a first draft. Then critique it yourself and produce a revised version."

---

## Output Rules

- Always output the complete enhanced prompt, ready to paste. No placeholders like "[insert here]" without clear instructions.
- Keep the enhanced prompt self-contained — it should work even without the user's explanation.
- Match the verbosity of the enhanced prompt to the task complexity.
- Never strip the user's original intent — only amplify and clarify it.
- If the user specifies a model (GPT-4, Claude, Gemini), optimize for that model's known strengths:
  - Claude: Responds well to XML tags, explicit reasoning prompts
  - GPT-4: Responds well to markdown structure, system/user role separation
  - Gemini: Benefits from clear structured formatting
  - Open-source (Llama, Mistral): Needs more explicit, simpler instructions

---

## Edge Cases

- If the user's prompt is already excellent: Tell them it's strong, explain why, and offer 1-2 minor refinements only.
- If the prompt involves sensitive/harmful use: Do not enhance it. Decline politely.
- If the prompt is for an image generator (Midjourney, DALL-E): Use visual prompt techniques instead — style modifiers, lighting, aspect ratio, negative prompts.
- If the user wants a system prompt: Structure with clear role, capabilities, constraints, and response format sections.

---

## MANDATORY OUTPUT FORMAT

You MUST always respond with ONLY valid JSON. No markdown, no backticks, no preamble, no plain text ever.

When you need clarification (prompt is too vague), return ONLY:
{"type":"questions","questions":["Question 1?","Question 2?"],"preview":"Brief note on what you already understand"}

When you have enough context to enhance, return ONLY:
{"type":"enhanced","enhancedPrompt":"The full ready-to-use enhanced prompt","improvements":["What changed and why 1","Improvement 2","Improvement 3"],"tags":["tag1","tag2"]}

NEVER return anything outside of these two JSON structures. NEVER wrap in markdown code fences.`;

// API key is secured in the backend (api/enhance.js) via environment variables

// Rough token estimate: ~4 chars per token (same heuristic most LLM UIs use)
function countTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

async function callGroq(messages) {
  try {
    const response = await fetch("/api/enhance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        systemPrompt: SYSTEM_PROMPT,
      }),
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      const errMsg = data.error?.message || data.error || response.statusText || "Unknown API error";
      return { type: "enhanced", enhancedPrompt: `⚠️ API Error: ${errMsg}`, improvements: ["Check your GROQ_API_KEY environment variable in Vercel"], tags: ["Error"] };
    }
    // Qwen3 may prefix a <think>...</think> block before JSON — strip it.
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!raw) {
      return { type: "enhanced", enhancedPrompt: "⚠️ The model returned an empty response. Please try again.", improvements: [], tags: ["Error"] };
    }
    const text = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    try {
      return JSON.parse(text);
    } catch {
      return { type: "enhanced", enhancedPrompt: text || raw, improvements: [], tags: [] };
    }
  } catch (err) {
    return { type: "enhanced", enhancedPrompt: `⚠️ Network Error: ${err.message}`, improvements: [], tags: ["Error"] };
  }
}

export default function App() {
  const [view, setView] = useState("home"); // "home" | "updates"
  const [input, setInput] = useState("");
  const [stage, setStage] = useState("idle");
  const [questions, setQuestions] = useState([]);
  const [preview, setPreview] = useState("");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  // LocalStorage persistence for history
  const [history, setHistory] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("promptcraft_history");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return [];
  });

  const [copied, setCopied] = useState(false); // Can be false, "markdown", "plain", or "txt"
  const [charCount, setCharCount] = useState(0);
  const [outputTokens, setOutputTokens] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current && view === "home") {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.max(120, textareaRef.current.scrollHeight) + "px";
    }
    setCharCount(input.length);
  }, [input, view]);

  // Save history on changes
  useEffect(() => {
    localStorage.setItem("promptcraft_history", JSON.stringify(history));
  }, [history]);

  async function handleEnhance() {
    if (!input.trim()) return;
    setStage("loading");
    setResult(null);
    setQuestions([]);
    setOutputTokens(0);
    const res = await callGroq([{ role: "user", content: input }]);
    if (res.type === "questions") {
      setQuestions(res.questions);
      setPreview(res.preview || "");
      setAnswers({});
      setStage("questions");
    } else {
      setResult(res);
      setOutputTokens(countTokens(res.enhancedPrompt));
      setHistory(h => [{ input, result: res }, ...h.slice(0, 9)]); // Keep last 10
      setStage("result");
    }
  }

  async function handleAnswers() {
    const answersText = questions.map((q, i) => `${q} → ${answers[i] || "(skipped)"}`).join("\n");
    const combined = `${input}\n\nAdditional context:\n${answersText}`;
    setStage("loading");
    setOutputTokens(0);
    const res = await callGroq([{ role: "user", content: combined }]);
    setResult(res);
    setOutputTokens(countTokens(res.enhancedPrompt));
    setHistory(h => [{ input, result: res }, ...h.slice(0, 9)]); // Keep last 10
    setStage("result");
  }

  function handleReset() {
    setInput("");
    setStage("idle");
    setResult(null);
    setQuestions([]);
    setAnswers({});
  }

  // --- Export Actions ---
  function copyMarkdown() {
    navigator.clipboard.writeText(result?.enhancedPrompt || "");
    setCopied("markdown");
    setTimeout(() => setCopied(false), 2000);
  }

  function copyPlaintext() {
    // Basic regex to strip markdown bolding/italics/code blocks
    const plain = (result?.enhancedPrompt || "").replace(/[*#_`]/g, "");
    navigator.clipboard.writeText(plain);
    setCopied("plain");
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadTxt() {
    const text = result?.enhancedPrompt || "";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "promptcraft-enhanced.txt";
    link.click();
    URL.revokeObjectURL(url);
    setCopied("txt");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#CCCCCC", position: "relative", zIndex: 0, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0A0A0A; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }

        .font-sora { font-family: 'Sora', sans-serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }

        .fade-in { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .s1 { animation-delay: 0.05s; }
        .s2 { animation-delay: 0.12s; }
        .s3 { animation-delay: 0.19s; }
        .s4 { animation-delay: 0.26s; }
        .s5 { animation-delay: 0.33s; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hero-bg {
          position: absolute; top: 0; left: 0; width: 100vw; height: 60vh;
          background: radial-gradient(ellipse at 50% -20%, rgba(77,255,180,0.1), transparent 60%);
          pointer-events: none; z-index: -1;
          animation: pulse-bg 8s ease-in-out infinite alternate;
        }

        @keyframes pulse-bg {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.05); }
        }
        
        /* Loading Skeleton Animation */
        .skeleton-block {
          background: #151515; border-radius: 6px;
        }
        .skeleton-pulse {
          animation: sk-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes sk-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .main-ta {
          width: 100%; background: transparent; border: none;
          color: #F5F5F5; font-family: 'DM Sans', sans-serif;
          font-size: 16px; line-height: 1.7; resize: none; outline: none;
          min-height: 120px; padding: 0;
        }
        .main-ta::placeholder { color: #282828; }

        .text-in {
          width: 100%; background: #0D0D0D; border: 1px solid #222;
          color: #F5F5F5; font-family: 'DM Sans', sans-serif;
          font-size: 15px; line-height: 1.6; padding: 12px 16px;
          outline: none; border-radius: 6px; transition: border-color 0.2s;
        }
        .text-in:focus { border-color: #4DFFB4; }
        .text-in::placeholder { color: #2A2A2A; }

        .btn-p {
          display: inline-flex; align-items: center; gap: 7px;
          background: #F5F5F5; color: #0A0A0A; border: none;
          padding: 12px 22px; font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 14px; cursor: pointer;
          border-radius: 6px; transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .btn-p:hover { background: #4DFFB4; transform: translateY(-1px); }
        .btn-p:active { transform: translateY(0); }
        .btn-p:disabled { opacity: 0.25; cursor: not-allowed; transform: none; }

        .btn-s {
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent; color: #666; border: 1px solid #222;
          padding: 11px 20px; font-family: 'DM Sans', sans-serif;
          font-weight: 500; font-size: 14px; cursor: pointer;
          border-radius: 6px; transition: border-color 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .btn-s:hover { border-color: #444; color: #CCCCCC; }

        .btn-g {
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent; color: #3A3A3A; border: none;
          padding: 8px 0; font-family: 'DM Sans', sans-serif;
          font-size: 13px; cursor: pointer; transition: color 0.2s;
        }
        .btn-g:hover { color: #888; }

        .tag {
          display: inline-flex; align-items: center; padding: 4px 11px;
          background: transparent; border: 1px solid #1E1E1E; border-radius: 100px;
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500;
          color: #444; letter-spacing: 0.03em; transition: border-color 0.2s, color 0.2s;
        }
        .tag:hover { border-color: #4DFFB4; color: #4DFFB4; }
        .tag-g { border-color: rgba(77,255,180,0.25); color: #4DFFB4; background: rgba(77,255,180,0.04); }

        .card {
          background: #111111; border: 1px solid #222222; border-radius: 10px;
        }

        .divider { height: 1px; background: #1E1E1E; border: none; }

        .dot {
          display: inline-block; width: 4px; height: 4px; background: #4DFFB4;
          border-radius: 50%; animation: bl 1.2s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.18s; }
        .dot:nth-child(3) { animation-delay: 0.36s; }
        @keyframes bl {
          0%,100% { opacity: 0.2; }
          50% { opacity: 1; }
        }

        .imp-row {
          display: flex; gap: 12px; align-items: flex-start;
          padding: 11px 0; border-bottom: 1px solid #161616;
        }
        .imp-row:last-child { border-bottom: none; }

        .hist-row {
          display: flex; align-items: center; gap: 12px; padding: 12px 16px;
          border: 1px solid #181818; border-radius: 6px; cursor: pointer;
          transition: border-color 0.2s, background 0.2s; background: transparent;
        }
        .hist-row:hover { border-color: #2E2E2E; background: #111; }

        .q-block { padding: 16px 0; border-bottom: 1px solid #181818; }
        .q-block:last-child { border-bottom: none; }
      `}</style>

      {/* Animated Hero Background */}
      <div className="hero-bg" />

      {/* ── NAV ── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", borderBottom: "1px solid #141414",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,10,0.85)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setView("home")}>
          <img src="/logo.png" alt="PromptCraft Header Logo" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "contain" }} />
          <span className="font-sora" style={{ fontSize: "15px", fontWeight: 600, color: "#F5F5F5", letterSpacing: "-0.025em" }}>PromptCraft</span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button className="btn-g font-mono" style={{ fontSize: "11px", letterSpacing: "0.05em" }} onClick={() => setView("updates")}>CHANGELOG</button>
          <div style={{ display: "flex", gap: "8px" }}>
            <span className="tag">Microservices</span>
            <span className="tag tag-g">v 1.1.1</span>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "660px", margin: "0 auto", padding: "0 24px 100px" }}>

        {/* ── HOME VIEW ── */}
        {view === "home" && (
          <>
            {/* ── HERO ── */}
            {stage === "idle" && (
              <div style={{ paddingTop: "88px", paddingBottom: "64px" }}>
                <div className="fade-in s1" style={{ marginBottom: "16px" }}>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#4DFFB4", letterSpacing: "0.14em" }}>AI PROMPT ENGINEER</span>
                </div>
                <h1 className="font-sora fade-in s2" style={{
                  fontSize: "clamp(38px, 8vw, 62px)", fontWeight: 700, color: "#F5F5F5",
                  lineHeight: 1.07, letterSpacing: "-0.04em", marginBottom: "22px",
                }}>
                  Turn messy thoughts<br />into perfect prompts.
                </h1>
                <p className="font-dm fade-in s3" style={{ fontSize: "17px", color: "#555", lineHeight: 1.65, maxWidth: "420px" }}>
                  Type anything rough. We break it down, clarify what's missing,
                  and return a prompt that actually gets results.
                </p>
                <div className="fade-in s4" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "28px" }}>
                  {["Smart clarification", "Structure injection", "Context-aware", "Instant output"].map(f => (
                    <span key={f} className="tag">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* spacing when not idle */}
            {stage !== "idle" && <div style={{ height: "40px" }} />}

            {/* ── INPUT ── */}
            {(stage === "idle" || stage === "loading") && (
              <div className={`card fade-in ${stage === "idle" ? "s5" : ""}`} style={{ padding: "24px 28px" }}>

                <div className="font-mono" style={{ fontSize: "10px", color: "#2A2A2A", letterSpacing: "0.14em", marginBottom: "16px" }}>
                  YOUR RAW INPUT
                </div>

                <textarea
                  className="main-ta"
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={"write something for my newsletter...\nhelp me ask AI to review my code...\nmake a logo brief for my startup..."}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleEnhance(); }}
                  disabled={stage === "loading"}
                />

                <hr className="divider" style={{ margin: "20px 0" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {input.trim() ? (
                      <span className="font-mono" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#3A3A3A" }}>
                        <span style={{ color: "#4DFFB4", opacity: 0.7 }}>IN</span>
                        <span style={{ color: "#4DFFB4", fontWeight: 600 }}>{countTokens(input).toLocaleString()}</span>
                        <span style={{ color: "#282828" }}>tok</span>
                      </span>
                    ) : (
                      <span className="font-mono" style={{ fontSize: "11px", color: "#222" }}>⌘↵ to enhance</span>
                    )}
                  </div>
                  <button className="btn-p" onClick={handleEnhance} disabled={stage === "loading" || !input.trim()}>
                    {stage === "loading"
                      ? <span style={{ display: "flex", gap: "4px", alignItems: "center" }}><span className="dot" /><span className="dot" /><span className="dot" /></span>
                      : <><Sparkles size={13} />Enhance</>
                    }
                  </button>
                </div>
              </div>
            )}

            {/* ── SKELETON LOADING ── */}
            {stage === "loading" && (
              <div className="fade-in s1" style={{ marginTop: "14px" }}>
                <div className="card skeleton-pulse" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div className="skeleton-block" style={{ width: "80px", height: "10px", marginBottom: "8px" }} />
                      <div className="skeleton-block" style={{ width: "120px", height: "18px" }} />
                    </div>
                    <div className="skeleton-block" style={{ width: "90px", height: "36px", borderRadius: "6px" }} />
                  </div>
                  <hr className="divider" />
                  <div>
                    <div className="skeleton-block" style={{ width: "100%", height: "14px", marginBottom: "12px" }} />
                    <div className="skeleton-block" style={{ width: "95%", height: "14px", marginBottom: "12px" }} />
                    <div className="skeleton-block" style={{ width: "100%", height: "14px", marginBottom: "12px" }} />
                    <div className="skeleton-block" style={{ width: "50%", height: "14px" }} />
                  </div>
                </div>
                <div className="card skeleton-pulse" style={{ padding: "20px 24px", marginTop: "14px" }}>
                  <div className="skeleton-block" style={{ width: "100px", height: "10px", marginBottom: "16px" }} />
                  <div className="skeleton-block" style={{ width: "80%", height: "12px", marginBottom: "12px" }} />
                  <div className="skeleton-block" style={{ width: "60%", height: "12px" }} />
                </div>
              </div>
            )}

            {/* ── QUESTIONS ── */}
            {stage === "questions" && (
              <div className="fade-in">
                <div style={{ marginBottom: "20px" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "6px 14px", background: "#111", border: "1px solid #1E1E1E", borderRadius: "100px",
                  }}>
                    <MessageSquare size={11} color="#333" />
                    <span className="font-dm" style={{ fontSize: "13px", color: "#444", maxWidth: "420px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {input}
                    </span>
                  </div>
                </div>

                <div className="card" style={{ padding: "28px" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "24px" }}>
                    <div style={{
                      width: 34, height: 34, border: "1px solid #222", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Zap size={14} color="#4DFFB4" />
                    </div>
                    <div>
                      <div className="font-sora" style={{ fontSize: "16px", fontWeight: 600, color: "#F5F5F5", letterSpacing: "-0.02em", marginBottom: "5px" }}>
                        A few quick questions
                      </div>
                      <div className="font-dm" style={{ fontSize: "13px", color: "#444", lineHeight: 1.6 }}>
                        Helps craft a sharper prompt. Skip any you'd like.
                      </div>
                    </div>
                  </div>

                  {preview && (
                    <div style={{ background: "#0D0D0D", border: "1px solid #1A1A1A", borderRadius: "6px", padding: "12px 16px", marginBottom: "20px" }}>
                      <div className="font-mono" style={{ fontSize: "10px", color: "#4DFFB4", letterSpacing: "0.1em", marginBottom: "6px" }}>ALREADY UNDERSTOOD</div>
                      <p className="font-dm" style={{ fontSize: "13px", color: "#444", lineHeight: 1.6 }}>{preview}</p>
                    </div>
                  )}

                  {questions.map((q, i) => (
                    <div key={i} className="q-block">
                      <div className="font-dm" style={{ fontSize: "14px", color: "#CCCCCC", marginBottom: "10px", lineHeight: 1.55, display: "flex", gap: "10px" }}>
                        <span className="font-mono" style={{ color: "#4DFFB4", fontSize: "11px", flexShrink: 0, paddingTop: "3px" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{q}</span>
                      </div>
                      <input
                        type="text"
                        className="text-in"
                        placeholder="Your answer (optional)"
                        value={answers[i] || ""}
                        onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter") handleAnswers(); }}
                      />
                    </div>
                  ))}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "24px" }}>
                    <button className="btn-g" onClick={handleReset}><RotateCcw size={12} />Start over</button>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn-s" onClick={handleAnswers}>Skip all</button>
                      <button className="btn-p" onClick={handleAnswers}><ArrowRight size={14} />Build prompt</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── RESULT ── */}
            {stage === "result" && result && (
              <div className="fade-in">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                  <button className="btn-g" onClick={handleReset}><RotateCcw size={12} />New prompt</button>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {result.tags?.map((t, i) => <span key={i} className="tag">{t}</span>)}
                  </div>
                </div>

                {/* Enhanced prompt */}
                <div className="card" style={{ padding: "28px", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "20px" }}>
                    <div>
                      <div className="font-mono" style={{ fontSize: "10px", color: "#4DFFB4", letterSpacing: "0.12em", marginBottom: "5px" }}>ENHANCED PROMPT</div>
                      <div className="font-sora" style={{ fontSize: "18px", fontWeight: 600, color: "#F5F5F5", letterSpacing: "-0.025em" }}>Ready to use</div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {/* Export Dropdown equivalent (buttons row) */}
                      <button className="btn-s" onClick={copyPlaintext} title="Copy as Plaintext" style={{ padding: "0 14px" }}>
                        {copied === "plain" ? <Check size={14} color="#4DFFB4" /> : <Layers size={14} />}
                      </button>
                      <button className="btn-s" onClick={downloadTxt} title="Download .txt" style={{ padding: "0 14px" }}>
                        {copied === "txt" ? <Check size={14} color="#4DFFB4" /> : <Download size={14} />}
                      </button>
                      <button className="btn-p" onClick={copyMarkdown} style={{ minWidth: "96px" }}>
                        {copied === "markdown" ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy</>}
                      </button>
                    </div>
                  </div>

                  <hr className="divider" style={{ marginBottom: "20px" }} />

                  <p className="font-dm" style={{ fontSize: "15px", lineHeight: 1.8, color: "#CCCCCC", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {result.enhancedPrompt}
                  </p>

                  {/* Output token count */}
                  {outputTokens > 0 && (
                    <>
                      <hr className="divider" style={{ marginTop: "20px", marginBottom: "12px" }} />
                      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                        <span className="font-mono" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "#3A3A3A" }}>
                          <span style={{ color: "#555" }}>IN</span>
                          <span style={{ color: "#888", fontWeight: 600 }}>{countTokens(input).toLocaleString()}</span>
                          <span style={{ color: "#333" }}>tok</span>
                        </span>
                        <span style={{ color: "#222", fontSize: "10px" }}>→</span>
                        <span className="font-mono" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "#3A3A3A" }}>
                          <span style={{ color: "#4DFFB4", opacity: 0.8 }}>OUT</span>
                          <span style={{ color: "#4DFFB4", fontWeight: 600 }}>{outputTokens.toLocaleString()}</span>
                          <span style={{ color: "#333" }}>tok</span>
                        </span>
                        <span style={{ color: "#252525", fontSize: "10px", fontFamily: "'JetBrains Mono', monospace" }}>
                          ×{(outputTokens / Math.max(countTokens(input), 1)).toFixed(1)} expansion
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Improvements */}
                {result.improvements?.length > 0 && (
                  <div className="card" style={{ padding: "20px 24px", marginBottom: "14px" }}>
                    <div className="font-mono" style={{ fontSize: "10px", color: "#2A2A2A", letterSpacing: "0.12em", marginBottom: "14px" }}>
                      WHAT WAS IMPROVED
                    </div>
                    {result.improvements.map((imp, i) => (
                      <div key={i} className="imp-row">
                        <div style={{
                          width: 20, height: 20, border: "1px solid #1E1E1E", borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px",
                        }}>
                          <span className="font-mono" style={{ fontSize: "9px", color: "#4DFFB4" }}>{i + 1}</span>
                        </div>
                        <p className="font-dm" style={{ fontSize: "13px", color: "#555", lineHeight: 1.65 }}>{imp}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Original */}
                <div style={{ padding: "14px 18px", border: "1px solid #161616", borderRadius: "6px" }}>
                  <div className="font-mono" style={{ fontSize: "10px", color: "#252525", letterSpacing: "0.1em", marginBottom: "6px" }}>ORIGINAL INPUT</div>
                  <p className="font-dm" style={{ fontSize: "13px", color: "#3A3A3A", lineHeight: 1.6, fontStyle: "italic" }}>{input}</p>
                </div>
              </div>
            )}

            {/* ── HISTORY ── */}
            {history.length > 0 && stage === "idle" && (
              <div className="fade-in" style={{ marginTop: "52px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <hr style={{ flex: 1, height: "1px", background: "#161616", border: "none" }} />
                  <span className="font-mono" style={{ fontSize: "10px", color: "#282828", letterSpacing: "0.12em" }}>RECENT HISTORY (SAVED)</span>
                  <hr style={{ flex: 1, height: "1px", background: "#161616", border: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {history.map((h, i) => (
                    <div key={i} className="hist-row" onClick={() => { setInput(h.input); setResult(h.result); setStage("result"); }}>
                      <FileText size={11} color="#2A2A2A" style={{ flexShrink: 0 }} />
                      <span className="font-dm" style={{ fontSize: "13px", color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {h.input}
                      </span>
                      <ChevronRight size={11} color="#2A2A2A" style={{ flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── UPDATES CHANGELOG VIEW ── */}
        {view === "updates" && (
          <div className="fade-in" style={{ paddingTop: "60px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "20px", cursor: "pointer" }} onClick={() => setView("home")} className="btn-g">
              <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} />
              <span className="font-dm" style={{ fontSize: "14px", fontWeight: 500 }}>Back to App</span>
            </div>

            <h2 className="font-sora" style={{ fontSize: "32px", fontWeight: 600, color: "#F5F5F5", marginBottom: "40px", letterSpacing: "-0.02em" }}>
              Updates & Changelog
            </h2>

            <div className="card" style={{ padding: "32px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="font-sora" style={{ fontSize: "20px", color: "#4DFFB4", fontWeight: 600 }}>v 1.1.1</span>
                  <span className="tag tag-g">LATEST</span>
                </div>
                <span className="font-mono" style={{ fontSize: "11px", color: "#444" }}>MAR 05, 2026</span>
              </div>
              <ul className="font-dm" style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong>Brand Identity</strong> — Added the official PromptCraft logo to navigation and application files.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: "32px", borderColor: "#181818", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="font-sora" style={{ fontSize: "20px", color: "#F5F5F5", fontWeight: 600 }}>v 1.1.0</span>
                </div>
                <span className="font-mono" style={{ fontSize: "11px", color: "#444" }}>MAR 04, 2026</span>
              </div>
              <ul className="font-dm" style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong>LocalStorage History</strong> — Prompt history now persists across browser sessions. Never lose a prompt again.</li>
                <li><strong>Multiple Export Options</strong> — Copy your output as Markdown, plain text, or download directly as a `.txt` file.</li>
                <li><strong>Animated UI Details</strong> — Added a subtle reactive mint gradient in the hero section for a premium feel.</li>
                <li><strong>Loading Skeletons</strong> — Removed the basic loading shimmer; results now generate with a structured layout skeleton.</li>
                <li><strong>Updates Center</strong> — Created this very page to track all future shipped features.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: "32px", borderColor: "#181818" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <span className="font-sora" style={{ fontSize: "20px", color: "#F5F5F5", fontWeight: 600 }}>v 1.0.0</span>
                <span className="font-mono" style={{ fontSize: "11px", color: "#444" }}>INITIAL RELEASE</span>
              </div>
              <ul className="font-dm" style={{ color: "#888888", fontSize: "15px", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong>3-Layer AI Architecture</strong> — Custom structured processing (Context, Sharpener, Finalizer).</li>
                <li><strong>Clarification Engine</strong> — Automatically asks up to 3 context questions if user prompts are too vague.</li>
                <li><strong>Token Analytics</strong> — Live token estimation for inputs and exact cost expansion tracking for outputs.</li>
                <li><strong>Sora + DM Sans Branding</strong> — Modern, monochrome design system implemented.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ marginTop: "80px", paddingTop: "24px", borderTop: "1px solid #141414", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span className="font-mono" style={{ fontSize: "11px", color: "#444", letterSpacing: "0.08em" }}>PROMPTCRAFT · v1.1.1</span>
            <span className="font-dm" style={{ fontSize: "11px", color: "#333", display: "flex", alignItems: "center", gap: "4px" }}>
              Made by <span style={{ color: "#666", fontWeight: 500 }}>Utkarsh AI dev</span>
            </span>
          </div>
          <span className="font-mono" style={{ fontSize: "11px", color: "#222", letterSpacing: "0.08em" }}>POWERED BY GROQ</span>
        </div>
      </main>
    </div>
  );
}
