import { pipeline, TextGenerationPipeline } from "@huggingface/transformers";

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
}

export const MODEL_INFO: ModelInfo = {
  name: "DistilGPT-2",
  parameters: "~82 Million",
  architecture: "Transformer Decoder (GPT-2)",
  layers: 6,
  hiddenSize: 768,
  attentionHeads: 12,
  vocabularySize: 50257,
  contextLength: 1024,
  trainingData: "WebText (8M documents, ~40GB)",
  size: "~320 MB (quantized)",
};

let generator: TextGenerationPipeline | null = null;
let isLoading = false;

export type ProgressCallback = (progress: {
  status: string;
  progress: number;
  file?: string;
}) => void;

export async function loadModel(
  onProgress?: ProgressCallback
): Promise<TextGenerationPipeline> {
  if (generator) return generator;
  if (isLoading) {
    // Wait for loading to complete
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return generator!;
  }

  isLoading = true;

  try {
    onProgress?.({ status: "Initializing model...", progress: 0 });

    generator = await pipeline(
      "text-generation",
      "Xenova/distilgpt2",
      {
        progress_callback: (data: any) => {
          if (data.status === "download" || data.status === "progress") {
            const progress = data.progress || 0;
            const file = data.file || "";
            onProgress?.({
              status: `Loading model weights...`,
              progress: Math.min(progress, 100),
              file,
            });
          } else if (data.status === "ready") {
            onProgress?.({ status: "Model ready!", progress: 100 });
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

export function formatPrompt(question: string): string {
  // Format the question as a prompt for the model
  // DistilGPT2 works best with completion-style prompts
  const prompt = `Q: ${question}\nA:`;
  return prompt;
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

  const prompt = formatPrompt(question);

  const result = await generator(prompt, {
    max_new_tokens: options?.maxLength || 100,
    temperature: options?.temperature || 0.7,
    top_k: options?.topK || 50,
    top_p: options?.topP || 0.95,
    repetition_penalty: options?.repetitionPenalty || 1.2,
    do_sample: true,
    num_return_sequences: 1,
  });

  // Extract the generated text after "A:"
  let response = result[0].generated_text;
  const aIndex = response.indexOf("A:");
  if (aIndex !== -1) {
    response = response.substring(aIndex + 2).trim();
  }

  // Clean up the response - remove any trailing Q: that might indicate the model is generating another question
  const nextQ = response.indexOf("\nQ:");
  if (nextQ !== -1) {
    response = response.substring(0, nextQ).trim();
  }

  return response || "I'm not sure how to answer that. Could you try rephrasing?";
}

export function isModelLoaded(): boolean {
  return generator !== null;
}
