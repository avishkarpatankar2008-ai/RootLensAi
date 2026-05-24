'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, Sparkles, Copy, Check,
  Loader2, AlertCircle, Command
} from 'lucide-react';
import { useChat } from '@/lib/hooks';

const QUICK_PROMPTS = [
  'What are the most common errors in recent logs?',
  'Summarize the latest critical incident',
  'Which services are currently degraded?',
  'What caused the last high-severity incident?',
  'Give me an RCA for the most recent failure',
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-slate-600 hover:text-slate-400">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function MessageBubble({ msg, isLast }: { msg: { id: string; role: string; content: string; timestamp: string }; isLast: boolean }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center mt-1">
          <Bot className="w-3.5 h-3.5 text-purple-400" />
        </div>
      )}

      <div className={`max-w-[75%] group ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed relative ${
          isUser
            ? 'bg-cyan-500/15 border border-cyan-500/20 text-slate-200 rounded-tr-sm'
            : 'bg-white/[0.05] border border-white/[0.08] text-slate-300 rounded-tl-sm'
        }`}>
          {!isUser && (
            <div className="absolute top-2 right-2">
              <CopyButton text={msg.content} />
            </div>
          )}
          <p className="whitespace-pre-wrap pr-4">{msg.content}</p>
        </div>
        <span className="text-[10px] text-slate-600 font-mono px-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-800 border border-white/[0.08] flex items-center justify-center mt-1">
          <User className="w-3.5 h-3.5 text-slate-400" />
        </div>
      )}
    </motion.div>
  );
}

export default function ChatPage() {
  const { messages, loading, error, send, historyLoaded } = useChat();
  const [input, setInput] = useState('');
  const [rows, setRows] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setRows(1);
    try { await send(text); } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const lines = e.target.value.split('\n').length;
    setRows(Math.min(lines, 4));
  };

  return (
    <div className="flex flex-col h-screen" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Topbar */}
      <header className="flex-shrink-0 border-b border-white/[0.06] bg-[rgba(8,12,20,0.85)] backdrop-blur-xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">AI Assistant</h1>
              <p className="text-[10px] text-slate-500">Powered by Groq LLaMA 3.1-8B</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 border border-white/[0.06] rounded-lg px-3 py-1.5">
            <Command className="w-3 h-3" />
            <span>Enter to send · Shift+Enter for newline</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">

          {!historyLoaded && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
            </div>
          )}

          {historyLoaded && messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-200 mb-2">AI Log Analysis Assistant</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Ask me anything about your logs, incidents, and system health. I have full context of all analyzed incidents.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-left text-sm px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:border-cyan-500/20 hover:bg-cyan-500/[0.03] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <MessageBubble key={msg.id} msg={msg} isLast={i === messages.length - 1} />
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center mt-1">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white/[0.05] border border-white/[0.08]">
                <div className="flex gap-1 items-center">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error.message}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-white/[0.06] bg-[rgba(8,12,20,0.85)] backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask about incidents, root causes, service health…"
                rows={rows}
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 focus:bg-white/[0.06] transition-all leading-relaxed"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
