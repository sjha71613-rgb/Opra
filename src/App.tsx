import { useState, useEffect, useRef, useCallback } from "react";
import { InferenceEngine, InferenceResult } from "./transformer/inference";
import {
  Brain,
  Send,
  X,
  Sparkles,
  Plus,
  MessageSquare,
  Code,
  Eye,
  Network,
  BarChart3,
  Activity,
  Lightbulb,
  Menu,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  inferenceResult?: InferenceResult;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStatus, setLoadStatus] = useState("Initializing...");
  const [showViz, setShowViz] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef<InferenceEngine | null>(null);

  const currentChat = chats.find(c => c.id === currentChatId);
  const messages = currentChat?.messages || [];

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

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [
        {
          id: "welcome",
          role: "system",
          content: "I'm OPRA — a hand-coded transformer language model. Ask me anything about science, math, geography, or general knowledge.",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
  };

  const deleteChat = (chatId: string) => {
    setChats(chats.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(chats.length > 1 ? chats.find(c => c.id !== chatId)?.id || null : null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating || modelStatus !== "ready") return;

    const question = input.trim();
    setInput("");
    setIsGenerating(true);

    let chatId = currentChatId;
    let currentChats = [...chats];
    
    // Create new chat if none exists
    if (!chatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: question.slice(0, 30) + (question.length > 30 ? "..." : ""),
        messages: [],
        createdAt: new Date(),
      };
      currentChats = [newChat, ...currentChats];
      chatId = newChat.id;
      setCurrentChatId(chatId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    // Add user message
    currentChats = currentChats.map(c => 
      c.id === chatId 
        ? { ...c, messages: [...c.messages, userMessage] }
        : c
    );
    setChats(currentChats);

    try {
      const result = await engineRef.current!.answer(question);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.answer,
        timestamp: new Date(),
        inferenceResult: result,
      };

      setChats(prev => prev.map(c => 
        c.id === chatId 
          ? { ...c, messages: [...c.messages, assistantMessage] }
          : c
      ));
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setChats(prev => prev.map(c => 
        c.id === chatId 
          ? { ...c, messages: [...c.messages, errorMessage] }
          : c
      ));
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
    <div className="h-screen w-screen flex bg-white text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } flex-shrink-0 transition-all duration-300 overflow-hidden border-r border-gray-200 bg-gray-50`}
      >
        <div className="w-64 h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">OPRA</h1>
                <p className="text-[10px] text-gray-500">Hand-coded LLM</p>
              </div>
            </div>
            <button
              onClick={createNewChat}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-2">
            {chats.length === 0 ? (
              <div className="text-center text-xs text-gray-400 py-8">
                No chats yet
              </div>
            ) : (
              <div className="space-y-1">
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      chat.id === currentChatId
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => setCurrentChatId(chat.id)}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-sm truncate">{chat.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => setShowAbout(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 text-sm text-gray-600 transition-colors"
            >
              <Code className="w-4 h-4" />
              About OPRA
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex-shrink-0 h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {currentChat?.title || "OPRA"}
              </span>
              {modelStatus === "ready" && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-500">Ready</span>
                </div>
              )}
              {modelStatus === "loading" && (
                <span className="text-xs text-gray-500">Loading...</span>
              )}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md px-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to OPRA
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  A hand-coded transformer language model running entirely in your browser. 
                  No external ML libraries — built from scratch in TypeScript.
                </p>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs font-medium text-gray-900 mb-1">Try asking:</p>
                    <p className="text-xs text-gray-600">"What is the capital of Japan?"</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs font-medium text-gray-900 mb-1">Or math:</p>
                    <p className="text-xs text-gray-600">"What is 15% of 200?"</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs font-medium text-gray-900 mb-1">Or facts:</p>
                    <p className="text-xs text-gray-600">"Tell me about DNA"</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs font-medium text-gray-900 mb-1">Or compare:</p>
                    <p className="text-xs text-gray-600">"Compare Earth and Mars"</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
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
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={modelStatus === "ready" ? "Message OPRA..." : "Loading..."}
                disabled={modelStatus !== "ready" || isGenerating}
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-40"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating || modelStatus !== "ready"}
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              OPRA runs 100% locally in your browser. No data is sent anywhere.
            </p>
          </div>
        </div>
      </main>

      {/* Visualization Modal */}
      {showViz && (() => {
        const msg = messages.find(m => m.id === showViz);
        if (!msg?.inferenceResult) return null;
        return <VizModal result={msg.inferenceResult} onClose={() => setShowViz(null)} />;
      })()}

      {/* About Modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}

/* ─── Components ─────────────────────────────────────────────────── */

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
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
      <div className="flex justify-center py-4">
        <div className="max-w-md text-center px-4 py-3 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-sm text-blue-900">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
        <Brain className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1 max-w-[calc(100%-3rem)]">
        <div
          className="text-sm text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
        />
        {onShowViz && (
          <button
            onClick={onShowViz}
            className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View transformer internals
          </button>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
        <Brain className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex items-center gap-1 py-2">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function VizModal({ result, onClose }: { result: InferenceResult; onClose: () => void }) {
  const { tokens, forwardResult, reasoningSteps } = result;
  const { attentionWeights, layerOutputs, inputEmbeddings } = forwardResult;
  const dModel = 512;
  const nHeads = 8;
  const seqLen = tokens.length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Transformer Internals</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Reasoning Steps */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              Reasoning Chain
            </h3>
            <div className="space-y-2 bg-gray-50 rounded-lg p-4">
              {reasoningSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-blue-600 font-mono w-6 text-right flex-shrink-0">{i + 1}.</span>
                  <div className="flex-1">
                    <span className="text-gray-700">{step.description}</span>
                    {step.detail && <span className="text-gray-500 ml-2">({step.detail})</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tokenization */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" />
              Tokenization
            </h3>
            <div className="flex flex-wrap gap-2">
              {tokens.map((token, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-sm font-mono text-blue-700"
                >
                  {token}
                </div>
              ))}
            </div>
          </section>

          {/* Embeddings */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Input Embeddings (first 64 dimensions)
            </h3>
            <div className="space-y-2 bg-gray-50 rounded-lg p-4">
              {tokens.slice(0, 6).map((token, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 truncate font-mono">{token}</span>
                  <div className="flex-1 flex gap-[1px] h-5">
                    {Array.from({ length: 64 }, (_, j) => {
                      const val = inputEmbeddings[i * dModel + j] || 0;
                      const intensity = Math.min(Math.abs(val) * 3, 1);
                      return (
                        <div
                          key={j}
                          className="flex-1 rounded-[1px]"
                          style={{ backgroundColor: `rgba(37, 99, 235, ${intensity})` }}
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
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-600" />
              Attention Patterns (Layer 1, all heads)
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: Math.min(nHeads, 8) }, (_, h) => {
                const attnLayer = attentionWeights[0];
                const offset = h * seqLen * seqLen;
                return (
                  <div key={h} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2 text-center">Head {h + 1}</p>
                    <div className="grid gap-[1px]" style={{ gridTemplateColumns: `repeat(${seqLen}, 1fr)` }}>
                      {Array.from({ length: seqLen * seqLen }, (_, idx) => {
                        const val = attnLayer[offset + idx] || 0;
                        return (
                          <div
                            key={idx}
                            className="aspect-square rounded-[1px]"
                            style={{
                              backgroundColor: `rgba(37, 99, 235, ${Math.min(val * 3, 1)})`,
                              minWidth: '4px',
                              minHeight: '4px',
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
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Hidden States per Layer
            </h3>
            <div className="space-y-2 bg-gray-50 rounded-lg p-4">
              {layerOutputs.map((output, layerIdx) => (
                <div key={layerIdx} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-12 font-mono">Layer {layerIdx + 1}</span>
                  <div className="flex-1 flex gap-[1px] h-4">
                    {Array.from({ length: 64 }, (_, j) => {
                      const val = output[j] || 0;
                      const intensity = Math.min(Math.abs(val) * 2, 1);
                      return (
                        <div
                          key={j}
                          className="flex-1 rounded-[1px]"
                          style={{ backgroundColor: `rgba(37, 99, 235, ${intensity})` }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">About OPRA</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What is OPRA?</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              OPRA is a <strong>hand-coded transformer language model</strong> built entirely from scratch in TypeScript. 
              It's not a wrapper around an existing model — every component is implemented from first principles.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium mb-2">Proof this is hand-coded:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Custom matrix multiplication implementation</li>
                <li>• Multi-head attention from scratch</li>
                <li>• Layer normalization, GELU activation, softmax — all custom</li>
                <li>• Recursive descent parser for math expressions</li>
                <li>• Pattern-based intent classification</li>
                <li>• Structured knowledge graph with 500+ facts</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Architecture</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Transformer</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• 6 transformer layers</li>
                  <li>• 512 hidden dimensions</li>
                  <li>• 8 attention heads</li>
                  <li>• ~100M parameters</li>
                  <li>• Causal masking</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Brain</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Intent classification</li>
                  <li>• Knowledge graph (500+ facts)</li>
                  <li>• Math expression evaluator</li>
                  <li>• Conversational memory</li>
                  <li>• Answer composition</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What Can It Do?</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 text-sm">
                <span className="text-blue-600 font-semibold">✓</span>
                <div>
                  <p className="font-medium text-gray-900">Answer factual questions</p>
                  <p className="text-gray-600 text-xs">Science, geography, history, technology, and more</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="text-blue-600 font-semibold">✓</span>
                <div>
                  <p className="font-medium text-gray-900">Solve math problems</p>
                  <p className="text-gray-600 text-xs">Arithmetic, percentages, powers, square roots</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="text-blue-600 font-semibold">✓</span>
                <div>
                  <p className="font-medium text-gray-900">Compare entities</p>
                  <p className="text-gray-600 text-xs">Side-by-side fact comparisons</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="text-blue-600 font-semibold">✓</span>
                <div>
                  <p className="font-medium text-gray-900">Maintain context</p>
                  <p className="text-gray-600 text-xs">Remember previous messages in conversation</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              OPRA runs <strong>100% locally in your browser</strong>. No data is sent to any server. 
              No APIs, no cloud, no tracking. Everything happens on your device.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Proof: Hand-Coded Implementation</h3>
            <p className="text-sm text-gray-700 mb-3">Here are actual code snippets from OPRA's source — every line written by hand:</p>
            
            <div className="space-y-3">
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <p className="text-xs text-gray-400 mb-2 font-mono">// Matrix multiplication — src/transformer/tensor.ts</p>
                <pre className="text-xs text-green-400 font-mono whitespace-pre">{`function matmul(a, aRows, aCols, b, bRows, bCols) {
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
}`}</pre>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <p className="text-xs text-gray-400 mb-2 font-mono">// Multi-head attention — src/transformer/model.ts</p>
                <pre className="text-xs text-green-400 font-mono whitespace-pre">{`function multiHeadAttention(x, seqLen, wQ, wK, wV, wO, ...) {
  const Q = addBias(matmul(x, seqLen, dModel, wQ, ...), bQ, ...);
  const K = addBias(matmul(x, seqLen, dModel, wK, ...), bK, ...);
  const V = addBias(matmul(x, seqLen, dModel, wV, ...), bV, ...);
  
  for (let h = 0; h < nHeads; h++) {
    // Split into heads, compute scaled dot-product attention
    const scores = matmul(Qh, seqLen, dHead, Kh, ...);
    const attnWeights = softmax(scores / sqrt(dHead));
    const headOut = matmul(attnWeights, seqLen, seqLen, Vh, ...);
  }
  // Concatenate heads and project output
}`}</pre>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <p className="text-xs text-gray-400 mb-2 font-mono">// Math parser — src/brain/math.ts</p>
                <pre className="text-xs text-green-400 font-mono whitespace-pre">{`class Parser {
  parseExpression(): number {
    let result = this.parseTerm();
    while (this.peek() === '+' || this.peek() === '-') {
      const op = this.consume();
      const right = this.parseTerm();
      result = op === '+' ? result + right : result - right;
    }
    return result;
  }
  // Recursive descent for *, /, ^, functions...
}`}</pre>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Built from scratch in TypeScript • No external ML libraries • Open source
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
