import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Plus,
  Send,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Colour tokens ────────────────────────────────────────────────────────────

const red = {
  badge: 'bg-[hsl(0,84%,60%,0.12)] text-[hsl(0,84%,60%)] border border-[hsl(0,84%,60%,0.25)]',
  text: 'text-[hsl(0,84%,60%)]',
  bg: 'bg-[hsl(0,84%,60%,0.06)] border-[hsl(0,84%,60%,0.18)]',
  pill: 'bg-[hsl(0,84%,60%,0.08)] text-[hsl(0,84%,60%)] border border-[hsl(0,84%,60%,0.2)]',
};

// ─── Header ───────────────────────────────────────────────────────────────────

function SignalHeader() {
  const [, navigate] = useLocation();
  return (
    <div className="mb-8">
      <button
        onClick={() => navigate('/watchtower')}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        NovaCura Therapeutics / Commercial
      </button>

      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded', red.badge)}>
              High Priority
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              New
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2">
            Customer concentration has increased materially
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            The largest customer now represents 31% of Q2 revenue, versus 18% stated in the management presentation.
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-muted-foreground">Detected</p>
          <p className="text-sm text-foreground mt-0.5">14 Aug 2026, 14:27</p>
        </div>
      </div>
    </div>
  );
}

// ─── Section 1: What Changed ──────────────────────────────────────────────────

function WhatChanged() {
  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">What Changed</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Cross-source comparison of customer concentration data</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* Previous */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Previous Understanding
            </p>
            <p className="text-5xl font-bold text-foreground tracking-tight">18%</p>
            <p className="text-xs text-muted-foreground">Largest customer share of revenue</p>
            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground">Management Presentation — May 2026</span>
              </div>
            </div>
          </div>

          {/* Arrow + delta */}
          <div className="flex flex-col items-center gap-2 px-4">
            <div className={cn('rounded-full p-2', red.badge)}>
              <ArrowRight className={cn('w-4 h-4', red.text)} />
            </div>
            <p className={cn('text-sm font-bold', red.text)}>+13 pp</p>
            <p className="text-[10px] text-muted-foreground">+72% relative</p>
          </div>

          {/* Latest */}
          <div className={cn('rounded-xl p-5 border', red.bg)}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Latest Evidence
            </p>
            <p className={cn('text-5xl font-bold tracking-tight', red.text)}>31%</p>
            <p className="text-xs text-muted-foreground mt-2">Largest customer share of Q2 revenue</p>
            <div className="pt-3 border-t border-[hsl(0,84%,60%,0.15)] mt-3">
              <div className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground">July Management Accounts — Aug 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section 2: Why It Matters ────────────────────────────────────────────────

function WhyItMatters() {
  const tags = ['Revenue resilience', 'Customer dependency', 'Downside case'];
  return (
    <div className="bg-card border border-card-border rounded-xl p-6">
      <h2 className="text-sm font-medium text-foreground mb-3">Why this matters</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        The latest trading data indicates materially greater customer concentration than the investment team previously understood. If structural rather than seasonal, this increases revenue dependency on a single counterparty and may weaken downside resilience in the base investment case.
      </p>
      <div className="flex flex-wrap gap-2 mt-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Section 3: Evidence ──────────────────────────────────────────────────────

function EvidenceSection() {
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
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Evidence</h2>
        <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded', red.badge)}>
          Contradiction detected
        </span>
      </div>
      <div className="divide-y divide-border">
        {evidence.map((ev) => {
          const Icon = ev.icon;
          return (
            <div key={ev.id} className="px-6 py-5 hover:bg-muted/20 transition-colors cursor-pointer group">
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
    </div>
  );
}

// ─── Section 4: Assessment ────────────────────────────────────────────────────

function Assessment() {
  const [, navigate] = useLocation();

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Watchtower Assessment</h2>
        <button
          onClick={() => navigate('/analysis-trace')}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 hover:border-border/80 transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5" />
          View Analysis Trace
        </button>
      </div>
      <div className="px-6 py-5">
        {/* Key metrics — inline, no nested card boxes */}
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

        <p className="text-sm text-muted-foreground leading-relaxed">
          The discrepancy is sufficiently large to warrant further investigation. The current evidence does not establish whether the increase is caused by seasonality, timing or a structural change in the customer mix. The signal should therefore remain open until customer-level revenue history and contractual exposure have been reviewed.
        </p>
      </div>
    </div>
  );
}

// ─── Section 5: Recommended Actions ──────────────────────────────────────────

function RecommendedActions() {
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
      purpose: 'Quantify EBITDA, cash flow and leverage impact if the largest customer churns or reduces volumes.',
    },
    {
      id: 'ra-4',
      title: 'Validate management explanation',
      purpose: 'Reconcile the 18% statement in the management presentation with the latest trading data.',
    },
  ];

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">Recommended Next Actions</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{actions.length} actions identified</p>
      </div>
      <div className="divide-y divide-border">
        {actions.map((action, idx) => (
          <div key={action.id} className="px-6 py-4 flex items-start gap-4">
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
    </div>
  );
}

// ─── Section 6: Investigate Further ──────────────────────────────────────────

function InvestigateFurther() {
  const [query, setQuery] = useState('');
  const suggested = [
    'What is the downside impact if Customer A leaves?',
    'Has customer concentration increased over time?',
    'Which contracts contribute most to concentration risk?',
  ];

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">Investigate this signal</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Ask a focused question about the customer concentration evidence
        </p>
      </div>
      <div className="p-6">
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
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignalDetail() {
  return (
    <div className="animate-in fade-in duration-400 max-w-4xl">
      <SignalHeader />

      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <WhatChanged />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <WhyItMatters />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <EvidenceSection />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Assessment />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <RecommendedActions />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <InvestigateFurther />
        </motion.div>
      </div>
    </div>
  );
}
