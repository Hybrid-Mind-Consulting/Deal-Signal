import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  FileSpreadsheet,
  FileText,
  FileType2,
  RefreshCw,
  Shield,
  TrendingUp,
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

// ─── Colour helpers ─────────────────────────────────────────────────────────

function priorityColors(priority: MaterialSignal['priority']) {
  if (priority === 'HIGH')
    return {
      badge: 'bg-[hsl(0,84%,60%,0.12)] text-[hsl(0,84%,60%)] border border-[hsl(0,84%,60%,0.25)]',
      bar: 'bg-[hsl(0,84%,60%)]',
      value: 'text-[hsl(0,84%,60%)]',
      glow: 'border-l-[hsl(0,84%,60%,0.5)]',
    };
  if (priority === 'MEDIUM')
    return {
      badge: 'bg-[hsl(38,92%,50%,0.12)] text-[hsl(38,92%,50%)] border border-[hsl(38,92%,50%,0.25)]',
      bar: 'bg-[hsl(38,92%,50%)]',
      value: 'text-[hsl(38,92%,50%)]',
      glow: 'border-l-[hsl(38,92%,50%,0.5)]',
    };
  return {
    badge: 'bg-primary/10 text-primary border border-primary/25',
    bar: 'bg-primary',
    value: 'text-primary',
    glow: 'border-l-primary/50',
  };
}

function statusColors(status: 'Green' | 'Amber' | 'Red') {
  if (status === 'Green')
    return {
      dot: 'bg-[hsl(160,84%,39%)]',
      text: 'text-[hsl(160,84%,39%)]',
      badge: 'bg-[hsl(160,84%,39%,0.1)] text-[hsl(160,84%,39%)] border border-[hsl(160,84%,39%,0.25)]',
    };
  if (status === 'Amber')
    return {
      dot: 'bg-[hsl(38,92%,50%)]',
      text: 'text-[hsl(38,92%,50%)]',
      badge: 'bg-[hsl(38,92%,50%,0.1)] text-[hsl(38,92%,50%)] border border-[hsl(38,92%,50%,0.25)]',
    };
  return {
    dot: 'bg-[hsl(0,84%,60%)]',
    text: 'text-[hsl(0,84%,60%)]',
    badge: 'bg-[hsl(0,84%,60%,0.1)] text-[hsl(0,84%,60%)] border border-[hsl(0,84%,60%,0.25)]',
  };
}

function fileIcon(ext: string) {
  if (ext === 'xlsx') return FileSpreadsheet;
  if (ext === 'docx') return FileType2;
  return FileText;
}

// ─── Page header ────────────────────────────────────────────────────────────

function WatchtowerHeader() {
  const amber = statusColors('Amber');
  return (
    <div className="flex items-start justify-between mb-6 pb-5 border-b border-border">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          NovaCura Therapeutics
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border',
              amber.badge,
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', amber.dot)} />
            Amber
          </span>
          <span className="text-sm text-muted-foreground">
            Specialty Pharma · Diligence
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Last evidence refresh</p>
          <p className="text-sm font-medium text-foreground">
            14 Aug 2026, 14:32
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Evidence
        </button>
      </div>
    </div>
  );
}

// ─── Executive summary cards ────────────────────────────────────────────────

function StatusCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: 'amber' | 'red' | 'green';
}) {
  const valueClass =
    highlight === 'amber'
      ? 'text-[hsl(38,92%,50%)]'
      : highlight === 'red'
        ? 'text-[hsl(0,84%,60%)]'
        : highlight === 'green'
          ? 'text-[hsl(160,84%,39%)]'
          : 'text-foreground';

  return (
    <div className="bg-card border border-card-border rounded-lg px-5 py-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className={cn('text-2xl font-bold tracking-tight', valueClass)}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

// ─── Signal card ────────────────────────────────────────────────────────────

function SignalCard({
  signal,
  index,
}: {
  signal: MaterialSignal;
  index: number;
}) {
  const [, navigate] = useLocation();
  const colors = priorityColors(signal.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        'bg-card border border-card-border rounded-xl overflow-hidden border-l-[3px] transition-shadow duration-200 hover:shadow-lg hover:shadow-black/20 cursor-default',
        colors.glow,
      )}
    >
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded',
                colors.badge,
              )}
            >
              {signal.priority} PRIORITY
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
              {signal.category}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-primary/5 text-primary border border-primary/20">
              {signal.status}
            </span>
          </div>
        </div>
        <h3 className="text-base font-semibold text-foreground leading-snug">
          {signal.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {signal.summary}
        </p>
      </div>

      {/* Comparison */}
      <div className="px-5 py-4 border-b border-border bg-background/30">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-lg px-4 py-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {signal.previousLabel}
            </p>
            <p className="text-xl font-bold text-foreground">
              {signal.previousValue}
            </p>
          </div>
          <div
            className={cn(
              'border rounded-lg px-4 py-3',
              signal.priority === 'HIGH'
                ? 'bg-[hsl(0,84%,60%,0.06)] border-[hsl(0,84%,60%,0.2)]'
                : 'bg-[hsl(38,92%,50%,0.06)] border-[hsl(38,92%,50%,0.2)]',
            )}
          >
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {signal.latestLabel}
            </p>
            <p className={cn('text-xl font-bold', colors.value)}>
              {signal.latestValue}
            </p>
          </div>
        </div>
      </div>

      {/* Meta + sources */}
      <div className="px-5 py-4 border-b border-border">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Materiality
            </p>
            <p
              className={cn(
                'text-sm font-semibold',
                signal.materiality === 'High'
                  ? 'text-[hsl(0,84%,60%)]'
                  : 'text-[hsl(38,92%,50%)]',
              )}
            >
              {signal.materiality}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Confidence
            </p>
            <p className="text-sm font-semibold text-foreground">
              {signal.confidence}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Detected
            </p>
            <p className="text-sm font-medium text-foreground">
              {signal.detected}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
            Sources
          </p>
          <div className="flex flex-wrap gap-1.5">
            {signal.sources.map((s) => (
              <span
                key={s}
                className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended action */}
      <div className="px-5 py-4">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Recommended Action
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          {signal.recommendedAction}
        </p>
        <button
          onClick={() => navigate('/signals/customer-concentration')}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group"
        >
          Investigate Signal
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Diligence Coverage ─────────────────────────────────────────────────────

function DiligenceCoverage() {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <h2 className="text-sm font-semibold text-foreground mb-1">
        Diligence Coverage
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Coverage status by workstream
      </p>
      <div className="space-y-2.5">
        {DILIGENCE_COVERAGE.map((item) => {
          const c = statusColors(item.status);
          return (
            <div
              key={item.area}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', c.dot)} />
                <span className="text-sm font-medium text-foreground">
                  {item.area}
                </span>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className={cn('text-xs', c.text)}>{item.note}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recent Evidence ────────────────────────────────────────────────────────

function RecentEvidence() {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <h2 className="text-sm font-semibold text-foreground mb-1">
        Recent Evidence
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Latest source updates
      </p>
      <div className="space-y-1">
        {RECENT_EVIDENCE.map((item) => {
          const Icon = fileIcon(item.ext);
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-default group"
            >
              <div className="flex-shrink-0 w-7 h-7 rounded bg-muted border border-border flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {item.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {item.updatedAt}
                </p>
              </div>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground flex-shrink-0">
                {item.category}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Watchtower Activity ─────────────────────────────────────────────────────

function WatchtowerActivity() {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <h2 className="text-sm font-semibold text-foreground mb-1">
        Watchtower Activity
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Continuous monitoring log — today
      </p>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[27px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-4">
          {WATCHTOWER_ACTIVITY.map((item, i) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-[54px] text-right">
                <span className="text-[10px] font-mono text-muted-foreground">
                  {item.time}
                </span>
              </div>
              <div className="flex-shrink-0 w-3.5 h-3.5 rounded-full border-2 border-border bg-background mt-0.5 relative z-10" />
              <p className="text-xs text-foreground leading-relaxed pt-0.5">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function Watchtower() {
  return (
    <div className="animate-in fade-in duration-400">
      <WatchtowerHeader />

      {/* Executive summary row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatusCard
          label="Overall Diligence Risk"
          value="AMBER"
          sub="Risk increased since previous review"
          highlight="amber"
        />
        <StatusCard
          label="Material Signals"
          value="3"
          sub="2 new since yesterday"
          highlight="amber"
        />
        <StatusCard
          label="Open Actions"
          value="7"
          sub="3 high priority"
        />
        <StatusCard
          label="Sources Monitored"
          value="42"
          sub="5 updated today"
        />
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-[1fr_320px] gap-6 items-start">
        {/* LEFT — Material Signals */}
        <div>
          <div className="mb-5">
            <h2 className="text-base font-semibold text-foreground">
              Material Signals
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Changes and contradictions requiring investment-team attention
            </p>
          </div>
          <div className="space-y-5">
            {MATERIAL_SIGNALS.map((signal, i) => (
              <SignalCard key={signal.id} signal={signal} index={i} />
            ))}
          </div>
        </div>

        {/* RIGHT — panels */}
        <div className="space-y-5">
          <DiligenceCoverage />
          <RecentEvidence />
          <WatchtowerActivity />
        </div>
      </div>
    </div>
  );
}
