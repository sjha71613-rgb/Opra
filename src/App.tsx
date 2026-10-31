import { useState, useEffect, useRef, useCallback } from "react";
import {
  loadModel,
  generateResponse,
  isModelLoaded,
  MODEL_INFO,
  ProgressCallback,
} from "./utils/model";
import { Brain, Send, Settings, Cpu, Zap, BookOpen, Loader2, Info, X, MessageSquare } from "lucide-react";

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
        "Welcome to MiniLLM! I'm a small language model running entirely in your browser with ~82 million parameters. Ask me anything and I'll do my best to help!",
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
    maxLength: 100,
    temperature: 0.7,
    topK: 50,
    topP: 0.95,
    repetitionPenalty: 1.2,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadModelHandler = useCallback(async () => {
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

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-sm px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-8 h-8 text-purple-400" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                modelStatus === "ready" ? "bg-green-400" : modelStatus === "error" ? "bg-red-400" : "bg-yellow-400 animate-pulse"
              }`} />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                MiniLLM
              </h1>
              <p className="text-xs text-gray-400">
                {MODEL_INFO.parameters} Parameters • Running in Browser
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Model Info"
            >
              <Info className="w-5 h-5 text-gray-300" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Model Loading Banner */}
      {modelStatus !== "ready" && (
        <div className="flex-shrink-0 bg-black/30 border-b border-white/10 px-4 py-3">
          <div className="max-w-5xl mx-auto">
            {modelStatus === "loading" && (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{loadStatus}</span>
                    <span className="text-purple-300">{Math.round(loadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${loadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    First load downloads ~320MB of model weights. Subsequent loads use cache.
                  </p>
                </div>
              </div>
            )}
            {modelStatus === "error" && (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X className="w-3 h-3 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-red-300">Failed to load model</p>
                  <button
                    onClick={loadModelHandler}
                    className="text-xs text-purple-400 hover:text-purple-300 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role !== "user" && (
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "system" ? "bg-blue-500/20" : "bg-purple-500/20"
                }`}>
                  {message.role === "system" ? (
                    <BookOpen className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Brain className="w-4 h-4 text-purple-400" />
                  )}
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-purple-600/40 border border-purple-500/30"
                    : message.role === "system"
                    ? "bg-blue-500/10 border border-blue-500/20"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600/40 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-purple-300" />
                </div>
              )}
            </div>
          ))}
          {isGenerating && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-400" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-sm text-gray-400">Generating response...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-white/10 bg-black/20 backdrop-blur-sm px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  modelStatus === "ready"
                    ? "Ask me anything..."
                    : "Waiting for model to load..."
                }
                disabled={modelStatus !== "ready" || isGenerating}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 disabled:opacity-50 transition-all"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating || modelStatus !== "ready"}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              Running locally in your browser
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {settings.temperature.toFixed(1)} temp
            </span>
            <span>•</span>
            <span>Press Enter to send</span>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Generation Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm mb-1">
                  <span>Max Tokens</span>
                  <span className="text-purple-300">{settings.maxLength}</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="256"
                  value={settings.maxLength}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, maxLength: parseInt(e.target.value) }))
                  }
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="flex justify-between text-sm mb-1">
                  <span>Temperature</span>
                  <span className="text-purple-300">{settings.temperature.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={settings.temperature}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, temperature: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher = more creative, Lower = more focused
                </p>
              </div>
              <div>
                <label className="flex justify-between text-sm mb-1">
                  <span>Top-K</span>
                  <span className="text-purple-300">{settings.topK}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={settings.topK}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, topK: parseInt(e.target.value) }))
                  }
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="flex justify-between text-sm mb-1">
                  <span>Top-P (Nucleus Sampling)</span>
                  <span className="text-purple-300">{settings.topP.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.topP}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, topP: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="flex justify-between text-sm mb-1">
                  <span>Repetition Penalty</span>
                  <span className="text-purple-300">{settings.repetitionPenalty.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="2.0"
                  step="0.05"
                  value={settings.repetitionPenalty}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, repetitionPenalty: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Model Architecture
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <InfoRow label="Model Name" value={MODEL_INFO.name} />
              <InfoRow label="Total Parameters" value={MODEL_INFO.parameters} highlight />
              <InfoRow label="Architecture" value={MODEL_INFO.architecture} />
              <InfoRow label="Transformer Layers" value={MODEL_INFO.layers.toString()} />
              <InfoRow label="Hidden Dimension" value={MODEL_INFO.hiddenSize.toString()} />
              <InfoRow label="Attention Heads" value={MODEL_INFO.attentionHeads.toString()} />
              <InfoRow label="Vocabulary Size" value={MODEL_INFO.vocabularySize.toLocaleString()} />
              <InfoRow label="Context Length" value={`${MODEL_INFO.contextLength} tokens`} />
              <InfoRow label="Training Data" value={MODEL_INFO.trainingData} />
              <InfoRow label="Model Size" value={MODEL_INFO.size} />
            </div>
            <div className="mt-6 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-xs text-purple-300">
                <strong>About this model:</strong> DistilGPT-2 is a distilled version of GPT-2, 
                retaining 97% of GPT-2's performance while being 40% smaller and 60% faster. 
                It runs entirely in your browser using WebAssembly and WebGL — no server required!
              </p>
            </div>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-xs text-yellow-300">
                <strong>Note:</strong> As a small language model, responses may not always be accurate. 
                This is a demonstration of running ML models directly in the browser.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-purple-300" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

export default App;
