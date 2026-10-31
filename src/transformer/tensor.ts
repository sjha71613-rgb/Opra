// ─── Tensor Operations ─────────────────────────────────────────────
// Pure TypeScript tensor math — no external libraries

export type Tensor1D = Float32Array;
export type Tensor2D = Float32Array; // row-major: [rows * cols]
export type Tensor3D = Float32Array; // [depth * rows * cols]

export function zeros(size: number): Float32Array {
  return new Float32Array(size);
}

export function zeros2D(rows: number, cols: number): Float32Array {
  return new Float32Array(rows * cols);
}

export function matmul(a: Float32Array, aRows: number, aCols: number,
                       b: Float32Array, bRows: number, bCols: number): Float32Array {
  // a: [aRows x aCols], b: [bRows x bCols] => [aRows x bCols]
  const result = new Float32Array(aRows * bCols);
  for (let i = 0; i < aRows; i++) {
    for (let j = 0; j < bCols; j++) {
      let sum = 0;
      for (let k = 0; k < aCols; k++) {
        sum += a[i * aCols + k] * b[k * bCols + j];
      }
      result[i * bCols + j] = sum;
    }
  }
  return result;
}

export function addBias(a: Float32Array, bias: Float32Array, rows: number, cols: number): Float32Array {
  const result = new Float32Array(a.length);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i * cols + j] = a[i * cols + j] + bias[j];
    }
  }
  return result;
}

export function layerNorm(x: Float32Array, rows: number, dim: number,
                          gamma: Float32Array, beta: Float32Array, eps: number = 1e-5): Float32Array {
  const result = new Float32Array(x.length);
  for (let i = 0; i < rows; i++) {
    const offset = i * dim;
    // Compute mean
    let mean = 0;
    for (let j = 0; j < dim; j++) mean += x[offset + j];
    mean /= dim;
    // Compute variance
    let variance = 0;
    for (let j = 0; j < dim; j++) {
      const diff = x[offset + j] - mean;
      variance += diff * diff;
    }
    variance /= dim;
    // Normalize
    const std = Math.sqrt(variance + eps);
    for (let j = 0; j < dim; j++) {
      result[offset + j] = gamma[j] * ((x[offset + j] - mean) / std) + beta[j];
    }
  }
  return result;
}

export function gelu(x: Float32Array): Float32Array {
  const result = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const val = x[i];
    // Approximation of GELU
    result[i] = 0.5 * val * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (val + 0.044715 * val * val * val)));
  }
  return result;
}

export function softmax(x: Float32Array, rows: number, cols: number): Float32Array {
  const result = new Float32Array(x.length);
  for (let i = 0; i < rows; i++) {
    const offset = i * cols;
    let maxVal = -Infinity;
    for (let j = 0; j < cols; j++) {
      if (x[offset + j] > maxVal) maxVal = x[offset + j];
    }
    let sum = 0;
    for (let j = 0; j < cols; j++) {
      result[offset + j] = Math.exp(x[offset + j] - maxVal);
      sum += result[offset + j];
    }
    for (let j = 0; j < cols; j++) {
      result[offset + j] /= sum;
    }
  }
  return result;
}

export function residualAdd(a: Float32Array, b: Float32Array): Float32Array {
  const result = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] + b[i];
  }
  return result;
}

// Cosine similarity between two vectors
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// Mean pooling: average all token embeddings into one vector
export function meanPool(x: Float32Array, seqLen: number, dim: number): Float32Array {
  const result = new Float32Array(dim);
  for (let j = 0; j < dim; j++) {
    let sum = 0;
    for (let i = 0; i < seqLen; i++) {
      sum += x[i * dim + j];
    }
    result[j] = sum / seqLen;
  }
  return result;
}
