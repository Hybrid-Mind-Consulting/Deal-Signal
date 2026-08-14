import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Send, Terminal, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const SUGGESTED = [
  'Has customer concentration increased over time?',
  'What is the downside if Customer A leaves?',
  'Which contracts contribute most to concentration risk?',
];

const CONVERSATION = [
  {
    id: 'msg-1',
    role: 'user' as const,
    text: 'What is driving the increase in customer concentration?',
  },
  {
    id: 'msg-2',
    role: 'system' as const,
    text: 'The latest July Management Accounts show Customer A generated £12.4m of £40.0m Q2 revenue, representing 31% of total revenue. The previous management presentation indicated the largest customer represented 18%. The available evidence does not yet establish whether this change is seasonal, timing-related or structural.',
  },
  {
    id: 'msg-3',
    role: 'user' as const,
    text: 'What happens if Customer A reduces volumes by 50%?',
  },
  {
    id: 'msg-4',
    role: 'system' as const,
    text: 'A 50% reduction in Customer A volumes would remove approximately £6.2m of quarterly revenue based on the latest run-rate. The current demo does not yet contain enough cost and margin data to calculate a reliable EBITDA impact. Recommended next step: run a downside scenario using the investment model and latest customer-level gross margin data.',
  },
];

export default function AskWatchtower() {
  const [input, setInput] = useState('');

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
      <PageHeader title="Ask Watchtower" />

      {/* Context label */}
      <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-card border border-card-border w-fit text-xs">
        <TrendingUp className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="text-muted-foreground">Context:</span>
        <span className="font-medium text-foreground">Customer concentration signal</span>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto mb-4 pr-1 space-y-6">
        {CONVERSATION.map((msg, idx) =>
          msg.role === 'user' ? (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex justify-end"
            >
              <div className="bg-card border border-border rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-2xl">
                <p className="text-sm text-foreground">{msg.text}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex justify-start"
            >
              <div className="bg-sidebar border border-sidebar-border rounded-2xl rounded-tl-sm px-5 py-4 max-w-2xl">
                <div className="flex items-center gap-2 mb-2.5">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    Watchtower
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{msg.text}</p>
              </div>
            </motion.div>
          )
        )}
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap gap-2 mb-3">
        {SUGGESTED.map((q) => (
          <button
            key={q}
            onClick={() => setInput(q)}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="relative mt-auto">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Terminal className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about NovaCura Therapeutics..."
          className="w-full bg-card border border-border rounded-lg py-4 pl-12 pr-16 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
        />
        <button className="absolute inset-y-2 right-2 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md flex items-center justify-center transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
