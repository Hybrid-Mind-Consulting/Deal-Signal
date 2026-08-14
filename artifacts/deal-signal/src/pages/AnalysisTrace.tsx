import React, { Fragment, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ANALYSIS_EVENTS } from '@/data/mock';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BellRing,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  FileSearch,
  FileText,
  GitBranch,
  Info,
  Network,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

type View = 'business' | 'technical';

// ─── View toggle ───────────────────────────────────────────────────────────────

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg border border-card-border w-fit mb-8">
      {(['business', 'technical'] as View[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            'px-4 py-1.5 rounded-md text-xs font-medium transition-colors',
            view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {v === 'business' ? 'Business View' : 'Technical View'}
        </button>
      ))}
    </div>
  );
}

// ─── Shared arrow connectors ───────────────────────────────────────────────────

function RightArrow() {
  return (
    <div className="flex items-center self-center flex-shrink-0 px-0.5">
      <ArrowRight className="w-4 h-4 text-border" />
    </div>
  );
}

function LeftArrow() {
  return (
    <div className="flex items-center self-center flex-shrink-0 px-0.5">
      <ArrowLeft className="w-4 h-4 text-border" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS VIEW — 5 simplified stages
// ─────────────────────────────────────────────────────────────────────────────

const BIZ_ACCENT = {
  blue:  { ring: 'bg-primary/10 border-primary/30',                               icon: 'text-primary',                card: 'border-primary/20' },
  teal:  { ring: 'bg-[hsl(173,80%,40%,0.12)] border-[hsl(173,80%,40%,0.3)]',     icon: 'text-[hsl(173,80%,40%)]',    card: 'border-[hsl(173,80%,40%,0.2)]' },
  red:   { ring: 'bg-[hsl(0,84%,60%,0.12)] border-[hsl(0,84%,60%,0.3)]',         icon: 'text-[hsl(0,84%,60%)]',      card: 'border-[hsl(0,84%,60%,0.25)]' },
  amber: { ring: 'bg-[hsl(38,92%,50%,0.12)] border-[hsl(38,92%,50%,0.3)]',       icon: 'text-[hsl(38,92%,50%)]',     card: 'border-[hsl(38,92%,50%,0.2)]' },
  green: { ring: 'bg-[hsl(160,84%,39%,0.12)] border-[hsl(160,84%,39%,0.3)]',     icon: 'text-[hsl(160,84%,39%)]',    card: 'border-[hsl(160,84%,39%,0.2)]' },
} as const;

type BizAccent = keyof typeof BIZ_ACCENT;

const BIZ_STAGES: { id: string; label: string; icon: React.ElementType; accent: BizAccent; fact: string }[] = [
  { id: 's1', label: 'Evidence', icon: FileText,    accent: 'blue',  fact: 'July Management Accounts · Aug 2026' },
  { id: 's2', label: 'Extract',  icon: FileSearch,  accent: 'teal',  fact: 'Customer A: 31% of Q2 revenue' },
  { id: 's3', label: 'Compare',  icon: GitBranch,   accent: 'red',   fact: '18% → 31% · +13 percentage points' },
  { id: 's4', label: 'Assess',   icon: ShieldCheck, accent: 'amber', fact: 'High materiality · 94% confidence' },
  { id: 's5', label: 'Act',      icon: BellRing,    accent: 'green', fact: 'Signal raised · 4 actions created' },
];

function BizNode({ node, delay }: { node: typeof BIZ_STAGES[number]; delay: number }) {
  const c = BIZ_ACCENT[node.accent];
  const Icon = node.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn('flex-shrink-0 rounded-xl border bg-card p-4 flex flex-col gap-3 w-44', c.card)}
    >
      <div className={cn('w-8 h-8 rounded-full border flex items-center justify-center', c.ring)}>
        <Icon className={cn('w-4 h-4', c.icon)} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground leading-tight mb-1.5">{node.label}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{node.fact}</p>
      </div>
    </motion.div>
  );
}

function BusinessWorkflow() {
  return (
    <div className="flex items-start gap-1.5 flex-wrap">
      {BIZ_STAGES.map((stage, i) => (
        <Fragment key={stage.id}>
          <BizNode node={stage} delay={i * 0.08} />
          {i < BIZ_STAGES.length - 1 && <RightArrow />}
        </Fragment>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TECHNICAL VIEW
// ─────────────────────────────────────────────────────────────────────────────

const TECH_NODES: {
  id: string; type: string; label: string; icon: React.ElementType;
  accent?: 'blue' | 'green' | 'amber' | 'red'; lines?: string[]; special?: 'formula' | 'gate';
}[] = [
  { id: 't1', type: 'SOURCE',        label: 'Evidence Ingestion',        icon: Database,          lines: ['July Management Accounts', 'Aug 2026'] },
  { id: 't2', type: 'PROCESSOR',     label: 'Extraction',                 icon: FileSearch,        lines: ['Customer revenue fields', 'Structured output'] },
  { id: 't3', type: 'ROUTER',        label: 'Evidence Router',            icon: Network,           lines: ['Prior evidence lookup', 'Context retrieval'] },
  { id: 't4', type: 'DETERMINISTIC', label: 'Deterministic Calculation',  icon: Cpu,   accent: 'blue',  special: 'formula' },
  { id: 't5', type: 'COMPARATOR',    label: 'Cross-source Comparison',    icon: GitBranch,         lines: ['Prev 18% vs latest 31%', 'Variance: +13 pp'] },
  { id: 't6', type: 'EVALUATOR',     label: 'Materiality Evaluator',      icon: SlidersHorizontal, lines: ['Threshold: High', 'Confidence: 94%'] },
  { id: 't7', type: 'GATE',          label: 'Quality / Evaluation Gate',  icon: CheckCircle2, accent: 'green', special: 'gate' },
  { id: 't8', type: 'OUTPUT',        label: 'Watchtower Output',          icon: BellRing,  accent: 'amber', lines: ['Signal dispatched', 'Deal Brief updated'] },
];

const NODE_W = 'w-40';
const NODE_W_PX = 160;

const TECH_ACCENT_CLS: Record<string, { border: string; label: string; icon: string }> = {
  blue:    { border: 'border-primary/30',               label: 'text-primary',            icon: 'text-primary' },
  green:   { border: 'border-[hsl(160,84%,39%,0.35)]',  label: 'text-[hsl(160,84%,39%)]', icon: 'text-[hsl(160,84%,39%)]' },
  amber:   { border: 'border-[hsl(38,92%,50%,0.35)]',   label: 'text-[hsl(38,92%,50%)]',  icon: 'text-[hsl(38,92%,50%)]' },
  default: { border: 'border-border',                    label: 'text-muted-foreground',   icon: 'text-muted-foreground' },
};

function TechNode({ node, delay }: { node: typeof TECH_NODES[number]; delay: number }) {
  const ac = TECH_ACCENT_CLS[node.accent ?? 'default'];
  const Icon = node.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn('flex-shrink-0 rounded-xl border bg-sidebar p-3.5 flex flex-col gap-2', NODE_W, ac.border)}
    >
      <div className="flex items-center justify-between">
        <span className={cn('text-[8px] font-bold uppercase tracking-widest font-mono', ac.label)}>
          {node.type}
        </span>
        <Icon className={cn('w-3.5 h-3.5', ac.icon)} />
      </div>
      <p className="text-[11px] font-semibold text-foreground leading-tight">{node.label}</p>
      {node.special === 'formula' && (
        <div className="mt-0.5 rounded bg-background border border-border px-2.5 py-1.5 font-mono">
          <p className="text-[9px] text-muted-foreground mb-0.5">calculation</p>
          <p className="text-[11px] font-bold text-primary">£12.4m ÷ £40.0m</p>
          <p className="text-[11px] font-bold text-[hsl(0,84%,60%)]">= 31.0%</p>
        </div>
      )}
      {node.special === 'gate' && (
        <div className="mt-0.5 space-y-1">
          {['Source grounding', 'Evidence consistency', 'Relevance'].map((check) => (
            <div key={check} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[hsl(160,84%,39%)] flex-shrink-0" />
              <span className="text-[9px] text-muted-foreground font-mono">
                {check}: <span className="text-[hsl(160,84%,39%)]">Passed</span>
              </span>
            </div>
          ))}
        </div>
      )}
      {!node.special && node.lines && (
        <div className="space-y-0.5 mt-0.5">
          {node.lines.map((l, i) => (
            <p key={i} className="text-[9px] text-muted-foreground font-mono leading-relaxed">{l}</p>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function TechnicalWorkflow() {
  const row1 = TECH_NODES.slice(0, 4);
  const row2 = TECH_NODES.slice(4);

  return (
    <div>
      <div className="flex items-start gap-1.5">
        {row1.map((node, i) => (
          <Fragment key={node.id}>
            <TechNode node={node} delay={i * 0.06} />
            {i < row1.length - 1 && <RightArrow />}
          </Fragment>
        ))}
      </div>
      <div className="flex justify-end my-1.5">
        <div className="flex justify-center" style={{ width: NODE_W_PX }}>
          <ArrowDown className="w-4 h-4 text-border" />
        </div>
      </div>
      <div className="flex items-start gap-1.5 flex-row-reverse">
        {row2.map((node, i) => (
          <Fragment key={node.id}>
            <TechNode node={node} delay={0.26 + i * 0.06} />
            {i < row2.length - 1 && <LeftArrow />}
          </Fragment>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 flex items-start gap-2.5 px-4 py-3 rounded-lg border border-border bg-muted/20 max-w-2xl"
      >
        <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Prototype workflow</span> — production architecture can be orchestrated with governed agent workflows, deterministic business logic and evaluation tooling.
        </p>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT ICON
// ─────────────────────────────────────────────────────────────────────────────

function EventIcon({ type }: { type: string }) {
  const cls = 'w-4 h-4';
  switch (type) {
    case 'Ingestion':             return <Database className={cls} />;
    case 'Extraction':            return <FileSearch className={cls} />;
    case 'Context Retrieval':     return <BrainCircuit className={cls} />;
    case 'Cross-Reference':       return <Network className={cls} />;
    case 'Signal Classification': return <SlidersHorizontal className={cls} />;
    case 'Evaluation':            return <ShieldCheck className={cls} />;
    case 'Alert':                 return <BellRing className={cls} />;
    default:                      return <GitBranch className={cls} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPANDABLE LOG
// ─────────────────────────────────────────────────────────────────────────────

function ExpandableLog() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-10 max-w-3xl">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group mb-4"
      >
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        View detailed execution log
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="log"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="relative border-l border-border ml-4 space-y-8 pb-8">
              {ANALYSIS_EVENTS.map((event) => (
                <div key={event.id} className="relative pl-8">
                  <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-primary z-10">
                    <EventIcon type={event.type} />
                  </div>
                  <div className="bg-card border border-card-border rounded-xl p-5">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{event.type}</span>
                      <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{event.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                    {event.details && event.details.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {event.details.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="bg-sidebar rounded-lg flex items-center px-3 py-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {`{ "trace_id": "${event.traceId}", "status": "200 OK" }`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="relative pl-8 pt-4 text-xs text-muted-foreground font-mono italic">
                <div className="absolute -left-1.5 top-5 w-3 h-3 rounded-full border-2 border-border bg-background z-10" />
                End of trace · 7 steps · 14 Aug 2026, 14:27
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AnalysisTrace() {
  const [view, setView] = useState<View>('business');

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Analysis Trace"
        subtitle="Customer concentration has increased materially · NovaCura Therapeutics"
      />

      {/* Signal context strip */}
      <div className="mb-7">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-medium text-primary">SIG-001</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-muted-foreground">Customer concentration has increased materially</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-[hsl(38,92%,50%)] font-medium">HIGH · COMMERCIAL</span>
        </div>
      </div>

      <ViewToggle view={view} onChange={setView} />

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {view === 'business' ? <BusinessWorkflow /> : <TechnicalWorkflow />}
        </motion.div>
      </AnimatePresence>

      <ExpandableLog />
    </div>
  );
}
