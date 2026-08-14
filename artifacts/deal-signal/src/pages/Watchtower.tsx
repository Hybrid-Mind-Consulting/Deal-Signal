import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
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

// ─── Demo sequence ─────────────────────────────────────────────────────────────

const DEMO_STEPS = [
  { label: 'New evidence detected',            sub: 'July Management Accounts — Aug 2026' },
  { label: 'Analysing evidence',               sub: 'Extracting customer revenue data' },
  { label: 'Cross-referencing prior evidence', sub: 'Comparing against Management Presentation — May 2026' },
  { label: 'Material signal detected',         sub: 'Customer concentration increased from 18% to 31%' },
];

// Step timing in ms: step 1 @ 0ms, step 2 @ 900ms, step 3 @ 1800ms, complete @ 3200ms
const DEMO_TIMINGS = [0, 900, 1800, 3200];
// Signal pulse happens at step 4 complete
const VALUE_ANIMATE_AT = 2600; // ms — when to start animating 18→31
const SIGNAL_PULSE_AT = 3200; // ms — when to pulse the signal card

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
  if (status === 'Green')
    return { dot: 'bg-[hsl(160,84%,39%)]', text: 'text-[hsl(160,84%,39%)]' };
  if (status === 'Amber')
    return { dot: 'bg-[hsl(38,92%,50%)]', text: 'text-[hsl(38,92%,50%)]' };
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

// ─── Simulation panel ──────────────────────────────────────────────────────────

function SimulationPanel({ activeStep, isComplete }: { activeStep: number; isComplete: boolean }) {
  const [showProcess, setShowProcess] = useState(false);

  return (
    <div className="mb-7">
      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Slim status bar */}
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

            {/* Expandable 4-step grid */}
            <AnimatePresence>
              {showProcess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mt-3"
                >
                  <div className="grid grid-cols-4 gap-3">
                    {DEMO_STEPS.map((s, i) => (
                      <div
                        key={i}
                        className="rounded-lg border px-3 py-2.5 bg-[hsl(160,84%,39%,0.06)] border-[hsl(160,84%,39%,0.2)]"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-3 h-3 text-[hsl(160,84%,39%)] flex-shrink-0" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(160,84%,39%)]">
                            {s.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed pl-[18px]">{s.sub}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="running"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border border-card-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                <span className="text-xs font-medium text-foreground">Analysing new evidence…</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {DEMO_STEPS.map((s, i) => {
                  const stepNum = i + 1;
                  const done = activeStep > stepNum;
                  const active = activeStep === stepNum;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'rounded-lg border px-3 py-2.5 transition-colors duration-300',
                        done   ? 'bg-[hsl(160,84%,39%,0.06)] border-[hsl(160,84%,39%,0.2)]'
                        : active ? 'bg-primary/5 border-primary/25'
                        :          'border-border opacity-40',
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {done   ? <CheckCircle2 className="w-3 h-3 text-[hsl(160,84%,39%)] flex-shrink-0" />
                        : active ? <Loader2 className="w-3 h-3 text-primary animate-spin flex-shrink-0" />
                        :          <span className="w-3 h-3 rounded-full border border-border flex-shrink-0" />}
                        <span className={cn(
                          'text-[10px] font-semibold uppercase tracking-wider',
                          done ? 'text-[hsl(160,84%,39%)]' : active ? 'text-primary' : 'text-muted-foreground',
                        )}>
                          {s.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed pl-[18px]">{s.sub}</p>
                    </div>
                  );
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
  simRunning,
  demoState,
}: {
  onSimulate: () => void;
  onReset: () => void;
  simRunning: boolean;
  demoState: 'idle' | 'running' | 'complete';
}) {
  const amber = statusColors('Amber');
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
            14 Aug 2026, 14:32
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
        {demoState === 'complete' && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset demo
          </button>
        )}
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

function StatsBar({ openActionsBonus }: { openActionsBonus: number }) {
  const stats = [
    { label: 'Diligence Risk',    value: 'Amber',        sub: 'Risk elevated',       highlight: 'amber' as const },
    { label: 'Material Signals',  value: '3',            sub: '2 new since yesterday', highlight: 'amber' as const },
    { label: 'Open Actions',      value: String(7 + openActionsBonus), sub: '3 high priority',      highlight: undefined },
    { label: 'Sources Monitored', value: '42',           sub: '5 updated today',      highlight: undefined },
  ];
  return (
    <div className="flex items-stretch border border-card-border rounded-xl divide-x divide-border mb-8">
      {stats.map((s) => (
        <div key={s.label} className="flex-1 px-6 py-4">
          <p className="text-xs text-muted-foreground mb-1.5">{s.label}</p>
          <p className={cn(
            'text-xl font-bold leading-none transition-all duration-500',
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

// ─── Hero signal card (full detail) ───────────────────────────────────────────

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
      {/* Pulse highlight overlay */}
      <AnimatePresence>
        {pulseOnce && (
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className="absolute inset-0 rounded-xl bg-[hsl(0,84%,60%,0.08)] pointer-events-none z-10"
          />
        )}
      </AnimatePresence>

      <div className="relative px-5 py-5">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded', colors.badge)}>
              {signal.priority}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{signal.category}</span>
          </div>
          <span className="text-xs text-muted-foreground">{signal.detected}</span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-foreground leading-snug mb-1.5">{signal.title}</h3>

        {/* Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{signal.summary}</p>

        {/* Value comparison */}
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
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                  className={cn('text-2xl font-bold', colors.value)}
                >
                  {signal.latestValue}
                </motion.p>
              ) : (
                <motion.p
                  key="static"
                  className={cn('text-2xl font-bold', colors.value)}
                >
                  {signal.latestValue}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Meta + action */}
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

// ─── Compact signal row (secondary signals) ────────────────────────────────────

function CompactSignalRow({ signal, index }: { signal: MaterialSignal; index: number }) {
  const [, navigate] = useLocation();
  const colors = priorityColors(signal.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        'bg-card border border-card-border rounded-xl border-l-[3px] overflow-hidden',
        colors.glow,
      )}
    >
      <div className="px-5 py-3.5 flex items-center gap-4 min-w-0">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded', colors.badge)}>
            {signal.priority}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{signal.category}</span>
        </div>

        {/* Title */}
        <p className="flex-1 text-sm font-medium text-foreground truncate min-w-0">{signal.title}</p>

        {/* Value comparison */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-semibold text-foreground">{signal.previousValue}</span>
          <ArrowRight className="w-3 h-3 text-muted-foreground/40" />
          <span className={cn('text-sm font-semibold', colors.value)}>{signal.latestValue}</span>
        </div>

        {/* Confidence */}
        <span className={cn('text-xs flex-shrink-0 tabular-nums', colors.mat)}>
          {signal.confidence}% conf.
        </span>

        {/* Investigate */}
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

// ─── Activity Log (collapsed by default) ──────────────────────────────────────

function WatchtowerActivity({ extraEvents }: { extraEvents: typeof NEW_ACTIVITIES }) {
  const [open, setOpen] = useState(false);
  const allEvents = [...extraEvents, ...WATCHTOWER_ACTIVITY];

  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full"
      >
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
                    <p className={cn(
                      'text-xs leading-relaxed',
                      item.highlight ? 'text-foreground' : 'text-muted-foreground',
                    )}>
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

// Shared open-actions bonus — updated from SignalDetail actions
export let _openActionsBonus = 0;
export function incrementOpenActions() { _openActionsBonus += 1; }

export default function Watchtower() {
  const [demoState, setDemoState] = useState<DemoState>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [extraActivities, setExtraActivities] = useState<typeof NEW_ACTIVITIES>([]);
  const [signalPulse, setSignalPulse] = useState(false);
  const [valueAnimated, setValueAnimated] = useState(false);
  const [openActionsBonus] = useState(0); // will be reactive via re-render
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function startSimulation() {
    if (demoState !== 'idle') return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setDemoState('running');
    setActiveStep(1);
    setSignalPulse(false);
    setValueAnimated(false);

    // Step advances
    DEMO_TIMINGS.slice(1).forEach((ms, i) => {
      const t = setTimeout(() => {
        setActiveStep(i + 2);
      }, ms);
      timers.current.push(t);
    });

    // Animate value change (18→31) mid-sequence
    const tVal = setTimeout(() => {
      setValueAnimated(true);
    }, VALUE_ANIMATE_AT);
    timers.current.push(tVal);

    // Complete + pulse signal
    const tComplete = setTimeout(() => {
      setDemoState('complete');
      setShowNotification(true);
      setExtraActivities(NEW_ACTIVITIES);
      setSignalPulse(true);
      const hide = setTimeout(() => setShowNotification(false), 5000);
      const clearPulse = setTimeout(() => setSignalPulse(false), 2500);
      timers.current.push(hide, clearPulse);
    }, SIGNAL_PULSE_AT);
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

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const signalHighlighted = demoState === 'complete';

  return (
    <div className="animate-in fade-in duration-400">
      <NotificationToast visible={showNotification} />

      <WatchtowerHeader
        onSimulate={startSimulation}
        onReset={resetDemo}
        simRunning={demoState === 'running'}
        demoState={demoState}
      />

      {demoState !== 'idle' && (
        <SimulationPanel activeStep={activeStep} isComplete={demoState === 'complete'} />
      )}

      <StatsBar openActionsBonus={openActionsBonus} />

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
                <CompactSignalRow
                  key={signal.id}
                  signal={signal}
                  index={i}
                />
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
