import React, { useEffect, useRef, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileDown,
  Lock,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Regeneration sequence ────────────────────────────────────────────────────

const REGEN_STEPS = [
  { label: 'Collecting current Watchtower state' },
  { label: 'Validating active material signals' },
  { label: 'Updating executive brief' },
  { label: 'Deal Brief updated' },
];

const STEP_TIMINGS_MS = [0, 800, 1650, 2500, 3300];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function RiskItem({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex items-start gap-3">
      <AlertTriangle className="w-4 h-4 text-[hsl(38,92%,50%)] flex-shrink-0 mt-0.5" />
      <div>
        <span className="text-sm font-semibold text-foreground">{title}: </span>
        <span className="text-sm text-muted-foreground leading-relaxed">{description}</span>
      </div>
    </li>
  );
}

// ─── Regeneration progress panel ──────────────────────────────────────────────

function RegenPanel({ activeStep, isComplete }: { activeStep: number; isComplete: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden mb-6"
    >
      <div className="border border-card-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          {isComplete
            ? <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(160,84%,39%)]" />
            : <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
          <span className="text-xs font-medium text-foreground">
            {isComplete ? 'Deal Brief regenerated' : 'Regenerating Deal Brief…'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {REGEN_STEPS.map((s, i) => {
            const stepNum = i + 1;
            const done = activeStep > stepNum || (isComplete && activeStep >= stepNum);
            const active = activeStep === stepNum && !isComplete;
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
                <div className="flex items-center gap-1.5">
                  {done  ? <CheckCircle2 className="w-3 h-3 text-[hsl(160,84%,39%)] flex-shrink-0" />
                  : active ? <Loader2 className="w-3 h-3 text-primary animate-spin flex-shrink-0" />
                  :          <span className="w-3 h-3 rounded-full border border-border flex-shrink-0" />}
                  <span className={cn(
                    'text-[10px] font-semibold uppercase tracking-wider leading-tight',
                    done ? 'text-[hsl(160,84%,39%)]' : active ? 'text-primary' : 'text-muted-foreground',
                  )}>
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type RegenState = 'idle' | 'running' | 'complete';

export default function DealBrief() {
  const [regenState, setRegenState] = useState<RegenState>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function startRegen() {
    if (regenState !== 'idle') return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRegenState('running');
    setActiveStep(1);
    STEP_TIMINGS_MS.slice(1).forEach((ms, i) => {
      const t = setTimeout(() => {
        if (i < REGEN_STEPS.length - 1) {
          setActiveStep(i + 2);
        } else {
          setActiveStep(REGEN_STEPS.length);
          setRegenState('complete');
        }
      }, ms);
      timers.current.push(t);
    });
  }

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const isComplete = regenState === 'complete';
  const isRunning = regenState === 'running';

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader title="Deal Brief" subtitle="NovaCura Therapeutics">
        <div className="flex items-center gap-2">
          <button
            onClick={startRegen}
            disabled={isRunning}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors',
              isRunning
                ? 'border-primary/30 bg-primary/8 text-primary cursor-not-allowed'
                : isComplete
                  ? 'border-[hsl(160,84%,39%,0.35)] bg-[hsl(160,84%,39%,0.08)] text-[hsl(160,84%,39%)] hover:bg-[hsl(160,84%,39%,0.12)]'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80',
            )}
          >
            {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : isComplete ? <CheckCircle2 className="w-3.5 h-3.5" />
            : <RefreshCw className="w-3.5 h-3.5" />}
            {isComplete ? 'Regenerated' : 'Regenerate Deal Brief'}
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors">
            <FileDown className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
      </PageHeader>

      {/* Regeneration progress panel */}
      <AnimatePresence>
        {regenState !== 'idle' && (
          <RegenPanel activeStep={activeStep} isComplete={isComplete} />
        )}
      </AnimatePresence>

      {/* Document — clean prose, no card wrapper */}
      <div className="max-w-3xl">
        {/* Timestamp + controlled snapshot */}
        <div className="flex flex-col gap-2 mb-10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground w-fit">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            Generated from Watchtower evidence — 14 Aug 2026, 14:32
          </div>
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-2.5 px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 w-fit"
              >
                <Lock className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-primary">Controlled snapshot</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-md">
                    This brief represents a fixed version of the current diligence state for shared investment-team review.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-10">

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Executive Summary
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              NovaCura Therapeutics is a profitable specialty pharmaceutical business operating across specialist care markets. The investment team is evaluating a potential majority investment, with diligence focused on the sustainability of commercial growth, financial assumptions and selected regulatory milestones. Recent evidence has increased the overall diligence assessment to Amber, with three material issues currently requiring investment-team attention.
            </p>
          </motion.section>

          <div className="border-t border-border" />

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Investment Thesis
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              The opportunity is underpinned by an established commercial platform, specialist market positioning and potential for continued organic growth. The investment case assumes further expansion across existing products and selected pipeline opportunities. Current diligence is focused on validating the durability of that growth and the downside resilience of the base case.
            </p>
          </motion.section>

          <div className="border-t border-border" />

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Key Risks
            </p>
            <p className="text-xs text-muted-foreground mb-5 italic">
              Current Watchtower findings — 3 active material signals
            </p>
            <ul className="space-y-4">
              <RiskItem
                title="Customer Concentration"
                description="Latest evidence indicates the largest customer represents 31% of Q2 revenue versus 18% previously understood. The increase of 13 percentage points raises questions about revenue resilience and single-counterparty dependency."
              />
              <RiskItem
                title="Growth Assumptions"
                description="FY27 base-case revenue growth of 14% is above the latest annualised trading run-rate of approximately 8%. The gap has not yet been explained by management and should be reconciled before the investment case is finalised."
              />
              <RiskItem
                title="Regulatory Timing"
                description="Latest evidence suggests a key regulatory milestone may occur in Q2 2027 rather than Q1 2027, representing a one-quarter delay against the base-case timeline."
              />
            </ul>
          </motion.section>

          <div className="border-t border-border" />

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Diligence Status
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              Diligence is in progress across commercial, financial, regulatory, legal, technology and management workstreams. Commercial and financial workstreams are active, with three material signals currently under investigation. Legal, technology and management workstreams show no material changes at this stage.
            </p>
          </motion.section>

        </div>
      </div>
    </div>
  );
}
