---
name: prompt-enhancer
description: >
  Transforms vague, short, or weak user prompts into highly optimized, LLM-efficient prompts
  that are ~10x more effective. Use this skill whenever the user asks to "improve my prompt",
  "make this prompt better", "optimize this for AI", "rewrite my prompt", "enhance prompt",
  or shares a prompt and asks for feedback. Also trigger when users say things like "this isn't
  working well with AI", "ChatGPT/Claude keeps misunderstanding me", or "how do I get better results".
  Even if the user just pastes a short prompt and seems frustrated, assume they want enhancement.
---

# Prompt Enhancer Skill

Transform weak prompts into powerful, LLM-optimized instructions that get dramatically better results.

---

## Core Philosophy

Most user prompts fail because they are:
- **Too vague** ("write me a summary" → of what? for whom? how long?)
- **Missing context** (no role, audience, format, constraints)
- **Ambiguous intent** (the user knows what they mean; the model doesn't)
- **Single-shot** (no structure to guide reasoning)
- **Under-constrained** (no output format, length, tone)

A 10x prompt fixes all of this systematically.

---

## Step 1: Gather Context (Rapid Interview)

Before enhancing, ask the user **up to 3 quick questions** if the prompt is too sparse. Do NOT ask more than 3. Ask them all at once.

Key things to uncover:
1. **Goal** — What outcome do they actually want?
2. **Audience** — Who will read/use the output?
3. **Format** — How should the output be structured?
4. **Constraints** — Tone, length, style, things to avoid?
5. **Model** — Are they using Claude, GPT-4, Gemini, open-source? (Affects prompt style)

If the prompt already contains enough context, skip directly to Step 2.

---

## Step 2: Analyze the Original Prompt

Before rewriting, briefly diagnose what's weak:

| Issue | Example | Fix |
|-------|---------|-----|
| No role assigned | "Write a bio" | "You are a professional copywriter..." |
| Missing audience | "Explain this concept" | "Explain to a 10-year-old / senior engineer..." |
| No format | "Summarize this" | "Summarize in 3 bullet points with a 1-line TL;DR" |
| Ambiguous task | "Make it better" | "Rewrite to be more concise, professional, and action-oriented" |
| No constraints | "Write an email" | "Write a 150-word follow-up email, formal tone, no jargon" |
| Missing examples | "Generate ideas" | Provide 1-2 examples of the style/format desired |
| No chain-of-thought | Complex reasoning task | Add "Think step by step" or structured reasoning prompts |

---

## Step 3: Apply Enhancement Techniques

Use the relevant techniques from this toolkit:

### 🎭 Role Prompting
Assign a clear expert identity.
```
❌ "Write a marketing strategy"
✅ "You are a senior growth marketer with 10 years of B2B SaaS experience. Write a..."
```

### 🎯 Task Decomposition
Break complex asks into clear steps.
```
❌ "Analyze my business"
✅ "Analyze my business in three parts:
    1. Identify the top 3 strengths
    2. Identify the top 3 risks
    3. Recommend 2 actionable next steps"
```

### 📐 Format Specification
Always specify the exact desired output format.
```
❌ "Give me ideas"
✅ "Generate exactly 5 ideas. For each, provide:
    - Idea name (bold)
    - 2-sentence description
    - One potential risk"
```

### 🔗 Chain-of-Thought Anchoring
For reasoning tasks, require visible thinking.
```
❌ "Is this a good decision?"
✅ "Reason through this decision step by step before giving your final recommendation."
```

### 🚧 Constraint Injection
Add explicit boundaries.
```
❌ "Write a blog post about AI"
✅ "Write a 600-word blog post about AI for non-technical founders.
    Tone: conversational, optimistic. Avoid: jargon, hype words like 'revolutionize'.
    Must include: one real-world example, one actionable takeaway."
```

### 🧪 Few-Shot Examples (when applicable)
Show the model what good output looks like.
```
"Here is an example of the style I want:
[EXAMPLE INPUT]: ...
[EXAMPLE OUTPUT]: ...
Now do the same for: [ACTUAL INPUT]"
```

### 🔁 Iterative Refinement Framing
For creative/complex tasks, invite iteration.
```
"Generate a first draft. Then critique it yourself and produce a revised version."
```

---

## Step 4: Write the Enhanced Prompt

Structure the output as:

```
## ✨ Enhanced Prompt

[The full, ready-to-use optimized prompt]

---

## 🔍 What Changed

- [Change 1 + why it matters]
- [Change 2 + why it matters]
- [Change 3 + why it matters]

---

## 💡 Pro Tip (optional)
[One power-user tip for this specific use case]
```

---

## Output Rules

- Always output the **complete enhanced prompt**, ready to paste. No placeholders like "[insert here]" without clear instructions.
- Keep the enhanced prompt **self-contained** — it should work even without the user's explanation.
- Match the **verbosity of the enhanced prompt to the task complexity**: a simple task shouldn't need a 500-word prompt.
- **Never strip the user's original intent** — only amplify and clarify it.
- If the user is using a **specific model** (GPT-4, Claude, Gemini), optimize for that model's known strengths:
  - *Claude*: Responds well to XML tags (`<task>`, `<format>`, `<constraints>`), explicit reasoning prompts
  - *GPT-4*: Responds well to markdown structure, system/user role separation
  - *Gemini*: Benefits from clear structured formatting
  - *Open-source (Llama, Mistral)*: Needs more explicit, simpler instructions; less nuance

---

## Quick Examples

### Example A: Minimal Input → Enhanced

**Original:** `"Write me a cover letter"`

**Enhanced:**
```
You are an expert career coach and professional writer.

Write a compelling cover letter for the following:
- Role: [JOB TITLE] at [COMPANY NAME]
- Candidate background: [2-3 sentences about their experience]
- Key achievement to highlight: [SPECIFIC ACCOMPLISHMENT]

Requirements:
- Length: 3 short paragraphs (under 250 words total)
- Tone: Confident, warm, professional — not generic
- Opening: Hook with a specific reason for interest in this company, not "I am writing to apply..."
- Closing: Clear call to action

Do not use clichés like "team player", "hardworking", or "passionate".
```

---

### Example B: Technical Prompt → Enhanced

**Original:** `"Debug my code"`

**Enhanced:**
```
You are a senior software engineer specializing in [LANGUAGE/FRAMEWORK].

I have a bug in the following code. Please:
1. Identify the root cause of the bug
2. Explain WHY it's happening in plain English
3. Provide the corrected code with inline comments explaining what changed
4. Suggest one way to prevent this class of bug in the future

[PASTE CODE HERE]

Error message (if any): [PASTE ERROR]
Expected behavior: [DESCRIBE]
Actual behavior: [DESCRIBE]
```

---

## Edge Cases

- **If the user's prompt is already excellent**: Tell them it's strong, explain why, and offer 1-2 minor refinements only.
- **If the prompt involves sensitive/harmful use**: Do not enhance it. Decline politely.
- **If the prompt is for an image generator (Midjourney, DALL-E)**: Use visual prompt techniques instead — style modifiers, lighting, aspect ratio, negative prompts. These differ significantly from text LLM prompts.
- **If the user wants a system prompt**: Structure with clear role, capabilities, constraints, and response format sections.
