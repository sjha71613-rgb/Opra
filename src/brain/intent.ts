// ─── Intent Classification ────────────────────────────────────────
// Determines what kind of question is being asked

export type Intent =
  | 'greeting'
  | 'farewell'
  | 'thanks'
  | 'identity'
  | 'capability'
  | 'how_are_you'
  | 'math'
  | 'definition'
  | 'fact_query'
  | 'comparison'
  | 'list_query'
  | 'yes_no'
  | 'opinion'
  | 'help'
  | 'joke'
  | 'time_date'
  | 'unknown';

export interface IntentResult {
  intent: Intent;
  confidence: number;
  entities: string[];
  raw: string;
}

const GREETING_PATTERNS = [
  /^(hi|hello|hey|howdy|greetings|sup|yo|what'?s?\s*up|good\s*(morning|afternoon|evening|day))[\s!.?]*$/i,
  /^(hi|hello|hey)\s+(there|everyone|mini)/i,
];

const FAREWELL_PATTERNS = [
  /^(bye|goodbye|see\s*ya|farewell|good\s*night|later|cya|ttyl|take\s*care)[\s!.?]*$/i,
];

const THANKS_PATTERNS = [
  /^(thanks|thank\s*you|thx|ty|appreciate|cheers)[\s!.?]*$/i,
  /^(thanks|thank\s*you)\s+(for|so\s*much|a\s*lot)/i,
];

const IDENTITY_PATTERNS = [
  /who\s*are\s*you/i,
  /what\s*are\s*you/i,
  /what('?s| is)\s*your\s*name/i,
  /tell\s*me\s*about\s*(yourself|you)/i,
  /what\s*kind\s*of\s*(ai|model|bot)/i,
];

const CAPABILITY_PATTERNS = [
  /what\s*can\s*you\s*do/i,
  /what\s*(are\s*you\s*)?(capable|able)\s*(of|to)/i,
  /how\s*(do|does)\s*(this|it|you)\s*work/i,
  /explain\s*(yourself|how\s*this\s*works)/i,
];

const HOW_ARE_YOU_PATTERNS = [
  /how\s*are\s*you/i,
  /how\s*(are|is)\s*it\s*going/i,
  /how\s*do\s*you\s*feel/i,
  /what'?s?\s*up/i,
];

const MATH_PATTERNS = [
  /what\s*is\s*\d/i,
  /calculate/i,
  /compute/i,
  /\d\s*[\+\-\*\/\^]\s*\d/,
  /\d\s*(plus|minus|times|divided)\s*\d/i,
  /how\s*much\s*is\s*\d/i,
  /square\s*root/i,
  /percent/i,
];

const DEFINITION_PATTERNS = [
  /what\s*(is|are)\s+(a|an|the)\s+/i,
  /define\s+/i,
  /what\s*does\s+\S+\s*mean/i,
  /explain\s+(what|how|why)/i,
];

const FACT_QUERY_PATTERNS = [
  /what\s*(is|are)\s+the\s+/i,
  /how\s*(many|much|big|tall|long|far|old|heavy|fast|hot|cold)/i,
  /when\s*(was|did|is|are|will)/i,
  /where\s*(is|are|did|was)/i,
  /who\s*(is|was|invented|discovered|created|made|founded)/i,
  /why\s*(is|are|do|does|did|can|can't|won't)/i,
  /what\s*(color|shape|size|type|kind)\s/i,
];

const COMPARISON_PATTERNS = [
  /which\s*(is|are)\s*(bigger|smaller|better|faster|slower|taller|heavier|older|newer)/i,
  /compare\s+/i,
  /difference\s*between/i,
  /\s+vs\.?\s+|\s+versus\s+/i,
];

const LIST_QUERY_PATTERNS = [
  /list\s+(the\s+|all\s+)?/i,
  /name\s+(the\s+|all\s+)?/i,
  /what\s*are\s*(all\s+)?(the\s+)?/i,
  /give\s*me\s*(a\s+)?list/i,
];

const YES_NO_PATTERNS = [
  /^(is|are|was|were|do|does|did|can|could|will|would|should|has|have)\s+/i,
];

const OPINION_PATTERNS = [
  /what\s*do\s*you\s*think\s*(about|of)/i,
  /do\s*you\s*(like|prefer|enjoy|believe)/i,
  /what('?s| is)\s*your\s*(favorite|opinion|thought)/i,
];

const HELP_PATTERNS = [
  /help/i,
  /i\s*don'?t\s*understand/i,
  /can\s*you\s*explain/i,
  /what\s*does\s*that\s*mean/i,
];

const JOKE_PATTERNS = [
  /tell\s*(me\s*)?a\s*joke/i,
  /make\s*me\s*laugh/i,
  /something\s*funny/i,
];

const TIME_DATE_PATTERNS = [
  /what\s*(time|day|date)\s*(is\s*it)?/i,
  /what'?s?\s*(the\s*)?(time|date|day)/i,
  /today'?s?\s*date/i,
];

export function classifyIntent(question: string): IntentResult {
  const q = question.trim();
  const lower = q.toLowerCase();
  
  // Check each intent pattern
  const checks: Array<{ intent: Intent; patterns: RegExp[] }> = [
    { intent: 'greeting', patterns: GREETING_PATTERNS },
    { intent: 'farewell', patterns: FAREWELL_PATTERNS },
    { intent: 'thanks', patterns: THANKS_PATTERNS },
    { intent: 'identity', patterns: IDENTITY_PATTERNS },
    { intent: 'capability', patterns: CAPABILITY_PATTERNS },
    { intent: 'how_are_you', patterns: HOW_ARE_YOU_PATTERNS },
    { intent: 'joke', patterns: JOKE_PATTERNS },
    { intent: 'time_date', patterns: TIME_DATE_PATTERNS },
    { intent: 'help', patterns: HELP_PATTERNS },
    { intent: 'opinion', patterns: OPINION_PATTERNS },
    { intent: 'comparison', patterns: COMPARISON_PATTERNS },
    { intent: 'list_query', patterns: LIST_QUERY_PATTERNS },
    { intent: 'math', patterns: MATH_PATTERNS },
    { intent: 'definition', patterns: DEFINITION_PATTERNS },
    { intent: 'fact_query', patterns: FACT_QUERY_PATTERNS },
    { intent: 'yes_no', patterns: YES_NO_PATTERNS },
  ];
  
  for (const { intent, patterns } of checks) {
    for (const pattern of patterns) {
      if (pattern.test(q)) {
        return {
          intent,
          confidence: 0.9,
          entities: extractEntities(lower),
          raw: q,
        };
      }
    }
  }
  
  // Fallback: if it has a question mark, it's likely a fact query
  if (q.includes('?')) {
    return {
      intent: 'fact_query',
      confidence: 0.5,
      entities: extractEntities(lower),
      raw: q,
    };
  }
  
  return {
    intent: 'unknown',
    confidence: 0.3,
    entities: extractEntities(lower),
    raw: q,
  };
}

function extractEntities(text: string): string[] {
  // Simple entity extraction - find capitalized words and known entities
  const entities: string[] = [];
  const words = text.split(/\s+/);
  
  // Look for known entity references
  const knownEntities = [
    'earth', 'mars', 'jupiter', 'saturn', 'venus', 'mercury', 'uranus', 'neptune',
    'sun', 'moon', 'france', 'germany', 'japan', 'china', 'india', 'brazil',
    'water', 'oxygen', 'carbon', 'gold', 'dna', 'pi',
  ];
  
  for (const entity of knownEntities) {
    if (text.includes(entity)) {
      entities.push(entity);
    }
  }
  
  return entities;
}
