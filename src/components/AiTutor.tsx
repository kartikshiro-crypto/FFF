import React, { useState, useRef, useEffect } from 'react';
import { Student, ChatMessage } from '../types';
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Layers,
  AlertCircle,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface AiTutorProps {
  currentStudent: Student;
  onOpenInvoiceModal: () => void;
}

type ModelKey = 'gemini' | 'claude' | 'gpt' | 'grok';

interface ModelMeta {
  key: ModelKey;
  name: string;
  provider: string;
  tagline: string;
  badgeColor: string;
}

const MODELS: ModelMeta[] = [
  {
    key: 'gemini',
    name: 'Gemini 2.5 Flash',
    provider: 'Google AI',
    tagline: 'High-speed reasoning & code breakdowns',
    badgeColor: 'border-blue-500/40 text-blue-600 dark:text-blue-400',
  },
  {
    key: 'claude',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    tagline: 'Socratic mentor & deep pedagogical nuance',
    badgeColor: 'border-amber-500/40 text-amber-600 dark:text-amber-400',
  },
  {
    key: 'gpt',
    name: 'GPT-4o',
    provider: 'OpenAI',
    tagline: 'Step-by-step problem solver & rubric checking',
    badgeColor: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'grok',
    name: 'Grok-3',
    provider: 'xAI',
    tagline: 'Sharp, witty & real-world practical analogies',
    badgeColor: 'border-purple-500/40 text-purple-600 dark:text-purple-400',
  },
];

export const AiTutor: React.FC<AiTutorProps> = ({ currentStudent, onOpenInvoiceModal }) => {
  const [activeModel, setActiveModel] = useState<ModelKey>('gemini');
  const [viewMode, setViewMode] = useState<'chat' | 'compare'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Chat messages state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      model: 'gemini',
      text: `Sat Sri Akaal & Welcome, ${currentStudent.name}! I am your SkillBridge Bathinda AI Academic Coach.\n\nI can assist you with your **${currentStudent.courseTitle}** coursework, evaluate essay thesis statements, debug code, or answer questions about your schedule and academic progress.\n\n*Notice from Accounts:* Your current enrolled record shows ${
        currentStudent.feeDue > 0
          ? `an outstanding fee balance of **₹${currentStudent.feeDue.toLocaleString('en-IN')}**. You can review your GST invoice or record receipt under the Fees tab anytime.`
          : 'all fee installments are up to date! 🎉'
      }`,
      timestamp: 'Just now',
      feeAlert: currentStudent.feeDue > 0,
    },
  ]);

  // Comparison mode states
  const [comparePrompt, setComparePrompt] = useState(
    'Explain how to optimize an Express API response time vs how to structure an IELTS Band 8 paragraph.'
  );
  const [compareResults, setCompareResults] = useState<Record<ModelKey, string> | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      model: activeModel,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          model: activeModel,
          studentContext: {
            name: currentStudent.name,
            courseTitle: currentStudent.courseTitle,
            rollNo: currentStudent.rollNo,
            feeDue: currentStudent.feeDue,
            feeTotal: currentStudent.feeTotal,
            pendingAssignmentsCount: 2,
          },
          history: messages.slice(-5),
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        model: activeModel,
        text: data.reply || 'Apologies, I encountered a temporary network delay. Please retry!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feeAlert: currentStudent.feeDue > 0 && data.reply?.toLowerCase().includes('fee'),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        model: activeModel,
        text: `Here is a review for: "${textToSend}". Focus on the core foundational principles from your ${currentStudent.courseTitle} lessons. ${
          currentStudent.feeDue > 0
            ? `\n\n📌 *Accounts Reminder:* Friendly note that ₹${currentStudent.feeDue.toLocaleString('en-IN')} remains due for your batch registration.`
            : ''
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feeAlert: currentStudent.feeDue > 0,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunComparison = async (promptText?: string) => {
    const textToCompare = promptText || comparePrompt.trim();
    if (!textToCompare || isComparing) return;

    setIsComparing(true);
    setCompareResults(null);

    try {
      const response = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToCompare,
          studentContext: {
            name: currentStudent.name,
            courseTitle: currentStudent.courseTitle,
            feeDue: currentStudent.feeDue,
          },
        }),
      });

      const data = await response.json();
      setCompareResults(data.results);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setIsComparing(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const suggestedPrompts = [
    { label: 'Check my fee balance & how to pay', query: 'Can you check my current fee balance and how I can clear it?' },
    { label: 'Explain React 19 Actions & optimistic state', query: 'Can you explain React 19 Actions and how optimistic UI works?' },
    { label: 'IELTS Task 2: Band 8 thesis sentence', query: 'How do I write a Band 8 thesis statement for an IELTS Task 2 essay?' },
    { label: 'Derive Wave Optics fringe width formula', query: 'Please explain the derivation of fringe width in Young’s Double Slit Experiment step-by-step.' },
  ];

  const selectedModelMeta = MODELS.find((m) => m.key === activeModel) || MODELS[0];

  return (
    <div className="space-y-6">
      
      {/* Top Controls: Model Switcher & Mode Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Model Tabs */}
        <div>
          <div className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Select AI Engine:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {MODELS.map((m) => {
              const isSelected = activeModel === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setActiveModel(m.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* View Mode Toggle: Single Chat vs Arena */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('chat')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'chat'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Interactive Chat
            </button>
            <button
              onClick={() => {
                setViewMode('compare');
                if (!compareResults && !isComparing) {
                  handleRunComparison();
                }
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'compare'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Compare All 4 AIs</span>
            </button>
          </div>
        </div>

      </div>

      {/* Fee Alert Banner (if student has pending balance) */}
      {currentStudent.feeDue > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold">Account Reminder for {currentStudent.name}:</span> Outstanding course fee balance of{' '}
              <strong className="font-mono">₹{currentStudent.feeDue.toLocaleString('en-IN')}</strong> is due. The AI tutor will provide payment guidance upon request.
            </div>
          </div>

          <button
            onClick={onOpenInvoiceModal}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-200/60 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-900 rounded-lg transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View GST Invoice Slip</span>
          </button>
        </div>
      )}

      {/* Mode 1: Single Interactive Chat View */}
      {viewMode === 'chat' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[600px]">
          
          {/* Active Model Indicator Header */}
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {selectedModelMeta.name}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {selectedModelMeta.tagline}
              </span>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    sender: 'bot',
                    model: activeModel,
                    text: `Chat reset. Ready to assist you with ${currentStudent.courseTitle}! What would you like to explore?`,
                    timestamp: 'Just now',
                  },
                ]);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-slate-900 text-white dark:bg-blue-600'
                        : 'bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-blue-400'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`max-w-[82%] space-y-1`}>
                    <div
                      className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs whitespace-pre-line border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      {msg.text}

                      {/* If the message contains fee alert, show direct invoice button */}
                      {msg.feeAlert && !isUser && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                          <button
                            onClick={onOpenInvoiceModal}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Open GST Tax Invoice</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div
                      className={`text-2xs text-slate-400 flex items-center gap-2 px-1 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => copyToClipboard(msg.text, idx)}
                          className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <span className="flex items-center gap-0.5 text-emerald-600">
                              <Check className="w-2.5 h-2.5" /> Copied
                            </span>
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 rounded-tl-xs text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span>{selectedModelMeta.name} is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-2xs font-semibold uppercase text-slate-400 shrink-0">Try:</span>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                className="text-xs px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask ${selectedModelMeta.name} about your coursework, assignments, or fee status...`}
                className="flex-1 px-4 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs cursor-pointer shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Mode 2: Compare 4 AIs Side-by-Side Arena */}
      {viewMode === 'compare' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Multi-Model AI Arena</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Run the exact same prompt simultaneously across Gemini, Claude, GPT, and Grok to compare reasoning styles.
              </p>
            </div>

            <button
              onClick={() => handleRunComparison()}
              disabled={isComparing || !comparePrompt.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              {isComparing ? 'Generating All 4 Responses...' : 'Run Arena Comparison'}
            </button>
          </div>

          {/* Prompt Input for Comparison */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Enter Question or Problem to Compare:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={comparePrompt}
                onChange={(e) => setComparePrompt(e.target.value)}
                placeholder="Enter any curriculum question, code prompt, or IELTS essay question..."
                className="flex-1 px-4 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              <button
                onClick={() => handleRunComparison()}
                disabled={isComparing || !comparePrompt.trim()}
                className="p-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-2xs text-slate-400 font-medium">Quick comparison presets:</span>
              <button
                onClick={() => {
                  const p = 'Explain how React 19 useTransition works with a small code example.';
                  setComparePrompt(p);
                  handleRunComparison(p);
                }}
                className="text-2xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                React 19 useTransition
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => {
                  const p = 'Write an IELTS Band 8 conclusion for an essay about smart cities in Punjab.';
                  setComparePrompt(p);
                  handleRunComparison(p);
                }}
                className="text-2xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                IELTS Band 8 Conclusion
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => {
                  const p = 'Derive the magnetic field inside a long solenoid for Class 12 Physics.';
                  setComparePrompt(p);
                  handleRunComparison(p);
                }}
                className="text-2xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Class 12 Solenoid Derivation
              </button>
            </div>
          </div>

          {/* 4-Column Grid for Model Responses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODELS.map((m) => {
              const result = compareResults ? compareResults[m.key] : null;
              return (
                <div
                  key={m.key}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-2.5 mb-3">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {m.name}
                        </div>
                        <div className="text-2xs text-slate-500 dark:text-slate-400">
                          {m.provider}
                        </div>
                      </div>
                      <span className={`text-2xs px-1.5 py-0.5 rounded border font-mono ${m.badgeColor}`}>
                        {m.key.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line min-h-[160px]">
                      {isComparing ? (
                        <div className="space-y-2 py-4">
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-5/6"></div>
                        </div>
                      ) : result ? (
                        result
                      ) : (
                        <span className="text-slate-400 italic">
                          Click "Run Arena Comparison" above to generate response from {m.name}.
                        </span>
                      )}
                    </div>
                  </div>

                  {result && (
                    <div className="mt-4 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                      <button
                        onClick={() => copyToClipboard(result, 99)}
                        className="text-2xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copy answer</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
