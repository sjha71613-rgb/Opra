import { useState, useEffect, useRef, useCallback } from "react";
import {
  loadModel,
  generateResponse,
  MODEL_INFO,
  ProgressCallback,
} from "./utils/model";
import {
  Brain,
  Send,
  Settings,
  Cpu,
  Zap,
  BookOpen,
  Loader2,
  X,
  MessageSquare,
  Sparkles,
  Shield,
  Globe,
  ChevronDown,
  RotateCcw,
  Layers,
  Database,
  Hash,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface GenerationSettings {
  maxLength: number;
  temperature: number;
  topK: number;
  topP: number;
  repetitionPenalty: number;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content:
        "Hey! I'm MiniLLM — a small language model with 80 million parameters running entirely in your browser. I'm built on FLAN-T5-Small, which was specifically trained to follow instructions and answer questions. Try asking me something!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStatus, setLoadStatus] = useState("Initializing...");
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    maxLength: 150,
    temperature: 0.7,
    topK: 50,
    topP: 0.95,
    repetitionPenalty: 1.2,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadModelHandler = useCallback(async () => {
    setModelStatus("loading");
    const onProgress: ProgressCallback = (data) => {
      setLoadProgress(data.progress);
      setLoadStatus(data.status);
    };

    try {
      await loadModel(onProgress);
      setModelStatus("ready");
    } catch (error) {
      console.error("Failed to load model:", error);
      setModelStatus("error");
    }
  }, []);

  useEffect(() => {
    loadModelHandler();
  }, [loadModelHandler]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating || modelStatus !== "ready") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      const response = await generateResponse(input.trim(), {
        maxLength: settings.maxLength,
        temperature: settings.temperature,
        topK: settings.topK,
        topP: settings.topP,
        repetitionPenalty: settings.repetitionPenalty,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error generating a response. Please try again.",
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
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "system",
        content:
          "Chat cleared! I'm ready for your next question. Try asking me something — I can help with general knowledge, definitions, math, and more.",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="h-screen w-screen flex bg-[#0a0a0f] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } flex-shrink-0 transition-all duration-300 overflow-hidden border-r border-white/[0.06] bg-[#0d0d14]`}
      >
        <div className="w-80 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">MiniLLM</h1>
                <p className="text-[11px] text-white/40 font-medium">Personal Language Model</p>
              </div>
            </div>
          </div>

          {/* Model Status */}
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  modelStatus === "ready"
                    ? "bg-emerald-400 shadow-lg shadow-emerald-400/50"
                    : modelStatus === "error"
                    ? "bg-red-400"
                    : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="text-xs font-medium text-white/60">
                {modelStatus === "ready"
                  ? "Model Active"
                  : modelStatus === "error"
                  ? "Load Failed"
                  : "Loading Model"}
              </span>
            </div>

            {modelStatus === "loading" && (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/40">{loadStatus}</span>
                  <span className="text-violet-400 font-mono">{Math.round(loadProgress)}%</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-white/30 leading-relaxed">
                  Downloading model weights to browser cache. This only happens once.
                </p>
              </div>
            )}

            {modelStatus === "error" && (
              <button
                onClick={loadModelHandler}
                className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Retry loading
              </button>
            )}
          </div>

          {/* Model Stats */}
          <div className="p-5 border-b border-white/[0.06] flex-1 overflow-y-auto">
            <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-3">
              Architecture
            </h3>
            <div className="space-y-2.5">
              <StatItem icon={<Hash className="w-3.5 h-3.5" />} label="Parameters" value={MODEL_INFO.parameters} accent />
              <StatItem icon={<Layers className="w-3.5 h-3.5" />} label="Layers" value={MODEL_INFO.layers.toString()} />
              <StatItem icon={<Cpu className="w-3.5 h-3.5" />} label="Hidden Dim" value={MODEL_INFO.hiddenSize.toString()} />
              <StatItem icon={<Zap className="w-3.5 h-3.5" />} label="Attention Heads" value={MODEL_INFO.attentionHeads.toString()} />
              <StatItem icon={<Database className="w-3.5 h-3.5" />} label="Vocab Size" value={MODEL_INFO.vocabularySize.toLocaleString()} />
              <StatItem icon={<BookOpen className="w-3.5 h-3.5" />} label="Context" value={`${MODEL_INFO.contextLength} tokens`} />
              <StatItem icon={<Globe className="w-3.5 h-3.5" />} label="Architecture" value="T5 Encoder-Decoder" />
            </div>

            <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-3 mt-6">
              Capabilities
            </h3>
            <div className="space-y-2">
              <CapabilityBadge icon={<MessageSquare className="w-3 h-3" />} text="Question Answering" />
              <CapabilityBadge icon={<Sparkles className="w-3 h-3" />} text="Instruction Following" />
              <CapabilityBadge icon={<Shield className="w-3 h-3" />} text="100% Local / Private" />
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/[0.06]">
            <button
              onClick={() => setShowInfo(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-white/50 hover:text-white/70 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Model Details
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex-shrink-0 h-14 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 text-white/40 transition-transform duration-300 ${
                  sidebarOpen ? "-rotate-90" : "rotate-90"
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white/80">Chat</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
                FLAN-T5-Small
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors group"
              title="Clear chat"
            >
              <RotateCcw className="w-4 h-4 text-white/30 group-hover:text-white/60" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors group"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-white/30 group-hover:text-white/60" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-5 py-6 space-y-1">
            {messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} isLast={index === messages.length - 1} />
            ))}
            {isGenerating && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl px-5 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-violet-500/30 focus-within:bg-white/[0.06] transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  modelStatus === "ready"
                    ? "Ask me anything..."
                    : "Waiting for model..."
                }
                disabled={modelStatus !== "ready" || isGenerating}
                className="flex-1 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none disabled:opacity-40"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating || modelStatus !== "ready"}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg shadow-violet-500/20 disabled:shadow-none"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2.5 px-1">
              <div className="flex items-center gap-3 text-[11px] text-white/25">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  Runs locally
                </span>
                <span>•</span>
                <span>Enter to send</span>
              </div>
              <div className="text-[11px] text-white/25 font-mono">
                temp: {settings.temperature.toFixed(1)} · max: {settings.maxLength}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <Modal onClose={() => setShowSettings(false)} title="Generation Settings">
          <div className="space-y-5">
            <SliderSetting
              label="Max Tokens"
              value={settings.maxLength}
              min={20}
              max={256}
              step={1}
              onChange={(v) => setSettings((s) => ({ ...s, maxLength: v }))}
              description="Maximum length of the generated response"
            />
            <SliderSetting
              label="Temperature"
              value={settings.temperature}
              min={0.1}
              max={1.5}
              step={0.05}
              onChange={(v) => setSettings((s) => ({ ...s, temperature: v }))}
              description="Higher = more creative, Lower = more deterministic"
              format={(v) => v.toFixed(2)}
            />
            <SliderSetting
              label="Top-K Sampling"
              value={settings.topK}
              min={1}
              max={100}
              step={1}
              onChange={(v) => setSettings((s) => ({ ...s, topK: v }))}
              description="Number of highest probability tokens to keep"
            />
            <SliderSetting
              label="Top-P (Nucleus)"
              value={settings.topP}
              min={0.1}
              max={1.0}
              step={0.05}
              onChange={(v) => setSettings((s) => ({ ...s, topP: v }))}
              description="Cumulative probability cutoff for token selection"
              format={(v) => v.toFixed(2)}
            />
            <SliderSetting
              label="Repetition Penalty"
              value={settings.repetitionPenalty}
              min={1.0}
              max={2.0}
              step={0.05}
              onChange={(v) => setSettings((s) => ({ ...s, repetitionPenalty: v }))}
              description="Penalize repeated tokens in the output"
              format={(v) => v.toFixed(2)}
            />
          </div>
        </Modal>
      )}

      {/* Model Info Modal */}
      {showInfo && (
        <Modal onClose={() => setShowInfo(false)} title="Model Architecture">
          <div className="space-y-0">
            <InfoRow label="Model" value={MODEL_INFO.name} />
            <InfoRow label="Parameters" value={MODEL_INFO.parameters} highlight />
            <InfoRow label="Architecture" value={MODEL_INFO.architecture} />
            <InfoRow label="Task" value={MODEL_INFO.task} />
            <InfoRow label="Encoder Layers" value={MODEL_INFO.layers.toString()} />
            <InfoRow label="Hidden Dimension" value={MODEL_INFO.hiddenSize.toString()} />
            <InfoRow label="Attention Heads" value={MODEL_INFO.attentionHeads.toString()} />
            <InfoRow label="Vocabulary" value={MODEL_INFO.vocabularySize.toLocaleString() + " tokens"} />
            <InfoRow label="Context Window" value={`${MODEL_INFO.contextLength} tokens`} />
            <InfoRow label="Training Data" value={MODEL_INFO.trainingData} />
            <InfoRow label="Model Size" value={MODEL_INFO.size} />
          </div>
          <div className="mt-5 p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/10">
            <p className="text-xs text-white/50 leading-relaxed">
              <span className="text-violet-400 font-semibold">FLAN-T5-Small</span> is a finetuned version of Google's T5-Small model, trained on a mixture of instruction tasks. Unlike GPT-style models that just predict the next token, this model is specifically designed to understand and follow instructions — making it much better at answering questions.
            </p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/10">
            <p className="text-xs text-white/50 leading-relaxed">
              <span className="text-amber-400 font-semibold">Note:</span> With only 80M parameters, this model has limited knowledge. It works best for simple questions, definitions, math, and common knowledge. For complex topics, responses may be inaccurate.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center py-4">
        <div className="max-w-md text-center px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider">MiniLLM</span>
          </div>
          <p className="text-sm text-white/50 leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className={`flex justify-end ${isLast ? "animate-in fade-in slide-in-from-bottom-2" : ""}`}>
        <div className="max-w-[75%]">
          <div className="bg-gradient-to-br from-violet-600/90 to-fuchsia-600/90 rounded-2xl rounded-br-md px-4 py-3 shadow-lg shadow-violet-500/10">
            <p className="text-sm text-white/95 leading-relaxed">{message.content}</p>
          </div>
          <p className="text-[10px] text-white/20 mt-1.5 text-right pr-1">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isLast ? "animate-in fade-in slide-in-from-bottom-2" : ""}`}>
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center mt-0.5">
        <Brain className="w-3.5 h-3.5 text-violet-400" />
      </div>
      <div className="max-w-[75%]">
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
          <p className="text-sm text-white/80 leading-relaxed">{message.content}</p>
        </div>
        <p className="text-[10px] text-white/20 mt-1.5 pl-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-in fade-in">
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
        <Brain className="w-3.5 h-3.5 text-violet-400" />
      </div>
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce [animation-delay:0ms]" />
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce [animation-delay:150ms]" />
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-white/30">
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>
      <span className={`text-[11px] font-mono font-medium ${accent ? "text-violet-400" : "text-white/60"}`}>
        {value}
      </span>
    </div>
  );
}

function CapabilityBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
      <span className="text-emerald-400/70">{icon}</span>
      <span className="text-[11px] text-white/40">{text}</span>
    </div>
  );
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-[#13131a] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl shadow-black/50 animate-in zoom-in-95">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white/80">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4 text-white/40" />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function SliderSetting({
  label,
  value,
  min,
  max,
  step,
  onChange,
  description,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  description: string;
  format?: (v: number) => string;
}) {
  const display = format ? format(value) : value.toString();
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-white/60">{label}</span>
        <span className="text-xs font-mono text-violet-400">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      <p className="text-[10px] text-white/25 mt-1.5">{description}</p>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-white/35">{label}</span>
      <span className={`text-xs font-medium ${highlight ? "text-violet-400" : "text-white/70"}`}>
        {value}
      </span>
    </div>
  );
}

export default App;
