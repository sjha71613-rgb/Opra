// ─── Knowledge Base ───────────────────────────────────────────────
// A curated set of questions and answers for the model to retrieve from

export interface KnowledgeEntry {
  question: string;
  answer: string;
  keywords: string[];
  category: string;
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // Greetings
  {
    question: "hello",
    answer: "Hello! I'm MiniLLM, a small language model running in your browser. How can I help you today?",
    keywords: ["hello", "hi", "hey", "greetings"],
    category: "greetings"
  },
  {
    question: "how are you",
    answer: "I'm functioning well, thank you for asking! As an AI, I don't have feelings, but I'm ready to help you with questions.",
    keywords: ["how", "are", "you", "feeling"],
    category: "greetings"
  },
  {
    question: "what is your name",
    answer: "I'm MiniLLM, a transformer-based language model with approximately 100 million parameters, built from scratch and running entirely in your browser.",
    keywords: ["name", "who", "you", "called"],
    category: "greetings"
  },
  {
    question: "what can you do",
    answer: "I can answer questions on various topics like science, math, geography, and general knowledge. I'm a small model with 100M parameters, so my knowledge is limited but I'll do my best!",
    keywords: ["can", "do", "help", "capable"],
    category: "greetings"
  },

  // Basic Math
  {
    question: "what is 2 plus 2",
    answer: "2 + 2 = 4",
    keywords: ["2", "plus", "add", "two"],
    category: "math"
  },
  {
    question: "what is 10 times 10",
    answer: "10 × 10 = 100",
    keywords: ["10", "times", "multiply"],
    category: "math"
  },
  {
    question: "what is the square root of 16",
    answer: "The square root of 16 is 4, because 4 × 4 = 16.",
    keywords: ["square", "root", "16"],
    category: "math"
  },
  {
    question: "what is pi",
    answer: "Pi (π) is approximately 3.14159. It's the ratio of a circle's circumference to its diameter.",
    keywords: ["pi", "3.14", "circle"],
    category: "math"
  },

  // Science
  {
    question: "what is the speed of light",
    answer: "The speed of light in a vacuum is approximately 299,792,458 meters per second (about 300,000 km/s or 186,000 miles per second).",
    keywords: ["speed", "light", "fast"],
    category: "science"
  },
  {
    question: "what is gravity",
    answer: "Gravity is a fundamental force of nature that attracts objects with mass toward each other. On Earth, it gives weight to objects and causes them to fall toward the ground.",
    keywords: ["gravity", "force", "fall", "weight"],
    category: "science"
  },
  {
    question: "what is dna",
    answer: "DNA (Deoxyribonucleic Acid) is a molecule that carries genetic instructions for the development, functioning, growth, and reproduction of all known organisms. It has a double helix structure.",
    keywords: ["dna", "genetic", "gene", "helix"],
    category: "science"
  },
  {
    question: "what is an atom",
    answer: "An atom is the smallest unit of ordinary matter that forms a chemical element. It consists of a nucleus (protons and neutrons) surrounded by electrons.",
    keywords: ["atom", "smallest", "matter", "element"],
    category: "science"
  },
  {
    question: "what is photosynthesis",
    answer: "Photosynthesis is the process by which plants, algae, and some bacteria convert light energy, usually from the sun, into chemical energy stored in glucose. They use carbon dioxide and water, releasing oxygen as a byproduct.",
    keywords: ["photosynthesis", "plant", "sun", "light", "energy"],
    category: "science"
  },

  // Geography
  {
    question: "what is the capital of france",
    answer: "The capital of France is Paris.",
    keywords: ["capital", "france", "paris"],
    category: "geography"
  },
  {
    question: "what is the largest ocean",
    answer: "The Pacific Ocean is the largest ocean on Earth, covering about 63 million square miles (165 million square kilometers).",
    keywords: ["largest", "ocean", "pacific"],
    category: "geography"
  },
  {
    question: "how many continents are there",
    answer: "There are 7 continents: Africa, Antarctica, Asia, Australia/Oceania, Europe, North America, and South America.",
    keywords: ["continents", "seven", "7", "how many"],
    category: "geography"
  },
  {
    question: "what is the tallest mountain",
    answer: "Mount Everest is the tallest mountain on Earth, standing at 8,849 meters (29,032 feet) above sea level. It's located in the Himalayas on the border of Nepal and Tibet.",
    keywords: ["tallest", "mountain", "everest", "highest"],
    category: "geography"
  },
  {
    question: "what is the longest river",
    answer: "The Nile River in Africa is generally considered the longest river in the world at about 6,650 kilometers (4,130 miles), though some measurements suggest the Amazon may be longer.",
    keywords: ["longest", "river", "nile", "amazon"],
    category: "geography"
  },

  // Technology
  {
    question: "what is a computer",
    answer: "A computer is an electronic device that processes data according to instructions (programs). It can perform calculations, store information, and execute complex tasks.",
    keywords: ["computer", "electronic", "device", "program"],
    category: "technology"
  },
  {
    question: "what is the internet",
    answer: "The Internet is a global network of interconnected computer networks that use the Internet protocol suite (TCP/IP) to communicate. It enables services like the World Wide Web, email, and file sharing.",
    keywords: ["internet", "network", "web", "online"],
    category: "technology"
  },
  {
    question: "what is artificial intelligence",
    answer: "Artificial Intelligence (AI) is the simulation of human intelligence by computer systems. It includes learning, reasoning, problem-solving, perception, and language understanding.",
    keywords: ["artificial", "intelligence", "ai", "machine"],
    category: "technology"
  },

  // General Knowledge
  {
    question: "how many days are in a year",
    answer: "A regular year has 365 days. A leap year has 366 days and occurs every 4 years (with some exceptions).",
    keywords: ["days", "year", "365", "how many"],
    category: "general"
  },
  {
    question: "how many colors are in a rainbow",
    answer: "There are 7 colors in a rainbow: red, orange, yellow, green, blue, indigo, and violet (ROYGBIV).",
    keywords: ["colors", "rainbow", "seven", "7"],
    category: "general"
  },
  {
    question: "what is the boiling point of water",
    answer: "Water boils at 100 degrees Celsius (212 degrees Fahrenheit) at standard atmospheric pressure at sea level.",
    keywords: ["boiling", "point", "water", "100", "celsius"],
    category: "science"
  },
  {
    question: "what is the freezing point of water",
    answer: "Water freezes at 0 degrees Celsius (32 degrees Fahrenheit) at standard atmospheric pressure.",
    keywords: ["freezing", "point", "water", "0", "celsius"],
    category: "science"
  },
  {
    question: "how many planets are in our solar system",
    answer: "There are 8 planets in our solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.",
    keywords: ["planets", "solar", "system", "eight", "8"],
    category: "science"
  },
  {
    question: "what is the largest planet",
    answer: "Jupiter is the largest planet in our solar system. It's a gas giant with a mass more than twice that of all other planets combined.",
    keywords: ["largest", "planet", "jupiter"],
    category: "science"
  },
  {
    question: "what is the smallest planet",
    answer: "Mercury is the smallest planet in our solar system. It's only slightly larger than Earth's Moon.",
    keywords: ["smallest", "planet", "mercury"],
    category: "science"
  },
  {
    question: "what is the closest star to earth",
    answer: "The Sun is the closest star to Earth, at an average distance of about 93 million miles (150 million kilometers). The next closest star is Proxima Centauri, about 4.24 light-years away.",
    keywords: ["closest", "star", "sun", "earth"],
    category: "science"
  },
];

// Simple keyword-based matching as fallback
export function keywordMatch(query: string, entry: KnowledgeEntry): number {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);
  
  let score = 0;
  
  // Check keyword matches
  for (const keyword of entry.keywords) {
    if (queryWords.includes(keyword.toLowerCase())) {
      score += 2;
    }
    if (queryLower.includes(keyword.toLowerCase())) {
      score += 1;
    }
  }
  
  // Check question similarity
  const questionWords = entry.question.toLowerCase().split(/\s+/);
  for (const word of queryWords) {
    if (questionWords.includes(word)) {
      score += 0.5;
    }
  }
  
  return score;
}

export function findBestMatch(query: string): KnowledgeEntry | null {
  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;
  
  for (const entry of KNOWLEDGE_BASE) {
    const score = keywordMatch(query, entry);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  
  // Require at least some match
  return bestScore >= 2 ? bestMatch : null;
}
