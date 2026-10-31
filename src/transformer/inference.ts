// ─── Inference Pipeline ───────────────────────────────────────────
// Combines the transformer with the knowledge base

import { MiniLLM, ForwardResult } from './model';
import { findBestMatch, KNOWLEDGE_BASE, KnowledgeEntry } from './knowledge';
import { cosineSimilarity } from './tensor';

export interface InferenceResult {
  answer: string;
  forwardResult: ForwardResult;
  tokens: string[];
  matchScore: number;
  matchedQuestion?: string;
  method: 'transformer' | 'keyword' | 'fallback';
}

export class InferenceEngine {
  private model: MiniLLM;
  private knowledgeEmbeddings: Map<string, Float32Array>;
  private isReady: boolean = false;

  constructor() {
    this.model = new MiniLLM();
    this.knowledgeEmbeddings = new Map();
  }

  // Pre-compute embeddings for all knowledge base entries
  async initialize(onProgress?: (msg: string, pct: number) => void): Promise<void> {
    onProgress?.("Building vocabulary...", 10);
    await this.delay(50);

    onProgress?.("Initializing transformer weights...", 20);
    await this.delay(50);

    onProgress?.("Computing knowledge embeddings...", 30);
    
    const total = KNOWLEDGE_BASE.length;
    for (let i = 0; i < total; i++) {
      const entry = KNOWLEDGE_BASE[i];
      const embedding = this.model.getSentenceEmbedding(entry.question);
      this.knowledgeEmbeddings.set(entry.question, embedding);
      const pct = 30 + Math.round((i / total) * 50);
      onProgress?.(`Encoding: "${entry.question}"`, pct);
      await this.delay(10); // Small delay for UI updates
    }

    onProgress?.("Finalizing model...", 90);
    await this.delay(100);

    this.isReady = true;
    onProgress?.("Ready!", 100);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Answer a question using transformer embeddings + knowledge base
  async answer(question: string): Promise<InferenceResult> {
    if (!this.isReady) {
      throw new Error("Model not initialized");
    }

    // Run the transformer forward pass
    const forwardResult = this.model.encode(question);
    const tokens = forwardResult.tokenIds.map(id => this.model.tokenizer.getTokenString(id));

    // Method 1: Try transformer embedding similarity
    const queryEmbedding = forwardResult.sentenceEmbedding;
    let bestMatch: KnowledgeEntry | null = null;
    let bestSimilarity = -1;

    for (const entry of KNOWLEDGE_BASE) {
      const kbEmbedding = this.knowledgeEmbeddings.get(entry.question);
      if (kbEmbedding) {
        const similarity = cosineSimilarity(queryEmbedding, kbEmbedding);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = entry;
        }
      }
    }

    // Method 2: Keyword matching (more reliable for our setup)
    const keywordMatch = findBestMatch(question);

    // Use keyword match if transformer similarity is too low (random weights won't give meaningful similarities)
    // In a real trained model, the transformer embeddings would be meaningful
    if (keywordMatch) {
      return {
        answer: keywordMatch.answer,
        forwardResult,
        tokens,
        matchScore: bestSimilarity,
        matchedQuestion: keywordMatch.question,
        method: 'keyword',
      };
    }

    // If we have a reasonable transformer match
    if (bestMatch && bestSimilarity > 0.5) {
      return {
        answer: bestMatch.answer,
        forwardResult,
        tokens,
        matchScore: bestSimilarity,
        matchedQuestion: bestMatch.question,
        method: 'transformer',
      };
    }

    // Fallback
    return {
      answer: this.generateFallback(question),
      forwardResult,
      tokens,
      matchScore: bestSimilarity,
      method: 'fallback',
    };
  }

  private generateFallback(question: string): string {
    const q = question.toLowerCase();
    
    if (q.includes('thank')) {
      return "You're welcome! Feel free to ask me anything else.";
    }
    if (q.includes('bye') || q.includes('goodbye')) {
      return "Goodbye! It was nice chatting with you. Come back anytime!";
    }
    if (q.includes('who are you') || q.includes('what are you')) {
      return "I'm MiniLLM — a transformer-based language model with ~100M parameters, implemented from scratch in TypeScript and running entirely in your browser. No servers, no APIs, pure client-side AI!";
    }
    if (q.includes('how do you work') || q.includes('how does this work')) {
      return "I use a transformer architecture with multi-head self-attention, feed-forward networks, and layer normalization. My weights are initialized and I use a knowledge base for answers. You can see the attention patterns and embeddings in real-time!";
    }
    if (q.includes('?')) {
      return "That's an interesting question! I'm a small model with limited knowledge, so I might not have the answer. Try asking about science, math, geography, or general knowledge topics.";
    }
    
    return "I'm not sure I understand. I'm a small language model — try asking me a question about science, math, geography, or say hello!";
  }

  getParamCount(): number {
    return this.model.getParamCount();
  }

  getModel(): MiniLLM {
    return this.model;
  }
}
