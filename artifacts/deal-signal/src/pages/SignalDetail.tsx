import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Plus,
  Send,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Colour tokens ─────────────────────────────────────────────────────────────

const red = {
  badge: 'bg-[hsl(0,84%,60%,0.12)] text-[hsl(0,84%,60%)] border border-[hsl(0,84%,60%,0.25)]',
  text: 'text-[hsl(0,84%,60%)]',
  bg: 'bg-[hsl(0,84%,60%,0.06)] border-[hsl(0,84%,60%,0.18)]',
};

// ─── Disclosure section wrapper ────────────────────────────────────────────────

function DisclosureSection({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {badge}
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0',
            open && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-8">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Hero section ──────────────────────────────────────────────────────────────

function SignalHero() {
  const [, navigate] = useLocation();

  return (
    <div className="mb-10">
      {/* Back link */}
      <button
        onClick={() => navigate('/watchtower')}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        NovaCura Therapeutics / Commercial
      </button>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded', red.badge)}>
          High Priority
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
          Commercial
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
          New
        </span>
      </div>

      {/* Title */}
      <h1 className="text-xl font-semibold tracking-tight text-foreground mb-8">
        Customer concentration has increased materially
      </h1>

      {/* Value comparison — hero focal point */}
      <div className="flex items-center gap-12 mb-7">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Previous understanding</p>
          <p className="text-6xl font-bold text-foreground tracking-tight">18%</p>
          <div className="flex items-center gap-1.5 mt-2.5">
            <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">Management Presentation — May 2026</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className={cn('rounded-full p-2.5', red.badge)}>
            <ArrowRight className={cn('w-5 h-5', red.text)} />
          </div>
          <p className={cn('text-lg font-bold', red.text)}>+13 pp</p>
          <p className="text-[10px] text-muted-foreground">+72% relative</p>
        </div>

        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Latest evidence</p>
          <p className={cn('text-6xl font-bold tracking-tight', red.text)}>31%</p>
          <div className="flex items-center gap-1.5 mt-2.5">
            <FileSpreadsheet className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">July Management Accounts — Aug 2026</p>
          </div>
        </div>
      </div>

      {/* One-line why it matters */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl">
        Revenue dependency on a single counterparty may weaken downside resilience in the investment case.
      </p>

      {/* Primary CTA */}
      <button
        onClick={() => navigate('/ask-watchtower')}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Investigate
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Evidence content ──────────────────────────────────────────────────────────

function EvidenceContent() {
  const evidence = [
    {
      id: 'ev-1',
      name: 'Management Presentation — May 2026',
      icon: FileText,
      type: 'Management supplied',
      statement: '"No single customer represents more than 20% of group revenue."',
      metric: 'Largest customer: 18%',
      contradiction: false,
    },
    {
      id: 'ev-2',
      name: 'July Management Accounts — Aug 2026',
      icon: FileSpreadsheet,
      type: 'Financial data',
      statement: 'Customer A generated £12.4m of £40.0m Q2 revenue.',
      metric: '31.0%',
      contradiction: true,
    },
  ];

  return (
    <div className="divide-y divide-border rounded-xl border border-card-border overflow-hidden">
      {evidence.map((ev) => {
        const Icon = ev.icon;
        return (
          <div key={ev.id} className="px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer group">
            <div className="flex items-start gap-4">
              <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {ev.name}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground">{ev.type}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed mb-2">{ev.statement}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Extracted</span>
                  <span className={cn('text-sm font-semibold', ev.contradiction ? red.text : 'text-foreground')}>
                    {ev.metric}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Assessment content ────────────────────────────────────────────────────────

function AssessmentContent() {
  const [, navigate] = useLocation();

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 mb-5">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Materiality</p>
          <p className={cn('text-sm font-semibold', red.text)}>High</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Confidence</p>
          <p className="text-sm font-semibold text-foreground">94%</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Evidence strength</p>
          <p className="text-sm font-semibold text-foreground">Strong</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Signal type</p>
          <p className="text-sm font-semibold text-foreground">Cross-source contradiction</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Diligence area</p>
          <p className="text-sm font-semibold text-foreground">Commercial</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        The discrepancy is sufficiently large to warrant further investigation. The current evidence does not establish whether the increase is caused by seasonality, timing or a structural change in the customer mix. The signal should remain open until customer-level revenue history and contractual exposure have been reviewed.
      </p>

      <button
        onClick={() => navigate('/analysis-trace')}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 hover:border-border/80 transition-colors"
      >
        <GitBranch className="w-3.5 h-3.5" />
        View Analysis Trace
      </button>
    </div>
  );
}

// ─── Recommended Actions content ───────────────────────────────────────────────

function RecommendedActionsContent() {
  const actions = [
    {
      id: 'ra-1',
      title: 'Request monthly customer-level revenue for the previous 24 months',
      purpose: 'Determine whether Q2 concentration is seasonal or structural.',
    },
    {
      id: 'ra-2',
      title: 'Review Customer A contract terms',
      purpose: 'Assess duration, renewal dates, termination rights and pricing exposure.',
    },
    {
      id: 'ra-3',
      title: 'Stress-test customer loss in the investment model',
      purpose: 'Quantify EBITDA, cash flow and leverage impact if the largest customer churns.',
    },
    {
      id: 'ra-4',
      title: 'Validate management explanation',
      purpose: 'Reconcile the 18% statement in the management presentation with the latest trading data.',
    },
  ];

  return (
    <div className="divide-y divide-border rounded-xl border border-card-border overflow-hidden">
      {actions.map((action, idx) => (
        <div key={action.id} className="px-5 py-4 flex items-start gap-4">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center mt-0.5">
            <span className="text-[10px] font-bold text-muted-foreground">{idx + 1}</span>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground mb-0.5">{action.title}</p>
            <p className="text-xs text-muted-foreground">{action.purpose}</p>
          </div>
          <button className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
            <Plus className="w-3 h-3" />
            Create Action
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Investigate content ───────────────────────────────────────────────────────

function InvestigateContent() {
  const [query, setQuery] = useState('');
  const suggested = [
    'What is the downside impact if Customer A leaves?',
    'Has customer concentration increased over time?',
    'Which contracts contribute most to concentration risk?',
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {suggested.map((q) => (
          <button
            key={q}
            onClick={() => setQuery(q)}
            className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a follow-up question about this signal..."
          className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
        <button className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SignalDetail() {
  return (
    <div className="animate-in fade-in duration-400 max-w-4xl">
      {/* Hero — above the fold */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <SignalHero />
      </motion.div>

      {/* Supporting sections — progressive disclosure */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
        <DisclosureSection
          title="Evidence"
          badge={
            <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded', red.badge)}>
              Contradiction detected
            </span>
          }
          defaultOpen={true}
        >
          <EvidenceContent />
        </DisclosureSection>

        <DisclosureSection title="Watchtower Assessment" defaultOpen={false}>
          <AssessmentContent />
        </DisclosureSection>

        <DisclosureSection title="Recommended Actions" badge={
          <span className="text-xs text-muted-foreground">4 actions</span>
        } defaultOpen={false}>
          <RecommendedActionsContent />
        </DisclosureSection>

        <DisclosureSection title="Investigate this Signal" defaultOpen={false}>
          <InvestigateContent />
        </DisclosureSection>
      </motion.div>
    </div>
  );
}
