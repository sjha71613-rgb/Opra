// ─── Tokenizer ─────────────────────────────────────────────────────
// Word-level tokenizer with subword fallback

const SPECIAL_TOKENS = {
  '[PAD]': 0,
  '[UNK]': 1,
  '[BOS]': 2,
  '[EOS]': 3,
  '[CLS]': 4,
  '[SEP]': 5,
};

// Common English words + question words + basic vocabulary
const BASE_VOCAB = [
  // Question words
  'what', 'is', 'the', 'a', 'an', 'are', 'was', 'were', 'who', 'where', 'when', 'why', 'how',
  'which', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'should', 'may', 'might',
  // Common words
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that', 'these', 'those',
  'have', 'has', 'had', 'be', 'been', 'being', 'am', 'not', 'no', 'yes',
  'and', 'or', 'but', 'if', 'then', 'so', 'because', 'about', 'with', 'from',
  'to', 'of', 'in', 'on', 'at', 'for', 'by', 'as', 'into', 'through',
  'all', 'each', 'every', 'some', 'any', 'many', 'much', 'more', 'most', 'other',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  // Numbers
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '100', '1000',
  // Common nouns
  'time', 'year', 'people', 'way', 'day', 'man', 'woman', 'child', 'world', 'life',
  'hand', 'part', 'place', 'case', 'week', 'company', 'system', 'program', 'question',
  'work', 'government', 'number', 'night', 'point', 'home', 'water', 'room', 'mother',
  'area', 'money', 'story', 'fact', 'month', 'lot', 'right', 'study', 'book', 'eye',
  'job', 'word', 'business', 'issue', 'side', 'kind', 'head', 'house', 'service',
  'friend', 'father', 'power', 'hour', 'game', 'line', 'end', 'members', 'law',
  'car', 'city', 'community', 'name', 'president', 'team', 'minute', 'idea', 'body',
  'information', 'back', 'parent', 'face', 'others', 'level', 'office', 'door',
  'health', 'person', 'art', 'war', 'history', 'party', 'result', 'change', 'morning',
  // Verbs
  'know', 'say', 'get', 'make', 'go', 'see', 'come', 'think', 'take', 'want',
  'give', 'use', 'find', 'tell', 'ask', 'work', 'seem', 'feel', 'try', 'leave',
  'call', 'need', 'become', 'keep', 'let', 'begin', 'show', 'hear', 'play', 'run',
  'move', 'like', 'live', 'believe', 'hold', 'bring', 'happen', 'write', 'provide',
  'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn',
  'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read', 'allow',
  'add', 'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'love', 'consider',
  // Adjectives
  'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'old', 'right',
  'big', 'high', 'different', 'small', 'large', 'next', 'early', 'young', 'important',
  'few', 'public', 'bad', 'same', 'able', 'free', 'sure', 'real', 'full', 'special',
  // Greetings & responses
  'hello', 'hi', 'hey', 'goodbye', 'bye', 'thanks', 'thank', 'please', 'sorry',
  // Science
  'earth', 'sun', 'moon', 'star', 'planet', 'space', 'light', 'energy', 'force',
  'atom', 'molecule', 'cell', 'dna', 'gravity', 'speed', 'temperature', 'mass',
  'physics', 'chemistry', 'biology', 'science', 'math', 'mathematics',
  // Geography
  'country', 'state', 'city', 'ocean', 'river', 'mountain', 'island', 'continent',
  'capital', 'population', 'border', 'map', 'north', 'south', 'east', 'west',
  // Technology
  'computer', 'internet', 'software', 'hardware', 'code', 'data', 'network',
  'algorithm', 'program', 'application', 'digital', 'online', 'website', 'server',
  // Math concepts
  'add', 'subtract', 'multiply', 'divide', 'equation', 'formula', 'calculate',
  'sum', 'product', 'difference', 'average', 'percentage', 'fraction',
  // Colors
  'red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'purple', 'pink', 'brown',
  // Animals
  'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'chicken', 'lion', 'tiger',
  'elephant', 'bear', 'wolf', 'deer', 'rabbit', 'snake', 'monkey', 'whale', 'dolphin',
  // Food
  'food', 'eat', 'drink', 'bread', 'rice', 'meat', 'fruit', 'vegetable', 'apple',
  'banana', 'milk', 'coffee', 'tea', 'sugar', 'salt', 'pepper', 'cheese',
  // Body
  'head', 'body', 'arm', 'leg', 'heart', 'brain', 'blood', 'bone', 'skin', 'muscle',
  // Time
  'today', 'tomorrow', 'yesterday', 'now', 'always', 'never', 'often', 'sometimes',
  'second', 'hour', 'week', 'month', 'season', 'spring', 'summer', 'fall', 'winter',
  // Emotions
  'happy', 'sad', 'angry', 'afraid', 'love', 'hate', 'fear', 'joy', 'surprise',
];

export class Tokenizer {
  private wordToId: Map<string, number>;
  private idToWord: Map<number, string>;
  public vocabSize: number;

  constructor() {
    this.wordToId = new Map();
    this.idToWord = new Map();

    // Add special tokens
    for (const [token, id] of Object.entries(SPECIAL_TOKENS)) {
      this.wordToId.set(token, id);
      this.idToWord.set(id, token);
    }

    // Add vocabulary words
    let nextId = Object.keys(SPECIAL_TOKENS).length;
    for (const word of BASE_VOCAB) {
      if (!this.wordToId.has(word)) {
        this.wordToId.set(word, nextId);
        this.idToWord.set(nextId, word);
        nextId++;
      }
    }

    this.vocabSize = nextId;
  }

  tokenize(text: string): number[] {
    // Normalize
    const normalized = text.toLowerCase().trim();
    
    // Split into words and punctuation
    const tokens: number[] = [SPECIAL_TOKENS['[CLS]']];
    
    // Simple tokenization: split on spaces and handle punctuation
    const words = normalized.split(/\s+/);
    
    for (const word of words) {
      // Remove punctuation for lookup
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length === 0) continue;
      
      if (this.wordToId.has(cleanWord)) {
        tokens.push(this.wordToId.get(cleanWord)!);
      } else {
        // Subword: split into characters
        for (const char of cleanWord) {
          if (this.wordToId.has(char)) {
            tokens.push(this.wordToId.get(char)!);
          } else {
            tokens.push(SPECIAL_TOKENS['[UNK]']);
          }
        }
      }
    }
    
    tokens.push(SPECIAL_TOKENS['[EOS]']);
    return tokens;
  }

  decode(ids: number[]): string {
    const tokens: string[] = [];
    for (const id of ids) {
      const token = this.idToWord.get(id);
      if (token && !token.startsWith('[')) {
        tokens.push(token);
      }
    }
    return tokens.join(' ');
  }

  getTokenString(id: number): string {
    return this.idToWord.get(id) || '[UNK]';
  }
}
