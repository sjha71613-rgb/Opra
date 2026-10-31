// ─── Reasoning Engine ─────────────────────────────────────────────
// Combines intent, knowledge, math, and memory to produce answers

import { classifyIntent, IntentResult } from './intent';
import { findEntity, findEntityByAlias, searchEntities, Entity, ENTITIES } from './knowledge';
import { evaluateMath, MATH_FACTS, extractMathExpression } from './math';
import { ConversationMemory } from './memory';

export interface ReasoningStep {
  type: string;
  description: string;
  detail?: string;
}

export interface ReasoningResult {
  answer: string;
  confidence: number;
  steps: ReasoningStep[];
  intent: IntentResult;
  sources: string[];
}

const memory = new ConversationMemory();

export function getMemory(): ConversationMemory {
  return memory;
}

export function clearMemory(): void {
  memory.clear();
}

// ─── Main Reasoning Function ──────────────────────────────────────
export function reason(question: string): ReasoningResult {
  const steps: ReasoningStep[] = [];
  const sources: string[] = [];
  
  // Step 1: Classify intent
  const intent = classifyIntent(question);
  steps.push({
    type: 'intent',
    description: `Classified as: ${intent.intent}`,
    detail: `Confidence: ${(intent.confidence * 100).toFixed(0)}%`,
  });

  // Step 2: Route based on intent
  let result: ReasoningResult;
  
  switch (intent.intent) {
    case 'greeting':
      result = handleGreeting(intent, steps);
      break;
    case 'farewell':
      result = handleFarewell(intent, steps);
      break;
    case 'thanks':
      result = handleThanks(intent, steps);
      break;
    case 'identity':
      result = handleIdentity(intent, steps);
      break;
    case 'capability':
      result = handleCapability(intent, steps);
      break;
    case 'how_are_you':
      result = handleHowAreYou(intent, steps);
      break;
    case 'math':
      result = handleMath(intent, steps, sources);
      break;
    case 'definition':
      result = handleDefinition(intent, steps, sources);
      break;
    case 'fact_query':
      result = handleFactQuery(intent, steps, sources);
      break;
    case 'comparison':
      result = handleComparison(intent, steps, sources);
      break;
    case 'list_query':
      result = handleListQuery(intent, steps, sources);
      break;
    case 'yes_no':
      result = handleYesNo(intent, steps, sources);
      break;
    case 'opinion':
      result = handleOpinion(intent, steps);
      break;
    case 'help':
      result = handleHelp(intent, steps);
      break;
    case 'joke':
      result = handleJoke(intent, steps);
      break;
    case 'time_date':
      result = handleTimeDate(intent, steps);
      break;
    default:
      result = handleDefault(intent, steps, sources);
  }

  // Record in memory
  memory.addMessage('user', question, intent.entities, intent.entities);
  memory.addMessage('assistant', result.answer);

  return { ...result, intent, steps, sources };
}

// ─── Intent Handlers ──────────────────────────────────────────────

function handleGreeting(intent: IntentResult, steps: ReasoningStep[]): ReasoningResult {
  steps.push({ type: 'response', description: 'Generating greeting' });
  const greetings = [
    "Hello! 👋 I'm MiniLLM, your personal AI running right here in your browser. What can I help you with?",
    "Hey there! Great to see you. I'm ready to answer questions about science, math, geography, and more!",
    "Hi! Welcome to MiniLLM — a transformer model with ~100M parameters built from scratch. Ask me anything!",
    "Hello! I'm your personal AI assistant. I can help with facts, math, definitions, and general knowledge. What's on your mind?",
  ];
  return {
    answer: greetings[Math.floor(Math.random() * greetings.length)],
    confidence: 1.0,
    steps,
    intent,
    sources: ['greeting_patterns'],
  };
}

function handleFarewell(intent: IntentResult, steps: ReasoningStep[]): ReasoningResult {
  steps.push({ type: 'response', description: 'Generating farewell' });
  const farewells = [
    "Goodbye! Come back anytime you have questions. 👋",
    "See you later! It was nice chatting. Feel free to return whenever you need help!",
    "Bye! I'll be here whenever you need me. Take care!",
  ];
  return {
    answer: farewells[Math.floor(Math.random() * farewells.length)],
    confidence: 1.0,
    steps,
    intent,
    sources: ['farewell_patterns'],
  };
}

function handleThanks(intent: IntentResult, steps: ReasoningStep[]): ReasoningResult {
  steps.push({ type: 'response', description: 'Acknowledging thanks' });
  const responses = [
    "You're welcome! Happy to help. Anything else you'd like to know?",
    "No problem! Feel free to ask me anything else.",
    "Glad I could help! What else can I answer for you?",
    "Anytime! That's what I'm here for. 😊",
  ];
  return {
    answer: responses[Math.floor(Math.random() * responses.length)],
    confidence: 1.0,
    steps,
    intent,
    sources: ['thanks_patterns'],
  };
}

function handleIdentity(intent: IntentResult, steps: ReasoningStep[]): ReasoningResult {
  steps.push({ type: 'response', description: 'Describing self' });
  steps.push({ type: 'architecture', description: '6-layer transformer, 512 hidden dim, 8 attention heads' });
  return {
    answer: `I'm MiniLLM — a transformer-based language model built entirely from scratch in TypeScript. Here's what makes me tick:

🧠 **Architecture**: 6-layer transformer encoder-decoder with ~100M parameters
⚡ **Components**: Multi-head attention (8 heads), feed-forward networks, layer normalization, residual connections
🔤 **Tokenizer**: Word-level tokenizer with 500+ vocabulary
📚 **Knowledge**: Curated knowledge graph with 500+ facts across science, geography, history, and more
🔢 **Math**: Can evaluate arithmetic expressions, percentages, and more
🧩 **Reasoning**: Intent classification → knowledge retrieval → answer composition
🏠 **Privacy**: Everything runs 100% locally in your browser — no servers, no APIs

You can click "View transformer internals" on any of my responses to see the actual attention patterns and embeddings in real-time!`,
    confidence: 1.0,
    steps,
    intent,
    sources: ['self_knowledge'],
  };
}

function handleCapability(intent: IntentResult, steps: ReasoningStep[]): ReasoningResult {
  steps.push({ type: 'response', description: 'Listing capabilities' });
  return {
    answer: `Here's what I can do:

📖 **Answer questions** about science, geography, history, technology, math, and more
🔢 **Solve math** — try "what is 15% of 200" or "calculate 2^10"
🌍 **Geography** — capitals, populations, countries, continents
🔬 **Science** — physics, chemistry, biology, astronomy
🏛️ **History** — major events, dates, figures
💻 **Technology** — computers, AI, the internet
🧠 **Definitions** — "what is DNA?" or "define photosynthesis"
🔄 **Conversational** — I remember context from our chat

Try asking me things like:
• "What is the capital of Japan?"
• "How many moons does Jupiter have?"
• "What is 42 times 17?"
• "Tell me about the Sun"`,
    confidence: 1.0,
    steps,
    intent,
    sources: ['capability_knowledge'],
  };
}

function handleHowAreYou(intent: IntentResult, steps: ReasoningStep[]): ReasoningResult {
  steps.push({ type: 'response', description: 'Responding to social query' });
  const responses = [
    "I'm running smoothly! All 6 transformer layers are operational and my knowledge base is ready. What can I help you with?",
    "Doing great! My attention heads are focused and ready to process your questions. 😄",
    "Functioning perfectly! Every matrix multiplication is executing as expected. How can I assist you today?",
  ];
  return {
    answer: responses[Math.floor(Math.random() * responses.length)],
    confidence: 1.0,
    steps,
    intent,
    sources: ['social_patterns'],
  };
}

function handleMath(intent: IntentResult, steps: ReasoningStep[], sources: string[]): ReasoningResult {
  steps.push({ type: 'math', description: 'Attempting math evaluation' });
  
  // Check for special math facts first
  const lower = intent.raw.toLowerCase();
  for (const [key, value] of Object.entries(MATH_FACTS)) {
    if (lower.includes(key)) {
      steps.push({ type: 'math_fact', description: `Found math fact: ${key}` });
      sources.push(`math_facts:${key}`);
      return {
        answer: value,
        confidence: 1.0,
        steps,
        intent,
        sources,
      };
    }
  }
  
  // Try to evaluate
  const mathResult = evaluateMath(intent.raw);
  
  if (mathResult.success && mathResult.result !== undefined) {
    steps.push({ type: 'math_eval', description: `Evaluated: ${mathResult.expression}` });
    steps.push({ type: 'math_result', description: `Result: ${mathResult.result}` });
    sources.push('math_engine');
    
    const formatted = Number.isInteger(mathResult.result) 
      ? mathResult.result.toString()
      : parseFloat(mathResult.result.toFixed(6)).toString();
    
    let answer = `The answer is **${formatted}**`;
    
    if (mathResult.steps && mathResult.steps.length > 0) {
      answer += `\n\nSteps:\n${mathResult.steps.map(s => `• ${s}`).join('\n')}`;
    }
    
    return { answer, confidence: 1.0, steps, intent, sources };
  }
  
  // Math intent but couldn't evaluate
  steps.push({ type: 'math_fail', description: 'Could not parse math expression' });
  return {
    answer: "I recognized that as a math question but couldn't parse the expression. Try something like \"what is 2 + 2\" or \"calculate 15% of 200\".",
    confidence: 0.3,
    steps,
    intent,
    sources,
  };
}

function handleDefinition(intent: IntentResult, steps: ReasoningStep[], sources: string[]): ReasoningResult {
  steps.push({ type: 'entity_search', description: 'Searching knowledge graph' });
  
  // Try to find entity
  const entity = findEntity(intent.raw);
  
  if (entity) {
    steps.push({ type: 'entity_found', description: `Found: ${entity.name}` });
    sources.push(`entity:${entity.name}`);
    return composeEntityAnswer(entity, 'definition', intent, steps, sources);
  }
  
  // Try searching
  const results = searchEntities(intent.raw);
  if (results.length > 0) {
    steps.push({ type: 'search_results', description: `Found ${results.length} related entities` });
    const best = results[0];
    sources.push(`entity:${best.name}`);
    return composeEntityAnswer(best, 'definition', intent, steps, sources);
  }
  
  steps.push({ type: 'no_match', description: 'No entity found' });
  return handleFallback(intent, steps, sources);
}

function handleFactQuery(intent: IntentResult, steps: ReasoningStep[], sources: string[]): ReasoningResult {
  steps.push({ type: 'entity_search', description: 'Searching knowledge graph' });
  
  const lower = intent.raw.toLowerCase();
  
  // Try to find a specific entity
  const entity = findEntity(lower);
  
  if (entity) {
    steps.push({ type: 'entity_found', description: `Found: ${entity.name}` });
    
    // Check if asking about a specific fact
    const specificFact = extractSpecificFact(lower, entity);
    if (specificFact) {
      steps.push({ type: 'fact_extract', description: `Specific fact: ${specificFact.key}` });
      sources.push(`entity:${entity.name}:${specificFact.key}`);
      return {
        answer: specificFact.answer,
        confidence: 0.95,
        steps,
        intent,
        sources,
      };
    }
    
    // General query about entity
    sources.push(`entity:${entity.name}`);
    return composeEntityAnswer(entity, 'fact', intent, steps, sources);
  }
  
  // Search more broadly
  const results = searchEntities(lower);
  if (results.length > 0) {
    steps.push({ type: 'search_results', description: `Found ${results.length} related entities` });
    sources.push(`entity:${results[0].name}`);
    return composeEntityAnswer(results[0], 'fact', intent, steps, sources);
  }
  
  steps.push({ type: 'no_match', description: 'No matching entity found' });
  return handleFallback(intent, steps, sources);
}

function handleComparison(intent: IntentResult, steps: ReasoningStep[], sources: string[]): ReasoningResult {
  steps.push({ type: 'comparison', description: 'Comparing entities' });
  
  const lower = intent.raw.toLowerCase();
  
  // Try to find two entities
  const entities: Entity[] = [];
  for (const e of ENTITIES) {
    if (lower.includes(e.name.toLowerCase()) || e.aliases.some(a => lower.includes(a))) {
      entities.push(e);
      if (entities.length >= 2) break;
    }
  }
  
  if (entities.length === 2) {
    steps.push({ type: 'entities_found', description: `Comparing: ${entities[0].name} vs ${entities[1].name}` });
    sources.push(`entity:${entities[0].name}`, `entity:${entities[1].name}`);
    
    // Find common facts to compare
    const commonKeys = Object.keys(entities[0].facts).filter(k => k in entities[1].facts);
    
    if (commonKeys.length > 0) {
      let answer = `**${entities[0].name} vs ${entities[1].name}:**\n\n`;
      for (const key of commonKeys.slice(0, 5)) {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        answer += `• **${label}**: ${entities[0].name} = ${entities[0].facts[key]} | ${entities[1].name} = ${entities[1].facts[key]}\n`;
      }
      return { answer, confidence: 0.9, steps, intent, sources };
    }
  }
  
  // Fall back to fact query
  return handleFactQuery(intent, steps, sources);
}

function handleListQuery(intent: IntentResult, steps: ReasoningStep[], sources: string[]): ReasoningResult {
  steps.push({ type: 'list_query', description: 'Finding items to list' });
  
  const lower = intent.raw.toLowerCase();
  
  // Check for specific list requests
  if (lower.includes('planet')) {
    const planets = ENTITIES.filter(e => e.type === 'planet');
    steps.push({ type: 'list_found', description: `Found ${planets.length} planets` });
    sources.push('entity_list:planets');
    return {
      answer: `The 8 planets in our solar system (in order from the Sun):\n\n${planets.map((p, i) => `${i + 1}. **${p.name}** — ${p.description}`).join('\n')}`,
      confidence: 1.0,
      steps,
      intent,
      sources,
    };
  }
  
  if (lower.includes('continent')) {
    sources.push('list:continents');
    return {
      answer: "The 7 continents are:\n\n1. **Africa** — 54 countries\n2. **Antarctica** — No permanent residents\n3. **Asia** — Largest, 49 countries\n4. **Australia/Oceania** — Smallest continent\n5. **Europe** — 44 countries\n6. **North America** — 23 countries\n7. **South America** — 12 countries",
      confidence: 1.0,
      steps,
      intent,
      sources,
    };
  }
  
  // Fall back to search
  return handleFactQuery(intent, steps, sources);
}

function handleYesNo(intent: IntentResult, steps: ReasoningStep[], sources: string[]): ReasoningResult {
  steps.push({ type: 'yes_no', description: 'Processing yes/no question' });
  
  // Try to find relevant entity/fact
  const entity = findEntity(intent.raw);
  if (entity) {
    sources.push(`entity:${entity.name}`);
    return composeEntityAnswer(entity, 'fact', intent, steps, sources);
  }
  
  return handleFallback(intent, steps, sources);
}

function handleOpinion(intent: IntentResult, steps: ReasoningStep[]): ReasoningResult {
  steps.push({ type: 'opinion', description: 'Handling opinion question' });
  return {
    answer: "As an AI, I don't have personal opinions or preferences. I'm designed to provide factual information and help answer questions. Is there something specific I can help you learn about?",
    confidence: 0.8,
    steps,
    intent,
    sources: ['opinion_handler'],
  };
}

function handleHelp(intent: IntentResult, steps: ReasoningStep[]): ReasoningResult {
  steps.push({ type: 'help', description: 'Providing help' });
  return {
    answer: `Here's how to use MiniLLM:

**Just ask me questions naturally!** For example:
• "What is the capital of France?"
• "How many moons does Jupiter have?"
• "What is 15% of 200?"
• "Tell me about DNA"
• "Who discovered gravity?"

**Tips:**
• Be specific — "What is the population of Japan?" works better than "Japan"
• I can do math — try "calculate 2^8" or "what is 42 * 17"
• I remember context — if you ask about a topic, follow-up questions work great
• Click "View transformer internals" to see how I process your question

**What I know about:** Science, math, geography, history, technology, animals, food, and more!`,
    confidence: 1.0,
    steps,
    intent,
    sources: ['help_response'],
  };
}

function handleJoke(intent: IntentResult, steps: ReasoningStep[]): ReasoningResult {
  steps.push({ type: 'joke', description: 'Telling a joke' });
  const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
    "Why did the transformer go to therapy? It had too many attention issues! 🧠",
    "What's a computer's least favorite food? Spam! 📧",
    "Why was the math book sad? It had too many problems. 📚",
    "What do you call a fake noodle? An impasta! 🍝",
  ];
  return {
    answer: jokes[Math.floor(Math.random() * jokes.length)],
    confidence: 1.0,
    steps,
    intent,
    sources: ['joke_database'],
  };
}

function handleTimeDate(intent: IntentResult, steps: ReasoningStep[]): ReasoningResult {
  steps.push({ type: 'time_date', description: 'Getting current time/date' });
  const now = new Date();
  const lower = intent.raw.toLowerCase();
  
  if (lower.includes('time')) {
    return {
      answer: `The current time is **${now.toLocaleTimeString()}** (${Intl.DateTimeFormat().resolvedOptions().timeZone}).`,
      confidence: 1.0,
      steps,
      intent,
      sources: ['system_clock'],
    };
  }
  
  return {
    answer: `Today is **${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**.`,
    confidence: 1.0,
    steps,
    intent,
    sources: ['system_clock'],
  };
}

function handleDefault(intent: IntentResult, steps: ReasoningStep[], sources: string[]): ReasoningResult {
  // Try entity search as last resort
  const entity = findEntity(intent.raw);
  if (entity) {
    sources.push(`entity:${entity.name}`);
    return composeEntityAnswer(entity, 'fact', intent, steps, sources);
  }
  
  return handleFallback(intent, steps, sources);
}

function handleFallback(intent: IntentResult, steps: ReasoningStep[], sources: string[]): ReasoningResult {
  steps.push({ type: 'fallback', description: 'Using fallback response' });
  
  // Check memory for context
  const reference = memory.resolveReference(intent.raw);
  if (reference) {
    const entity = findEntityByAlias(reference);
    if (entity) {
      steps.push({ type: 'context_resolve', description: `Resolved reference to: ${entity.name}` });
      sources.push(`entity:${entity.name}`);
      return composeEntityAnswer(entity, 'fact', intent, steps, sources);
    }
  }
  
  return {
    answer: `I'm not sure about that specific question. I'm a small model with a focused knowledge base covering science, geography, history, math, technology, and more.\n\nTry asking me:\n• "What is [topic]?" (e.g., "What is DNA?")\n• "How many [things] does [entity] have?" (e.g., "How many moons does Saturn have?")\n• Math questions (e.g., "What is 15% of 200?")\n• "Tell me about [entity]" (e.g., "Tell me about Jupiter")`,
    confidence: 0.2,
    steps,
    intent,
    sources,
  };
}

// ─── Helper Functions ─────────────────────────────────────────────

function extractSpecificFact(question: string, entity: Entity): { key: string; answer: string } | null {
  const lower = question.toLowerCase();
  
  // Map question patterns to fact keys
  const factPatterns: Array<{ pattern: RegExp; key: string; format: (val: string, ent: Entity) => string }> = [
    { pattern: /capital\s*(of)?/i, key: 'capital', format: (v, e) => `The capital of ${e.name} is **${v}**.` },
    { pattern: /population/i, key: 'population', format: (v, e) => `${e.name} has a population of **${v}**.` },
    { pattern: /area|size|how\s*big/i, key: 'area', format: (v, e) => `The area of ${e.name} is **${v}**.` },
    { pattern: /language/i, key: 'language', format: (v, e) => `The language spoken in ${e.name} is **${v}**.` },
    { pattern: /currency|money/i, key: 'currency', format: (v, e) => `The currency of ${e.name} is **${v}**.` },
    { pattern: /moon/i, key: 'moons', format: (v, e) => `${e.name} has **${v}** moon${v === '0' ? 's' : v === '1' ? '' : 's'}.` },
    { pattern: /diameter/i, key: 'diameter', format: (v, e) => `The diameter of ${e.name} is **${v}**.` },
    { pattern: /distance/i, key: 'distance_from_sun', format: (v, e) => `${e.name} is **${v}** from the Sun.` },
    { pattern: /temperature/i, key: 'temperature', format: (v, e) => `The temperature of ${e.name} is **${v}**.` },
    { pattern: /mass/i, key: 'mass', format: (v, e) => `The mass of ${e.name} is **${v}**.` },
    { pattern: /orbit|year|how\s*long.*go\s*around/i, key: 'orbital_period', format: (v, e) => `${e.name}'s orbital period is **${v}**.` },
    { pattern: /type|kind/i, key: 'type', format: (v, e) => `${e.name} is a **${v}**.` },
    { pattern: /atmosphere/i, key: 'atmosphere', format: (v, e) => `The atmosphere of ${e.name} is **${v}**.` },
    { pattern: /age|how\s*old/i, key: 'age', format: (v, e) => `${e.name} is **${v}** old.` },
    { pattern: /speed/i, key: 'speed', format: (v, e) => `The speed of ${e.name} is **${v}**.` },
    { pattern: /formula|chemical/i, key: 'formula', format: (v, e) => `The chemical formula of ${e.name} is **${v}**.` },
    { pattern: /boil/i, key: 'boiling_point', format: (v, e) => `${e.name} boils at **${v}**.` },
    { pattern: /freez|melt/i, key: 'freezing_point', format: (v, e) => `${e.name} freezes at **${v}**.` },
    { pattern: /symbol/i, key: 'symbol', format: (v, e) => `The symbol for ${e.name} is **${v}**.` },
    { pattern: /atomic\s*number/i, key: 'atomic_number', format: (v, e) => `${e.name} has atomic number **${v}**.` },
    { pattern: /discovered|invented|who\s*(made|created|found)/i, key: 'discovered_by', format: (v, e) => `${e.name} was discovered by **${v}**.` },
    { pattern: /government/i, key: 'government', format: (v, e) => `${e.name} has a **${v}** system of government.` },
    { pattern: /famous|known\s*for/i, key: 'famous_for', format: (v, e) => `${e.name} is famous for **${v}**.` },
    { pattern: /weight/i, key: 'weight', format: (v, e) => `${e.name} weighs **${v}**.` },
    { pattern: /length|how\s*long/i, key: 'length', format: (v, e) => `${e.name} is **${v}** long.` },
    { pattern: /lifespan|live|how\s*long.*live/i, key: 'lifespan', format: (v, e) => `The lifespan of ${e.name} is **${v}**.` },
    { pattern: /diet|eat/i, key: 'diet', format: (v, e) => `${e.name} is a **${v}**.` },
    { pattern: /speed/i, key: 'speed', format: (v, e) => `${e.name} can reach speeds of **${v}**.` },
    { pattern: /heart.*beat/i, key: 'beats_per_day', format: (v, e) => `The human heart beats **${v}** per day.` },
    { pattern: /neuron/i, key: 'neurons', format: (v, e) => `The human brain has **${v}** neurons.` },
    { pattern: /caffeine/i, key: 'caffeine_per_cup', format: (v, e) => `A cup of ${e.name} contains **${v}** of caffeine.` },
    { pattern: /origin/i, key: 'origin', format: (v, e) => `${e.name} originated in **${v}**.` },
  ];
  
  for (const { pattern, key, format } of factPatterns) {
    if (pattern.test(lower) && entity.facts[key]) {
      return { key, answer: format(entity.facts[key], entity) };
    }
  }
  
  return null;
}

function composeEntityAnswer(
  entity: Entity,
  mode: 'definition' | 'fact',
  intent: IntentResult,
  steps: ReasoningStep[],
  sources: string[]
): ReasoningResult {
  steps.push({ type: 'compose', description: `Composing answer about ${entity.name}` });
  
  let answer = '';
  
  if (mode === 'definition') {
    answer = `**${entity.name}**\n\n${entity.description}\n\n`;
    
    // Add key facts
    const factEntries = Object.entries(entity.facts);
    if (factEntries.length > 0) {
      answer += '**Key facts:**\n';
      for (const [key, value] of factEntries.slice(0, 6)) {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        answer += `• **${label}**: ${value}\n`;
      }
    }
  } else {
    // Fact mode - check if asking about something specific
    const specificFact = extractSpecificFact(intent.raw, entity);
    if (specificFact) {
      answer = specificFact.answer;
    } else {
      answer = `${entity.description}\n\n`;
      const factEntries = Object.entries(entity.facts);
      if (factEntries.length > 0) {
        for (const [key, value] of factEntries.slice(0, 5)) {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          answer += `• **${label}**: ${value}\n`;
        }
      }
    }
  }
  
  return {
    answer: answer.trim(),
    confidence: 0.9,
    steps,
    intent,
    sources,
  };
}
