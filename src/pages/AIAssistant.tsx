/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Bot, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { gemini } from '../lib/gemini';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "Mera is mahine ka summary do",
  "Kaun sabse risky debtor hai?",
  "Pehle kisse maango?",
  "Mujhe reminder messages generate karo"
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! Main aapka LendLedger AI assistant hoon. Aap mujhse apne hisaab-kitaab ke baare mein kuch bhi pooch sakte hain.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const allData = {
      contacts: storage.getContacts(),
      transactions: storage.getTransactions(),
      user: storage.getUser()
    };

    const response = await gemini.chatWithAssistant(text, allData);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  const clearChat = () => {
    if (window.confirm('Clear chat history?')) {
      setMessages([messages[0]]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col glass rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-bold">AI Assistant</h2>
            <p className="text-[10px] text-success font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> Online
            </p>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 text-text-muted hover:text-accent transition-all">
          <Trash2 size={20} />
        </button>
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-white/10" : "bg-accent"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="space-y-2">
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed relative group",
                  msg.role === 'user' ? "bg-white/5 rounded-tr-none" : "bg-secondary rounded-tl-none"
                )}>
                  {msg.content}
                  {msg.role === 'assistant' && (
                    <button 
                      onClick={() => copyToClipboard(msg.content)}
                      className="absolute -right-10 top-0 p-2 opacity-0 group-hover:opacity-100 transition-all text-text-muted hover:text-white"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-text-muted px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-secondary p-4 rounded-2xl rounded-tl-none w-24 h-10" />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="p-6 border-t border-white/5 space-y-4">
        {/* Quick Prompts */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {QUICK_PROMPTS.map(prompt => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap px-4 py-2 glass rounded-full text-xs font-medium hover:bg-accent/10 hover:text-accent transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="relative"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Poochiye apne hisaab ke baare mein..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 outline-none focus:border-accent transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white disabled:opacity-50 transition-all"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      </footer>
    </div>
  );
}
