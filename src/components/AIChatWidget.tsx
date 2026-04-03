'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  sender: 'user' | 'kds';
  text: string;
  timestamp: Date;
}

const KDS_RESPONSES: Record<string, string> = {
  greeting: "Hey! 👋 I'm KDS AI — your assistant from 2130. How can I help you today?",
  services: "We offer AI Agents, automation pipelines, websites, mobile apps, video production, and consulting. Check out our Marketplace!",
  pricing: "Pricing varies by service. AI Agents start at $2,500, websites from $1,500. Every quote is custom — want to discuss your project?",
  deploy: "We deploy via rsync to Hostinger VPS, Docker containers, or Vercel. Your pipeline, your choice.",
  community: "Join our Telegram @KingSwaggyDrip_bot for live community chat, daily updates, and direct access to our team!",
  thanks: "Always! 🧠 Don't hesitate to reach out anytime. The future is waiting.",
  fallback: "Interesting! Let me connect you with our team. In the meantime, check our Marketplace and Dashboard for what we can do for you.",
  features: "KDS offers: AI Community Hub with live video chat, a Digital Marketplace, Command Center dashboard, built-in terminal, affiliate network, and a 4D immersive experience.",
  help: "I can help with: \n• Service inquiries\n• Pricing info\n• Community links\n• Deployment details\n• Platform features\n\nJust ask!",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.match(/\b(hi|hello|hey|yo|sup|greetings|what'?s up)\b/)) return KDS_RESPONSES.greeting;
  if (lower.match(/\b(service|offer|provide|sell|list|catalog)\b/)) return KDS_RESPONSES.services;
  if (lower.match(/\b(price|cost|pricing|how much|rate|fee)\b/)) return KDS_RESPONSES.pricing;
  if (lower.match(/\b(deploy|deployed|deployment|host|server|vps|hostinger)\b/)) return KDS_RESPONSES.deploy;
  if (lower.match(/\b(community|join|telegram|discord|group|chat|connect)\b/)) return KDS_RESPONSES.community;
  if (lower.match(/\b(thanks|thank|thx|ty|appreciate)\b/)) return KDS_RESPONSES.thanks;
  if (lower.match(/\b(featur|what.*(can|do)|capabilities|platform)\b/)) return KDS_RESPONSES.features;
  if (lower.match(/\b(help|how|what|can you|explain)\b/)) return KDS_RESPONSES.help;
  return KDS_RESPONSES.fallback;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'kds',
      text: KDS_RESPONSES.greeting,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    const userInput = input.trim();
    setInput('');
    setIsTyping(true);

    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const response = getAIResponse(userInput);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'kds',
        text: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-lime text-void flex items-center justify-center shadow-lg shadow-lime/30 hover:shadow-xl hover:shadow-lime/40 hover:scale-110 transition-shadow duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </motion.button>

      {/* Online indicator pulse */}
      {!isOpen && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="fixed bottom-4 right-4 z-[9998] w-5 h-5 rounded-full bg-lime pointer-events-none"
        />
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-[9999] w-[380px] max-w-[calc(100vw-48px)] h-[520px] glass rounded-3xl border border-white/[0.08] flex flex-col overflow-hidden shadow-2xl shadow-black/50"
            style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center">
                  <span className="text-lime text-lg">🧠</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-lime rounded-full border-2 border-[#02040a]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-white">KDS AI Assistant</h3>
                <p className="text-[10px] font-mono text-lime">Online • From 2130</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-lime/10 border border-lime/20 text-white rounded-br-md'
                        : 'bg-white/[0.04] border border-white/[0.06] text-text-secondary rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <p className={`text-[9px] font-mono mt-1 ${
                      msg.sender === 'user' ? 'text-lime/60' : 'text-text-muted'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-lime"
                      />
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-lime"
                      />
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-lime"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
              {['Services', 'Pricing', 'Community'].map(q => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => {
                      const userMsg: ChatMessage = {
                        id: `msg-${Date.now()}`,
                        sender: 'user',
                        text: q,
                        timestamp: new Date(),
                      };
                      setMessages(prev => [...prev, userMsg]);
                      setInput('');
                      setIsTyping(true);
                      const delay = 800 + Math.random() * 1200;
                      setTimeout(() => {
                        const response = getAIResponse(q);
                        const aiMsg: ChatMessage = {
                          id: `msg-${Date.now() + 1}`,
                          sender: 'kds',
                          text: response,
                          timestamp: new Date(),
                        };
                        setMessages(prev => [...prev, aiMsg]);
                        setIsTyping(false);
                      }, delay);
                    }, 50);
                  }}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-mono bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-lime hover:border-lime/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-1 focus-within:border-lime/30 transition-colors">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask KDS AI anything..."
                  className="flex-1 bg-transparent outline-none text-sm text-white py-2 placeholder:text-text-muted/60"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    input.trim()
                      ? 'bg-lime/20 text-lime hover:bg-lime/30'
                      : 'text-text-muted/30 cursor-not-allowed'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
