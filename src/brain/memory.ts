// ─── Conversational Memory ────────────────────────────────────────
// Tracks context across messages

export interface MemoryEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  topics: string[];
  entities: string[];
}

export interface ConversationContext {
  lastTopic: string | null;
  lastEntity: string | null;
  messageCount: number;
  recentTopics: string[];
  userPreferences: Record<string, string>;
}

export class ConversationMemory {
  private history: MemoryEntry[] = [];
  private context: ConversationContext = {
    lastTopic: null,
    lastEntity: null,
    messageCount: 0,
    recentTopics: [],
    userPreferences: {},
  };

  addMessage(role: 'user' | 'assistant', content: string, topics: string[] = [], entities: string[] = []) {
    this.history.push({
      role,
      content,
      timestamp: Date.now(),
      topics,
      entities,
    });

    this.context.messageCount++;
    
    if (topics.length > 0) {
      this.context.lastTopic = topics[0];
      this.context.recentTopics = [topics[0], ...this.context.recentTopics.slice(0, 4)];
    }
    
    if (entities.length > 0) {
      this.context.lastEntity = entities[0];
    }
  }

  getContext(): ConversationContext {
    return { ...this.context };
  }

  getHistory(limit: number = 5): MemoryEntry[] {
    return this.history.slice(-limit);
  }

  // Check if the current question refers to something previously discussed
  resolveReference(question: string): string | null {
    const lower = question.toLowerCase();
    
    // Pronoun references
    const pronounPatterns = [
      { pattern: /\b(he|she|it|they|him|her|them)\b/i, type: 'entity' },
      { pattern: /\b(that|this|the\s+same)\b/i, type: 'topic' },
    ];

    for (const { pattern, type } of pronounPatterns) {
      if (pattern.test(lower)) {
        if (type === 'entity' && this.context.lastEntity) {
          return this.context.lastEntity;
        }
        if (type === 'topic' && this.context.lastTopic) {
          return this.context.lastTopic;
        }
      }
    }

    // "tell me more about it" type references
    if (/more\s*about\s*(it|that|this|them)/i.test(lower)) {
      return this.context.lastTopic || this.context.lastEntity;
    }

    return null;
  }

  clear() {
    this.history = [];
    this.context = {
      lastTopic: null,
      lastEntity: null,
      messageCount: 0,
      recentTopics: [],
      userPreferences: {},
    };
  }
}
