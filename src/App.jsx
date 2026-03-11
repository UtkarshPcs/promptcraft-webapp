import { useState, useRef, useEffect } from "react";
import { ArrowRight, Sparkles, RotateCcw, Copy, Check, ChevronRight, Zap, MessageSquare, Layers, Download, FileText, LayoutList, Wand2, Send, AlertTriangle, Blend, ArrowLeftRight, CheckCircle2, Circle, Settings, AlertCircle, ChevronDown, Mic, Loader2, X } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import removeMarkdown from 'remove-markdown';

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

### CRITICAL: Domain-Aware Question Selection
First, classify the input into its domain, then tailor questions to that domain. NEVER default to generic questions like "Who is the audience?" when domain-specific questions would be far more useful.

- **Technical/coding prompts** → Ask about: programming language, framework, error context, desired output format (code, explanation, review), environment
- **Data/analytics prompts** → Ask about: dataset type, analysis goal, tools/libraries, output format (chart, report, code)
- **Creative/design prompts** → Ask about: style references, brand constraints, colors/motifs to avoid, medium (digital, print)
- **Business/professional prompts** → Ask about: industry, company stage, specific KPIs, competitive context
- **Writing/content prompts** → Ask about: tone, length, publication platform, key message
- **General/vague prompts** → Then fall back to: goal, audience, format, constraints

Key things to uncover (use only when domain-specific questions don't apply):
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

const REFINE_SYSTEM_PROMPT = `# Prompt Refiner

You are a precision prompt editor. You are given an existing enhanced prompt and a user's modification request.

## Your Job

1. Read the existing enhanced prompt carefully.
2. Read the user's refinement instruction.
3. Apply ONLY the requested changes — do not rewrite or restructure anything else.
4. Preserve the quality, structure, formatting, and intent of the original enhanced prompt.

## Rules

- If the user says "add X": Insert X naturally into the existing prompt at the most logical position.
- If the user says "remove X": Delete X from the prompt while keeping the rest coherent.
- If the user says "change X to Y": Replace X with Y precisely.
- If the user gives a vague instruction like "make it better": Apply a small, targeted improvement without overhauling.
- NEVER reduce the quality or completeness of the prompt.
- Keep the same tone, format, and structure unless explicitly asked to change it.

## Contradiction Detection

If the user's modification directly contradicts the core intent of the original prompt (e.g., original says "formal tone" but user says "make it casual" without removing the formal constraint), return a clarification question:
{"type":"questions","questions":["Your question about the contradiction"],"preview":"Brief explanation of what conflicts"}

## MANDATORY OUTPUT FORMAT

You MUST always respond with ONLY valid JSON. No markdown, no backticks, no preamble.

When you can apply the refinement:
{"type":"enhanced","enhancedPrompt":"The full updated prompt with changes applied","improvements":["What was changed 1","What was changed 2"],"tags":["tag1","tag2"]}

When you need clarification about a contradiction:
{"type":"questions","questions":["Clarifying question"],"preview":"Explanation of the detected contradiction"}

NEVER return anything outside of these two JSON structures.`;

const MIXER_SYSTEM_PROMPT = `# Prompt Mixer

You are an expert prompt blending engine. You receive TWO prompts and must intelligently merge them into a single, unified, superior prompt.

## Your Process

1. **Analyze Both Prompts**: Read Prompt A and Prompt B carefully.
2. **Identify Shared Instructions**: Find instructions that appear in BOTH prompts (even if worded differently but semantically identical). Keep only ONE copy of each shared instruction.
3. **Identify Unique Instructions**: Find instructions that exist in only ONE of the two prompts. Include ALL unique instructions in the merged result.
4. **Detect Contradictions**: Find any instructions that DIRECTLY CONFLICT between the two prompts. Examples of contradictions:
   - One says "write short" and the other says "write long"
   - One says "formal tone" and the other says "casual tone"
   - One says "use bullet points" and the other says "use paragraphs only"
   - One says "avoid technical jargon" and the other says "use technical terminology"
   - One assigns a different role/persona
   - One specifies a different audience
   - Conflicting output formats, lengths, styles, or constraints

## Deep Conflict Analysis (CRITICAL)
When analyzing contradictions, decompose each conflict into ALL its separable dimensions. Do NOT surface only one vague conflict when the prompts actually differ on multiple fronts. For example, if Prompt A assigns a "Therapist" role and Prompt B assigns a "Life Coach" role, these roles differ on MANY dimensions:
- Methodology (therapeutic techniques vs action-oriented coaching)
- Communication style (reflective listening vs directive guidance)
- Advice-giving philosophy (exploratory vs prescriptive)
- Accountability approach (empathetic processing vs goal-driven tracking)
Surface EACH dimension as a separate contradiction with its own options. The number of contradictions must scale with the actual complexity of the conflict — simple tone conflicts may be 1 item, but deep role/philosophy conflicts should be 3-5+ items.

## Single-Word Prompt Handling
If one prompt is very short (1-3 words) like "Sell", "Simplify", "Fix", "Summarize", treat it as a STRONG INTENT MODIFIER. Do not just absorb it gently — amplify that intent aggressively throughout the entire blended output. A single word like "Sell" means the entire output should be reoriented toward persuasion. "Simplify" means strip complexity everywhere.

## Multilingual Detection
If the two prompts are in DIFFERENT languages, acknowledge this in your response. In the blended output, default to the language of the longer/more detailed prompt, but mention in the mergeLog that multiple languages were detected and which language was chosen for the output.

## Response Rules

### If NO contradictions are found:
Merge everything into a cohesive, well-structured prompt. Deduplicate shared instructions and combine all unique ones.

Return ONLY this JSON:
{"type":"blended","blendedPrompt":"The full merged prompt ready to use","mergeLog":["Kept shared: description of shared instruction","Merged unique from A: description","Merged unique from B: description"],"tags":["Blended","Merged"]}

### If contradictions ARE found:
Do NOT attempt to merge yet. Instead, surface EVERY contradiction as a question for the user to resolve. Be thorough — surface ALL dimensions of conflict, not just the obvious ones.

Return ONLY this JSON:
{"type":"contradictions","contradictions":[{"point":"Short name of the conflict","promptA":"What Prompt A says about this","promptB":"What Prompt B says about this","question":"A clear question asking the user which approach to take","options":["Option based on Prompt A","Option based on Prompt B","A reasonable middle-ground option"]}],"preview":"Brief summary of what the prompts share and what conflicts"}

Each contradiction MUST have 2-3 options. Be specific about what each option means.

## Quality Rules
- The blended prompt should be BETTER than either input alone
- Maintain logical flow and coherent structure
- Don't just concatenate — truly merge and synthesize
- Use the best phrasing from whichever prompt expressed an idea better
- The final prompt should be self-contained and ready to use

NEVER return anything outside of these two JSON structures. NEVER wrap in markdown code fences.`;

const MIXER_RESOLVE_PROMPT = `# Prompt Mixer — Resolution Mode

You previously analyzed two prompts and found contradictions. The user has now resolved each contradiction by choosing their preferred option.

Your job: Merge the two prompts into ONE unified prompt, using the user's chosen resolutions for each conflict point.

## Rules
- Apply each resolution exactly as chosen
- Deduplicate shared instructions (keep one copy)
- Include all unique instructions from both prompts
- Create a cohesive, well-structured final prompt
- The result should be BETTER than either input alone

## MANDATORY OUTPUT FORMAT

Return ONLY this JSON:
{"type":"blended","blendedPrompt":"The full merged prompt with resolutions applied","mergeLog":["Resolved: conflict name → chosen option","Kept shared: description","Merged unique: description"],"tags":["Blended","Resolved"]}

NEVER return anything outside this JSON structure. NEVER wrap in markdown code fences.`;

// API key is secured in the backend (api/enhance.js) via environment variables

// Rough token estimate: ~4 chars per token (same heuristic most LLM UIs use)
function countTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

async function callGroq(messages, sysPrompt = SYSTEM_PROMPT, apiKey = null, userContext = "", model = "groq/compound") {
  try {
    let finalSysPrompt = sysPrompt;
    if (userContext.trim()) {
      finalSysPrompt += `\n\n## User Context (Apply these instructions strictly):\n${userContext.trim()}`;
    }

    if (!apiKey) {
      return { type: "enhanced", enhancedPrompt: "⚠️ Missing API Key. Please add your Groq API key in Settings.", improvements: [], tags: ["Error"] };
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1500,
        temperature: 0.6,
        top_p: 0.95,
        messages: [
          { role: "system", content: finalSysPrompt },
          ...messages,
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      const errMsg = data.error?.message || data.error || response.statusText || "Unknown API error";

      // Specifically catch 401 Unauthorized for invalid keys
      if (response.status === 401 || errMsg.toLowerCase().includes('invalid api key')) {
        return {
          type: "invalid_key",
          enhancedPrompt: `⚠️ Invalid API Key. Please check your settings.`,
          improvements: [],
          tags: ["Error"]
        };
      }

      return { type: "enhanced", enhancedPrompt: `⚠️ API Error: ${errMsg}`, improvements: ["Check your API settings"], tags: ["Error"] };
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
  const [view, setView] = useState("home"); // "home" | "updates" | "mixer" | "settings"
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

  const [copied, setCopied] = useState(false); // Can be false, "markdown", "plaintext", "md", or "txt"
  const [showCopyDropdown, setShowCopyDropdown] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [outputTokens, setOutputTokens] = useState(0);
  const textareaRef = useRef(null);

  // Refiner state
  const [refineInput, setRefineInput] = useState("");
  const [refineCount, setRefineCount] = useState(0);
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineClarify, setRefineClarify] = useState(null); // { questions, preview }
  const [refineClarifyAnswer, setRefineClarifyAnswer] = useState("");
  const refineRef = useRef(null);

  // Mixer state
  const [mixerInputA, setMixerInputA] = useState("");
  const [mixerInputB, setMixerInputB] = useState("");
  const [mixerStage, setMixerStage] = useState("input"); // "input" | "loading" | "contradictions" | "result"
  const [mixerContradictions, setMixerContradictions] = useState([]);
  const [mixerResolutions, setMixerResolutions] = useState({});
  const [mixerResult, setMixerResult] = useState(null);
  const [mixerCopied, setMixerCopied] = useState(false);
  const [mixerPreview, setMixerPreview] = useState("");
  const mixerRefA = useRef(null);
  const mixerRefB = useRef(null);

  // Settings state
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("promptcraft_api_key") || "";
    }
    return "";
  });
  const [customInstructions, setCustomInstructions] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("promptcraft_custom_instructions") || "";
    }
    return "";
  });
  const [model, setModel] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("promptcraft_model") || "groq/compound";
    }
    return "groq/compound";
  });
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempInstructions, setTempInstructions] = useState(customInstructions);
  const [tempModel, setTempModel] = useState(model);

  const [whisperModel, setWhisperModel] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("promptcraft_whisperModel") || "whisper-large-v3";
    }
    return "whisper-large-v3";
  });
  const [tempWhisperModel, setTempWhisperModel] = useState(whisperModel);

  const [micStatus, setMicStatus] = useState("idle"); // "idle" | "recording" | "processing" | "done"
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [toastMessage, setToastMessage] = useState(null);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  async function handleMicClick() {
    if (micStatus === "recording") {
      mediaRecorderRef.current?.stop();
      return;
    }

    if (!apiKey) {
      showToast("Please add your Groq API key in Settings first.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      let recStartTime = Date.now();

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const recDuration = Date.now() - recStartTime;
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        if (recDuration < 1000 || audioBlob.size === 0) {
          showToast("Recording too short. Please try again.");
          setMicStatus("idle");
          return;
        }
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setMicStatus("recording");
    } catch (err) {
      showToast("Microphone access denied. Please allow it in browser settings.");
      setMicStatus("idle");
    }
  }

  async function processAudio(blob) {
    setMicStatus("processing");
    try {
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");
      formData.append("model", whisperModel);
      formData.append("response_format", "json");

      const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error("TranscribeFail");
      }
      
      const data = await res.json();
      const rawTranscript = data.text;
      
      if (!rawTranscript) {
        throw new Error("TranscribeFail");
      }

      const cleanupSysPrompt = `You are a transcript cleanup assistant. The user has spoken their thoughts out loud and you have received the raw transcript. Your job is to clean it up and return only the corrected version — nothing else. No explanations, no preamble, no labels.

Follow these rules strictly:

1. FILLER WORDS: Remove all filler words and sounds like "umm", "ahh", "uh", "like", "you know", "so basically", "I mean", etc.

2. REPETITION: If the user repeated themselves or said something, then corrected it (e.g. "do this, no actually don't do this, do that instead"), remove the cancelled version. Keep only what the user finally meant.

3. CONSOLIDATION: If the user mentioned pieces of the same idea at different points in their speech (e.g. mentioned a subject at the start, a price in the middle, and a detail at the end), bring all those pieces together into one clear, coherent sentence or paragraph. Do not leave related information scattered.

4. MEANING: Under absolutely no circumstances should you change what the user actually meant. Do not add new information. Do not assume. Do not reinterpret. Only clean, consolidate, and restructure what was already said.

5. STRUCTURE: Output clean, readable prose. Fix obvious grammar and spelling mistakes introduced by the transcription. Proper punctuation. No bullet points unless the user was clearly listing items.

6. LENGTH: The output should be shorter than or equal to the input — never longer. You are compressing and clarifying, not expanding.

Return only the cleaned transcript. Nothing else.`;

      const cleanupRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: cleanupSysPrompt },
            { role: "user", content: rawTranscript }
          ]
        })
      });

      if (!cleanupRes.ok) {
        setInput(prev => prev ? prev + "\n" + rawTranscript : rawTranscript);
        showToast("Transcript received but cleanup failed. Raw transcript placed in box.");
        setMicStatus("idle");
        return;
      }
      
      const cleanupData = await cleanupRes.json();
      const cleanedText = cleanupData.choices?.[0]?.message?.content?.trim();
      
      if (cleanedText) {
        setInput(prev => prev ? prev + "\n" + cleanedText : cleanedText);
        setMicStatus("done");
        setTimeout(() => setMicStatus("idle"), 2000);
      } else {
        setInput(prev => prev ? prev + "\n" + rawTranscript : rawTranscript);
        showToast("Transcript received but cleanup failed. Raw transcript placed in box.");
        setMicStatus("idle");
      }
      
    } catch (err) {
      showToast("Transcription failed. Check your API key or try again.");
      setMicStatus("idle");
    }
  }

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

  useEffect(() => {
    let timeout1, timeout2;
    if (showApiKeyAlert) {
      timeout1 = setTimeout(() => setShowApiKeyAlert(false), 10000);
    }
    if (apiKeyError) {
      timeout2 = setTimeout(() => setApiKeyError(""), 10000);
    }
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [showApiKeyAlert, apiKeyError]);

  useEffect(() => {
    if (apiKey) {
      setShowApiKeyAlert(false);
      setApiKeyError("");
    }
  }, [apiKey]);

  async function handleEnhance() {
    if (!input.trim()) return;

    if (!apiKey) {
      setShowApiKeyAlert(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setShowApiKeyAlert(false);
    setApiKeyError("");

    setStage("loading");
    setResult(null);
    setQuestions([]);
    setOutputTokens(0);
    const res = await callGroq([{ role: "user", content: input }], SYSTEM_PROMPT, apiKey, customInstructions, model);

    if (res.type === "invalid_key") {
      setApiKeyError("The API key provided is invalid. Please check your Settings.");
      setResult(res);
      setStage("result");
      return;
    }

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
    if (!apiKey) return;

    const allSkipped = questions.every((_, i) => !answers[i]?.trim());
    const answersText = questions.map((q, i) => `${q} → ${answers[i] || "(skipped)"}`).join("\n");
    const combined = allSkipped ? input : `${input}\n\nAdditional context:\n${answersText}`;
    setStage("loading");
    setOutputTokens(0);

    // If all answers were skipped, use a force-enhance system prompt that won't ask questions
    const sysPrompt = allSkipped
      ? SYSTEM_PROMPT + `\n\n## OVERRIDE: FORCE ENHANCEMENT MODE\nThe user chose to skip all clarifying questions. You MUST NOT return questions. Instead, enhance the prompt immediately using your best judgment to fill in missing context. Make reasonable assumptions for audience, format, tone, and constraints. Generate the best possible enhanced prompt from what you have. Return ONLY the enhanced JSON format — NEVER the questions format.`
      : SYSTEM_PROMPT;

    let res = await callGroq([{ role: "user", content: combined }], sysPrompt, apiKey, customInstructions, model);

    if (res.type === "invalid_key") {
      setApiKeyError("The API key provided is invalid. Please check your Settings.");
      setResult(res);
      setStage("result");
      return;
    }

    // Safety net: if AI still returns questions despite force mode, retry once more with raw input only
    if (res.type === "questions" || !res.enhancedPrompt) {
      const forceMsg = `Enhance this prompt with a clear expert persona, specific step-by-step instructions, format, constraints, and any implied context. Make reasonable assumptions. Do NOT ask any questions — just enhance it:\n\n${input}`;
      res = await callGroq([{ role: "user", content: forceMsg }], sysPrompt, apiKey, customInstructions, model);
    }

    // Final fallback: if still no enhancedPrompt, construct a minimal valid result
    if (!res?.enhancedPrompt && res?.type !== "invalid_key") {
      res = {
        type: "enhanced",
        enhancedPrompt: res?.enhancedPrompt || input,
        improvements: res?.improvements || ["Unable to enhance — showing original input"],
        tags: res?.tags || ["Fallback"]
      };
    }

    setResult(res);
    setOutputTokens(countTokens(res.enhancedPrompt));
    setHistory(h => [{ input, result: res }, ...h.slice(0, 9)]);
    setStage("result");
  }

  function handleReset() {
    setInput("");
    setStage("idle");
    setResult(null);
    setQuestions([]);
    setAnswers({});
    setRefineInput("");
    setRefineCount(0);
    setRefineLoading(false);
    setRefineClarify(null);
    setRefineClarifyAnswer("");
  }

  // --- Refine Handler ---
  async function handleRefine() {
    if (!refineInput.trim() || !result?.enhancedPrompt || !apiKey) return;
    setRefineLoading(true);
    setRefineClarify(null);
    const refineMessage = `## Current Enhanced Prompt\n\n${result.enhancedPrompt}\n\n## User's Modification Request\n\n${refineInput}`;
    const res = await callGroq([{ role: "user", content: refineMessage }], REFINE_SYSTEM_PROMPT, apiKey, customInstructions, model);
    if (res.type === "questions") {
      setRefineClarify({ questions: res.questions, preview: res.preview });
      setRefineLoading(false);
    } else {
      setResult(res);
      setOutputTokens(countTokens(res.enhancedPrompt));
      setRefineCount(c => c + 1);
      setRefineInput("");
      setRefineLoading(false);
      setHistory(h => [{ input, result: res }, ...h.slice(0, 9)]);
    }
  }

  async function handleRefineClarifySubmit() {
    if (!refineClarifyAnswer.trim() || !apiKey) return;
    setRefineLoading(true);
    const refineMessage = `## Current Enhanced Prompt\n\n${result.enhancedPrompt}\n\n## User's Original Modification Request\n\n${refineInput}\n\n## User's Clarification\n\n${refineClarifyAnswer}`;
    const res = await callGroq([{ role: "user", content: refineMessage }], REFINE_SYSTEM_PROMPT, apiKey, customInstructions, model);
    setResult(res);
    setOutputTokens(countTokens(res.enhancedPrompt));
    setRefineCount(c => c + 1);
    setRefineInput("");
    setRefineClarify(null);
    setRefineClarifyAnswer("");
    setRefineLoading(false);
    setHistory(h => [{ input, result: res }, ...h.slice(0, 9)]);
  }

  // --- Mixer Handlers ---
  async function handleBlend() {
    if (!mixerInputA.trim() || !mixerInputB.trim()) return;

    if (!apiKey) {
      setShowApiKeyAlert(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setShowApiKeyAlert(false);
    setApiKeyError("");

    setMixerStage("loading");
    setMixerResult(null);
    setMixerContradictions([]);
    setMixerResolutions({});
    setMixerPreview("");

    const message = `## Prompt A\n\n${mixerInputA}\n\n## Prompt B\n\n${mixerInputB}`;
    const res = await callGroq([{ role: "user", content: message }], MIXER_SYSTEM_PROMPT, apiKey, customInstructions, model);

    if (res.type === "contradictions") {
      setMixerContradictions(res.contradictions || []);
      setMixerPreview(res.preview || "");
      setMixerResolutions({});
      setMixerStage("contradictions");
    } else {
      setMixerResult(res);
      setMixerStage("result");
    }
  }

  async function handleResolveContradictions() {
    if (!apiKey) return;
    const allResolved = mixerContradictions.every((_, i) => mixerResolutions[i] !== undefined);
    if (!allResolved) return;

    setMixerStage("loading");
    const resolutionsText = mixerContradictions.map((c, i) => {
      return `- ${c.point}: User chose → "${c.options[mixerResolutions[i]]}"`;
    }).join("\n");

    const message = `## Prompt A\n\n${mixerInputA}\n\n## Prompt B\n\n${mixerInputB}\n\n## User's Resolved Contradictions\n\n${resolutionsText}`;
    const res = await callGroq([{ role: "user", content: message }], MIXER_RESOLVE_PROMPT, apiKey, customInstructions, model);
    setMixerResult(res);
    setMixerStage("result");
  }

  function handleMixerCopy() {
    navigator.clipboard.writeText(mixerResult?.blendedPrompt || "");
    setMixerCopied(true);
    setTimeout(() => setMixerCopied(false), 2000);
  }

  function handleMixerReset() {
    setMixerInputA("");
    setMixerInputB("");
    setMixerStage("input");
    setMixerContradictions([]);
    setMixerResolutions({});
    setMixerResult(null);
    setMixerCopied(false);
    setMixerPreview("");
  }

  function downloadMixerTxt() {
    const text = mixerResult?.blendedPrompt || "";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "promptcraft-blended.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  // --- Export Actions ---
  function copyOptions(format) {
    const text = result?.enhancedPrompt || "";
    if (format === "markdown") {
      navigator.clipboard.writeText(text);
      setCopied("markdown");
    } else {
      navigator.clipboard.writeText(removeMarkdown(text));
      setCopied("plaintext");
    }
    setTimeout(() => setCopied(false), 2000);
    setShowCopyDropdown(false);
  }

  function downloadOptions(format) {
    const text = result?.enhancedPrompt || "";
    const content = format === "markdown" ? text : removeMarkdown(text);
    const filename = format === "markdown" ? "promptcraft-enhanced.md" : "promptcraft-enhanced.txt";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setCopied(format === "markdown" ? "md" : "txt");
    setTimeout(() => setCopied(false), 2000);
    setShowDownloadDropdown(false);
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

        .btn-dropdown {
          background: transparent; border: none; padding: 10px 14px; color: #CCC; font-family: 'DM Sans', sans-serif; font-size: 13px;
          border-radius: 4px; display: flex; align-items: center; justify-content: flex-start; cursor: pointer; transition: all 0.2s;
          white-space: nowrap; width: 100%; text-align: left;
        }
        .btn-dropdown:hover { background: #1A1A1A; color: #FFF; }

        .markdown-output { white-space: normal; }
        .markdown-output h1, .markdown-output h2, .markdown-output h3 { color: #FFF; margin-top: 1.2em; margin-bottom: 0.6em; }
        .markdown-output h1 { font-size: 1.4em; }
        .markdown-output h2 { font-size: 1.2em; }
        .markdown-output strong { color: #FFF; font-weight: 600; }
        .markdown-output ul { margin-left: 1.5em; margin-bottom: 1em; list-style-type: disc; }
        .markdown-output ol { margin-left: 1.5em; margin-bottom: 1em; list-style-type: decimal; }
        .markdown-output p { margin-bottom: 1em; }
        .markdown-output p:last-child { margin-bottom: 0; }
        .markdown-output code { background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.85em; }
        .markdown-output pre code { background: transparent; padding: 0; font-size: 13px; }
        .markdown-output pre { background: rgba(0,0,0,0.4); border: 1px solid #1A1A1A; padding: 12px; border-radius: 8px; overflow-x: auto; margin-bottom: 1em; }
        .markdown-output blockquote { border-left: 3px solid #4DFFB4; padding-left: 12px; margin-left: 0; color: #aaa; font-style: italic; }

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

        @keyframes savePulse {
          0% { box-shadow: 0 0 0 0 rgba(77, 255, 180, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(77, 255, 180, 0); }
          100% { box-shadow: 0 0 0 0 rgba(77, 255, 180, 0); }
        }

        .btn-saved-pulse {
          animation: savePulse 1.5s ease-out;
        }

        @keyframes micPulse {
          0% { box-shadow: 0 0 0 0 rgba(77, 255, 180, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(77, 255, 180, 0); }
          100% { box-shadow: 0 0 0 0 rgba(77, 255, 180, 0); }
        }
        .mic-recording {
          animation: micPulse 1.5s infinite;
          background: rgba(77,255,180,0.2) !important;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
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

        .refine-bar {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; background: #111; border: 1px solid #1E1E1E;
          border-radius: 8px; transition: border-color 0.2s;
        }
        .refine-bar:focus-within { border-color: #4DFFB4; }
        .refine-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #CCCCCC; font-family: 'DM Sans', sans-serif; font-size: 14px;
          line-height: 1.5;
        }
        .refine-input::placeholder { color: #333; }
        .refine-send {
          width: 32px; height: 32px; border-radius: 6px; border: 1px solid #222;
          background: transparent; color: #4DFFB4; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, border-color 0.2s;
        }
        .refine-send:hover { background: rgba(77,255,180,0.08); border-color: #4DFFB4; }
        .refine-send:disabled { opacity: 0.3; cursor: not-allowed; }
        .refine-clarify {
          margin-top: 12px; padding: 16px; background: rgba(77,255,180,0.03);
          border: 1px solid #1E3A2A; border-radius: 8px;
        }

        /* Mixer Styles */
        .mixer-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        @media (max-width: 640px) {
          .mixer-grid { grid-template-columns: 1fr; }
        }
        .mixer-ta {
          width: 100%; background: #0D0D0D; border: 1px solid #222;
          color: #F5F5F5; font-family: 'DM Sans', sans-serif;
          font-size: 14px; line-height: 1.7; resize: none; outline: none;
          min-height: 200px; padding: 16px; border-radius: 8px;
          transition: border-color 0.2s;
        }
        .mixer-ta:focus { border-color: #4DFFB4; }
        .mixer-ta::placeholder { color: #282828; }

        .mixer-center-icon {
          display: flex; align-items: center; justify-content: center;
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 36px; height: 36px; border-radius: 50%;
          background: #0A0A0A; border: 1px solid #222;
          z-index: 2;
        }
        @media (max-width: 640px) {
          .mixer-center-icon { display: none; }
        }

        .contradiction-card {
          background: #0D0D0D; border: 1px solid #1E1E1E; border-radius: 8px;
          padding: 20px; margin-bottom: 12px;
          transition: border-color 0.2s;
        }
        .contradiction-card:last-child { margin-bottom: 0; }

        .resolution-option {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border: 1px solid #1E1E1E; border-radius: 6px;
          cursor: pointer; transition: all 0.2s; background: transparent;
          width: 100%; text-align: left; color: #888;
          font-family: 'DM Sans', sans-serif; font-size: 13px; line-height: 1.5;
        }
        .resolution-option:hover { border-color: #333; color: #CCCCCC; background: #111; }
        .resolution-option.selected {
          border-color: rgba(77,255,180,0.4); color: #F5F5F5;
          background: rgba(77,255,180,0.04);
        }

        .blend-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #4DFFB4, #2AD0A0);
          color: #0A0A0A; border: none;
          padding: 14px 28px; font-family: 'DM Sans', sans-serif;
          font-weight: 700; font-size: 15px; cursor: pointer;
          border-radius: 8px; transition: transform 0.15s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .blend-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(77,255,180,0.15); }
        .blend-btn:active { transform: translateY(0); }
        .blend-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; box-shadow: none; }
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
        {toastMessage && (
          <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", zIndex: 999 }}>
            <div className="fade-in" style={{
              background: "#111", border: "1px solid #333", borderRadius: "8px",
              padding: "12px 20px", display: "flex", alignItems: "center", gap: "10px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.8)"
            }}>
              <AlertCircle size={16} color="#4DFFB4" />
              <span className="font-dm" style={{ fontSize: "14px", color: "#F5F5F5" }}>{toastMessage}</span>
            </div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setView("home")}>
          <img src="/image-removebg-preview.png" alt="PromptCraft Header Logo" style={{ width: 22, height: 22, objectFit: "contain" }} />
          <span className="font-sora" style={{ fontSize: "15px", fontWeight: 600, color: "#F5F5F5", letterSpacing: "-0.025em" }}>PromptCraft</span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button className={`btn-g font-mono${view === "mixer" ? "" : ""}`} style={{ fontSize: "11px", letterSpacing: "0.05em", color: view === "mixer" ? "#4DFFB4" : undefined }} onClick={() => { setView("mixer"); setMixerStage("input"); }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Blend size={12} />MIXER</span>
          </button>
          <button className="btn-g font-mono" style={{ fontSize: "11px", letterSpacing: "0.05em", color: view === "settings" ? "#4DFFB4" : undefined }} onClick={() => setView("settings")}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Settings size={12} />SETTINGS</span>
          </button>
          <button className="btn-g font-mono" style={{ fontSize: "11px", letterSpacing: "0.05em" }} onClick={() => setView("updates")}>CHANGELOG</button>
          <div style={{ display: "flex", gap: "8px" }}>
            <span className="tag">Microservices</span>
            <span className="tag tag-g">v 1.5.0</span>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "660px", margin: "0 auto", padding: "0 24px 100px" }}>

        {/* ── API KEY ALERTS ── */}
        {showApiKeyAlert && (
          <div style={{ backgroundColor: "rgba(255, 171, 0, 0.1)", border: "1px solid rgba(255, 171, 0, 0.3)", padding: "16px", borderRadius: "12px", marginBottom: "24px", marginTop: "24px", display: "flex", alignItems: "flex-start", gap: "12px", position: "relative" }}>
            <AlertCircle size={20} color="#FFAB00" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ flex: 1 }}>
              <h4 className="font-sora" style={{ color: "#FFAB00", fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>API Key Required</h4>
              <p className="font-dm" style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", lineHeight: 1.5 }}>
                You need a Groq API key to use PromptCraft. Your key is stored locally in your browser and never sent to our servers.
              </p>
            </div>
            <button onClick={() => setView("settings")} style={{ background: "#FFAB00", color: "#000", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer", alignSelf: "center", whiteSpace: "nowrap", marginRight: "24px" }}>
              Go to Settings
            </button>
            <button onClick={() => setShowApiKeyAlert(false)} style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "#FFAB00", cursor: "pointer", opacity: 0.7, padding: "4px" }}>
              <X size={16} />
            </button>
          </div>
        )}

        {apiKeyError && (
          <div style={{ backgroundColor: "rgba(255, 86, 86, 0.1)", border: "1px solid rgba(255, 86, 86, 0.3)", padding: "16px", borderRadius: "12px", marginBottom: "24px", marginTop: "24px", display: "flex", alignItems: "flex-start", gap: "12px", position: "relative" }}>
            <AlertCircle size={20} color="#FF5656" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ flex: 1 }}>
              <h4 className="font-sora" style={{ color: "#FF5656", fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>API Key Error</h4>
              <p className="font-dm" style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", lineHeight: 1.5 }}>
                {apiKeyError}
              </p>
            </div>
            <button onClick={() => setView("settings")} style={{ background: "#FF5656", color: "#000", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer", alignSelf: "center", whiteSpace: "nowrap", marginRight: "24px" }}>
              Check API Key
            </button>
            <button onClick={() => setApiKeyError("")} style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "#FF5656", cursor: "pointer", opacity: 0.7, padding: "4px" }}>
              <X size={16} />
            </button>
          </div>
        )}

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

                <div style={{ position: "relative" }}>
                  <textarea
                    className="main-ta"
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={"write something for my newsletter...\nhelp me ask AI to review my code...\nmake a logo brief for my startup..."}
                    onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleEnhance(); }}
                    disabled={stage === "loading"}
                    style={{ paddingBottom: "40px" }}
                  />
                  
                  <div style={{ position: "absolute", bottom: "0px", right: "0px", display: "flex", alignItems: "center", gap: "8px" }}>
                    {micStatus === "recording" && <span style={{ color: "#4DFFB4", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }} className="fade-in">Recording...</span>}
                    {micStatus === "processing" && <span style={{ color: "#4DFFB4", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }} className="fade-in">Transcribing...</span>}
                    <button 
                      onClick={handleMicClick}
                      className={micStatus === "recording" ? "mic-recording" : ""}
                      title={micStatus === "idle" ? "Record voice input" : undefined}
                      style={{ 
                        width: "36px", height: "36px", borderRadius: "50%", border: "none", 
                        background: micStatus === "done" ? "#4DFFB4" : "rgba(77,255,180,0.1)", 
                        color: micStatus === "done" ? "#000" : "#4DFFB4", 
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: micStatus === "processing" ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        opacity: micStatus === "processing" ? 0.7 : 1
                      }}
                      disabled={micStatus === "processing"}
                    >
                      {micStatus === "processing" ? <Loader2 size={16} className="spinner" /> : (micStatus === "done" ? <Check size={16} /> : <Mic size={16} />)}
                    </button>
                  </div>
                </div>

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

                      {/* Download Dropdown */}
                      <div style={{ position: "relative" }}>
                        <button className="btn-s" onClick={() => { setShowDownloadDropdown(!showDownloadDropdown); setShowCopyDropdown(false); }} title="Download" style={{ padding: "0 14px", height: "100%" }}>
                          {copied === "md" || copied === "txt" ? <Check size={14} color="#4DFFB4" /> : <><Download size={14} /> <ChevronDown size={14} style={{ marginLeft: 4, opacity: 0.6 }} /></>}
                        </button>
                        {showDownloadDropdown && (
                          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#111", border: "1px solid #333", borderRadius: "8px", padding: "6px", display: "flex", flexDirection: "column", gap: "2px", zIndex: 10, minWidth: "160px", boxShadow: "0 8px 16px rgba(0,0,0,0.6)" }}>
                            <button className="btn-dropdown" onClick={() => downloadOptions("markdown")}>Download as .md</button>
                            <button className="btn-dropdown" onClick={() => downloadOptions("plaintext")}>Download as .txt</button>
                          </div>
                        )}
                      </div>

                      {/* Copy Dropdown */}
                      <div style={{ position: "relative" }}>
                        <button className="btn-p" onClick={() => { setShowCopyDropdown(!showCopyDropdown); setShowDownloadDropdown(false); }} style={{ minWidth: "120px", height: "100%" }}>
                          {copied === "markdown" || copied === "plaintext" ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy <ChevronDown size={14} style={{ marginLeft: 4, opacity: 0.6 }} /></>}
                        </button>
                        {showCopyDropdown && (
                          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#111", border: "1px solid #333", borderRadius: "8px", padding: "6px", display: "flex", flexDirection: "column", gap: "2px", zIndex: 10, minWidth: "180px", boxShadow: "0 8px 16px rgba(0,0,0,0.6)" }}>
                            <button className="btn-dropdown" onClick={() => copyOptions("markdown")}>Copy as Markdown</button>
                            <button className="btn-dropdown" onClick={() => copyOptions("plaintext")}>Copy as Plain Text</button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  <hr className="divider" style={{ marginBottom: "20px" }} />

                  <div className="font-dm markdown-output" style={{ fontSize: "15px", lineHeight: 1.8, color: "#CCCCCC", wordBreak: "break-word" }}>
                    <ReactMarkdown>{result.enhancedPrompt}</ReactMarkdown>
                  </div>

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
                <div style={{ padding: "14px 18px", border: "1px solid #161616", borderRadius: "6px", marginBottom: "18px" }}>
                  <div className="font-mono" style={{ fontSize: "10px", color: "#252525", letterSpacing: "0.1em", marginBottom: "6px" }}>ORIGINAL INPUT</div>
                  <p className="font-dm" style={{ fontSize: "13px", color: "#3A3A3A", lineHeight: 1.6, fontStyle: "italic" }}>{input}</p>
                </div>

                {/* ── REFINE SECTION ── */}
                <div className="card" style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <Wand2 size={14} color="#4DFFB4" />
                    <span className="font-mono" style={{ fontSize: "10px", color: "#4DFFB4", letterSpacing: "0.12em" }}>
                      REFINE PROMPT {refineCount > 0 && <span style={{ color: "#666" }}>· v{refineCount + 1}</span>}
                    </span>
                  </div>

                  <div className="refine-bar">
                    <input
                      ref={refineRef}
                      className="refine-input"
                      placeholder="Add, remove, or change something..."
                      value={refineInput}
                      onChange={e => setRefineInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleRefine()}
                      disabled={refineLoading}
                    />
                    <button className="refine-send" onClick={handleRefine} disabled={refineLoading || !refineInput.trim()}>
                      {refineLoading ? <span className="dot" /> : <Send size={14} />}
                    </button>
                  </div>

                  {refineLoading && (
                    <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="dot" /><span className="dot" /><span className="dot" />
                      <span className="font-dm" style={{ fontSize: "13px", color: "#444" }}>Refining your prompt...</span>
                    </div>
                  )}

                  {refineClarify && (
                    <div className="refine-clarify">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <AlertTriangle size={14} color="#FFD666" />
                        <span className="font-mono" style={{ fontSize: "10px", color: "#FFD666", letterSpacing: "0.1em" }}>CONTRADICTION DETECTED</span>
                      </div>
                      {refineClarify.preview && (
                        <p className="font-dm" style={{ fontSize: "13px", color: "#888", marginBottom: "12px", lineHeight: 1.6 }}>{refineClarify.preview}</p>
                      )}
                      {refineClarify.questions.map((q, i) => (
                        <p key={i} className="font-dm" style={{ fontSize: "14px", color: "#CCCCCC", marginBottom: "12px", lineHeight: 1.6 }}>{q}</p>
                      ))}
                      <div className="refine-bar" style={{ marginTop: "10px" }}>
                        <input
                          className="refine-input"
                          placeholder="Your answer..."
                          value={refineClarifyAnswer}
                          onChange={e => setRefineClarifyAnswer(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleRefineClarifySubmit()}
                        />
                        <button className="refine-send" onClick={handleRefineClarifySubmit} disabled={!refineClarifyAnswer.trim()}>
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="font-dm" style={{ fontSize: "11px", color: "#2A2A2A", marginTop: "10px" }}>
                    Tell the AI what to add, remove, or change in the enhanced prompt.
                  </div>
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
        {/* ── SETTINGS VIEW ── */}
        {view === "settings" && (
          <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 0 20px" }}>
            <div style={{ marginBottom: "40px" }}>
              <h2 className="font-sora" style={{ fontSize: "32px", fontWeight: 600, color: "#F5F5F5", marginBottom: "12px", letterSpacing: "-0.02em" }}>
                Settings
              </h2>
              <p className="font-dm" style={{ fontSize: "15px", color: "#888888", lineHeight: 1.6 }}>
                Configure your API keys and default AI instructions.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

              {/* API Key Section */}
              <div className="card" style={{ padding: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertCircle size={16} color="#888" />
                  </div>
                  <h3 className="font-sora" style={{ fontSize: "18px", color: "#F5F5F5", fontWeight: 600 }}>Groq API Key</h3>
                </div>
                <p className="font-dm" style={{ fontSize: "14px", color: "#888", marginBottom: "24px", lineHeight: 1.6 }}>
                  To use PromptCraft, you run calls directly from your browser to Groq.
                  Your key is stored securely in your browser's Local Storage and is never sent to our servers.
                  Get a free key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: "#4DFFB4", textDecoration: "none" }}>console.groq.com</a>.
                </p>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "12px" }}>
                    <div style={{ position: "relative" }}>
                      <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "4px" }}>API Key</label>
                      <input
                        type={showKey ? "text" : "password"}
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        placeholder="gsk_..."
                        className="font-mono text-in"
                        style={{ paddingRight: "48px", width: "100%" }}
                      />
                      <button
                        onClick={() => setShowKey(!showKey)}
                        style={{ position: "absolute", right: "12px", top: "70%", transform: "translateY(-50%)", background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "12px" }}
                        title={showKey ? "Hide Key" : "Show Key"}
                      >
                        {showKey ? "HIDE" : "SHOW"}
                      </button>
                    </div>

                    <div style={{ position: "relative" }}>
                      <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "4px" }}>Model</label>
                      <input
                        type="text"
                        value={tempModel}
                        onChange={(e) => setTempModel(e.target.value)}
                        placeholder="e.g. groq/compound"
                        className="font-mono text-in"
                        style={{ width: "100%" }}
                      />
                    </div>

                    <div style={{ position: "relative" }}>
                      <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "4px" }}>Whisper Model</label>
                      <select
                        value={tempWhisperModel}
                        onChange={(e) => setTempWhisperModel(e.target.value)}
                        className="font-mono text-in"
                        style={{ width: "100%", paddingRight: "32px", appearance: "none", cursor: "pointer" }}
                      >
                        <option value="whisper-large-v3">whisper-large-v3</option>
                        <option value="whisper-large-v3-turbo">whisper-large-v3-turbo</option>
                      </select>
                      <ChevronDown size={14} color="#666" style={{ position: "absolute", right: "12px", top: "70%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (tempApiKey.trim() || tempModel.trim()) {
                        if (tempApiKey.trim()) {
                          localStorage.setItem("promptcraft_api_key", tempApiKey.trim());
                          setApiKey(tempApiKey.trim());
                        }
                        if (tempModel.trim()) {
                          localStorage.setItem("promptcraft_model", tempModel.trim());
                          setModel(tempModel.trim());
                        }
                        
                        localStorage.setItem("promptcraft_whisperModel", tempWhisperModel);
                        setWhisperModel(tempWhisperModel);
                        
                        setSettingsSaved(true);
                        setTimeout(() => setSettingsSaved(false), 2500);
                      }
                    }}
                    className={`btn-p ${settingsSaved ? 'btn-saved-pulse' : ''}`}
                    style={{
                      background: settingsSaved ? "#4DFFB4" : "#F5F5F5",
                      color: "#000",
                      fontWeight: 600,
                      padding: "0 24px",
                      minWidth: "120px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      transform: settingsSaved ? "scale(1.05)" : "scale(1)",
                      alignSelf: "flex-end",
                      marginBottom: "4px"
                    }}
                  >
                    {settingsSaved ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Check size={18} color="#000" />
                        <span>Saved!</span>
                      </div>
                    ) : "Save"}
                  </button>
                </div>
                {apiKey && (
                  <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to clear your API key?")) {
                          localStorage.removeItem("promptcraft_api_key");
                          setApiKey("");
                          setTempApiKey("");
                        }
                      }}
                      style={{ background: "none", border: "none", color: "#FF5656", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <Circle size={12} /> Clear stored key
                    </button>
                  </div>
                )}
              </div>

              {/* Custom Instructions Section */}
              <div className="card" style={{ padding: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={16} color="#888" />
                  </div>
                  <h3 className="font-sora" style={{ fontSize: "18px", color: "#F5F5F5", fontWeight: 600 }}>Global AI Instructions</h3>
                </div>
                <p className="font-dm" style={{ fontSize: "14px", color: "#888", marginBottom: "24px", lineHeight: 1.6 }}>
                  Set custom instructions that will be injected into every prompt enhancement.
                  Use this to enforce a specific writing style, target audience context, or project constraints across all your prompts.
                </p>

                <div className="input-wrap" style={{ marginBottom: "16px" }}>
                  <textarea
                    value={tempInstructions}
                    onChange={(e) => setTempInstructions(e.target.value)}
                    placeholder="e.g., Always use B2B SaaS terminology. Avoid emojis. Optimize for senior engineering audiences."
                    className="font-dm text-in"
                    style={{ minHeight: "150px", resize: "vertical" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#555", marginTop: "8px", padding: "0 4px" }}>
                    <span className="font-mono">{tempInstructions.length} chars</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  {customInstructions && tempInstructions !== customInstructions && (
                    <button
                      className="btn-g"
                      onClick={() => setTempInstructions(customInstructions)}
                    >
                      Discard Changes
                    </button>
                  )}
                  <button
                    onClick={() => {
                      localStorage.setItem("promptcraft_custom_instructions", tempInstructions);
                      setCustomInstructions(tempInstructions);
                      setSettingsSaved(true);
                      setTimeout(() => setSettingsSaved(false), 2000);
                    }}
                    className="btn-p"
                    style={{ background: "#F5F5F5", color: "#000", fontWeight: 600 }}
                  >
                    Save Instructions
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

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
                  <span className="font-sora" style={{ fontSize: "20px", color: "#4DFFB4", fontWeight: 600 }}>v 1.5.0</span>
                  <span className="tag tag-g">LATEST</span>
                </div>
                <span className="font-mono" style={{ fontSize: "11px", color: "#444" }}>MAR 11, 2026</span>
              </div>
              <ul className="font-dm" style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong>Voice Input</strong> — Dictate your prompt using the new mic button (bottom right of input box). Thoughts are transcribed and structured automatically via Groq Whisper models.</li>
                <li><strong>Whisper Models</strong> — Added configuration setting to switch between `whisper-large-v3` and `whisper-large-v3-turbo` models.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: "32px", borderColor: "#181818", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="font-sora" style={{ fontSize: "20px", color: "#F5F5F5", fontWeight: 600 }}>v 1.4.1</span>
                </div>
                <span className="font-mono" style={{ fontSize: "11px", color: "#444" }}>MAR 10, 2026</span>
              </div>
              <ul className="font-dm" style={{ color: "#888888", fontSize: "15px", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong>Markdown Rendering</strong> — Rendered prompt output as properly formatted Markdown instead of raw text, turning headers and lists into visual structures.</li>
                <li><strong>Export Formats</strong> — Replaced simple buttons with dropdown menus to allow "Copy as Markdown" vs "Copy as Plain Text" and "Download as .md" vs "Download as .txt".</li>
              </ul>
            </div>

            <div className="card" style={{ padding: "32px", borderColor: "#181818", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="font-sora" style={{ fontSize: "20px", color: "#F5F5F5", fontWeight: 600 }}>v 1.4.0</span>
                </div>
                <span className="font-mono" style={{ fontSize: "11px", color: "#444" }}>MAR 10, 2026</span>
              </div>
              <ul className="font-dm" style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong>Dynamic Model Selection</strong> — You can now specify any custom Groq model in the Settings view to use for prompt enhancement and evaluation.</li>
                <li><strong>UI Enhancements</strong> — Replaced the text-only save button with a sleek pulse animation and checkmark to provide satisfying visual feedback when saving settings.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: "32px", borderColor: "#181818", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="font-sora" style={{ fontSize: "20px", color: "#F5F5F5", fontWeight: 600 }}>v 1.3.2</span>
                </div>
                <span className="font-mono" style={{ fontSize: "11px", color: "#444" }}>MAR 07, 2026</span>
              </div>
              <ul className="font-dm" style={{ color: "#888888", fontSize: "15px", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong>Settings Tab</strong> — New centralized Settings view accessible via the navigation bar.</li>
                <li><strong>User API Keys</strong> — Moved away from a shared server key. Users now provide their own Groq API key securely saved in their browser's local storage.</li>
                <li><strong>Custom Instructions</strong> — You can now save default custom AI instructions that will be injected into every prompt enhancement (e.g., preferred target audience or coding style).</li>
                <li><strong>Key Validation</strong> — Added contextual alert banners to prompt users to enter a key if missing or invalid.</li>
                <li><strong>Client-Side Architecture</strong> — Deleted the serverless API proxy resulting in direct, faster API requests from the browser to Groq.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: "32px", borderColor: "#181818", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="font-sora" style={{ fontSize: "20px", color: "#F5F5F5", fontWeight: 600 }}>v 1.3.1</span>
                </div>
                <span className="font-mono" style={{ fontSize: "11px", color: "#444" }}>MAR 05, 2026</span>
              </div>
              <ul className="font-dm" style={{ color: "#888888", fontSize: "15px", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong>Skip All Fix</strong> — Fixed critical bug where skipping all clarifying questions produced an empty output. Now generates a best-effort enhanced prompt immediately.</li>
                <li><strong>Smarter Questions</strong> — Clarifying questions are now domain-aware. Technical prompts ask about stack/tools, creative prompts ask about style constraints — no more generic "Who is the audience?"</li>
                <li><strong>Deeper Conflict Analysis</strong> — The Mixer now decomposes complex role conflicts into all separable dimensions instead of surfacing just one shallow contradiction.</li>
                <li><strong>Multilingual Detection</strong> — Mixer now detects when prompts are in different languages and notes the language choice in the merge log.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: "32px", borderColor: "#181818", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="font-sora" style={{ fontSize: "20px", color: "#F5F5F5", fontWeight: 600 }}>v 1.3.0</span>
                </div>
                <span className="font-mono" style={{ fontSize: "11px", color: "#444" }}>MAR 05, 2026</span>
              </div>
              <ul className="font-dm" style={{ color: "#888888", fontSize: "15px", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong>Prompt Mixer</strong> — Paste two prompts and blend them into one. Shared instructions are deduplicated, unique ones are merged seamlessly.</li>
                <li><strong>Contradiction Resolution</strong> — When two prompts conflict (e.g., "write short" vs "write long"), the Mixer surfaces each contradiction as interactive questions with options for you to choose.</li>
                <li><strong>Merge Intelligence</strong> — The AI synthesizes the best phrasing from both inputs, creating a blended prompt that's better than either original.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: "32px", borderColor: "#181818", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="font-sora" style={{ fontSize: "20px", color: "#F5F5F5", fontWeight: 600 }}>v 1.2.0</span>
                </div>
                <span className="font-mono" style={{ fontSize: "11px", color: "#444" }}>MAR 05, 2026</span>
              </div>
              <ul className="font-dm" style={{ color: "#888888", fontSize: "15px", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong>Prompt Refiner</strong> — After getting your enhanced prompt, refine it with natural language. Add, remove, or tweak anything without starting over.</li>
                <li><strong>Contradiction Detection</strong> — If your refinement conflicts with your original intent, the AI asks a clarifying question before making changes.</li>
                <li><strong>Iterative Refinement Loop</strong> — Keep refining as many times as you want with version tracking (v2, v3, v4...).</li>
              </ul>
            </div>

            <div className="card" style={{ padding: "32px", borderColor: "#181818", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="font-sora" style={{ fontSize: "20px", color: "#F5F5F5", fontWeight: 600 }}>v 1.1.2</span>
                </div>
                <span className="font-mono" style={{ fontSize: "11px", color: "#444" }}>MAR 05, 2026</span>
              </div>
              <ul className="font-dm" style={{ color: "#888888", fontSize: "15px", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong>Simplified Export</strong> — Removed the Copy as Plaintext button for a cleaner, less cluttered export bar.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: "32px", borderColor: "#181818", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="font-sora" style={{ fontSize: "20px", color: "#F5F5F5", fontWeight: 600 }}>v 1.1.1</span>
                </div>
                <span className="font-mono" style={{ fontSize: "11px", color: "#444" }}>MAR 05, 2026</span>
              </div>
              <ul className="font-dm" style={{ color: "#888888", fontSize: "15px", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
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

        {/* ── MIXER VIEW ── */}
        {view === "mixer" && (
          <div className="fade-in" style={{ paddingTop: "60px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "20px", cursor: "pointer" }} onClick={() => setView("home")} className="btn-g">
              <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} />
              <span className="font-dm" style={{ fontSize: "14px", fontWeight: 500 }}>Back to App</span>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <span className="font-mono" style={{ fontSize: "11px", color: "#4DFFB4", letterSpacing: "0.14em" }}>PROMPT MIXER</span>
            </div>
            <h2 className="font-sora" style={{ fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 700, color: "#F5F5F5", marginBottom: "12px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Blend two prompts<br />into one.
            </h2>
            <p className="font-dm" style={{ fontSize: "15px", color: "#555", lineHeight: 1.65, maxWidth: "420px", marginBottom: "36px" }}>
              Paste two prompts below. We'll merge shared instructions, combine unique ones,
              and help you resolve any contradictions.
            </p>

            {/* MIXER INPUT STAGE */}
            {(mixerStage === "input" || mixerStage === "loading") && (
              <div className="fade-in">
                <div style={{ position: "relative" }}>
                  <div className="mixer-grid">
                    <div>
                      <div className="font-mono" style={{ fontSize: "10px", color: "#4DFFB4", letterSpacing: "0.12em", marginBottom: "8px" }}>PROMPT A</div>
                      <textarea
                        className="mixer-ta"
                        ref={mixerRefA}
                        value={mixerInputA}
                        onChange={e => setMixerInputA(e.target.value)}
                        placeholder={"Paste your first prompt here..."}
                        disabled={mixerStage === "loading"}
                      />
                      {mixerInputA.trim() && (
                        <div className="font-mono" style={{ fontSize: "10px", color: "#333", marginTop: "6px" }}>
                          {countTokens(mixerInputA).toLocaleString()} tok
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-mono" style={{ fontSize: "10px", color: "#4DFFB4", letterSpacing: "0.12em", marginBottom: "8px" }}>PROMPT B</div>
                      <textarea
                        className="mixer-ta"
                        ref={mixerRefB}
                        value={mixerInputB}
                        onChange={e => setMixerInputB(e.target.value)}
                        placeholder={"Paste your second prompt here..."}
                        disabled={mixerStage === "loading"}
                      />
                      {mixerInputB.trim() && (
                        <div className="font-mono" style={{ fontSize: "10px", color: "#333", marginTop: "6px" }}>
                          {countTokens(mixerInputB).toLocaleString()} tok
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mixer-center-icon">
                    <ArrowLeftRight size={14} color="#4DFFB4" />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", marginTop: "28px" }}>
                  <button className="blend-btn" onClick={handleBlend} disabled={mixerStage === "loading" || !mixerInputA.trim() || !mixerInputB.trim()}>
                    {mixerStage === "loading"
                      ? <span style={{ display: "flex", gap: "6px", alignItems: "center" }}><span className="dot" /><span className="dot" /><span className="dot" /><span className="font-dm">Analyzing prompts...</span></span>
                      : <><Blend size={15} />Blend Prompts</>
                    }
                  </button>
                </div>
              </div>
            )}

            {/* CONTRADICTIONS STAGE */}
            {mixerStage === "contradictions" && (
              <div className="fade-in">
                <div className="card" style={{ padding: "28px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                    <div style={{
                      width: 34, height: 34, border: "1px solid #332E1E", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      background: "rgba(255,214,102,0.04)",
                    }}>
                      <AlertTriangle size={14} color="#FFD666" />
                    </div>
                    <div>
                      <div className="font-sora" style={{ fontSize: "16px", fontWeight: 600, color: "#F5F5F5", letterSpacing: "-0.02em", marginBottom: "3px" }}>
                        Contradictions Detected
                      </div>
                      <div className="font-dm" style={{ fontSize: "13px", color: "#555", lineHeight: 1.5 }}>
                        Choose your preference for each conflict to continue blending.
                      </div>
                    </div>
                  </div>

                  {mixerPreview && (
                    <div style={{ background: "#0A0A0A", border: "1px solid #1A1A1A", borderRadius: "6px", padding: "12px 16px", marginBottom: "20px" }}>
                      <div className="font-mono" style={{ fontSize: "10px", color: "#4DFFB4", letterSpacing: "0.1em", marginBottom: "6px" }}>ANALYSIS</div>
                      <p className="font-dm" style={{ fontSize: "13px", color: "#555", lineHeight: 1.6 }}>{mixerPreview}</p>
                    </div>
                  )}

                  {mixerContradictions.map((c, idx) => (
                    <div key={idx} className="contradiction-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                        <span className="font-mono" style={{ fontSize: "10px", color: "#FFD666", letterSpacing: "0.08em" }}>
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="font-sora" style={{ fontSize: "14px", fontWeight: 600, color: "#F5F5F5" }}>{c.point}</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                        <div style={{ background: "#111", border: "1px solid #1A1A1A", borderRadius: "6px", padding: "10px 14px" }}>
                          <div className="font-mono" style={{ fontSize: "9px", color: "#4DFFB4", letterSpacing: "0.1em", marginBottom: "4px" }}>PROMPT A</div>
                          <p className="font-dm" style={{ fontSize: "12px", color: "#888", lineHeight: 1.5 }}>{c.promptA}</p>
                        </div>
                        <div style={{ background: "#111", border: "1px solid #1A1A1A", borderRadius: "6px", padding: "10px 14px" }}>
                          <div className="font-mono" style={{ fontSize: "9px", color: "#4DFFB4", letterSpacing: "0.1em", marginBottom: "4px" }}>PROMPT B</div>
                          <p className="font-dm" style={{ fontSize: "12px", color: "#888", lineHeight: 1.5 }}>{c.promptB}</p>
                        </div>
                      </div>

                      <div className="font-dm" style={{ fontSize: "13px", color: "#CCCCCC", marginBottom: "10px", lineHeight: 1.5 }}>
                        {c.question}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {c.options?.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            className={`resolution-option${mixerResolutions[idx] === optIdx ? " selected" : ""}`}
                            onClick={() => setMixerResolutions(r => ({ ...r, [idx]: optIdx }))}
                          >
                            {mixerResolutions[idx] === optIdx
                              ? <CheckCircle2 size={14} color="#4DFFB4" style={{ flexShrink: 0 }} />
                              : <Circle size={14} color="#333" style={{ flexShrink: 0 }} />
                            }
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "24px" }}>
                    <button className="btn-g" onClick={handleMixerReset}><RotateCcw size={12} />Start over</button>
                    <button
                      className="blend-btn"
                      onClick={handleResolveContradictions}
                      disabled={!mixerContradictions.every((_, i) => mixerResolutions[i] !== undefined)}
                      style={{ padding: "12px 24px", fontSize: "14px" }}
                    >
                      <Blend size={14} />Blend with Resolutions
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MIXER RESULT STAGE */}
            {mixerStage === "result" && mixerResult && (
              <div className="fade-in">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                  <button className="btn-g" onClick={handleMixerReset}><RotateCcw size={12} />New blend</button>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {mixerResult.tags?.map((t, i) => <span key={i} className="tag">{t}</span>)}
                  </div>
                </div>

                {/* Blended prompt */}
                <div className="card" style={{ padding: "28px", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "20px" }}>
                    <div>
                      <div className="font-mono" style={{ fontSize: "10px", color: "#4DFFB4", letterSpacing: "0.12em", marginBottom: "5px" }}>BLENDED PROMPT</div>
                      <div className="font-sora" style={{ fontSize: "18px", fontWeight: 600, color: "#F5F5F5", letterSpacing: "-0.025em" }}>Ready to use</div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn-s" onClick={downloadMixerTxt} title="Download .txt" style={{ padding: "0 14px" }}>
                        <Download size={14} />
                      </button>
                      <button className="btn-p" onClick={handleMixerCopy} style={{ minWidth: "96px" }}>
                        {mixerCopied ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy</>}
                      </button>
                    </div>
                  </div>

                  <hr className="divider" style={{ marginBottom: "20px" }} />

                  <p className="font-dm" style={{ fontSize: "15px", lineHeight: 1.8, color: "#CCCCCC", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {mixerResult.blendedPrompt}
                  </p>

                  <hr className="divider" style={{ marginTop: "20px", marginBottom: "12px" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <span className="font-mono" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "#3A3A3A" }}>
                      <span style={{ color: "#555" }}>A</span>
                      <span style={{ color: "#888", fontWeight: 600 }}>{countTokens(mixerInputA).toLocaleString()}</span>
                      <span style={{ color: "#333" }}>tok</span>
                    </span>
                    <span style={{ color: "#222", fontSize: "10px" }}>+</span>
                    <span className="font-mono" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "#3A3A3A" }}>
                      <span style={{ color: "#555" }}>B</span>
                      <span style={{ color: "#888", fontWeight: 600 }}>{countTokens(mixerInputB).toLocaleString()}</span>
                      <span style={{ color: "#333" }}>tok</span>
                    </span>
                    <span style={{ color: "#222", fontSize: "10px" }}>→</span>
                    <span className="font-mono" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "#3A3A3A" }}>
                      <span style={{ color: "#4DFFB4", opacity: 0.8 }}>OUT</span>
                      <span style={{ color: "#4DFFB4", fontWeight: 600 }}>{countTokens(mixerResult.blendedPrompt).toLocaleString()}</span>
                      <span style={{ color: "#333" }}>tok</span>
                    </span>
                  </div>
                </div>

                {/* Merge Log */}
                {mixerResult.mergeLog?.length > 0 && (
                  <div className="card" style={{ padding: "20px 24px", marginBottom: "14px" }}>
                    <div className="font-mono" style={{ fontSize: "10px", color: "#2A2A2A", letterSpacing: "0.12em", marginBottom: "14px" }}>
                      MERGE LOG
                    </div>
                    {mixerResult.mergeLog.map((log, i) => (
                      <div key={i} className="imp-row">
                        <div style={{
                          width: 20, height: 20, border: "1px solid #1E1E1E", borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px",
                        }}>
                          <span className="font-mono" style={{ fontSize: "9px", color: "#4DFFB4" }}>{i + 1}</span>
                        </div>
                        <p className="font-dm" style={{ fontSize: "13px", color: "#555", lineHeight: 1.65 }}>{log}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Original Inputs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ padding: "14px 18px", border: "1px solid #161616", borderRadius: "6px" }}>
                    <div className="font-mono" style={{ fontSize: "10px", color: "#252525", letterSpacing: "0.1em", marginBottom: "6px" }}>ORIGINAL PROMPT A</div>
                    <p className="font-dm" style={{ fontSize: "12px", color: "#3A3A3A", lineHeight: 1.5, fontStyle: "italic", maxHeight: "100px", overflow: "hidden", textOverflow: "ellipsis" }}>{mixerInputA}</p>
                  </div>
                  <div style={{ padding: "14px 18px", border: "1px solid #161616", borderRadius: "6px" }}>
                    <div className="font-mono" style={{ fontSize: "10px", color: "#252525", letterSpacing: "0.1em", marginBottom: "6px" }}>ORIGINAL PROMPT B</div>
                    <p className="font-dm" style={{ fontSize: "12px", color: "#3A3A3A", lineHeight: 1.5, fontStyle: "italic", maxHeight: "100px", overflow: "hidden", textOverflow: "ellipsis" }}>{mixerInputB}</p>
                  </div>
                </div>
              </div>
            )}

            {/* LOADING SKELETON for Mixer */}
            {mixerStage === "loading" && (
              <div className="fade-in s1" style={{ marginTop: "14px" }}>
                <div className="card skeleton-pulse" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div className="skeleton-block" style={{ width: "100px", height: "10px", marginBottom: "8px" }} />
                      <div className="skeleton-block" style={{ width: "140px", height: "18px" }} />
                    </div>
                    <div className="skeleton-block" style={{ width: "90px", height: "36px", borderRadius: "6px" }} />
                  </div>
                  <hr className="divider" />
                  <div>
                    <div className="skeleton-block" style={{ width: "100%", height: "14px", marginBottom: "12px" }} />
                    <div className="skeleton-block" style={{ width: "90%", height: "14px", marginBottom: "12px" }} />
                    <div className="skeleton-block" style={{ width: "95%", height: "14px", marginBottom: "12px" }} />
                    <div className="skeleton-block" style={{ width: "60%", height: "14px" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ marginTop: "80px", paddingTop: "24px", borderTop: "1px solid #141414", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span className="font-mono" style={{ fontSize: "11px", color: "#444", letterSpacing: "0.08em" }}>PROMPTCRAFT · v1.5.0</span>
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
