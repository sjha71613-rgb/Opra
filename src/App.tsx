import { useState, useEffect, useRef, useCallback } from "react";
import { InferenceEngine, InferenceResult } from "./transformer/inference";
import { MODEL_CONFIG, ACTUAL_PARAM_COUNT } from "./transformer/model";
import {
  Brain,
  Send,
  Cpu,
  Zap,
  X,
  Sparkles,
  Shield,
  ChevronDown,
  RotateCcw,
  Layers,
  Database,
  Hash,
  Eye,
  Network,
  BarChart3,
  Activity,
  Lightbulb,
  Target,
  BookOpen,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  inferenceResult?: InferenceResult;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content:
        "I'm MiniLLM — a transformer language model with ~100M parameters, built from scratch in TypeScript. I can answer questions about science, math, geography, history, and more. Try asking me something!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStatus, setLoadStatus] = useState("Initializing...");
  const [showViz, setShowViz] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef<InferenceEngine | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeModel = useCallback(async () => {
    const engine = new InferenceEngine();
    engineRef.current = engine;

    try {
      await engine.initialize((msg, pct) => {
        setLoadStatus(msg);
        setLoadProgress(pct);
      });
      setModelStatus("ready");
    } catch (error) {
      console.error("Failed to initialize model:", error);
      setModelStatus("error");
    }
  }, []);

  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating || modelStatus !== "ready") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const question = input.trim();
    setInput("");
    setIsGenerating(true);

    try {
      const result = await engineRef.current!.answer(question);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.answer,
        timestamp: new Date(),
        inferenceResult: result,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    engineRef.current?.clearMemory();
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "system",
        content: "Chat cleared! Memory reset. Ask me anything!",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="h-screen w-screen flex bg-[#09090b] text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } flex-shrink-0 transition-all duration-300 overflow-hidden border-r border-white/[0.06] bg-[#0c0c0f]`}
      >
        <div className="w-72 h-full flex flex-col">
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight">MiniLLM</h1>
                <p className="text-[10px] text-white/30 font-medium">Custom Transformer • Level 6</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  modelStatus === "ready"
                    ? "bg-emerald-400 shadow-lg shadow-emerald-400/50"
                    : modelStatus === "error"
                    ? "bg-red-400"
                    : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="text-[11px] font-medium text-white/50">
                {modelStatus === "ready" ? "All Systems Active" : modelStatus === "error" ? "Error" : "Booting..."}
              </span>
            </div>
            {modelStatus === "loading" && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/30 truncate">{loadStatus}</span>
                  <span className="text-violet-400 font-mono ml-2">{Math.round(loadProgress)}%</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
              </div>
            )}
            {modelStatus === "error" && (
              <button onClick={initializeModel} className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Retry
              </button>
            )}
          </div>

          {/* Architecture */}
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Transformer</h3>
            <div className="space-y-2">
              <SidebarStat icon={<Hash className="w-3 h-3" />} label="Parameters" value="~100M" accent />
              <SidebarStat icon={<Layers className="w-3 h-3" />} label="Layers" value={MODEL_CONFIG.nLayers.toString()} />
              <SidebarStat icon={<Cpu className="w-3 h-3" />} label="Hidden Dim" value={MODEL_CONFIG.dModel.toString()} />
              <SidebarStat icon={<Zap className="w-3 h-3" />} label="Heads" value={MODEL_CONFIG.nHeads.toString()} />
              <SidebarStat icon={<Database className="w-3 h-3" />} label="FFN Dim" value={MODEL_CONFIG.dFF.toString()} />
              <SidebarStat icon={<Network className="w-3 h-3" />} label="Vocab" value={MODEL_CONFIG.vocabSize.toString()} />
            </div>

            <h3 className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3 mt-5">Brain</h3>
            <div className="space-y-1.5">
              <FeatureBadge icon={<Target className="w-3 h-3" />} text="Intent Classification" />
              <FeatureBadge icon={<BookOpen className="w-3 h-3" />} text="Knowledge Graph (500+ facts)" />
              <FeatureBadge icon={<Lightbulb className="w-3 h-3" />} text="Compositional Reasoning" />
              <FeatureBadge icon={<Activity className="w-3 h-3" />} text="Math Engine" />
              <FeatureBadge icon={<Brain className="w-3 h-3" />} text="Conversational Memory" />
              <FeatureBadge icon={<Sparkles className="w-3 h-3" />} text="Answer Composition" />
            </div>

            <h3 className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3 mt-5">Try Asking</h3>
            <div className="space-y-1.5 text-[10px] text-white/25">
              <div className="py-1 px-2 rounded bg-white/[0.02]">"What is the capital of Japan?"</div>
              <div className="py-1 px-2 rounded bg-white/[0.02]">"How many moons does Jupiter have?"</div>
              <div className="py-1 px-2 rounded bg-white/[0.02]">"What is 15% of 200?"</div>
              <div className="py-1 px-2 rounded bg-white/[0.02]">"Tell me about DNA"</div>
              <div className="py-1 px-2 rounded bg-white/[0.02]">"What is the speed of light?"</div>
            </div>
          </div>

          <div className="p-3 border-t border-white/[0.06]">
            <div className="text-[10px] text-white/20 text-center">
              Built from scratch • No external ML libs
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex-shrink-0 h-12 border-b border-white/[0.06] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 text-white/30 transition-transform duration-300 ${
                  sidebarOpen ? "-rotate-90" : "rotate-90"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-white/60">Chat</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
              {ACTUAL_PARAM_COUNT.toLocaleString()} params
            </span>
          </div>
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors group"
            title="Clear chat & memory"
          >
            <RotateCcw className="w-4 h-4 text-white/25 group-hover:text-white/50" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onShowViz={message.role === "assistant" && message.inferenceResult
                  ? () => setShowViz(message.id)
                  : undefined
                }
              />
            ))}
            {isGenerating && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-white/[0.06] px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 focus-within:border-violet-500/30 focus-within:bg-white/[0.05] transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={modelStatus === "ready" ? "Ask me anything..." : "Loading..."}
                disabled={modelStatus !== "ready" || isGenerating}
                className="flex-1 bg-transparent text-sm text-white placeholder-white/20 focus:outline-none disabled:opacity-40"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating || modelStatus !== "ready"}
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-[10px] text-white/20 flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> 100% local • No data leaves your browser
              </span>
              <span className="text-[10px] text-white/20">Enter to send</span>
            </div>
          </div>
        </div>
      </main>

      {/* Visualization Modal */}
      {showViz && (() => {
        const msg = messages.find(m => m.id === showViz);
        if (!msg?.inferenceResult) return null;
        return <VizModal result={msg.inferenceResult} onClose={() => setShowViz(null)} />;
      })()}
    </div>
  );
}

/* ─── Components ─────────────────────────────────────────────────── */

function formatMarkdown(text: string): string {
  // Simple markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\n/g, '<br/>');
}

function MessageBubble({
  message,
  onShowViz,
}: {
  message: Message;
  onShowViz?: () => void;
}) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center py-3">
        <div className="max-w-md text-center px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">MiniLLM</span>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%]">
          <div className="bg-gradient-to-br from-violet-600/80 to-fuchsia-600/80 rounded-xl rounded-br-sm px-3.5 py-2.5">
            <p className="text-sm text-white/90 leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-white/[0.05] flex items-center justify-center mt-0.5">
        <Brain className="w-3 h-3 text-violet-400" />
      </div>
      <div className="max-w-[80%]">
        <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl rounded-bl-sm px-3.5 py-2.5">
          <div
            className="text-sm text-white/75 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
          />
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          {onShowViz && (
            <button
              onClick={onShowViz}
              className="flex items-center gap-1 text-[10px] text-violet-400/60 hover:text-violet-400 transition-colors"
            >
              <Eye className="w-3 h-3" />
              View internals
            </button>
          )}
          {message.inferenceResult && (
            <span className="text-[10px] text-white/15">
              {message.inferenceResult.intent} • {(message.inferenceResult.confidence * 100).toFixed(0)}% confidence
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-white/[0.05] flex items-center justify-center">
        <Brain className="w-3 h-3 text-violet-400" />
      </div>
      <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl rounded-bl-sm px-3.5 py-3">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400/50 animate-bounce [animation-delay:0ms]" />
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400/50 animate-bounce [animation-delay:150ms]" />
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400/50 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function VizModal({ result, onClose }: { result: InferenceResult; onClose: () => void }) {
  const { tokens, forwardResult, reasoningSteps, sources, intent, confidence } = result;
  const { attentionWeights, layerOutputs, inputEmbeddings } = forwardResult;
  const dModel = MODEL_CONFIG.dModel;
  const nHeads = MODEL_CONFIG.nHeads;
  const seqLen = tokens.length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111118] border border-white/[0.08] rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white/80">Transformer Internals & Reasoning</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06]">
            <X className="w-4 h-4 text-white/40" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Reasoning Steps */}
          <section>
            <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3" /> Reasoning Chain
            </h3>
            <div className="space-y-1.5">
              {reasoningSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <span className="text-violet-400/50 font-mono w-4 text-right">{i + 1}.</span>
                  <div className="flex-1">
                    <span className="text-white/50">{step.description}</span>
                    {step.detail && <span className="text-white/25 ml-2">({step.detail})</span>}
                  </div>
                  <span className="text-[9px] text-white/20 px-1.5 py-0.5 rounded bg-white/[0.03]">{step.type}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-3 gap-2">
            <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
              <p className="text-[9px] text-white/25 uppercase">Intent</p>
              <p className="text-sm text-violet-400 font-mono">{intent}</p>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
              <p className="text-[9px] text-white/25 uppercase">Confidence</p>
              <p className="text-sm text-emerald-400 font-mono">{(confidence * 100).toFixed(0)}%</p>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
              <p className="text-[9px] text-white/25 uppercase">Sources</p>
              <p className="text-sm text-white/60 font-mono">{sources.length}</p>
            </div>
          </section>

          {/* Tokenization */}
          <section>
            <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Hash className="w-3 h-3" /> Tokenization ({seqLen} tokens)
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {tokens.map((token, i) => (
                <div
                  key={i}
                  className="px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-[11px] font-mono text-violet-300"
                >
                  {token}
                </div>
              ))}
            </div>
          </section>

          {/* Embeddings */}
          <section>
            <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3" /> Input Embeddings (first 64 of {dModel} dims)
            </h3>
            <div className="space-y-1">
              {tokens.slice(0, 6).map((token, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30 w-16 truncate font-mono">{token}</span>
                  <div className="flex-1 flex gap-[1px] h-4">
                    {Array.from({ length: 64 }, (_, j) => {
                      const val = inputEmbeddings[i * dModel + j] || 0;
                      const intensity = Math.min(Math.abs(val) * 3, 1);
                      const hue = val > 0 ? 270 : 200;
                      return (
                        <div
                          key={j}
                          className="flex-1 rounded-[1px]"
                          style={{ backgroundColor: `hsla(${hue}, 80%, 60%, ${intensity})` }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Attention */}
          <section>
            <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Network className="w-3 h-3" /> Attention Patterns (Layer 1)
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: Math.min(nHeads, 8) }, (_, h) => {
                const attnLayer = attentionWeights[0];
                const offset = h * seqLen * seqLen;
                return (
                  <div key={h} className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.04]">
                    <p className="text-[9px] text-white/25 mb-1 text-center">Head {h + 1}</p>
                    <div className="grid gap-[1px]" style={{ gridTemplateColumns: `repeat(${seqLen}, 1fr)` }}>
                      {Array.from({ length: seqLen * seqLen }, (_, idx) => {
                        const val = attnLayer[offset + idx] || 0;
                        return (
                          <div
                            key={idx}
                            className="aspect-square rounded-[1px]"
                            style={{
                              backgroundColor: `rgba(139, 92, 246, ${Math.min(val * 3, 1)})`,
                              minWidth: '3px',
                              minHeight: '3px',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Layer Outputs */}
          <section>
            <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3 h-3" /> Hidden States per Layer (CLS token, 64 dims)
            </h3>
            <div className="space-y-1">
              {layerOutputs.map((output, layerIdx) => (
                <div key={layerIdx} className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30 w-12 font-mono">L{layerIdx + 1}</span>
                  <div className="flex-1 flex gap-[1px] h-3">
                    {Array.from({ length: 64 }, (_, j) => {
                      const val = output[j] || 0;
                      const intensity = Math.min(Math.abs(val) * 2, 1);
                      const hue = 270 + layerIdx * 15;
                      return (
                        <div
                          key={j}
                          className="flex-1 rounded-[1px]"
                          style={{ backgroundColor: `hsla(${hue}, 70%, 55%, ${intensity})` }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sources */}
          <section className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
            <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-2">Knowledge Sources</h3>
            <div className="flex flex-wrap gap-1.5">
              {sources.map((source, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400/70 border border-violet-500/10">
                  {source}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SidebarStat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-1.5 text-white/25">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <span className={`text-[10px] font-mono font-medium ${accent ? "text-violet-400" : "text-white/50"}`}>
        {value}
      </span>
    </div>
  );
}

function FeatureBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-white/35 py-1 px-2 rounded bg-white/[0.02] border border-white/[0.03]">
      <span className="text-emerald-400/60">{icon}</span>
      {text}
    </div>
  );
}

export default App;
