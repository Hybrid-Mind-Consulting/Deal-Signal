import React, { Fragment, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ANALYSIS_EVENTS } from '@/data/mock';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  BellRing,
  Bot,
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
  Workflow,
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
  role?: string;
  dealSignalInteraction?: string;
  integration?: string;
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
// TECHNICAL VIEW
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

// ─── Deal Signal workflow nodes ────────────────────────────────────────────────

const DEAL_SIGNAL_NODES: TechNodeDef[] = [
  {
    id: 'ev-trigger',
    label: 'Evidence Trigger',
    typeLabel: 'TRIGGER',
    color: 'slate',
    icon: Database,
    inspector: {
      name: 'Evidence Event / Trigger',
      type: 'Source / Data Processing',
      inputs: [{ label: 'Document', value: 'July Management Accounts — Aug 2026' }],
      logic: 'New document event received from connected GHO environment · validate and classify',
      output: 'Evidence event created · Routed to Signal Orchestration',
      status: 'Passed',
      notes: 'Source authenticated · Financial data category · Received via Sana trigger',
    },
  },
  {
    id: 'ev-extract',
    label: 'Evidence Extraction',
    typeLabel: 'PROCESSOR',
    color: 'slate',
    icon: FileSearch,
    inspector: {
      name: 'Evidence Extraction',
      type: 'Source / Data Processing',
      inputs: [{ label: 'Document', value: 'July Management Accounts — Aug 2026' }],
      logic: 'Identify and extract named entities, revenue figures, customer references',
      output: 'Customer A revenue: £12.4m · Total Q2 revenue: £40.0m',
      status: 'Passed',
    },
  },
  {
    id: 'sig-orch',
    label: 'Signal Orchestration',
    typeLabel: 'ORCHESTRATOR',
    color: 'violet',
    icon: Workflow,
    inspector: {
      name: 'Signal Orchestration',
      type: 'AI / Context Reasoning',
      inputs: [{ label: 'Extracted entities', value: 'Customer revenue data, concentration figures' }],
      logic: 'Classify signal type and orchestrate parallel evidence retrieval and deterministic analysis',
      output: 'Dispatched to Context & Evidence Routing + Deterministic Analysis in parallel',
      status: 'Passed',
    },
  },
  {
    id: 'ctx-route',
    label: 'Context Routing',
    typeLabel: 'ROUTER',
    color: 'slate',
    icon: Network,
    inspector: {
      name: 'Context & Evidence Routing',
      type: 'Source / Data Processing',
      inputs: [{ label: 'Signal context', value: 'Customer concentration · NovaCura Therapeutics' }],
      logic: 'Identify relevant prior evidence and initiate retrieval via GHO connected sources',
      output: 'Retrieval request dispatched to GHO connected environment',
      status: 'Passed',
    },
  },
  {
    id: 'gho-src',
    label: 'Retrieve Context',
    typeLabel: 'GHO RETRIEVAL',
    color: 'violet',
    icon: BrainCircuit,
    inspector: {
      name: 'Retrieve via GHO Connected Sources',
      type: 'AI / Context Reasoning',
      inputs: [{ label: 'Query', value: 'Customer concentration · NovaCura Therapeutics' }],
      logic: 'Vector search across existing GHO-connected evidence — not a new Deal Signal document store',
      output: 'Management Presentation May 2026 · Largest customer: 18%',
      status: 'Passed',
      notes: 'Cosine similarity > 0.82 · 2 relevant documents retrieved from GHO connected environment',
    },
  },
  {
    id: 'det-calc',
    label: 'Deterministic Analysis',
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
      name: 'Deterministic Analysis',
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
    id: 'cross-cmp',
    label: 'Cross-source Comparison',
    typeLabel: 'COMPARATOR',
    color: 'red',
    icon: GitBranch,
    snippet: (
      <div className="mt-1 rounded bg-background border border-border px-2 py-1.5 font-mono">
        <p className="text-[9px] text-[hsl(0,84%,60%)] font-bold">18% → 31%</p>
        <p className="text-[9px] text-muted-foreground">+13 percentage points</p>
      </div>
    ),
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
    id: 'mat-eval',
    label: 'Materiality Evaluation',
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
    id: 'gov-gate',
    label: 'Quality / Governance Gate',
    typeLabel: 'GATE',
    color: 'green',
    icon: ShieldCheck,
    inspector: {
      name: 'Quality / Governance Gate',
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
    id: 'publish',
    label: 'Publish Governed Signal',
    typeLabel: 'OUTPUT',
    color: 'green',
    icon: BellRing,
    inspector: {
      name: 'Publish Governed Signal',
      type: 'Evaluation / Governance',
      inputs: [{ label: 'Signal', value: 'Customer concentration has increased materially' }],
      logic: 'Dispatch governed signal to Watchtower, Deal Brief, Sana workflow, and Claude investigation capability',
      output: 'SIG-001 dispatched · 4 actions created · Deal Brief updated',
      status: 'Passed',
    },
  },
];

// ─── GHO boundary nodes ────────────────────────────────────────────────────────

interface GhoNodeDef {
  id: string;
  label: string;
  sublabel: string;
  badge: string;
  icon: React.ElementType;
  inspector: InspectorData;
  connectorLabel?: string;
}

const GHO_INPUT_NODE: GhoNodeDef = {
  id: 'sana-in',
  label: 'Sana',
  sublabel: 'Retrieval · triggers · workflows',
  badge: 'EXISTING GHO PLATFORM',
  icon: Database,
  inspector: {
    name: 'Sana',
    type: 'Existing GHO platform',
    role: 'Retrieval, workflow triggers and task orchestration',
    dealSignalInteraction: 'Provides and initiates evidence workflow · can receive governed signals and actions',
    integration: 'Illustrative',
  },
};

const GHO_OUTPUT_NODES: GhoNodeDef[] = [
  {
    id: 'out-wt',
    label: 'Watchtower',
    sublabel: 'Proactive alert',
    badge: 'DEAL SIGNAL',
    icon: BellRing,
    inspector: {
      name: 'Watchtower',
      type: 'Deal Signal — user interface',
      role: 'Investment team workspace for material signal review and action management',
      dealSignalInteraction: 'Primary destination for published governed signals',
      integration: 'Native',
    },
  },
  {
    id: 'out-db',
    label: 'Deal Brief',
    sublabel: 'Controlled investment snapshot',
    badge: 'DEAL SIGNAL',
    icon: FileText,
    inspector: {
      name: 'Deal Brief',
      type: 'Deal Signal — user interface',
      role: 'Controlled, evidence-backed snapshot for investment committee review',
      dealSignalInteraction: 'Updated automatically when governed signals are published',
      integration: 'Native',
    },
  },
  {
    id: 'out-sana',
    label: 'Sana',
    sublabel: 'Workflow / actions',
    badge: 'EXISTING GHO PLATFORM',
    icon: Database,
    inspector: {
      name: 'Sana',
      type: 'Existing GHO platform',
      role: 'Workflow triggers and action management within GHO environment',
      dealSignalInteraction: 'Governed signals and recommended actions can be dispatched to Sana workflows',
      integration: 'Illustrative',
    },
  },
  {
    id: 'out-claude',
    label: 'Claude',
    sublabel: 'Follow-up investigation',
    badge: 'EXISTING GHO AI',
    icon: Bot,
    inspector: {
      name: 'Claude',
      type: 'Existing GHO AI interface',
      role: 'Advanced user investigation and follow-up',
      dealSignalInteraction: 'Governed diligence capability can be exposed through MCP / API',
      integration: 'Illustrative',
    },
    connectorLabel: 'MCP / API',
  },
];

// ─── Combined node lookup ──────────────────────────────────────────────────────

type AnyNode = TechNodeDef | GhoNodeDef;

function isGhoNode(n: AnyNode): n is GhoNodeDef {
  return 'sublabel' in n;
}

const ALL_NODES: AnyNode[] = [
  GHO_INPUT_NODE,
  ...DEAL_SIGNAL_NODES,
  ...GHO_OUTPUT_NODES,
];

const NODE_BY_ID = Object.fromEntries(ALL_NODES.map((n) => [n.id, n]));

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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => onSelect(node.id)}
      className={cn(
        'flex-shrink-0 w-28 rounded-lg border p-2 flex flex-col gap-1.5 text-left transition-all duration-200 cursor-pointer shadow-md',
        c.border, c.bg, c.glow,
        selected ? 'ring-2 ring-offset-1 ring-offset-background ring-primary/50 shadow-primary/10' : 'hover:brightness-110',
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className={cn('text-[7px] font-bold uppercase tracking-widest font-mono px-1 py-0.5 rounded-sm', c.badge, c.badgeText)}>
          {node.typeLabel}
        </span>
        <Icon className={cn('w-2.5 h-2.5 flex-shrink-0', c.icon)} />
      </div>
      <p className="text-[10px] font-semibold text-foreground leading-tight">{node.label}</p>
    </motion.button>
  );
}

// ─── GHO boundary node card ────────────────────────────────────────────────────

function GhoNode({
  node,
  delay,
  selected,
  onSelect,
}: {
  node: GhoNodeDef;
  delay: number;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = node.icon;
  const isGHO = node.badge.startsWith('EXISTING');

  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => onSelect(node.id)}
      className={cn(
        'w-full rounded-lg border-2 border-dashed p-2 flex flex-col gap-1 text-left transition-all duration-200 cursor-pointer',
        isGHO
          ? 'border-sky-500/30 bg-sky-500/[0.03] hover:bg-sky-500/[0.06]'
          : 'border-[hsl(160,84%,39%,0.3)] bg-[hsl(160,84%,39%,0.03)] hover:bg-[hsl(160,84%,39%,0.06)]',
        selected && 'ring-2 ring-offset-1 ring-offset-background ring-primary/50',
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className={cn(
          'text-[7px] font-bold uppercase tracking-widest font-mono px-1 py-0.5 rounded-sm',
          isGHO ? 'bg-sky-500/10 text-sky-400' : 'bg-[hsl(160,84%,39%,0.1)] text-[hsl(160,84%,39%)]',
        )}>
          {node.badge}
        </span>
        <Icon className={cn('w-2.5 h-2.5 flex-shrink-0', isGHO ? 'text-sky-400' : 'text-[hsl(160,84%,39%)]')} />
      </div>
      <p className="text-[10px] font-semibold text-foreground leading-tight">{node.label}</p>
      <p className="text-[9px] text-muted-foreground leading-tight">{node.sublabel}</p>
      {node.connectorLabel && (
        <span className="self-start text-[7px] font-mono font-bold px-1 py-0.5 rounded border border-primary/30 text-primary bg-primary/5">
          {node.connectorLabel}
        </span>
      )}
    </motion.button>
  );
}

// ─── Connector ─────────────────────────────────────────────────────────────────

function ConnectorH() {
  return (
    <div className="self-center flex-shrink-0 flex items-center" style={{ width: '24px' }}>
      <div className="flex-1 h-px bg-border/60" />
      <ArrowRight className="w-3 h-3 text-border/60 flex-shrink-0" />
    </div>
  );
}

// ─── Inspector panel ───────────────────────────────────────────────────────────

function InspectorPanel({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const node = NODE_BY_ID[nodeId];
  const insp = node.inspector;

  // Determine color context
  const isGho = isGhoNode(node);
  const color = isGho ? null : (node as TechNodeDef).color;
  const c = color ? NODE_COLORS[color] : null;
  const Icon = node.icon;

  const headerBg = c ? c.bg : 'bg-sky-500/[0.04]';
  const iconBg = c ? c.iconBg : 'bg-sky-500/10 border-sky-500/25';
  const iconColor = c ? c.icon : 'text-sky-400';
  const typeColor = c ? c.badgeText : 'text-sky-400';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="w-60 flex-shrink-0 rounded-xl border border-card-border bg-card shadow-xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className={cn('px-4 pt-4 pb-3 border-b border-border flex items-start gap-3', headerBg)}>
        <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5', iconBg)}>
          <Icon className={cn('w-3.5 h-3.5', iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">{insp.name}</p>
          <p className={cn('text-[10px] mt-0.5', typeColor)}>{insp.type}</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">

        {insp.role && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Role</p>
            <p className="text-foreground leading-relaxed">{insp.role}</p>
          </div>
        )}

        {insp.dealSignalInteraction && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Deal Signal Interaction</p>
            <p className="text-foreground leading-relaxed">{insp.dealSignalInteraction}</p>
          </div>
        )}

        {insp.integration && (
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Integration</p>
            <span className="text-[10px] font-medium text-muted-foreground italic">{insp.integration}</span>
          </div>
        )}

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

        {insp.status && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Execution Status</p>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[hsl(160,84%,39%)]" />
              <span className="text-[hsl(160,84%,39%)] font-semibold text-[10px]">{insp.status}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Technical workflow — swimlane canvas ──────────────────────────────────────

function TechnicalWorkflow() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  // Deal Signal rows
  const row1 = DEAL_SIGNAL_NODES.slice(0, 3);  // trigger, extract, orchestrate
  const branchLeft  = DEAL_SIGNAL_NODES[3];     // context routing
  const branchLeft2 = DEAL_SIGNAL_NODES[4];     // retrieve context
  const branchRight = DEAL_SIGNAL_NODES[5];     // deterministic
  const row3 = DEAL_SIGNAL_NODES.slice(6);      // comparison → publish

  // ── Position constants (node=112px w-28, connectorH=24px, gap=0) ──────────
  // Row 1: 112 + 24 + 112 + 24 + 112 = 384px
  // Orchestration centre: 112+24+112+24+56 = 328px
  // Branch left col: 0–112px  centre=56px
  // Spacer: 96px → right col: 208–320px  centre=264px
  // Fork bar: 56→328  Join bar: 56→264

  return (
    <div>
      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="text-[9px] text-muted-foreground/50 italic mb-3 px-1"
      >
        Illustrative integration architecture — final deployment would align to GHO's existing systems, security and integration standards.
      </motion.p>

      {/* Canvas + inspector */}
      <div className="flex gap-4 items-start">

        {/* Swimlane canvas */}
        <div className="flex-1 min-w-0">
          <div
            className="rounded-2xl border border-border overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(circle, hsl(var(--border) / 0.5) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            <div className="flex">

              {/* ── LEFT: GHO Existing Environment ── */}
              <div className="w-44 flex-shrink-0 flex flex-col p-3 bg-sky-500/[0.02]"
                   style={{ borderRight: '1px dashed hsl(var(--border))' }}>
                <p className="text-[8px] font-bold uppercase tracking-widest text-sky-400 mb-3">
                  GHO Existing Environment
                </p>

                <div className="space-y-1.5 mb-3">
                  {['SharePoint / Document Repos', 'Financial Data', 'CRM / Deal Data', 'External / Public Data'].map((label) => (
                    <div key={label} className="flex items-center gap-1.5 px-2 py-1 rounded border border-sky-500/15 bg-sky-500/[0.04]">
                      <span className="w-1 h-1 rounded-full bg-sky-400/50 flex-shrink-0" />
                      <span className="text-[9px] text-sky-300/70 leading-tight">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center my-1">
                  <ArrowDown className="w-3 h-3 text-sky-500/30" />
                </div>

                <GhoNode node={GHO_INPUT_NODE} delay={0.06} selected={selectedId === GHO_INPUT_NODE.id} onSelect={handleSelect} />

                <div className="flex-1" />
                <div className="flex items-center justify-end gap-1.5 mt-3 pr-1">
                  <span className="text-[8px] font-semibold text-sky-400/60 tracking-wide">triggers</span>
                  <ArrowRight className="w-4 h-4 text-sky-500/60" />
                </div>
              </div>

              {/* ── CENTER: Deal Signal Proactive Intelligence ── */}
              <div className="flex-1 flex flex-col p-3 bg-primary/[0.01]"
                   style={{ borderRight: '1px dashed hsl(var(--border))' }}>
                <p className="text-[8px] font-bold uppercase tracking-widest text-primary mb-3">
                  Deal Signal Proactive Intelligence
                </p>

                {/* Row 1: trigger → extraction → orchestration (no gap — explicit widths) */}
                <div className="flex items-start">
                  {row1.map((node, i) => (
                    <Fragment key={node.id}>
                      <TechNode node={node} delay={0.08 + i * 0.06} selected={selectedId === node.id} onSelect={handleSelect} />
                      {i < row1.length - 1 && <ConnectorH />}
                    </Fragment>
                  ))}
                </div>

                {/* Fork connector
                    Stem from Orchestration centre (328px) down 10px
                    Horizontal bar: left=56px, width=272px (56→328)
                    Drops at left-branch centre (56px) and right-branch centre (264px) */}
                <div className="relative" style={{ height: '20px' }}>
                  <div className="absolute w-px bg-border" style={{ left: '328px', top: '0', height: '10px' }} />
                  <div className="absolute h-px bg-border" style={{ left: '56px', width: '272px', top: '10px' }} />
                  <div className="absolute w-px bg-border" style={{ left: '56px',  top: '10px', bottom: '0' }} />
                  <div className="absolute w-px bg-border" style={{ left: '264px', top: '10px', bottom: '0' }} />
                </div>

                {/* Row 2: parallel branches
                    Left col 0–112px (centre 56) | spacer 96px | right col 208–320px (centre 264) */}
                <div className="flex">
                  <div style={{ width: '112px', flexShrink: 0 }} className="flex flex-col gap-1">
                    <TechNode node={branchLeft}  delay={0.26} selected={selectedId === branchLeft.id}  onSelect={handleSelect} />
                    <div className="flex justify-center"><ArrowDown className="w-3 h-3 text-border" /></div>
                    <TechNode node={branchLeft2} delay={0.30} selected={selectedId === branchLeft2.id} onSelect={handleSelect} />
                  </div>
                  <div style={{ width: '96px', flexShrink: 0 }} />
                  <div style={{ width: '112px', flexShrink: 0 }} className="flex flex-col">
                    <TechNode node={branchRight} delay={0.32} selected={selectedId === branchRight.id} onSelect={handleSelect} />
                    {/* Equalizer line stretches to match left-branch height */}
                    <div className="flex-1 flex justify-center pt-1 min-h-[8px]">
                      <div className="w-px bg-border/50" />
                    </div>
                  </div>
                </div>

                {/* Join connector
                    Stems from left (56px) and right (264px), bar: left=56, width=208 (56→264)
                    Single drop at 56px into Row 3 */}
                <div className="relative" style={{ height: '20px' }}>
                  <div className="absolute w-px bg-border" style={{ left: '56px',  top: '0', height: '10px' }} />
                  <div className="absolute w-px bg-border" style={{ left: '264px', top: '0', height: '10px' }} />
                  <div className="absolute h-px bg-border" style={{ left: '56px', width: '208px', top: '10px' }} />
                  <div className="absolute w-px bg-border" style={{ left: '56px', top: '10px', bottom: '0' }} />
                </div>

                {/* Arrow into Row 3 — centred at 56px, arrow w-3=12px → paddingLeft=50px */}
                <div style={{ paddingLeft: '50px', marginBottom: '4px' }}>
                  <ArrowDown className="w-3 h-3 text-border" />
                </div>

                {/* Row 3: comparison → materiality → gate → publish */}
                <div className="flex items-start">
                  {row3.map((node, i) => (
                    <Fragment key={node.id}>
                      <TechNode node={node} delay={0.38 + i * 0.06} selected={selectedId === node.id} onSelect={handleSelect} />
                      {i < row3.length - 1 && <ConnectorH />}
                    </Fragment>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-1.5 mt-3 pr-1">
                  <span className="text-[8px] text-muted-foreground/40 italic">dispatch</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[hsl(160,84%,39%)]/30" />
                </div>
              </div>

              {/* ── RIGHT: GHO User Channels / Outputs ── */}
              <div className="w-60 flex-shrink-0 flex flex-col p-3 bg-[hsl(160,84%,39%,0.02)]">
                <p className="text-[8px] font-bold uppercase tracking-widest text-[hsl(160,84%,39%)] mb-3">
                  GHO User Channels / Outputs
                </p>

                <div className="flex flex-col gap-2">
                  {GHO_OUTPUT_NODES.map((node, i) => (
                    <GhoNode key={node.id} node={node} delay={0.5 + i * 0.06} selected={selectedId === node.id} onSelect={handleSelect} />
                  ))}
                </div>

                <p className="text-[8px] text-muted-foreground/40 italic mt-2 leading-relaxed">
                  Governed diligence via existing AI interface
                </p>
              </div>

            </div>
          </div>

          {/* Legend + inspect hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-3 flex items-center flex-wrap gap-3 px-1"
          >
            {(
              [
                { color: 'slate',  label: 'Source / Data Processing' },
                { color: 'violet', label: 'AI / Context Reasoning' },
                { color: 'amber',  label: 'Deterministic / Logic' },
                { color: 'green',  label: 'Evaluation / Governance' },
                { color: 'red',    label: 'Contradiction / Material Issue' },
              ] as { color: NodeColor; label: string }[]
            ).map(({ color, label }) => (
              <div key={color} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: color === 'slate' ? 'hsl(199,89%,60%)' : color === 'violet' ? 'hsl(265,42%,66%)' : color === 'amber' ? 'hsl(38,92%,50%)' : color === 'green' ? 'hsl(160,84%,39%)' : 'hsl(0,84%,60%)' }}
                />
                <span className="text-[9px] text-muted-foreground">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm border border-dashed border-sky-500/50 flex-shrink-0" />
              <span className="text-[9px] text-muted-foreground">Existing GHO component</span>
            </div>
            <span className="text-[9px] text-muted-foreground/40 italic ml-auto">Click any node to inspect</span>
          </motion.div>

          {/* Prototype disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg border border-border bg-muted/20 max-w-2xl"
          >
            <Info className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
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
