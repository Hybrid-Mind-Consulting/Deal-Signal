import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Send, Terminal, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const SUGGESTED = [
  'Has customer concentration increased over time?',
  'What is the downside if Customer A leaves?',
  'Which contracts contribute most to concentration risk?',
];

type UserMessage = { id: string; role: 'user'; text: string };
type SystemMessage = {
  id: string;
  role: 'system';
  conclusion: string;
  evidence: string[];
  caveat?: string;
  nextStep: string;
};
type Message = UserMessage | SystemMessage;

const CONVERSATION: Message[] = [
  {
    id: 'msg-1',
    role: 'user',
    text: 'What is driving the increase in customer concentration?',
  },
  {
    id: 'msg-2',
    role: 'system',
    conclusion:
      'Customer A now represents 31% of Q2 revenue, up from 18% stated in the management presentation — a 13 percentage point increase.',
    evidence: [
      'July Management Accounts (Aug 2026): Customer A generated £12.4m of £40.0m Q2 revenue.',
      'Management Presentation (May 2026) stated no single customer exceeded 20% of group revenue.',
    ],
    caveat:
      'The available evidence does not establish whether this change is seasonal, timing-related or structural.',
    nextStep:
      'Request 24 months of customer-level revenue to determine whether Q2 concentration is seasonal or structural.',
  },
  {
    id: 'msg-3',
    role: 'user',
    text: 'What happens if Customer A reduces volumes by 50%?',
  },
  {
    id: 'msg-4',
    role: 'system',
    conclusion:
      'A 50% reduction in Customer A volumes would remove approximately £6.2m of quarterly revenue at the current run-rate.',
    evidence: ['Customer A: £12.4m Q2 revenue × 50% = £6.2m reduction.'],
    caveat:
      'Insufficient cost and margin data to calculate a reliable EBITDA impact from the available evidence.',
    nextStep:
      'Run a downside scenario using the investment model with the latest customer-level gross margin data.',
  },
];

export default function AskWatchtower() {
  const [input, setInput] = useState('');

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
      <PageHeader title="Ask Watchtower" />

      {/* Context label */}
      <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
        <TrendingUp className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span>Context:</span>
        <span className="text-foreground font-medium">
          Customer concentration signal · NovaCura Therapeutics
        </span>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-5 pr-1">
        {CONVERSATION.map((msg, idx) =>
          msg.role === 'user' ? (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex justify-end"
            >
              <div className="bg-card border border-card-border rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-2xl">
                <p className="text-sm text-foreground">{msg.text}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex justify-start"
            >
              <div className="bg-sidebar border border-sidebar-border rounded-2xl rounded-tl-sm px-5 py-4 max-w-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                    Watchtower
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Conclusion */}
                  <p className="text-sm text-foreground font-medium leading-relaxed">
                    {msg.conclusion}
                  </p>

                  {/* Evidence points */}
                  {msg.evidence.length > 0 && (
                    <ul className="space-y-1.5">
                      {msg.evidence.map((e, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Caveat */}
                  {msg.caveat && (
                    <p className="text-xs text-muted-foreground italic">{msg.caveat}</p>
                  )}

                  {/* Recommended next step */}
                  <div className="flex items-start gap-2 pt-2 border-t border-border">
                    <TrendingUp className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-primary leading-relaxed">{msg.nextStep}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ),
        )}
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap gap-2 mb-3">
        {SUGGESTED.map((q) => (
          <button
            key={q}
            onClick={() => setInput(q)}
            className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors text-left"
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
          className="w-full bg-card border border-border rounded-xl py-4 pl-12 pr-16 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground"
        />
        <button className="absolute inset-y-2 right-2 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
