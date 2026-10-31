// ─── Inference Pipeline ───────────────────────────────────────────
// Combines the transformer (for visualization) with the brain (for answers)

import { MiniLLM, ForwardResult } from '../transformer/model';
import { reason, ReasoningResult, getMemory, clearMemory } from '../brain/reasoning';

export interface InferenceResult {
  answer: string;
  confidence: number;
  forwardResult: ForwardResult;
  tokens: string[];
  reasoningSteps: Array<{ type: string; description: string; detail?: string }>;
  sources: string[];
  intent: string;
}

export class InferenceEngine {
  private model: MiniLLM;
  private isReady: boolean = false;

  constructor() {
    this.model = new MiniLLM();
  }

  async initialize(onProgress?: (msg: string, pct: number) => void): Promise<void> {
    onProgress?.("Building vocabulary...", 10);
    await this.delay(30);

    onProgress?.("Initializing transformer weights...", 20);
    await this.delay(30);

    onProgress?.("Loading knowledge graph...", 40);
    await this.delay(30);

    onProgress?.("Compiling reasoning engine...", 60);
    await this.delay(30);

    onProgress?.("Initializing intent classifier...", 75);
    await this.delay(30);

    onProgress?.("Setting up math engine...", 85);
    await this.delay(30);

    onProgress?.("Calibrating response composer...", 95);
    await this.delay(50);

    this.isReady = true;
    onProgress?.("Ready!", 100);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async answer(question: string): Promise<InferenceResult> {
    if (!this.isReady) {
      throw new Error("Model not initialized");
    }

    // Run transformer for visualization
    const forwardResult = this.model.encode(question);
    const tokens = forwardResult.tokenIds.map(id => this.model.tokenizer.getTokenString(id));

    // Run brain for actual answer
    const reasoningResult: ReasoningResult = reason(question);

    return {
      answer: reasoningResult.answer,
      confidence: reasoningResult.confidence,
      forwardResult,
      tokens,
      reasoningSteps: reasoningResult.steps,
      sources: reasoningResult.sources,
      intent: reasoningResult.intent.intent,
    };
  }

  clearMemory(): void {
    clearMemory();
  }

  getParamCount(): number {
    return this.model.getParamCount();
  }

  getModel(): MiniLLM {
    return this.model;
  }
}
