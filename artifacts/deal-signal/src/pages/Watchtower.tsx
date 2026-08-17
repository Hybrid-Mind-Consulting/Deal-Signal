import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  FileType2,
  Loader2,
  RefreshCw,
  RotateCcw,
  Zap,
} from 'lucide-react';
import {
  MATERIAL_SIGNALS,
  DILIGENCE_COVERAGE,
  RECENT_EVIDENCE,
  WATCHTOWER_ACTIVITY,
  type MaterialSignal,
} from '@/data/mock';
import { cn } from '@/lib/utils';

// ─── Demo sequence — 8 deliberate stages ~1.2s apart ──────────────────────────

type StepType = 'ingestion' | 'extraction' | 'deterministic' | 'retrieval' | 'comparison' | 'evaluation' | 'signal';

interface DemoStep {
  id: string;
  label: string;
  lines: string[];
  type: StepType;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 'ds-1',
    label: 'New evidence detected',
    lines: ['July Management Accounts — Aug 2026', 'New financial evidence received'],
    type: 'ingestion',
  },
  {
    id: 'ds-2',
    label: 'Extracting key data',
    lines: ['Customer A revenue: £12.4m', 'Total Q2 revenue: £40.0m'],
    type: 'extraction',
  },
  {
    id: 'ds-3',
    label: 'Calculating customer concentration',
    lines: ['£12.4m ÷ £40.0m = 31.0%'],
    type: 'deterministic',
  },
  {
    id: 'ds-4',
    label: 'Checking relevant prior evidence',
    lines: ['Searching connected diligence evidence'],
    type: 'retrieval',
  },
  {
    id: 'ds-5',
    label: 'Prior evidence identified',
    lines: ['Management Presentation — May 2026', 'Previous understanding: 18%'],
    type: 'retrieval',
  },
  {
    id: 'ds-6',
    label: 'Cross-source comparison',
    lines: ['18% → 31%', 'Variance: +13 percentage points'],
    type: 'comparison',
  },
  {
    id: 'ds-7',
    label: 'Materiality assessment',
    lines: ['Assessing investment relevance and evidence quality'],
    type: 'evaluation',
  },
  {
    id: 'ds-8',
    label: 'High-priority signal detected',
    lines: [
      'Customer concentration has increased materially',
      'Commercial · High materiality · 94% confidence',
    ],
    type: 'signal',
  },
];

// Step start times in ms (~1200ms per step, ~9.6s total)
const STEP_OFFSETS_MS = [0, 1200, 2400, 3700, 4900, 6100, 7300, 8500];
const COMPLETE_AT_MS  = 9600;
const VALUE_ANIMATE_AT_MS = 6100; // when cross-source comparison step becomes active

const NEW_ACTIVITIES = [
  { id: 'demo-a1', time: '14:27', description: 'New evidence ingested: July Management Accounts — Aug 2026', highlight: true },
  { id: 'demo-a2', time: '14:27', description: 'Customer revenue data extracted — concentration 31.0% calculated', highlight: true },
  { id: 'demo-a3', time: '14:27', description: 'Cross-source contradiction confirmed: 18% → 31%', highlight: true },
  { id: 'demo-a4', time: '14:27', description: 'High-priority commercial signal dispatched to deal team', highlight: true },
];

// ─── Colour helpers ────────────────────────────────────────────────────────────

function priorityColors(priority: MaterialSignal['priority']) {
  if (priority === 'HIGH')
    return {
      badge: 'bg-[hsl(0,84%,60%,0.12)] text-[hsl(0,84%,60%)] border border-[hsl(0,84%,60%,0.25)]',
      value: 'text-[hsl(0,84%,60%)]',
      glow: 'border-l-[hsl(0,84%,60%,0.5)]',
      mat: 'text-[hsl(0,84%,60%)]',
    };
  if (priority === 'MEDIUM')
    return {
      badge: 'bg-[hsl(38,92%,50%,0.12)] text-[hsl(38,92%,50%)] border border-[hsl(38,92%,50%,0.25)]',
      value: 'text-[hsl(38,92%,50%)]',
      glow: 'border-l-[hsl(38,92%,50%,0.5)]',
      mat: 'text-[hsl(38,92%,50%)]',
    };
  return {
    badge: 'bg-primary/10 text-primary border border-primary/25',
    value: 'text-primary',
    glow: 'border-l-primary/50',
    mat: 'text-primary',
  };
}

function statusColors(status: 'Green' | 'Amber' | 'Red') {
  if (status === 'Green')  return { dot: 'bg-[hsl(160,84%,39%)]', text: 'text-[hsl(160,84%,39%)]' };
  if (status === 'Amber')  return { dot: 'bg-[hsl(38,92%,50%)]',  text: 'text-[hsl(38,92%,50%)]' };
  return { dot: 'bg-[hsl(0,84%,60%)]', text: 'text-[hsl(0,84%,60%)]' };
}

function fileIcon(ext: string) {
  if (ext === 'xlsx') return FileSpreadsheet;
  if (ext === 'docx') return FileType2;
  return FileText;
}

// ─── Notification toast ────────────────────────────────────────────────────────

function NotificationToast({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="fixed top-5 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-[hsl(0,84%,60%,0.35)] shadow-xl shadow-black/30"
        >
          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[hsl(0,84%,60%)] animate-pulse" />
          <span className="text-xs font-medium text-foreground">
            New high-priority commercial signal detected
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Refresh banner ────────────────────────────────────────────────────────────

type RefreshPhase = 'idle' | 'checking' | 'sourcing' | 'done';

function RefreshBanner({ phase }: { phase: RefreshPhase }) {
  const green = 'hsl(160,84%,39%)';

  return (
    <AnimatePresence>
      {(phase === 'sourcing' || phase === 'done') && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden mb-5"
        >
          <div className={cn(
            'flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors duration-500',
            phase === 'done'
              ? 'border-[hsl(160,84%,39%,0.3)] bg-[hsl(160,84%,39%,0.05)]'
              : 'border-border bg-muted/10',
          )}>
            {phase === 'sourcing' && (
              <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin flex-shrink-0" />
            )}
            {phase === 'done' && (
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: green }} />
            )}
            <span className={cn(
              'text-xs transition-colors duration-300',
              phase === 'done' ? 'text-foreground' : 'text-muted-foreground',
            )}>
              {phase === 'sourcing' && 'Checking 42 monitored sources'}
              {phase === 'done'     && '5 sources updated · No additional material changes detected'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Simulation step row ───────────────────────────────────────────────────────

function SimStepRow({ step, state }: { step: DemoStep; state: 'done' | 'active' | 'pending' }) {
  const isDone    = state === 'done';
  const isActive  = state === 'active';
  const isPending = state === 'pending';

  return (
    <motion.div
      initial={isActive ? { opacity: 0, x: -4 } : undefined}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'flex items-start gap-3 px-3.5 py-3 rounded-lg border transition-all duration-300',
        isDone    ? 'bg-[hsl(160,84%,39%,0.04)] border-[hsl(160,84%,39%,0.18)]'
        : isActive  ? 'bg-primary/[0.04] border-primary/40 shadow-sm shadow-primary/10'
        :              'border-border/50 opacity-40',
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {isDone   && <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(160,84%,39%)]" />}
        {isActive && <Loader2      className="w-3.5 h-3.5 text-primary animate-spin" />}
        {isPending && (
          <span className="flex items-center justify-center w-3.5 h-3.5">
            <span className="w-2.5 h-2.5 rounded-full border border-border/70" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[11px] font-semibold uppercase tracking-wider leading-snug',
          isDone   ? 'text-[hsl(160,84%,39%)]'
          : isActive ? 'text-primary'
          :             'text-muted-foreground',
        )}>
          {step.label}
        </p>

        {/* Sub-lines — show when done or active */}
        {(isDone || isActive) && (
          <div className="mt-1 space-y-0.5">
            {step.lines.map((line, i) => (
              <p
                key={i}
                className={cn(
                  'text-[11px] leading-relaxed',
                  step.type === 'deterministic'
                    ? 'font-mono text-[hsl(38,92%,50%)] font-semibold'
                    : step.type === 'signal' && i === 0
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground',
                )}
              >
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Simulation panel ──────────────────────────────────────────────────────────

function SimulationPanel({ activeStep, isComplete }: { activeStep: number; isComplete: boolean }) {
  const [showProcess, setShowProcess] = useState(false);

  return (
    <div className="mb-7">
      <AnimatePresence mode="wait">
        {isComplete ? (
          // ── Completed state: slim success bar + expandable process ──
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-[hsl(160,84%,39%,0.25)] bg-[hsl(160,84%,39%,0.05)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(160,84%,39%)] flex-shrink-0" />
              <span className="text-xs text-foreground flex-1">
                Evidence analysis complete · New high-priority commercial signal detected
              </span>
              <button
                onClick={() => setShowProcess((o) => !o)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                {showProcess ? 'Hide process' : 'View process'}
              </button>
            </div>

            {/* Expandable: all 8 steps shown as completed */}
            <AnimatePresence>
              {showProcess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden mt-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {DEMO_STEPS.map((step) => (
                      <SimStepRow key={step.id} step={step} state="done" />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          // ── Running state: vertical step list ──
          <motion.div
            key="running"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border border-card-border rounded-xl p-4">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                <span className="text-xs font-medium text-foreground">Analysing new evidence…</span>
                <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                  {activeStep}/{DEMO_STEPS.length}
                </span>
              </div>

              {/* Step list */}
              <div className="space-y-2">
                {DEMO_STEPS.map((step, i) => {
                  const stepNum = i + 1;
                  const state =
                    activeStep > stepNum ? 'done'
                    : activeStep === stepNum ? 'active'
                    : 'pending';
                  return <SimStepRow key={step.id} step={step} state={state} />;
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page header ───────────────────────────────────────────────────────────────

function WatchtowerHeader({
  onSimulate,
  onReset,
  onRefresh,
  simRunning,
  demoState,
  refreshPhase,
  lastRefreshed,
}: {
  onSimulate: () => void;
  onReset: () => void;
  onRefresh: () => void;
  simRunning: boolean;
  demoState: 'idle' | 'running' | 'complete';
  refreshPhase: RefreshPhase;
  lastRefreshed: string;
}) {
  const amber = statusColors('Amber');
  const isRefreshing = refreshPhase === 'checking' || refreshPhase === 'sourcing';

  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">NovaCura Therapeutics</h1>
        <div className="flex items-center gap-2.5 mt-1.5">
          <span className={cn('flex items-center gap-1.5 text-xs font-medium', amber.text)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', amber.dot)} />
            Amber
          </span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-sm text-muted-foreground">Specialty Pharma · Diligence</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastRefreshed}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors',
            isRefreshing
              ? 'border-border text-muted-foreground cursor-not-allowed opacity-70'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80',
          )}
        >
          {isRefreshing
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <RefreshCw className="w-3.5 h-3.5" />}
          {refreshPhase === 'checking' ? 'Checking sources…' : 'Refresh'}
        </button>

        {/* Reset demo */}
        {demoState === 'complete' && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset demo
          </button>
        )}

        {/* Simulate New Evidence */}
        <button
          onClick={onSimulate}
          disabled={simRunning || demoState === 'complete'}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors',
            simRunning
              ? 'border-primary/30 bg-primary/8 text-primary cursor-not-allowed'
              : demoState === 'complete'
                ? 'border-border text-muted-foreground opacity-50 cursor-default'
                : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/16 hover:border-primary/60',
          )}
        >
          {simRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          Simulate New Evidence
        </button>
      </div>
    </div>
  );
}

// ─── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { label: 'Diligence Risk',    value: 'Amber', sub: 'Risk elevated',        highlight: 'amber' as const },
    { label: 'Material Signals',  value: '3',     sub: '2 new since yesterday', highlight: 'amber' as const },
    { label: 'Open Actions',      value: '7',     sub: '3 high priority',       highlight: undefined },
    { label: 'Sources Monitored', value: '42',    sub: '5 updated today',       highlight: undefined },
  ];
  return (
    <div className="flex items-stretch border border-card-border rounded-xl divide-x divide-border mb-8">
      {stats.map((s) => (
        <div key={s.label} className="flex-1 px-6 py-4">
          <p className="text-xs text-muted-foreground mb-1.5">{s.label}</p>
          <p className={cn(
            'text-xl font-bold leading-none',
            s.highlight === 'amber' ? 'text-[hsl(38,92%,50%)]' : 'text-foreground',
          )}>
            {s.value}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Hero signal card ──────────────────────────────────────────────────────────

function SignalCard({
  signal,
  index,
  highlighted,
  pulseOnce,
  animateValue,
}: {
  signal: MaterialSignal;
  index: number;
  highlighted?: boolean;
  pulseOnce?: boolean;
  animateValue?: boolean;
}) {
  const [, navigate] = useLocation();
  const colors = priorityColors(signal.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        'bg-card border border-card-border rounded-xl border-l-[3px] overflow-hidden transition-all duration-500',
        colors.glow,
        highlighted && 'ring-1 ring-[hsl(0,84%,60%,0.35)] shadow-md shadow-[hsl(0,84%,60%,0.06)]',
      )}
    >
      {/* One-time pulse overlay */}
      <AnimatePresence>
        {pulseOnce && (
          <motion.div
            initial={{ opacity: 0.25 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute inset-0 rounded-xl bg-[hsl(0,84%,60%,0.08)] pointer-events-none z-10"
          />
        )}
      </AnimatePresence>

      <div className="relative px-5 py-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded', colors.badge)}>
              {signal.priority}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{signal.category}</span>
          </div>
          <span className="text-xs text-muted-foreground">{signal.detected}</span>
        </div>

        <h3 className="text-[15px] font-semibold text-foreground leading-snug mb-1.5">{signal.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{signal.summary}</p>

        <div className="flex items-center gap-5 mb-4">
          <div>
            <p className="text-[11px] text-muted-foreground mb-1">{signal.previousLabel}</p>
            <p className="text-2xl font-bold text-foreground">{signal.previousValue}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
          <div>
            <p className="text-[11px] text-muted-foreground mb-1">{signal.latestLabel}</p>
            <AnimatePresence mode="wait">
              {animateValue ? (
                <motion.p
                  key="animated"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, type: 'spring', stiffness: 180 }}
                  className={cn('text-2xl font-bold', colors.value)}
                >
                  {signal.latestValue}
                </motion.p>
              ) : (
                <motion.p key="static" className={cn('text-2xl font-bold', colors.value)}>
                  {signal.latestValue}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Materiality: <span className={colors.mat}>{signal.materiality}</span>
            {' · '}{signal.confidence}% confidence
            {' · '}{signal.sources.join(', ')}
          </p>
          <button
            onClick={() => navigate('/signals/customer-concentration')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group flex-shrink-0"
          >
            Investigate
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Compact signal row ────────────────────────────────────────────────────────

function CompactSignalRow({ signal, index }: { signal: MaterialSignal; index: number }) {
  const [, navigate] = useLocation();
  const colors = priorityColors(signal.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn('bg-card border border-card-border rounded-xl border-l-[3px] overflow-hidden', colors.glow)}
    >
      <div className="px-5 py-3.5 flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded', colors.badge)}>
            {signal.priority}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{signal.category}</span>
        </div>
        <p className="flex-1 text-sm font-medium text-foreground truncate min-w-0">{signal.title}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-semibold text-foreground">{signal.previousValue}</span>
          <ArrowRight className="w-3 h-3 text-muted-foreground/40" />
          <span className={cn('text-sm font-semibold', colors.value)}>{signal.latestValue}</span>
        </div>
        <span className={cn('text-xs flex-shrink-0 tabular-nums', colors.mat)}>
          {signal.confidence}% conf.
        </span>
        <button
          onClick={() => navigate('/signals/customer-concentration')}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors group flex-shrink-0"
        >
          Investigate
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Diligence Coverage ────────────────────────────────────────────────────────

function DiligenceCoverage() {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <h2 className="text-sm font-medium text-foreground mb-4">Diligence Coverage</h2>
      <div className="space-y-0">
        {DILIGENCE_COVERAGE.map((item) => {
          const c = statusColors(item.status);
          return (
            <div key={item.area} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div className="flex items-center gap-2.5">
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', c.dot)} />
                <span className="text-sm text-foreground">{item.area}</span>
              </div>
              <span className={cn('text-xs', c.text)}>{item.note}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recent Evidence ───────────────────────────────────────────────────────────

function RecentEvidence() {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <h2 className="text-sm font-medium text-foreground mb-4">Recent Evidence</h2>
      <div className="space-y-0">
        {RECENT_EVIDENCE.map((item) => {
          const Icon = fileIcon(item.ext);
          return (
            <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 cursor-default">
              <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">{item.updatedAt}</p>
              </div>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">{item.category}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Activity Log ──────────────────────────────────────────────────────────────

function WatchtowerActivity({ extraEvents }: { extraEvents: typeof NEW_ACTIVITIES }) {
  const [open, setOpen] = useState(false);
  const allEvents = [...extraEvents, ...WATCHTOWER_ACTIVITY];

  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-between w-full">
        <h2 className="text-sm font-medium text-foreground">Activity Log</h2>
        <span className="text-xs text-primary hover:text-primary/80 transition-colors">
          {open ? 'Hide activity' : 'View activity'}
        </span>
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
            <div className="relative mt-4">
              <div className="absolute left-[43px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-4">
                {allEvents.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={item.highlight ? { opacity: 0, x: -4 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <span className="flex-shrink-0 w-[38px] text-right text-[10px] font-mono text-muted-foreground pt-0.5">
                      {item.time}
                    </span>
                    <div className={cn(
                      'flex-shrink-0 w-3 h-3 rounded-full border-2 mt-1 relative z-10',
                      item.highlight
                        ? 'border-[hsl(0,84%,60%)] bg-[hsl(0,84%,60%,0.2)]'
                        : 'border-border bg-background',
                    )} />
                    <p className={cn('text-xs leading-relaxed', item.highlight ? 'text-foreground' : 'text-muted-foreground')}>
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

type DemoState = 'idle' | 'running' | 'complete';

export default function Watchtower() {
  const [demoState, setDemoState]             = useState<DemoState>('idle');
  const [activeStep, setActiveStep]           = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [extraActivities, setExtraActivities] = useState<typeof NEW_ACTIVITIES>([]);
  const [signalPulse, setSignalPulse]         = useState(false);
  const [valueAnimated, setValueAnimated]     = useState(false);

  // Refresh state
  const [refreshPhase, setRefreshPhase]       = useState<RefreshPhase>('idle');
  const [lastRefreshed, setLastRefreshed]     = useState('14 Aug 2026, 14:32');

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Simulation ─────────────────────────────────────────────────────────────

  function startSimulation() {
    if (demoState !== 'idle') return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setDemoState('running');
    setActiveStep(1);
    setSignalPulse(false);
    setValueAnimated(false);

    // Advance step at each offset
    STEP_OFFSETS_MS.slice(1).forEach((ms, i) => {
      const t = setTimeout(() => setActiveStep(i + 2), ms);
      timers.current.push(t);
    });

    // Animate the 18→31 value when cross-source comparison activates
    const tVal = setTimeout(() => setValueAnimated(true), VALUE_ANIMATE_AT_MS);
    timers.current.push(tVal);

    // Complete: signal pulse + notification + activities
    const tComplete = setTimeout(() => {
      setDemoState('complete');
      setShowNotification(true);
      setExtraActivities(NEW_ACTIVITIES);
      setSignalPulse(true);
      const hide       = setTimeout(() => setShowNotification(false), 5000);
      const clearPulse = setTimeout(() => setSignalPulse(false), 2500);
      timers.current.push(hide, clearPulse);
    }, COMPLETE_AT_MS);
    timers.current.push(tComplete);
  }

  function resetDemo() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setDemoState('idle');
    setActiveStep(0);
    setShowNotification(false);
    setExtraActivities([]);
    setSignalPulse(false);
    setValueAnimated(false);
  }

  // ── Refresh ────────────────────────────────────────────────────────────────

  function startRefresh() {
    if (refreshPhase !== 'idle') return;

    setRefreshPhase('checking');

    // STATE 2 — "Checking 42 monitored sources"
    const t1 = setTimeout(() => {
      setRefreshPhase('sourcing');
    }, 1500);

    // STATE 3 — "5 sources updated · No additional material changes detected"
    const t2 = setTimeout(() => {
      setRefreshPhase('done');
      setLastRefreshed('14 Aug 2026, 14:35');
    }, 3000);

    // STATE 4 — Return to idle, hide banner after a moment
    const t3 = setTimeout(() => {
      setRefreshPhase('idle');
    }, 6500);

    timers.current.push(t1, t2, t3);
  }

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const signalHighlighted = demoState === 'complete';

  return (
    <div className="animate-in fade-in duration-400">
      <NotificationToast visible={showNotification} />

      <WatchtowerHeader
        onSimulate={startSimulation}
        onReset={resetDemo}
        onRefresh={startRefresh}
        simRunning={demoState === 'running'}
        demoState={demoState}
        refreshPhase={refreshPhase}
        lastRefreshed={lastRefreshed}
      />

      {/* Refresh status banner */}
      <RefreshBanner phase={refreshPhase} />

      {/* Simulation panel */}
      {demoState !== 'idle' && (
        <SimulationPanel activeStep={activeStep} isComplete={demoState === 'complete'} />
      )}

      <StatsBar />

      {/* Two-column body */}
      <div className="grid grid-cols-[1fr_300px] gap-6 items-start">
        {/* LEFT — Material Signals */}
        <div>
          <div className="mb-5">
            <h2 className="text-sm font-medium text-foreground">Material Signals</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Changes and contradictions requiring investment-team attention
            </p>
          </div>
          <div className="space-y-3">
            {MATERIAL_SIGNALS.map((signal, i) =>
              i === 0 ? (
                <div key={signal.id} className="relative">
                  <SignalCard
                    signal={signal}
                    index={i}
                    highlighted={signalHighlighted}
                    pulseOnce={signalPulse}
                    animateValue={valueAnimated}
                  />
                </div>
              ) : (
                <CompactSignalRow key={signal.id} signal={signal} index={i} />
              )
            )}
          </div>
        </div>

        {/* RIGHT — panels */}
        <div className="space-y-4">
          <DiligenceCoverage />
          <RecentEvidence />
          <WatchtowerActivity extraEvents={extraActivities} />
        </div>
      </div>
    </div>
  );
}
