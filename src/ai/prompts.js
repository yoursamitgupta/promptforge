/**
 * PromptForge Meta-Prompting & Algorithmic Heuristics Engine
 */

/**
 * System prompts for LLM-powered prompt refinement
 */
export function getSystemPrompt(framework = 'balanced') {
  const coreDirective = `You are PromptForge, an elite Prompt Engineering Specialist and AI Systems Architect.
Your task is to take an informal human thought or query and transform it into a high-leverage, precision prompt for an AI assistant (Claude, ChatGPT, Copilot).

Rules:
1. Preserve the user's authentic intent and core objective completely. Do NOT solve or answer the user's task yourself.
2. Formulate explicit: Role, Context, Constraints, Step-by-Step Task Breakdown, and Strict Output Format.
3. Eliminate conversational ambiguity to guarantee a high-quality response on the FIRST turn.
4. Output ONLY the polished prompt text. Do not include introductory remarks, meta-chat, or wrapping quotes.`;

  switch (framework) {
    case 'code':
      return `${coreDirective}

Target Mode: STAFF SOFTWARE ENGINEER (CODE & DEV)
- Establish the persona of a Principal / Staff Engineer with strict architectural rigor.
- Require modern idioms, static typing, robust error handling, memory efficiency, and comprehensive edge-case mitigation.
- Enforce: "Provide production-grade, modular code with minimal surrounding chatter. Only document non-trivial trade-offs."`;

    case 'tokensaver':
      return `${coreDirective}

Target Mode: TOKEN CONSERVER (ULTRA DENSE)
- Optimize the prompt to minimize BOTH prompt and completion tokens.
- Explicitly instruct the recipient AI: "Omit conversational introductions, polite filler, summaries, and boilerplate disclaimers. Begin immediately with the structured output (tables/bullets/code)."`;

    case 'reasoning':
      return `${coreDirective}

Target Mode: DEEP REASONING (CHAIN-OF-THOUGHT)
- Instruct the AI to perform structured analytical reasoning before concluding.
- Require explicit auditing of underlying assumptions, evaluation of at least two counter-approaches, and validation of edge cases.`;

    case 'executive':
      return `${coreDirective}

Target Mode: EXECUTIVE BRIEF (BLUF)
- Frame the persona as a Senior Strategy Advisor.
- Enforce strict BLUF structure: 1) Bottom-Line Up Front (Key takeaway), 2) Core Strategic Analysis, 3) Actionable Roadmap with Milestones, 4) Risk Matrix & Mitigations.`;

    case 'balanced':
    default:
      return `${coreDirective}

Target Mode: CREATE FRAMEWORK (BALANCED)
- Define Character / Persona, Clear Request, Concrete Examples, Quality Adjustments, and Output Type.
- Ensure clear, readable typography with markdown headers.`;
  }
}

/**
 * Offline Heuristics Transformer
 * 100% private, instant transformation without external network calls or API keys.
 */
export function offlineTransform(thought, framework = 'balanced') {
  const clean = thought.trim();
  if (!clean) return '';

  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
  const isCoding = /\b(code|function|bug|react|python|typescript|javascript|api|sql|css|html|endpoint|docker|component|refactor|error|class|algorithm)\b/i.test(clean);

  if (framework === 'code' || (framework === 'balanced' && isCoding)) {
    return `### 🧑‍💻 Role & Objective
Act as a Principal Software Engineer specializing in modern production architecture.
Your objective is to implement:
"${capitalized}"

### 📋 Technical Requirements
1. **Architecture & Idioms:** Follow clean architecture, separation of concerns, and industry best practices.
2. **Type Safety & Contracts:** Implement strict type safety and interface contracts without loose \`any\` typing.
3. **Resilience & Edge Cases:** Provide robust error handling, input validation, and account for potential failure modes.
4. **Performance:** Prioritize optimal algorithmic complexity and avoid unneeded allocations.

### 📤 Output Specification
- Provide complete, cleanly commented, runnable code.
- Avoid unnecessary conversational filler; include brief bullet points detailing non-obvious design trade-offs.`;
  }

  if (framework === 'tokensaver') {
    return `[Goal]: ${capitalized}
[Output Constraint]: Dense, direct answer using bullet points or code. Omit conversational filler, preamble, and closing remarks. Begin directly with the solution.`;
  }

  if (framework === 'reasoning') {
    return `### 🧠 Objective & Task
Conduct a thorough, step-by-step analytical assessment of:
"${capitalized}"

### 🔍 Analytical Requirements
1. **Core Assumptions:** Identify and audit foundational premises.
2. **First-Principles Breakdown:** Deconstruct the problem into elementary components.
3. **Alternative Approaches:** Compare at least two distinct approaches and highlight trade-offs.
4. **Edge Cases:** Address failure modes, second-order effects, and risks.

### 📤 Final Recommendation
Conclude with a clear, synthesized conclusion and actionable recommendation based on the analysis.`;
  }

  if (framework === 'executive') {
    return `### 📊 Executive Directive
Act as a Senior Strategic Advisor. Provide an executive-level analysis and roadmap for:
"${capitalized}"

### 📑 Structure Requirements
1. **BLUF (Bottom Line Up Front):** 2-3 sentence strategic takeaway.
2. **Key Strategic Drivers:** Critical factors, market/system impacts, and core trade-offs.
3. **Implementation Roadmap:** Prioritized phases, timelines, and resource expectations.
4. **Risk Matrix:** Key failure vectors and proactive mitigation protocols.`;
  }

  // Default: CREATE Balanced
  return `### 🎯 Role & Persona
Act as an authoritative subject-matter expert with extensive domain experience.

### 📝 Request & Goal
Provide a comprehensive, high-clarity solution for:
"${capitalized}"

### ⚙️ Guidelines & Quality Standards
- **Depth:** Deliver actionable, nuanced insights rather than generic overviews.
- **Examples:** Include concrete, real-world illustrations or implementations where applicable.
- **Pitfalls:** Highlight common mistakes, misconceptions, and how to avoid them.

### 📋 Presentation
Format the response using clear headings, structured bullet points, and high-readability markdown formatting.`;
}
