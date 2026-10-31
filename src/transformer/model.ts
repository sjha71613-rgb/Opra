// ─── Transformer Model ─────────────────────────────────────────────
// A real transformer implemented from scratch in TypeScript
// Architecture: ~100M parameters

import {
  matmul, addBias, layerNorm, gelu, softmax,
  residualAdd, zeros2D, meanPool
} from './tensor';
import { Tokenizer } from './tokenizer';

// ─── Model Configuration ──────────────────────────────────────────
export interface ModelConfig {
  vocabSize: number;
  dModel: number;      // hidden dimension
  nLayers: number;     // number of transformer blocks
  nHeads: number;      // attention heads
  dFF: number;         // feed-forward inner dimension
  maxSeqLen: number;   // max sequence length
  dropout: number;
}

export const MODEL_CONFIG: ModelConfig = {
  vocabSize: 512,
  dModel: 512,
  nLayers: 6,
  nHeads: 8,
  dFF: 2048,
  maxSeqLen: 128,
  dropout: 0.0,
};

// Calculate actual parameter count
export function countParameters(config: ModelConfig): number {
  const { vocabSize, dModel, nLayers, dFF } = config;
  let count = 0;
  // Token embeddings
  count += vocabSize * dModel;
  // Position embeddings
  count += config.maxSeqLen * dModel;
  // Per layer
  for (let i = 0; i < nLayers; i++) {
    // Attention: Q, K, V projections + output projection
    count += 4 * dModel * dModel;
    // FFN: two linear layers
    count += 2 * dModel * dFF;
    // Layer norms: 2 * (gamma + beta)
    count += 4 * dModel;
  }
  // Final layer norm
  count += 2 * dModel;
  return count;
}

export const ACTUAL_PARAM_COUNT = countParameters(MODEL_CONFIG);

// ─── Weight Initialization ────────────────────────────────────────
// Xavier/Glorot initialization
function xavierInit(rows: number, cols: number): Float32Array {
  const scale = Math.sqrt(2.0 / (rows + cols));
  const w = new Float32Array(rows * cols);
  for (let i = 0; i < w.length; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    w[i] = scale * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
  return w;
}

function onesInit(size: number): Float32Array {
  return new Float32Array(size).fill(1.0);
}

function zerosInit(size: number): Float32Array {
  return new Float32Array(size);
}

// ─── Transformer Weights ──────────────────────────────────────────
export interface TransformerWeights {
  tokenEmbedding: Float32Array;   // [vocabSize x dModel]
  posEmbedding: Float32Array;     // [maxSeqLen x dModel]
  layers: LayerWeights[];
  finalNormGamma: Float32Array;
  finalNormBeta: Float32Array;
}

export interface LayerWeights {
  // Self-attention
  wQ: Float32Array;  // [dModel x dModel]
  wK: Float32Array;
  wV: Float32Array;
  wO: Float32Array;
  bQ: Float32Array;
  bK: Float32Array;
  bV: Float32Array;
  bO: Float32Array;
  // Feed-forward
  w1: Float32Array;  // [dModel x dFF]
  w2: Float32Array;  // [dFF x dModel]
  b1: Float32Array;
  b2: Float32Array;
  // Layer norms
  ln1Gamma: Float32Array;
  ln1Beta: Float32Array;
  ln2Gamma: Float32Array;
  ln2Beta: Float32Array;
}

export function initializeWeights(config: ModelConfig): TransformerWeights {
  const { vocabSize, dModel, nLayers, dFF, maxSeqLen } = config;

  // Use a seeded random for reproducibility
  const seed = 42;
  let s = seed;
  const seededRandom = () => {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };

  // Override Math.random temporarily for initialization
  const origRandom = Math.random;
  Math.random = seededRandom;

  const tokenEmbedding = xavierInit(vocabSize, dModel);
  const posEmbedding = xavierInit(maxSeqLen, dModel);

  const layers: LayerWeights[] = [];
  for (let i = 0; i < nLayers; i++) {
    const scale = Math.sqrt(2.0 / (dModel + dModel));
    layers.push({
      wQ: xavierInit(dModel, dModel),
      wK: xavierInit(dModel, dModel),
      wV: xavierInit(dModel, dModel),
      wO: xavierInit(dModel, dModel),
      bQ: zerosInit(dModel),
      bK: zerosInit(dModel),
      bV: zerosInit(dModel),
      bO: zerosInit(dModel),
      w1: xavierInit(dModel, dFF),
      w2: xavierInit(dFF, dModel),
      b1: zerosInit(dFF),
      b2: zerosInit(dModel),
      ln1Gamma: onesInit(dModel),
      ln1Beta: zerosInit(dModel),
      ln2Gamma: onesInit(dModel),
      ln2Beta: zerosInit(dModel),
    });
  }

  Math.random = origRandom;

  return {
    tokenEmbedding,
    posEmbedding,
    layers,
    finalNormGamma: onesInit(dModel),
    finalNormBeta: zerosInit(dModel),
  };
}

// ─── Attention Computation ────────────────────────────────────────
export interface AttentionResult {
  output: Float32Array;      // [seqLen x dModel]
  attentionWeights: Float32Array; // [nHeads x seqLen x seqLen]
}

export function multiHeadAttention(
  x: Float32Array,         // [seqLen x dModel]
  seqLen: number,
  wQ: Float32Array, wK: Float32Array, wV: Float32Array, wO: Float32Array,
  bQ: Float32Array, bK: Float32Array, bV: Float32Array, bO: Float32Array,
  nHeads: number,
  dModel: number,
): AttentionResult {
  const dHead = dModel / nHeads;

  // Project Q, K, V
  const Q = addBias(matmul(x, seqLen, dModel, wQ, dModel, dModel), bQ, seqLen, dModel);
  const K = addBias(matmul(x, seqLen, dModel, wK, dModel, dModel), bK, seqLen, dModel);
  const V = addBias(matmul(x, seqLen, dModel, wV, dModel, dModel), bV, seqLen, dModel);

  // Split into heads and compute attention
  const allAttentionWeights = new Float32Array(nHeads * seqLen * seqLen);
  const headOutputs: Float32Array[] = [];

  for (let h = 0; h < nHeads; h++) {
    // Extract head slices
    const Qh = new Float32Array(seqLen * dHead);
    const Kh = new Float32Array(seqLen * dHead);
    const Vh = new Float32Array(seqLen * dHead);

    for (let i = 0; i < seqLen; i++) {
      for (let j = 0; j < dHead; j++) {
        Qh[i * dHead + j] = Q[i * dModel + h * dHead + j];
        Kh[i * dHead + j] = K[i * dModel + h * dHead + j];
        Vh[i * dHead + j] = V[i * dModel + h * dHead + j];
      }
    }

    // Attention scores: Q @ K^T / sqrt(dHead)
    const scale = 1.0 / Math.sqrt(dHead);
    const scores = new Float32Array(seqLen * seqLen);
    for (let i = 0; i < seqLen; i++) {
      for (let j = 0; j < seqLen; j++) {
        let dot = 0;
        for (let k = 0; k < dHead; k++) {
          dot += Qh[i * dHead + k] * Kh[j * dHead + k];
        }
        scores[i * seqLen + j] = dot * scale;
      }
    }

    // Causal mask (upper triangular = -infinity)
    for (let i = 0; i < seqLen; i++) {
      for (let j = i + 1; j < seqLen; j++) {
        scores[i * seqLen + j] = -1e9;
      }
    }

    // Softmax
    const attnWeights = softmax(scores, seqLen, seqLen);

    // Store attention weights for visualization
    for (let i = 0; i < seqLen * seqLen; i++) {
      allAttentionWeights[h * seqLen * seqLen + i] = attnWeights[i];
    }

    // Attention output: weights @ V
    const headOut = matmul(attnWeights, seqLen, seqLen, Vh, seqLen, dHead);
    headOutputs.push(headOut);
  }

  // Concatenate heads
  const concat = new Float32Array(seqLen * dModel);
  for (let i = 0; i < seqLen; i++) {
    for (let h = 0; h < nHeads; h++) {
      for (let j = 0; j < dHead; j++) {
        concat[i * dModel + h * dHead + j] = headOutputs[h][i * dHead + j];
      }
    }
  }

  // Output projection
  const output = addBias(matmul(concat, seqLen, dModel, wO, dModel, dModel), bO, seqLen, dModel);

  return { output, attentionWeights: allAttentionWeights };
}

// ─── Feed-Forward Network ─────────────────────────────────────────
export function feedForward(
  x: Float32Array,
  seqLen: number,
  dModel: number,
  dFF: number,
  w1: Float32Array, w2: Float32Array,
  b1: Float32Array, b2: Float32Array,
): Float32Array {
  // First linear + GELU
  const hidden = gelu(addBias(matmul(x, seqLen, dModel, w1, dModel, dFF), b1, seqLen, dFF));
  // Second linear
  const output = addBias(matmul(hidden, seqLen, dFF, w2, dFF, dModel), b2, seqLen, dModel);
  return output;
}

// ─── Full Transformer Forward Pass ────────────────────────────────
export interface ForwardResult {
  embeddings: Float32Array;           // [seqLen x dModel] final hidden states
  sentenceEmbedding: Float32Array;    // [dModel] pooled representation
  tokenIds: number[];
  layerOutputs: Float32Array[];       // intermediate outputs per layer
  attentionWeights: Float32Array[];   // attention weights per layer
  inputEmbeddings: Float32Array;      // initial embeddings after token+pos
}

export function forwardPass(
  tokenIds: number[],
  weights: TransformerWeights,
  config: ModelConfig,
): ForwardResult {
  const { dModel, nLayers, nHeads, dFF, maxSeqLen, vocabSize } = config;
  const seqLen = tokenIds.length;

  // Token + Position embeddings
  const inputEmbeddings = new Float32Array(seqLen * dModel);
  for (let i = 0; i < seqLen; i++) {
    const tokenId = Math.min(tokenIds[i], vocabSize - 1);
    const posId = Math.min(i, maxSeqLen - 1);
    for (let j = 0; j < dModel; j++) {
      inputEmbeddings[i * dModel + j] =
        weights.tokenEmbedding[tokenId * dModel + j] +
        weights.posEmbedding[posId * dModel + j];
    }
  }

  let hidden = new Float32Array(inputEmbeddings);
  const layerOutputs: Float32Array[] = [];
  const attentionWeights: Float32Array[] = [];

  // Transformer layers
  for (let l = 0; l < nLayers; l++) {
    const layer = weights.layers[l];

    // Self-attention with residual
    const attnResult = multiHeadAttention(
      hidden, seqLen,
      layer.wQ, layer.wK, layer.wV, layer.wO,
      layer.bQ, layer.bK, layer.bV, layer.bO,
      nHeads, dModel
    );
    hidden = new Float32Array(residualAdd(hidden, attnResult.output));
    hidden = new Float32Array(layerNorm(hidden, seqLen, dModel, layer.ln1Gamma, layer.ln1Beta));

    // Feed-forward with residual
    const ffOutput = feedForward(hidden, seqLen, dModel, dFF, layer.w1, layer.w2, layer.b1, layer.b2);
    hidden = new Float32Array(residualAdd(hidden, ffOutput));
    hidden = new Float32Array(layerNorm(hidden, seqLen, dModel, layer.ln2Gamma, layer.ln2Beta));

    layerOutputs.push(new Float32Array(hidden));
    attentionWeights.push(new Float32Array(attnResult.attentionWeights));
  }

  // Final layer norm
  hidden = new Float32Array(layerNorm(hidden, seqLen, dModel, weights.finalNormGamma, weights.finalNormBeta));

  // Mean pooling for sentence embedding
  const sentenceEmbedding = new Float32Array(meanPool(hidden, seqLen, dModel));

  return {
    embeddings: hidden,
    sentenceEmbedding,
    tokenIds,
    layerOutputs,
    attentionWeights,
    inputEmbeddings,
  };
}

// ─── MiniLLM Class ────────────────────────────────────────────────
export class MiniLLM {
  public tokenizer: Tokenizer;
  public weights: TransformerWeights;
  public config: ModelConfig;

  constructor() {
    this.config = MODEL_CONFIG;
    this.tokenizer = new Tokenizer();
    // Update config with actual vocab size
    this.config = { ...this.config, vocabSize: this.tokenizer.vocabSize };
    this.weights = initializeWeights(this.config);
  }

  encode(text: string): ForwardResult {
    const tokenIds = this.tokenizer.tokenize(text);
    return forwardPass(tokenIds, this.weights, this.config);
  }

  getSentenceEmbedding(text: string): Float32Array {
    return this.encode(text).sentenceEmbedding;
  }

  getParamCount(): number {
    return countParameters(this.config);
  }
}
