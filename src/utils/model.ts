import { pipeline, Text2TextGenerationPipeline } from "@huggingface/transformers";

export interface ModelInfo {
  name: string;
  parameters: string;
  architecture: string;
  layers: number;
  hiddenSize: number;
  attentionHeads: number;
  vocabularySize: number;
  contextLength: number;
  trainingData: string;
  size: string;
  task: string;
}

export const MODEL_INFO: ModelInfo = {
  name: "FLAN-T5-Small",
  parameters: "80 Million",
  architecture: "Encoder-Decoder Transformer (T5)",
  layers: 8,
  hiddenSize: 512,
  attentionHeads: 6,
  vocabularySize: 32128,
  contextLength: 512,
  trainingData: "Mixed instruction-tuned data (C4, FLAN collections)",
  size: "~300 MB",
  task: "Text-to-Text (Instruction Following)",
};

let generator: Text2TextGenerationPipeline | null = null;
let isLoading = false;

export type ProgressCallback = (progress: {
  status: string;
  progress: number;
  file?: string;
}) => void;

export async function loadModel(
  onProgress?: ProgressCallback
): Promise<Text2TextGenerationPipeline> {
  if (generator) return generator;
  if (isLoading) {
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return generator!;
  }

  isLoading = true;

  try {
    onProgress?.({ status: "Initializing FLAN-T5-Small...", progress: 0 });

    generator = await pipeline(
      "text2text-generation",
      "Xenova/flan-t5-small",
      {
        progress_callback: (data: any) => {
          if (data.status === "download" || data.status === "progress") {
            const progress = data.progress || 0;
            const file = data.file || "";
            onProgress?.({
              status: `Downloading ${file || "model files"}...`,
              progress: Math.min(progress, 100),
              file,
            });
          } else if (data.status === "ready") {
            onProgress?.({ status: "Model ready!", progress: 100 });
          } else if (data.status === "initiate") {
            onProgress?.({ status: "Loading model into memory...", progress: 90 });
          }
        },
      }
    );

    onProgress?.({ status: "Model loaded successfully!", progress: 100 });
    return generator;
  } catch (error) {
    isLoading = false;
    throw error;
  } finally {
    isLoading = false;
  }
}

export async function generateResponse(
  question: string,
  options?: {
    maxLength?: number;
    temperature?: number;
    topK?: number;
    topP?: number;
    repetitionPenalty?: number;
  }
): Promise<string> {
  if (!generator) {
    throw new Error("Model not loaded. Please wait for the model to load.");
  }

  // FLAN-T5 is instruction-tuned, so we can just pass the question directly
  const result = await generator(question, {
    max_new_tokens: options?.maxLength || 150,
    temperature: options?.temperature || 0.7,
    top_k: options?.topK || 50,
    top_p: options?.topP || 0.95,
    repetition_penalty: options?.repetitionPenalty || 1.2,
    do_sample: true,
  });

  const response = result[0]?.generated_text?.trim();
  return response || "I'm not sure how to answer that. Could you try rephrasing your question?";
}

export function isModelLoaded(): boolean {
  return generator !== null;
}
