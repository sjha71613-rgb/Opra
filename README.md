# OPRA - Hand-Coded Language Model

<div align="center">

**A transformer language model built entirely from scratch in TypeScript**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Build](https://github.com/YOUR_USERNAME/opra/actions/workflows/build.yml/badge.svg)](https://github.com/YOUR_USERNAME/opra/actions)

*No external ML libraries • No pre-trained weights • 100% hand-coded • Runs in browser*

</div>

## 🎯 What is OPRA?

OPRA is a **proof-of-concept** demonstrating that a real language model can be hand-coded from first principles. Every component — from matrix multiplication to multi-head attention to the reasoning engine — was implemented by hand in TypeScript.

This is **NOT**:
- ❌ A wrapper around GPT-2, BERT, or any existing model
- ❌ Using Hugging Face Transformers, TensorFlow, or PyTorch
- ❌ Loading pre-trained weights from the internet
- ❌ Calling an API or cloud service

This **IS**:
- ✅ Custom matrix multiplication implementation
- ✅ Hand-coded multi-head self-attention
- ✅ From-scratch layer normalization and GELU activation
- ✅ Custom recursive descent parser for math
- ✅ Pattern-based intent classification
- ✅ Structured knowledge graph with 500+ facts
- ✅ 100% browser-based, no server required

## 🧠 Architecture

### Transformer (Visualization)
The transformer runs a forward pass on every query to generate attention patterns and embeddings for visualization. The weights are randomly initialized (Xavier initialization) since this is a demonstration, not a trained model.

**Components:**
- 6 transformer layers
- 512 hidden dimensions
- 8 attention heads
- Custom matrix multiplication
- Causal masking for autoregressive generation
- Layer normalization with learnable parameters
- GELU activation function
- Residual connections

**Implementation files:**
```
src/transformer/
├── tensor.ts       # Matrix operations (matmul, layernorm, softmax, etc.)
├── tokenizer.ts    # Word-level tokenizer
├── model.ts        # Full transformer implementation
└── inference.ts    # Inference pipeline
```

### Brain (Actual Intelligence)
The reasoning engine handles the actual question answering using:

**1. Intent Classification**
- Pattern-based classification (16+ intent types)
- Regex matching for greetings, math, facts, comparisons, etc.
- No ML model — pure pattern matching

**2. Knowledge Graph**
- 40+ entities (planets, countries, elements, animals, etc.)
- 500+ structured facts
- Entity search with fuzzy matching
- Fact extraction based on question patterns

**3. Math Engine**
- Recursive descent parser
- Supports: +, -, *, /, ^, %, sqrt, sin, cos, tan
- English parsing: "15% of 200", "2 plus 2"
- Step-by-step calculation tracking

**4. Conversational Memory**
- Tracks conversation context
- Resolves pronoun references
- Maintains topic history

**5. Answer Composition**
- Combines multiple facts
- Generates varied, natural responses
- Formats with markdown

**Implementation files:**
```
src/brain/
├── knowledge.ts    # Knowledge graph (500+ facts)
├── intent.ts       # Intent classification
├── math.ts         # Math expression evaluator
├── memory.ts       # Conversational memory
└── reasoning.ts    # Main reasoning engine
```

## 🚀 Features

### ✅ What Works Well
- **Factual Q&A**: "What is the capital of Japan?" → "The capital of Japan is **Tokyo**."
- **Math**: "What is 15% of 200?" → "The answer is **30**" (with steps)
- **Entity facts**: "How many moons does Jupiter have?" → "Jupiter has **95** moons."
- **Definitions**: "What is DNA?" → Comprehensive explanation with key facts
- **Comparisons**: "Compare Earth and Mars" → Side-by-side fact comparison
- **Conversational**: Remembers context, handles follow-ups
- **Visualization**: See actual attention patterns and embeddings in real-time

### 🎨 Visualization
Click "View transformer internals" on any response to see:
- **Tokenization**: How your question is split into tokens
- **Embeddings**: Input embeddings as heatmaps
- **Attention Patterns**: All 8 attention heads visualized
- **Layer Outputs**: Hidden states after each transformer layer
- **Reasoning Chain**: Step-by-step reasoning process

## 📊 Example Interactions

```
User: What is the capital of France?
OPRA: The capital of France is **Paris**.

User: How many moons does Jupiter have?
OPRA: Jupiter has **95** moons.

User: What is 42 times 17?
OPRA: The answer is **714**
Steps:
• 42 × 17 = 714

User: Tell me about DNA
OPRA: **DNA**
DNA is the molecule that carries genetic instructions...

**Key facts:**
• **Structure**: Double helix
• **Discovered By**: Watson and Crick (1953)
• **Components**: Adenine, Thymine, Guanine, Cytosine
...

User: What is 15% of 200?
OPRA: The answer is **30**
Steps:
• 15 / 100 = 0.15
• 0.15 × 200 = 30
```

## 🔧 Technical Details

### Transformer Implementation
All transformer components implemented from scratch:

**Matrix Multiplication** (`tensor.ts`):
```typescript
export function matmul(a: Float32Array, aRows: number, aCols: number,
                       b: Float32Array, bRows: number, bCols: number): Float32Array {
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
```

**Multi-Head Attention** (`model.ts`):
```typescript
export function multiHeadAttention(
  x: Float32Array, seqLen: number,
  wQ: Float32Array, wK: Float32Array, wV: Float32Array, wO: Float32Array,
  bQ: Float32Array, bK: Float32Array, bV: Float32Array, bO: Float32Array,
  nHeads: number, dModel: number
): AttentionResult {
  // Project Q, K, V
  const Q = addBias(matmul(x, seqLen, dModel, wQ, dModel, dModel), bQ, seqLen, dModel);
  const K = addBias(matmul(x, seqLen, dModel, wK, dModel, dModel), bK, seqLen, dModel);
  const V = addBias(matmul(x, seqLen, dModel, wV, dModel, dModel), bV, seqLen, dModel);
  
  // Split into heads and compute attention
  // ... (see model.ts for full implementation)
}
```

**Math Parser** (`math.ts`):
```typescript
class Parser {
  parseExpression(): number {
    let result = this.parseTerm();
    while (this.peek() === '+' || this.peek() === '-') {
      const op = this.consume();
      const right = this.parseTerm();
      if (op === '+') result += right;
      else result -= right;
    }
    return result;
  }
  
  parseTerm(): number {
    let result = this.parsePower();
    while (this.peek() === '*' || this.peek() === '/') {
      const op = this.consume();
      const right = this.parsePower();
      if (op === '*') result *= right;
      else result /= right;
    }
    return result;
  }
  // ... (recursive descent for all operations)
}
```

### Knowledge Graph Structure
```typescript
interface Entity {
  name: string;
  type: string;
  aliases: string[];
  facts: Record<string, string>;
  description: string;
  category: string;
}

// Example:
{
  name: "Jupiter",
  type: "planet",
  aliases: ["jupiter"],
  description: "The largest planet in our solar system",
  facts: {
    distance_from_sun: "778.5 million km",
    diameter: "139,820 km",
    moons: "95",
    orbital_period: "11.86 years",
    type: "Gas Giant",
    // ... more facts
  }
}
```

## 📈 Performance

- **Bundle size**: 219KB (gzipped: 70KB)
- **Load time**: ~2 seconds
- **Response time**: <100ms (most queries)
- **Memory**: ~50MB
- **Privacy**: 100% local, no data leaves browser

## 🎓 Educational Value

This project demonstrates:
1. **Transformer architecture**: Real implementation of attention, FFN, layernorm
2. **NLP pipeline**: Tokenization → encoding → reasoning → generation
3. **Knowledge representation**: Structured facts vs. learned embeddings
4. **Intent classification**: Pattern-based understanding
5. **Compositional reasoning**: Combining multiple facts
6. **Browser ML**: Running complex models client-side
7. **From-scratch development**: No reliance on existing frameworks

## 🚧 Limitations

- **Not trained**: Transformer weights are random (for visualization only)
- **Limited knowledge**: Only 40+ entities in knowledge graph
- **No learning**: Cannot improve from interactions
- **Pattern-based**: Intent classification uses regex, not ML
- **No fine-tuning**: Cannot adapt to specific domains

## 🔮 Future Upgrades

To make this a "real" trained model:
1. Collect training data (question-answer pairs)
2. Implement backpropagation
3. Train on real conversational data
4. Fine-tune on instruction-following datasets
5. Expand knowledge graph to 10,000+ entities
6. Add semantic search with learned embeddings

## 📝 License

MIT - Built for educational purposes

## 🙏 Acknowledgments

This project was built to demonstrate that a language model can be implemented from first principles without relying on existing ML frameworks. All code is original and hand-written.

---

**Built from scratch in TypeScript • No external ML libraries • 100% hand-coded • Open source**
