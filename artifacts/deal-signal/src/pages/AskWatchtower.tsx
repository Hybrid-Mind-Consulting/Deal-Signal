import React, { useEffect, useRef, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Loader2, Search, Send, Terminal, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Response types ────────────────────────────────────────────────────────────

type AWSearchAction = {
  prompt: string;
  searchingText: string;
  resultText: string;
  recommendedAction: string;
};

type UserMessage = { id: string; role: 'user'; text: string };
type SystemMessage = {
  id: string;
  role: 'system';
  conclusion: string;
  evidence: string[];
  caveat?: string;
  nextStep: string;
  fallbackSuggestions?: string[];
  searchAction?: AWSearchAction;
};
type Message = UserMessage | SystemMessage;

// ─── Response library ──────────────────────────────────────────────────────────

type AWResponse = Omit<SystemMessage, 'id' | 'role'>;

const SEARCH_ACTION_TREND: AWSearchAction = {
  prompt: 'Search connected sources',
  searchingText: 'Searching connected diligence sources…',
  resultText: 'No sufficiently complete 24-month customer-level revenue series found.',
  recommendedAction: 'Request monthly customer-level revenue history',
};

function makeId() {
  return `aw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getAWResponse(input: string): AWResponse {
  const q = input.toLowerCase();

  // Customer A leaves (complete loss)
  if (
    (q.includes('customer a') || q.includes('customer')) &&
    (q.includes('leave') || q.includes('leaves') || q.includes('loss') || q.includes('loses') || q.includes('gone')) &&
    !q.includes('50')
  ) {
    return {
      conclusion:
        'Customer A currently represents approximately £12.4m of £40.0m quarterly revenue. A complete customer loss would therefore put approximately 31% of current quarterly revenue at risk.',
      evidence: [
        'Customer A: £12.4m of £40.0m Q2 revenue (31.0% concentration).',
        'Management Presentation — May 2026 stated no single customer exceeded 20%.',
      ],
      caveat:
        'The current evidence does not contain sufficient customer-level margin, replacement-volume or cost data to calculate a reliable EBITDA impact.',
      nextStep:
        'Run a downside scenario using the investment model and latest customer-level gross margin data.',
    };
  }

  // 50% volume reduction
  if (q.includes('50') || q.includes('reduces') || q.includes('reduction') || q.includes('half')) {
    return {
      conclusion:
        'A 50% reduction in Customer A volumes would remove approximately £6.2m of quarterly revenue at the current run-rate.',
      evidence: ['Customer A: £12.4m Q2 revenue × 50% = £6.2m reduction.'],
      caveat:
        'Insufficient cost and margin data to calculate a reliable EBITDA impact from the available evidence.',
      nextStep:
        'Run a downside scenario using the investment model with the latest customer-level gross margin data.',
    };
  }

  // Concentration over time / trend
  if (
    q.includes('over time') || q.includes('trend') || q.includes('historical') ||
    q.includes('increased over') || (q.includes('concentration') && q.includes('time'))
  ) {
    return {
      conclusion:
        'The available evidence confirms that the latest Q2 concentration of 31% is above the 18% understanding recorded in the May Management Presentation.',
      evidence: [
        'Management Presentation — May 2026: 18% concentration stated.',
        'July Management Accounts — Aug 2026: 31.0% calculated from Customer A revenue.',
      ],
      caveat: 'Two observation points are not sufficient to establish a historical trend.',
      nextStep: 'Additional evidence required: monthly customer-level revenue for the previous 24 months.',
      searchAction: SEARCH_ACTION_TREND,
    };
  }

  // Contracts / concentration risk
  if (q.includes('contract') || (q.includes('concentrat') && q.includes('risk'))) {
    return {
      conclusion:
        'The current evidence identifies Customer A as the largest revenue exposure, but the connected evidence does not contain sufficient contract-level revenue attribution to rank individual contracts reliably.',
      evidence: ['Customer A: £12.4m of £40.0m Q2 revenue — largest identified exposure.'],
      caveat: undefined,
      nextStep:
        'Recommended next evidence: Customer A contract terms and customer-level revenue by contract.',
    };
  }

  // Evidence supporting signal
  if (q.includes('evidence') && (q.includes('support') || q.includes('signal') || q.includes('basis'))) {
    return {
      conclusion: 'Two sources currently support the customer concentration signal.',
      evidence: [
        'Management Presentation — May 2026: largest customer understood to represent 18% of revenue.',
        'July Management Accounts — Aug 2026: Customer A generated £12.4m of £40.0m Q2 revenue, equal to 31%.',
      ],
      caveat: undefined,
      nextStep: 'The signal is based on a cross-source contradiction of +13 percentage points.',
    };
  }

  // Material diligence risks
  if (
    q.includes('material') || q.includes('diligence risk') ||
    (q.includes('risk') && (q.includes('current') || q.includes('all')))
  ) {
    return {
      conclusion: 'Three material signals currently require attention.',
      evidence: [
        'HIGH — Commercial: Customer concentration increased from 18% to 31%.',
        'MEDIUM — Financial: FY27 growth assumption is 14% versus an approximately 8% current run-rate.',
        'MEDIUM — Regulatory: Management guidance indicates Q1 2027 while the latest evidence indicates Q2 2027.',
      ],
      caveat: undefined,
      nextStep:
        'The overall diligence assessment remains Amber. All three signals require team attention before the next IC review.',
    };
  }

  // Changes since previous review
  if (
    q.includes('changed') || q.includes('since') || q.includes('previous review') ||
    q.includes('last review') || q.includes('previous') || q.includes('what changed')
  ) {
    return {
      conclusion: 'Two material changes have been identified since the previous review.',
      evidence: [
        'Customer concentration escalated to High following the latest management accounts.',
        'FY27 growth assumption was updated following the latest trading evidence.',
      ],
      caveat: undefined,
      nextStep: 'The overall diligence assessment remains Amber.',
    };
  }

  // What should the deal team investigate / next steps
  if (
    q.includes('investigate next') || q.includes('what next') || q.includes('should') ||
    q.includes('recommend') || (q.includes('next') && q.includes('invest'))
  ) {
    return {
      conclusion: 'Four diligence actions are recommended.',
      evidence: [
        'Request 24 months of monthly customer-level revenue.',
        'Review Customer A contract terms.',
        'Stress-test customer loss in the investment model.',
        'Reconcile the discrepancy with management.',
      ],
      caveat: undefined,
      nextStep: 'All four actions should be completed before the next IC review.',
    };
  }

  // What is driving the increase (general concentration question)
  if (
    q.includes('driving') || q.includes('increase') ||
    (q.includes('concentrat') && !q.includes('risk') && !q.includes('time'))
  ) {
    return {
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
    };
  }

  // Fallback
  return {
    conclusion:
      "I don't have enough grounded evidence in the current diligence sources to answer that reliably.",
    evidence: [],
    caveat: undefined,
    nextStep: 'Try asking about:',
    fallbackSuggestions: [
      'customer concentration',
      'supporting evidence',
      'downside exposure',
      'historical trend',
      'recommended diligence actions',
    ],
  };
}

// ─── Initial conversation ──────────────────────────────────────────────────────

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'init-u1',
    role: 'user',
    text: 'What is driving the increase in customer concentration?',
  },
  {
    id: 'init-s1',
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
    id: 'init-u2',
    role: 'user',
    text: 'What happens if Customer A reduces volumes by 50%?',
  },
  {
    id: 'init-s2',
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

const SUGGESTED_CHIPS = [
  'What happens if Customer A leaves?',
  'Has customer concentration increased over time?',
  'Which contracts contribute most to concentration risk?',
  'What are the current material diligence risks?',
  'What has changed since the previous review?',
  'What should the deal team investigate next?',
];

// ─── System message bubble ─────────────────────────────────────────────────────

function SystemBubble({
  msg,
  searchState,
  onSearch,
  animDelay,
}: {
  msg: SystemMessage;
  searchState: 'idle' | 'searching' | 'done';
  onSearch: () => void;
  animDelay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay }}
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
          <p className="text-sm text-foreground font-medium leading-relaxed">{msg.conclusion}</p>

          {/* Evidence */}
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

          {/* Next step / fallback suggestions */}
          {msg.fallbackSuggestions ? (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1.5">{msg.nextStep}</p>
              <ul className="space-y-1">
                {msg.fallbackSuggestions.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-border flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-start gap-2 pt-2 border-t border-border">
              <TrendingUp className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-primary leading-relaxed">{msg.nextStep}</p>
            </div>
          )}

          {/* Search connected sources */}
          {msg.searchAction && (
            <div className="pt-1">
              {searchState === 'idle' && (
                <button
                  onClick={onSearch}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-2.5 py-1.5 hover:border-border/80 transition-colors"
                >
                  <Search className="w-3 h-3" />
                  {msg.searchAction.prompt}
                </button>
              )}
              {searchState === 'searching' && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {msg.searchAction.searchingText}
                </div>
              )}
              {searchState === 'done' && (
                <div className="space-y-2 px-3 py-2.5 rounded-lg border border-border bg-muted/10">
                  <p className="text-xs text-muted-foreground">{msg.searchAction.resultText}</p>
                  <div className="flex items-start gap-1.5">
                    <TrendingUp className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-primary">{msg.searchAction.recommendedAction}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AskWatchtower() {
  const [messages, setMessages]           = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput]                 = useState('');
  const [thinking, setThinking]           = useState(false);
  const [searchStates, setSearchStates]   = useState<Record<string, 'idle' | 'searching' | 'done'>>({});
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  function send() {
    const text = input.trim();
    if (!text || thinking) return;

    const uid = makeId();
    setMessages((prev) => [...prev, { id: uid, role: 'user', text }]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const resp = getAWResponse(text);
      const sid = makeId();
      setMessages((prev) => [...prev, { id: sid, role: 'system', ...resp }]);
      setThinking(false);
    }, 700);
  }

  function handleSearch(msgId: string) {
    setSearchStates((s) => ({ ...s, [msgId]: 'searching' }));
    setTimeout(() => {
      setSearchStates((s) => ({ ...s, [msgId]: 'done' }));
    }, 1800);
  }

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
        {messages.map((msg, idx) =>
          msg.role === 'user' ? (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.2) }}
              className="flex justify-end"
            >
              <div className="bg-card border border-card-border rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-2xl">
                <p className="text-sm text-foreground">{msg.text}</p>
              </div>
            </motion.div>
          ) : (
            <SystemBubble
              key={msg.id}
              msg={msg as SystemMessage}
              searchState={searchStates[msg.id] ?? 'idle'}
              onSearch={() => handleSearch(msg.id)}
              animDelay={Math.min(idx * 0.05, 0.25)}
            />
          )
        )}

        {/* Thinking indicator */}
        <AnimatePresence>
          {thinking && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl rounded-tl-sm bg-sidebar border border-sidebar-border text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                Reviewing current evidence…
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Suggested chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {SUGGESTED_CHIPS.map((q) => (
          <button
            key={q}
            onClick={() => { setInput(q); inputRef.current?.focus(); }}
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
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="Ask about NovaCura Therapeutics..."
          className="w-full bg-card border border-border rounded-xl py-4 pl-12 pr-16 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground"
        />
        <button
          onClick={send}
          disabled={!input.trim() || thinking}
          className={`absolute inset-y-2 right-2 px-3 rounded-lg flex items-center justify-center transition-colors ${
            !input.trim() || thinking
              ? 'bg-primary/40 text-primary-foreground/60 cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
