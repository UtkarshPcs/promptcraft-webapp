import { useState, useRef, useEffect } from "react";
import { ArrowRight, Sparkles, RotateCcw, Copy, Check, ChevronRight, Zap, MessageSquare, Layers, Loader2 } from "lucide-react";

const SYSTEM_PROMPT_LAYER_1 = `# Prompt Enhancer - Layer 1: The Structurer
Your job is to take a raw user prompt and define its core structure.
1. Assign a clear Role/Expert Persona.
2. Decompose the task into logical, numbered steps or clear sections.
3. Inject format specifications and constraints if implicitly needed.
4. If the user's prompt is too vague to structure intelligently, ask up to 3 clarifying questions.

Output MUST BE valid JSON. No markdown backticks around the JSON.

If you need clarification (too vague), return ONLY:
{"type":"questions","questions":["Q1?","Q2?"],"preview":"Brief note on what you understand"}

If you have enough context, return the structured prompt AND a list of improvements you made:
{"type":"enhanced","enhancedPrompt":"[The structured prompt]","improvements":["Assigned an Expert Role (e.g., Senior Copywriter)","Decomposed the core task into 3 explicit steps"],"tags":["Structured"]}
`;

const SYSTEM_PROMPT_LAYER_2 = `# Prompt Enhancer - Layer 2: The Sharpener
You receive a structured prompt from Layer 1. Your job is to sharpen it to be LLM-optimized.
1. Tighten the language (remove ambiguity, fluff, and unnecessary words).
2. Add 'Chain-of-Thought' anchors for reasoning (e.g., "Think step-by-step before answering").
3. Inject negative constraints to prevent common LLM pitfalls (e.g., "DO NOT use generic jargon like 'in today's digital landscape'").
4. Specify tone and output length explicitly if missing.

Output MUST BE valid JSON. No markdown backticks around the JSON.
Return the sharpened prompt AND a list of improvements you made.
{"type":"enhanced","enhancedPrompt":"[The sharpened prompt]","improvements":["Injected negative constraints against generic AI jargon","Added a Chain-of-Thought step for better reasoning"],"tags":["Sharpened"]}
`;

const SYSTEM_PROMPT_LAYER_3 = `# Prompt Enhancer - Layer 3: The Finalizer
You receive a sharpened prompt from Layer 2. Your job is to finalize and polish it for ultimate LLM performance.
1. Add iterative refinement framing if it's a creative task (e.g., "Review your draft and refine it").
2. Ensure formatting uses strong markdown (headers, bolding, bullet points, XML tags if appropriate) to make it explicitly parsable by the LLM.
3. Make the final prompt structurally impeccable, visually clean, and highly effective.

Output MUST BE valid JSON. No markdown backticks around the JSON.
Return the final polished prompt AND a list of improvements you made.
{"type":"enhanced","enhancedPrompt":"[The final optimized prompt]","improvements":["Applied semantic Markdown styling for better token parsing","Added a self-refinement and critique step"],"tags":["Finalized", "Expert-Level"]}
`;

// API key moved to environment variables for Vercel backend
// Rough token estimate: ~4 chars per token (same heuristic most LLM UIs use)
function countTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

async function callGroq(messages, systemPrompt) {
  try {
    const response = await fetch("/api/enhance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        systemPrompt,
      }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      return { type: "enhanced", enhancedPrompt: `API Error: ${data.error?.message || response.statusText}`, improvements: [], tags: ["Error"] };
    }

    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
    const text = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    try {
      return JSON.parse(text);
    } catch {
      return { type: "enhanced", enhancedPrompt: text || raw, improvements: ["Failed to parse JSON, returning raw text"], tags: ["Parse Error"] };
    }
  } catch (err) {
    return { type: "enhanced", enhancedPrompt: `Fetch Error: ${err.message}`, improvements: [], tags: ["Network Error"] };
  }
}

export default function App() {
  const [input, setInput] = useState("");
  const [stage, setStage] = useState("idle");
  const [enhanceProgress, setEnhanceProgress] = useState("");
  const [questions, setQuestions] = useState([]);
  const [preview, setPreview] = useState("");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [outputTokens, setOutputTokens] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.max(120, textareaRef.current.scrollHeight) + "px";
    }
    setCharCount(input.length);
  }, [input]);

  async function handleEnhance() {
    if (!input.trim()) return;
    setStage("loading");
    setResult(null);
    setQuestions([]);
    setOutputTokens(0);

    setEnhanceProgress("Layer 1: Structuring task & roles...");
    const res1 = await callGroq([{ role: "user", content: input }], SYSTEM_PROMPT_LAYER_1);
    if (res1.type === "questions") {
      setQuestions(res1.questions);
      setPreview(res1.preview || "");
      setAnswers({});
      setStage("questions");
      return;
    }

    setEnhanceProgress("Layer 2: Sharpening logic & constraints...");
    const res2 = await callGroq([{ role: "user", content: res1.enhancedPrompt }], SYSTEM_PROMPT_LAYER_2);

    setEnhanceProgress("Layer 3: Finalizing formatting & polish...");
    const res3 = await callGroq([{ role: "user", content: res2.enhancedPrompt || res1.enhancedPrompt }], SYSTEM_PROMPT_LAYER_3);

    const finalResult = {
      type: "enhanced",
      enhancedPrompt: res3.enhancedPrompt || res2.enhancedPrompt || res1.enhancedPrompt,
      improvements: [...(res1.improvements || []), ...(res2.improvements || []), ...(res3.improvements || [])],
      tags: [...new Set([...(res1.tags || []), ...(res2.tags || []), ...(res3.tags || [])])]
    };

    setResult(finalResult);
    setOutputTokens(countTokens(finalResult.enhancedPrompt));
    setHistory(h => [{ input, result: finalResult }, ...h.slice(0, 4)]);
    setStage("result");
  }

  async function handleAnswers() {
    const answersText = questions.map((q, i) => `${q} → ${answers[i] || "(skipped)"}`).join("\n");
    const combined = `${input}\n\nAdditional context:\n${answersText}`;
    setStage("loading");
    setOutputTokens(0);

    setEnhanceProgress("Layer 1: Structuring task & roles...");
    const res1 = await callGroq([{ role: "user", content: combined }], SYSTEM_PROMPT_LAYER_1);

    let currentPrompt = res1.enhancedPrompt || combined;
    let allImprovements = res1.improvements || [];
    let allTags = res1.tags || [];

    if (currentPrompt && res1.type !== "questions") {
      setEnhanceProgress("Layer 2: Sharpening logic & constraints...");
      const res2 = await callGroq([{ role: "user", content: currentPrompt }], SYSTEM_PROMPT_LAYER_2);
      currentPrompt = res2.enhancedPrompt || currentPrompt;
      allImprovements = [...allImprovements, ...(res2.improvements || [])];
      allTags = [...allTags, ...(res2.tags || [])];

      setEnhanceProgress("Layer 3: Finalizing formatting & polish...");
      const res3 = await callGroq([{ role: "user", content: currentPrompt }], SYSTEM_PROMPT_LAYER_3);
      currentPrompt = res3.enhancedPrompt || currentPrompt;
      allImprovements = [...allImprovements, ...(res3.improvements || [])];
      allTags = [...allTags, ...(res3.tags || [])];
    }

    const finalResult = {
      type: "enhanced",
      enhancedPrompt: currentPrompt,
      improvements: allImprovements,
      tags: [...new Set(allTags)]
    };

    setResult(finalResult);
    setOutputTokens(countTokens(finalResult.enhancedPrompt));
    setHistory(h => [{ input, result: finalResult }, ...h.slice(0, 4)]);
    setStage("result");
  }

  function handleReset() {
    setInput("");
    setStage("idle");
    setResult(null);
    setQuestions([]);
    setAnswers({});
  }

  const fallbackCopy = (text) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.top = "-9999px";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert("Copy failed — please select the text manually.");
      }
    } catch (err) {
      alert("Copy failed — please select the text manually.");
    } finally {
      document.body.removeChild(el);
    }
  };

  const copyPrompt = () => {
    const text = result?.enhancedPrompt || "";

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch((err) => {
        console.error("Clipboard API failed:", err);
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#CCCCCC" }}>
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

        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 
          100% { transform: rotate(360deg); }
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

        .shimmer {
          height: 1px; border-radius: 10px 10px 0 0;
          background: linear-gradient(90deg, transparent 0%, #4DFFB4 50%, transparent 100%);
          background-size: 200% 100%;
          animation: sh 1.6s ease-in-out infinite;
        }
        @keyframes sh {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

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

        .nav-dot { width: 6px; height: 6px; border-radius: 50%; background: #4DFFB4; display: inline-block; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", borderBottom: "1px solid #141414",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,10,0.94)", backdropFilter: "blur(14px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="nav-dot" />
          <span className="font-sora" style={{ fontSize: "15px", fontWeight: 600, color: "#F5F5F5", letterSpacing: "-0.025em" }}>PromptCraft</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span className="tag">Microservices</span>
          <span className="tag tag-g">Beta</span>
        </div>
      </nav>

      <main style={{ maxWidth: "660px", margin: "0 auto", padding: "0 24px 100px" }}>

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
            {stage === "loading" && <div className="shimmer" style={{ margin: "-24px -28px 24px" }} />}

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
                  ? <span style={{ display: "flex", gap: "6px", alignItems: "center", minWidth: "210px", justifyContent: "center" }}>
                    <Loader2 size={14} className="spin-anim" /> {enhanceProgress}
                  </span>
                  : <><Sparkles size={13} />Enhance (3-Layered)</>
                }
              </button>
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
                <button className="btn-p" onClick={copyPrompt} style={{ flexShrink: 0, minWidth: "96px" }}>
                  {copied ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy</>}
                </button>
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
              <span className="font-mono" style={{ fontSize: "10px", color: "#242424", letterSpacing: "0.12em" }}>RECENT</span>
              <hr style={{ flex: 1, height: "1px", background: "#161616", border: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {history.map((h, i) => (
                <div key={i} className="hist-row" onClick={() => { setInput(h.input); setResult(h.result); setStage("result"); }}>
                  <Layers size={11} color="#2A2A2A" style={{ flexShrink: 0 }} />
                  <span className="font-dm" style={{ fontSize: "13px", color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {h.input}
                  </span>
                  <ChevronRight size={11} color="#2A2A2A" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ marginTop: "80px", paddingTop: "24px", borderTop: "1px solid #141414", display: "flex", justifyContent: "space-between" }}>
          <span className="font-mono" style={{ fontSize: "11px", color: "#222", letterSpacing: "0.08em" }}>PROMPTCRAFT · 2025</span>
          <span className="font-mono" style={{ fontSize: "11px", color: "#222", letterSpacing: "0.08em" }}>POWERED BY GROQ</span>
        </div>
      </main>
    </div>
  );
}
