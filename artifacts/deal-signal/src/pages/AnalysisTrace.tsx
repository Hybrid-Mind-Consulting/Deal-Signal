import React, { Fragment, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ANALYSIS_EVENTS } from '@/data/mock';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
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
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

type View = 'business' | 'technical';

type NodeColor = 'slate' | 'violet' | 'amber' | 'green' | 'red';

interface InspectorData {
  name: string;
  type: string;
  inputs?: { label: string; value: string }[];
  logic?: string;
  output?: string;
  status?: 'Passed' | 'Running';
  checks?: { label: string; status: 'Passed' | 'Failed' }[];
  notes?: string;
}

interface TechNodeDef {
  id: string;
  label: string;
  typeLabel: string;
  color: NodeColor;
  icon: React.ElementType;
  snippet?: React.ReactNode;
  inspector: InspectorData;
}

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

// ─── Shared arrow ──────────────────────────────────────────────────────────────

function RightArrow() {
  return (
    <div className="flex items-center self-center flex-shrink-0 px-0.5">
      <ArrowRight className="w-4 h-4 text-border" />
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
// TECHNICAL VIEW — node-based workflow canvas
// ─────────────────────────────────────────────────────────────────────────────

const NODE_COLORS: Record<NodeColor, {
  border: string; bg: string; iconBg: string; icon: string;
  badge: string; badgeText: string; glow: string;
}> = {
  slate: {
    border: 'border-sky-500/25',
    bg: 'bg-sky-500/[0.04]',
    iconBg: 'bg-sky-500/10 border-sky-500/25',
    icon: 'text-sky-400',
    badge: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    glow: 'shadow-sky-500/5',
  },
  violet: {
    border: 'border-primary/30',
    bg: 'bg-primary/[0.04]',
    iconBg: 'bg-primary/10 border-primary/30',
    icon: 'text-primary',
    badge: 'bg-primary/10',
    badgeText: 'text-primary',
    glow: 'shadow-primary/5',
  },
  amber: {
    border: 'border-[hsl(38,92%,50%,0.3)]',
    bg: 'bg-[hsl(38,92%,50%,0.04)]',
    iconBg: 'bg-[hsl(38,92%,50%,0.1)] border-[hsl(38,92%,50%,0.3)]',
    icon: 'text-[hsl(38,92%,50%)]',
    badge: 'bg-[hsl(38,92%,50%,0.1)]',
    badgeText: 'text-[hsl(38,92%,50%)]',
    glow: 'shadow-[hsl(38,92%,50%)]/5',
  },
  green: {
    border: 'border-[hsl(160,84%,39%,0.3)]',
    bg: 'bg-[hsl(160,84%,39%,0.04)]',
    iconBg: 'bg-[hsl(160,84%,39%,0.1)] border-[hsl(160,84%,39%,0.3)]',
    icon: 'text-[hsl(160,84%,39%)]',
    badge: 'bg-[hsl(160,84%,39%,0.1)]',
    badgeText: 'text-[hsl(160,84%,39%)]',
    glow: 'shadow-[hsl(160,84%,39%)]/5',
  },
  red: {
    border: 'border-[hsl(0,84%,60%,0.3)]',
    bg: 'bg-[hsl(0,84%,60%,0.04)]',
    iconBg: 'bg-[hsl(0,84%,60%,0.1)] border-[hsl(0,84%,60%,0.3)]',
    icon: 'text-[hsl(0,84%,60%)]',
    badge: 'bg-[hsl(0,84%,60%,0.1)]',
    badgeText: 'text-[hsl(0,84%,60%)]',
    glow: 'shadow-[hsl(0,84%,60%)]/5',
  },
};

// ─── Node definitions ──────────────────────────────────────────────────────────

const TECH_NODES: TechNodeDef[] = [
  {
    id: 'tn-1',
    label: 'Evidence Ingestion',
    typeLabel: 'SOURCE',
    color: 'slate',
    icon: Database,
    inspector: {
      name: 'Evidence Ingestion',
      type: 'Source / Data Processing',
      inputs: [{ label: 'Document', value: 'July Management Accounts — Aug 2026' }],
      logic: 'Ingest new source document, validate format, extract metadata',
      output: 'Structured document ready for extraction',
      status: 'Passed',
      notes: 'Source authenticated · Financial data category',
    },
  },
  {
    id: 'tn-2',
    label: 'Extraction',
    typeLabel: 'PROCESSOR',
    color: 'slate',
    icon: FileSearch,
    inspector: {
      name: 'Extraction',
      type: 'Source / Data Processing',
      inputs: [
        { label: 'Document', value: 'July Management Accounts — Aug 2026' },
      ],
      logic: 'Identify and extract named entities, revenue figures, customer references',
      output: 'Customer A revenue: £12.4m · Total Q2 revenue: £40.0m',
      status: 'Passed',
    },
  },
  {
    id: 'tn-3',
    label: 'Evidence Router',
    typeLabel: 'ROUTER',
    color: 'slate',
    icon: Network,
    inspector: {
      name: 'Evidence Router',
      type: 'Source / Data Processing',
      inputs: [{ label: 'Extracted entities', value: 'Customer revenue data, concentration figures' }],
      logic: 'Route extracted evidence to relevant downstream processors in parallel',
      output: 'Dispatched to Prior Evidence Retrieval + Deterministic Calculation',
      status: 'Passed',
    },
  },
  {
    id: 'tn-4',
    label: 'Prior Evidence Retrieval',
    typeLabel: 'AI CONTEXT',
    color: 'violet',
    icon: BrainCircuit,
    inspector: {
      name: 'Prior Evidence Retrieval',
      type: 'AI / Context Reasoning',
      inputs: [{ label: 'Query', value: 'Customer concentration · NovaCura Therapeutics' }],
      logic: 'Vector search across document store for semantically related prior evidence',
      output: 'Management Presentation May 2026 · Largest customer: 18%',
      status: 'Passed',
      notes: 'Cosine similarity > 0.82 · Retrieved 2 relevant documents',
    },
  },
  {
    id: 'tn-5',
    label: 'Deterministic Calculation',
    typeLabel: 'LOGIC',
    color: 'amber',
    icon: Cpu,
    snippet: (
      <div className="mt-1.5 rounded bg-background border border-border px-2.5 py-2 font-mono">
        <p className="text-[9px] text-muted-foreground mb-1">formula</p>
        <p className="text-[10px] font-bold text-[hsl(38,92%,50%)]">£12.4m ÷ £40.0m</p>
        <p className="text-[10px] font-bold text-[hsl(0,84%,60%)] mt-0.5">= 31.0%</p>
      </div>
    ),
    inspector: {
      name: 'Deterministic Calculation',
      type: 'Deterministic / Business Logic',
      inputs: [
        { label: 'Customer A revenue', value: '£12.4m' },
        { label: 'Total Q2 revenue', value: '£40.0m' },
      ],
      logic: 'customer_revenue / total_revenue',
      output: '31.0%',
      status: 'Passed',
    },
  },
  {
    id: 'tn-6',
    label: 'Cross-source Comparison',
    typeLabel: 'COMPARATOR',
    color: 'red',
    icon: GitBranch,
    inspector: {
      name: 'Cross-source Comparison',
      type: 'Contradiction / Material Issue',
      inputs: [
        { label: 'Prior evidence', value: '18% (Management Presentation, May 2026)' },
        { label: 'Latest evidence', value: '31.0% (Management Accounts, Aug 2026)' },
      ],
      logic: 'Compute absolute and relative variance across source documents',
      output: 'Variance: +13 pp · +72% relative · Contradiction detected',
      status: 'Passed',
      notes: 'Threshold exceeded · Escalation triggered',
    },
  },
  {
    id: 'tn-7',
    label: 'Materiality Evaluator',
    typeLabel: 'EVALUATOR',
    color: 'amber',
    icon: SlidersHorizontal,
    inspector: {
      name: 'Materiality Evaluator',
      type: 'Deterministic / Business Logic',
      inputs: [
        { label: 'Variance', value: '+13 percentage points' },
        { label: 'Category', value: 'Commercial · Customer concentration' },
      ],
      logic: 'Apply materiality thresholds by signal category and variance magnitude',
      output: 'Materiality: High · Confidence: 94%',
      status: 'Passed',
    },
  },
  {
    id: 'tn-8',
    label: 'Quality / Evaluation Gate',
    typeLabel: 'GATE',
    color: 'green',
    icon: ShieldCheck,
    inspector: {
      name: 'Quality / Evaluation Gate',
      type: 'Evaluation / Governance',
      checks: [
        { label: 'Source grounding', status: 'Passed' },
        { label: 'Evidence consistency', status: 'Passed' },
        { label: 'Relevance', status: 'Passed' },
        { label: 'Hallucination guard', status: 'Passed' },
      ],
      output: 'Signal approved for dispatch',
      status: 'Passed',
    },
  },
  {
    id: 'tn-9',
    label: 'Watchtower Output',
    typeLabel: 'OUTPUT',
    color: 'green',
    icon: BellRing,
    inspector: {
      name: 'Watchtower Output',
      type: 'Evaluation / Governance',
      inputs: [{ label: 'Signal', value: 'Customer concentration has increased materially' }],
      logic: 'Dispatch signal to deal team · Update Deal Brief · Create recommended actions',
      output: 'SIG-001 dispatched · 4 actions created · Deal Brief updated',
      status: 'Passed',
    },
  },
];

// Lookup by id
const NODE_BY_ID = Object.fromEntries(TECH_NODES.map((n) => [n.id, n]));

// ─── Technical node card ───────────────────────────────────────────────────────

function TechNode({
  node,
  delay,
  selected,
  onSelect,
}: {
  node: TechNodeDef;
  delay: number;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const c = NODE_COLORS[node.color];
  const Icon = node.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => onSelect(node.id)}
      className={cn(
        'flex-shrink-0 w-40 rounded-xl border p-3.5 flex flex-col gap-2 text-left transition-all duration-200 cursor-pointer shadow-lg',
        c.border, c.bg, c.glow,
        selected ? 'ring-2 ring-offset-2 ring-offset-background ring-primary/50 shadow-primary/10' : 'hover:brightness-110',
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className={cn('text-[8px] font-bold uppercase tracking-widest font-mono px-1.5 py-0.5 rounded-sm', c.badge, c.badgeText)}>
          {node.typeLabel}
        </span>
        <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', c.icon)} />
      </div>
      <p className="text-[11px] font-semibold text-foreground leading-tight">{node.label}</p>
      {node.snippet}
      {node.id === 'tn-8' && (
        <div className="space-y-1 mt-0.5">
          {['Source grounding', 'Evidence consistency', 'Relevance'].map((check) => (
            <div key={check} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-2.5 h-2.5 text-[hsl(160,84%,39%)] flex-shrink-0" />
              <span className="text-[9px] text-muted-foreground font-mono">
                {check}: <span className="text-[hsl(160,84%,39%)]">Passed</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.button>
  );
}

// ─── Connector dots ────────────────────────────────────────────────────────────

function ConnectorH() {
  return (
    <div className="flex items-center self-center flex-shrink-0 px-0.5">
      <div className="flex items-center gap-1">
        <div className="w-3 h-px bg-border" />
        <ArrowRight className="w-3.5 h-3.5 text-border" />
      </div>
    </div>
  );
}

// ─── Inspector panel ───────────────────────────────────────────────────────────

function InspectorPanel({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const node = NODE_BY_ID[nodeId];
  const insp = node.inspector;
  const c = NODE_COLORS[node.color];
  const Icon = node.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="w-72 flex-shrink-0 rounded-xl border border-card-border bg-card shadow-xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className={cn('px-4 pt-4 pb-3 border-b border-border flex items-start gap-3', c.bg)}>
        <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5', c.iconBg)}>
          <Icon className={cn('w-3.5 h-3.5', c.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">{insp.name}</p>
          <p className={cn('text-[10px] mt-0.5', c.badgeText)}>{insp.type}</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {insp.inputs && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Input</p>
            <div className="space-y-1.5">
              {insp.inputs.map((inp) => (
                <div key={inp.label} className="flex items-start gap-2">
                  <span className="text-muted-foreground min-w-0 flex-shrink-0">{inp.label}:</span>
                  <span className="text-foreground font-medium">{inp.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insp.logic && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Logic / Process</p>
            <p className="text-foreground font-mono text-[11px] bg-background border border-border rounded-lg px-3 py-2 leading-relaxed">
              {insp.logic}
            </p>
          </div>
        )}

        {insp.checks && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Checks</p>
            <div className="space-y-1.5">
              {insp.checks.map((check) => (
                <div key={check.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{check.label}</span>
                  <span className={cn(
                    'text-[10px] font-semibold',
                    check.status === 'Passed' ? 'text-[hsl(160,84%,39%)]' : 'text-[hsl(0,84%,60%)]',
                  )}>
                    {check.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insp.output && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Output</p>
            <p className="text-foreground leading-relaxed">{insp.output}</p>
          </div>
        )}

        {insp.notes && (
          <div className="rounded-lg bg-muted/20 border border-border px-3 py-2">
            <p className="text-muted-foreground leading-relaxed">{insp.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Execution Status</p>
          {insp.status && (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[hsl(160,84%,39%)]" />
              <span className="text-[hsl(160,84%,39%)] font-semibold text-[10px]">{insp.status}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── System architecture context strip ─────────────────────────────────────────

function SystemArchitectureStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="mb-8"
    >
      {/* Section label */}
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        System Architecture Context
      </p>

      <div className="flex items-stretch gap-0 rounded-xl overflow-hidden border border-border">
        {/* Column 1 — GHO Existing Environment */}
        <div className="flex-1 bg-sky-500/[0.03] border-r border-border px-4 py-4">
          <p className="text-[9px] font-bold uppercase tracking-widest text-sky-400 mb-3">
            GHO Existing Environment
          </p>
          <div className="space-y-2">
            {[
              { label: 'Sana', note: 'Knowledge management platform' },
              { label: 'Claude', note: 'AI assistant interface' },
              { label: 'Document repositories', note: 'Diligence evidence store' },
              { label: 'Financial data feeds', note: 'Management accounts, models' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-sky-400/60 mt-1.5" />
                <div>
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-1.5">{item.note}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground/50 italic mt-3">
            Existing GHO infrastructure — not Deal Signal–owned
          </p>
        </div>

        {/* Arrow */}
        <div className="flex items-center px-3 flex-shrink-0 bg-muted/5">
          <ArrowRight className="w-4 h-4 text-border" />
        </div>

        {/* Column 2 — Deal Signal Proactive Intelligence */}
        <div className="flex-1 bg-primary/[0.03] border-r border-border px-4 py-4">
          <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-3">
            Deal Signal — Proactive Intelligence
          </p>
          <div className="space-y-2">
            {[
              { label: 'Evidence ingestion', note: 'Continuous source monitoring' },
              { label: 'Extraction & reasoning', note: 'AI + deterministic pipeline' },
              { label: 'Cross-source comparison', note: 'Contradiction detection' },
              { label: 'Materiality evaluation', note: 'Signal scoring & governance' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5" />
                <div>
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-1.5">{item.note}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground/50 italic mt-3">
            Workflow shown in detail below · Integrations illustrative
          </p>
        </div>

        {/* Arrow */}
        <div className="flex items-center px-3 flex-shrink-0 bg-muted/5">
          <ArrowRight className="w-4 h-4 text-border" />
        </div>

        {/* Column 3 — User Channels & Controlled Outputs */}
        <div className="flex-1 bg-[hsl(160,84%,39%,0.03)] px-4 py-4">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[hsl(160,84%,39%)] mb-3">
            User Channels &amp; Controlled Outputs
          </p>
          <div className="space-y-2">
            {[
              { label: 'Deal Team Workspace', note: 'Signal view, recommended actions' },
              { label: 'Deal Brief', note: 'Controlled snapshot for IC review' },
              { label: 'Ask Watchtower', note: 'Evidence-grounded Q&A' },
              { label: 'Notifications', note: 'Alert on new material signals' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[hsl(160,84%,39%,0.7)] mt-1.5" />
                <div>
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-1.5">{item.note}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground/50 italic mt-3">
            Investment team–facing outputs only
          </p>
        </div>
      </div>

      <p className="text-[9px] text-muted-foreground/50 mt-2 px-1 italic">
        Source integrations (Sana, Claude, financial data feeds) are illustrative. Production connectivity subject to GHO environment and security review.
      </p>
    </motion.div>
  );
}

// ─── Technical workflow canvas ─────────────────────────────────────────────────

function TechnicalWorkflow() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  const row1 = TECH_NODES.slice(0, 3); // Evidence Ingestion, Extraction, Evidence Router
  const branchLeft = TECH_NODES[3];    // Prior Evidence Retrieval
  const branchRight = TECH_NODES[4];   // Deterministic Calculation
  const row3 = TECH_NODES.slice(5);    // Cross-source Comparison → Watchtower Output

  return (
    <div>
      <SystemArchitectureStrip />

      <div className="flex gap-6 items-start">
      {/* Canvas */}
      <div className="flex-1 min-w-0">
        {/* Subtle grid background */}
        <div
          className="rounded-2xl border border-border p-6 relative"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--border) / 0.5) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          {/* Click hint */}
          <p className="text-[10px] text-muted-foreground/60 mb-4 font-mono">
            Click any node to inspect · {TECH_NODES.length} nodes · 9 edges
          </p>

          {/* Row 1: linear chain */}
          <div className="flex items-start gap-1">
            {row1.map((node, i) => (
              <Fragment key={node.id}>
                <TechNode node={node} delay={i * 0.06} selected={selectedId === node.id} onSelect={handleSelect} />
                {i < row1.length - 1 && <ConnectorH />}
              </Fragment>
            ))}
          </div>

          {/* Branch connectors from Evidence Router down */}
          <div className="flex mt-2 mb-2" style={{ paddingLeft: '342px' }}>
            {/* Left branch: down + left to Prior Evidence */}
            <div className="relative" style={{ width: '180px', height: '28px' }}>
              {/* Vertical line down from center-ish */}
              <div className="absolute left-[40px] top-0 bottom-0 w-px bg-border" />
              {/* Horizontal line going left */}
              <div className="absolute left-0 right-[calc(100%-41px)] bottom-0 h-px bg-border" />
              {/* Vertical line down on left side */}
              <div className="absolute left-0 bottom-0" style={{ top: '50%' }}>
                <div className="w-px bg-border" style={{ height: '14px' }} />
              </div>
            </div>
            {/* Right branch: down + right to Deterministic Calc */}
            <div className="relative" style={{ width: '180px', height: '28px' }}>
              <div className="absolute left-[40px] top-0 bottom-0 w-px bg-border" />
              <div className="absolute left-[41px] right-0 bottom-0 h-px bg-border" />
              <div className="absolute right-0 bottom-0" style={{ top: '50%' }}>
                <div className="w-px bg-border" style={{ height: '14px' }} />
              </div>
            </div>
          </div>

          {/* Row 2: Branch nodes */}
          <div className="flex gap-2 mb-2" style={{ paddingLeft: '302px' }}>
            <TechNode node={branchLeft} delay={0.22} selected={selectedId === branchLeft.id} onSelect={handleSelect} />
            <div className="w-14 self-center flex items-center justify-center">
              <div className="w-full h-px bg-border" />
            </div>
            <TechNode node={branchRight} delay={0.28} selected={selectedId === branchRight.id} onSelect={handleSelect} />
          </div>

          {/* Merge connectors down to Row 3 */}
          <div className="flex mb-2" style={{ paddingLeft: '302px' }}>
            <div className="relative" style={{ width: '180px', height: '28px' }}>
              <div className="absolute left-[80px] top-0 bottom-0 w-px bg-border" />
              <div className="absolute left-[80px] right-0 bottom-0 h-px bg-border" />
            </div>
            <div className="w-14" />
            <div className="relative" style={{ width: '180px', height: '28px' }}>
              <div className="absolute left-[80px] top-0 bottom-0 w-px bg-border" />
              <div className="absolute left-0 right-[calc(100%-80px)] bottom-0 h-px bg-border" />
            </div>
          </div>

          {/* Merge arrow */}
          <div className="flex mb-2" style={{ paddingLeft: '462px' }}>
            <ArrowDown className="w-4 h-4 text-border" />
          </div>

          {/* Row 3: linear chain */}
          <div className="flex items-start gap-1">
            {row3.map((node, i) => (
              <Fragment key={node.id}>
                <TechNode node={node} delay={0.34 + i * 0.06} selected={selectedId === node.id} onSelect={handleSelect} />
                {i < row3.length - 1 && <ConnectorH />}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 flex items-center flex-wrap gap-4 px-1"
        >
          {(
            [
              { color: 'slate', label: 'Source / Data Processing' },
              { color: 'violet', label: 'AI / Context Reasoning' },
              { color: 'amber', label: 'Deterministic / Business Logic' },
              { color: 'green', label: 'Evaluation / Governance' },
              { color: 'red', label: 'Contradiction / Material Issue' },
            ] as { color: NodeColor; label: string }[]
          ).map(({ color, label }) => (
            <div key={color} className="flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full', NODE_COLORS[color].icon.replace('text-', 'bg-').split(' ')[0])}
                style={{ background: color === 'slate' ? 'hsl(199, 89%, 60%)' : color === 'violet' ? 'hsl(265, 42%, 66%)' : color === 'amber' ? 'hsl(38, 92%, 50%)' : color === 'green' ? 'hsl(160, 84%, 39%)' : 'hsl(0, 84%, 60%)' }}
              />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Prototype disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg border border-border bg-muted/20 max-w-2xl"
        >
          <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Prototype workflow</span> — production architecture can be orchestrated with governed agent workflows, deterministic business logic and evaluation tooling.
          </p>
        </motion.div>
      </div>

      {/* Inspector panel */}
      <AnimatePresence>
        {selectedId && (
          <InspectorPanel key={selectedId} nodeId={selectedId} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </div>
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
