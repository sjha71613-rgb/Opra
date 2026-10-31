// ─── Math Engine ──────────────────────────────────────────────────
// Parses and evaluates mathematical expressions

export interface MathResult {
  success: boolean;
  result?: number;
  expression?: string;
  error?: string;
  steps?: string[];
}

// Tokenize a math expression
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    
    if (ch === ' ') continue;
    
    if ('0123456789.'.includes(ch)) {
      current += ch;
    } else if (current.length > 0 && !'+-*/()^%'.includes(ch)) {
      tokens.push(current);
      current = '';
      tokens.push(ch);
    } else {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      tokens.push(ch);
    }
  }
  
  if (current.length > 0) tokens.push(current);
  return tokens;
}

// Recursive descent parser
class Parser {
  private tokens: string[];
  private pos: number = 0;
  public steps: string[] = [];

  constructor(tokens: string[]) {
    this.tokens = tokens;
  }

  private peek(): string | undefined {
    return this.tokens[this.pos];
  }

  private consume(): string {
    return this.tokens[this.pos++];
  }

  // Expression: Term (('+' | '-') Term)*
  parseExpression(): number {
    let result = this.parseTerm();
    
    while (this.peek() === '+' || this.peek() === '-') {
      const op = this.consume();
      const right = this.parseTerm();
      if (op === '+') {
        this.steps.push(`${result} + ${right} = ${result + right}`);
        result += right;
      } else {
        this.steps.push(`${result} - ${right} = ${result - right}`);
        result -= right;
      }
    }
    
    return result;
  }

  // Term: Factor (('*' | '/' | '%') Factor)*
  parseTerm(): number {
    let result = this.parsePower();
    
    while (this.peek() === '*' || this.peek() === '/' || this.peek() === '%') {
      const op = this.consume();
      const right = this.parsePower();
      if (op === '*') {
        this.steps.push(`${result} × ${right} = ${result * right}`);
        result *= right;
      } else if (op === '/') {
        if (right === 0) throw new Error("Division by zero");
        this.steps.push(`${result} ÷ ${right} = ${result / right}`);
        result /= right;
      } else {
        this.steps.push(`${result} mod ${right} = ${result % right}`);
        result %= right;
      }
    }
    
    return result;
  }

  // Power: Unary ('^' Unary)*
  parsePower(): number {
    let result = this.parseUnary();
    
    while (this.peek() === '^') {
      this.consume();
      const right = this.parseUnary();
      this.steps.push(`${result}^${right} = ${Math.pow(result, right)}`);
      result = Math.pow(result, right);
    }
    
    return result;
  }

  // Unary: ('-' | '+') Unary | Primary
  parseUnary(): number {
    if (this.peek() === '-') {
      this.consume();
      const val = this.parseUnary();
      this.steps.push(`-${val} = ${-val}`);
      return -val;
    }
    if (this.peek() === '+') {
      this.consume();
      return this.parseUnary();
    }
    return this.parsePrimary();
  }

  // Primary: Number | '(' Expression ')' | Function
  parsePrimary(): number {
    const token = this.peek();
    
    if (token === '(') {
      this.consume();
      const result = this.parseExpression();
      if (this.peek() === ')') this.consume();
      return result;
    }
    
    // Functions
    if (token === 'sqrt') {
      this.consume();
      if (this.peek() === '(') this.consume();
      const val = this.parseExpression();
      if (this.peek() === ')') this.consume();
      const result = Math.sqrt(val);
      this.steps.push(`√${val} = ${result}`);
      return result;
    }
    
    if (token === 'abs') {
      this.consume();
      if (this.peek() === '(') this.consume();
      const val = this.parseExpression();
      if (this.peek() === ')') this.consume();
      return Math.abs(val);
    }

    if (token === 'sin' || token === 'cos' || token === 'tan') {
      const func = this.consume();
      if (this.peek() === '(') this.consume();
      const val = this.parseExpression();
      if (this.peek() === ')') this.consume();
      let result: number;
      if (func === 'sin') result = Math.sin(val);
      else if (func === 'cos') result = Math.cos(val);
      else result = Math.tan(val);
      this.steps.push(`${func}(${val}) = ${result}`);
      return result;
    }
    
    if (token === 'pi') {
      this.consume();
      return Math.PI;
    }
    
    // Number
    const num = parseFloat(token || '');
    if (isNaN(num)) throw new Error(`Unexpected token: ${token}`);
    this.consume();
    return num;
  }
}

// Convert English math questions to expressions
export function extractMathExpression(question: string): string | null {
  let q = question.toLowerCase().trim();
  
  // Remove question prefixes
  q = q.replace(/^(what\s+is|calculate|compute|evaluate|solve|whats)\s*/i, '');
  q = q.replace(/\?$/, '').trim();
  
  // Convert English to math symbols
  q = q.replace(/\bplus\b/g, '+');
  q = q.replace(/\bminus\b/g, '-');
  q = q.replace(/\btimes\b/g, '*');
  q = q.replace(/\bmultiplied\s*by\b/g, '*');
  q = q.replace(/\bdivided\s*by\b/g, '/');
  q = q.replace(/\bover\b/g, '/');
  q = q.replace(/\bmod\b/g, '%');
  q = q.replace(/\bmodulo\b/g, '%');
  q = q.replace(/\bto\s*the\s*power\s*of\b/g, '^');
  q = q.replace(/\bsquared\b/g, '^2');
  q = q.replace(/\bcubed\b/g, '^3');
  q = q.replace(/\bsquare\s*root\s*(of)?\s*/g, 'sqrt(');
  q = q.replace(/\bpercent\s*of\b/g, '/100*');
  q = q.replace(/(\d+)\s*%\s*of\s*(\d+)/g, '($1/100)*$2');
  q = q.replace(/x/g, '*'); // common multiplication notation
  
  // Handle "what is X% of Y"
  const percentMatch = q.match(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/);
  if (percentMatch) {
    return `(${percentMatch[1]}/100)*${percentMatch[2]}`;
  }
  
  // Check if it looks like a math expression
  if (/[\d]+\s*[\+\-\*\/\^]\s*[\d]+/.test(q) || q.includes('sqrt')) {
    // Close any unclosed parentheses from sqrt conversion
    const openParens = (q.match(/\(/g) || []).length;
    const closeParens = (q.match(/\)/g) || []).length;
    q += ')'.repeat(Math.max(0, openParens - closeParens));
    return q;
  }
  
  return null;
}

// Main evaluation function
export function evaluateMath(question: string): MathResult {
  const expression = extractMathExpression(question);
  
  if (!expression) {
    return { success: false, error: "No math expression found" };
  }
  
  try {
    const tokens = tokenize(expression);
    const parser = new Parser(tokens);
    const result = parser.parseExpression();
    
    // Format result nicely
    const formatted = Number.isInteger(result) ? result.toString() : 
                      parseFloat(result.toFixed(8)).toString();
    
    return {
      success: true,
      result,
      expression,
      steps: parser.steps,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid expression",
      expression,
    };
  }
}

// Special math knowledge
export const MATH_FACTS: Record<string, string> = {
  "pi": `Pi (π) ≈ 3.14159265358979... It's the ratio of a circle's circumference to its diameter. It's an irrational number, meaning its decimal representation never ends or repeats.`,
  "e": `Euler's number (e) ≈ 2.718281828... It's the base of natural logarithms and appears in compound interest, probability, and calculus.`,
  "golden ratio": `The golden ratio (φ) ≈ 1.618033988... It appears in art, architecture, and nature. Two quantities are in the golden ratio if their ratio equals the ratio of their sum to the larger quantity.`,
  "pythagorean theorem": `The Pythagorean theorem states that in a right triangle: a² + b² = c², where c is the hypotenuse. Discovered by Pythagoras (~570-495 BC).`,
  "fibonacci": `The Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34... Each number is the sum of the two preceding ones. It appears throughout nature in spirals and patterns.`,
};
