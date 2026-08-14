import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Plus,
  Send,
  TrendingUp,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Colour tokens ─────────────────────────────────────────────────────────────

const red = {
  badge: 'bg-[hsl(0,84%,60%,0.12)] text-[hsl(0,84%,60%)] border border-[hsl(0,84%,60%,0.25)]',
  text: 'text-[hsl(0,84%,60%)]',
  bg: 'bg-[hsl(0,84%,60%,0.06)] border-[hsl(0,84%,60%,0.18)]',
};

// ─── Signal lifecycle ──────────────────────────────────────────────────────────

type LifecycleStatus = 'New' | 'Investigating' | 'Resolved';

const LIFECYCLE_COLORS: Record<LifecycleStatus, { badge: string; dot: string }> = {
  New:           { badge: 'bg-primary/10 text-primary border border-primary/20',                               dot: 'bg-primary' },
  Investigating: { badge: 'bg-[hsl(38,92%,50%,0.12)] text-[hsl(38,92%,50%)] border border-[hsl(38,92%,50%,0.25)]', dot: 'bg-[hsl(38,92%,50%)]' },
  Resolved:      { badge: 'bg-[hsl(160,84%,39%,0.12)] text-[hsl(160,84%,39%)] border border-[hsl(160,84%,39%,0.25)]', dot: 'bg-[hsl(160,84%,39%)]' },
};

function LifecyclePip({ status }: { status: LifecycleStatus }) {
  const steps: LifecycleStatus[] = ['New', 'Investigating', 'Resolved'];
  const idx = steps.indexOf(status);
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex items-center gap-1">
            <span className={cn(
              'w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-300',
              i <= idx ? LIFECYCLE_COLORS[step].dot : 'bg-border',
            )} />
            <span className={cn(
              'text-[10px] font-medium transition-colors duration-300',
              i === idx ? 'text-foreground' : i < idx ? 'text-muted-foreground' : 'text-muted-foreground/50',
            )}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('w-5 h-px transition-colors duration-300', i < idx ? 'bg-border' : 'bg-border/40')} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

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

// ─── Evidence drawer ───────────────────────────────────────────────────────────

type EvidenceDef = {
  id: string;
  name: string;
  icon: React.ElementType;
  type: string;
  statement: string;
  metric: string;
  contradiction: boolean;
  drawerData: {
    sourceType: string;
    updatedAt?: string;
    rows: { label: string; value: string }[];
    linkedSignal: string;
  };
};

const EVIDENCE_ITEMS: EvidenceDef[] = [
  {
    id: 'ev-1',
    name: 'Management Presentation — May 2026',
    icon: FileText,
    type: 'Management supplied',
    statement: '"No single customer represents more than 20% of group revenue."',
    metric: 'Largest customer: 18%',
    contradiction: false,
    drawerData: {
      sourceType: 'Management supplied',
      rows: [
        { label: 'Relevant statement', value: '"No single customer represents more than 20% of group revenue."' },
        { label: 'Extracted understanding', value: 'Largest customer = 18%' },
      ],
      linkedSignal: 'Customer concentration has increased materially',
    },
  },
  {
    id: 'ev-2',
    name: 'July Management Accounts — Aug 2026',
    icon: FileSpreadsheet,
    type: 'Financial data',
    statement: 'Customer A generated £12.4m of £40.0m Q2 revenue.',
    metric: '31.0%',
    contradiction: true,
    drawerData: {
      sourceType: 'Financial data',
      updatedAt: '14 Aug 2026, 14:22',
      rows: [
        { label: 'Customer A revenue', value: '£12.4m' },
        { label: 'Total Q2 revenue', value: '£40.0m' },
        { label: 'Calculated concentration', value: '31.0%' },
      ],
      linkedSignal: 'Customer concentration has increased materially',
    },
  },
];

function EvidenceDrawer({ evidence, onClose }: { evidence: EvidenceDef; onClose: () => void }) {
  const Icon = evidence.icon;
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-0 top-0 bottom-0 z-50 w-96 bg-card border-l border-card-border shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-border">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/40 border border-border flex items-center justify-center mt-0.5">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug">{evidence.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{evidence.drawerData.sourceType}</p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {evidence.drawerData.updatedAt && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Last updated</p>
              <p className="text-sm text-foreground">{evidence.drawerData.updatedAt}</p>
            </div>
          )}

          {evidence.drawerData.rows.map((row) => (
            <div key={row.label}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{row.label}</p>
              <p className={cn(
                'text-sm leading-relaxed',
                row.label === 'Calculated concentration' || row.value === '31.0%' ? red.text + ' font-semibold' : 'text-foreground',
              )}>
                {row.value}
              </p>
            </div>
          ))}

          <div className="pt-1 border-t border-border">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Linked signal</p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border">
              <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded', red.badge)}>
                HIGH
              </span>
              <p className="text-xs text-foreground">{evidence.drawerData.linkedSignal}</p>
            </div>
          </div>

          {evidence.contradiction && (
            <div className="flex items-start gap-2.5 px-3 py-3 rounded-lg bg-[hsl(0,84%,60%,0.06)] border border-[hsl(0,84%,60%,0.2)]">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[hsl(0,84%,60%)] mt-1.5" />
              <p className="text-xs text-[hsl(0,84%,60%)] leading-relaxed">
                Contradiction detected against prior evidence — concentration increased from 18% to 31.0%.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Evidence content ──────────────────────────────────────────────────────────

function EvidenceContent({ onOpenEvidence }: { onOpenEvidence: (ev: EvidenceDef) => void }) {
  return (
    <div className="divide-y divide-border rounded-xl border border-card-border overflow-hidden">
      {EVIDENCE_ITEMS.map((ev) => {
        const Icon = ev.icon;
        return (
          <button
            key={ev.id}
            onClick={() => onOpenEvidence(ev)}
            className="w-full text-left px-5 py-4 hover:bg-muted/20 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {ev.name}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground">{ev.type}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
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
          </button>
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

// ─── Action drawer ─────────────────────────────────────────────────────────────

type ActionDef = {
  id: string;
  title: string;
  purpose: string;
  action: string;
  owner: string;
  priority: string;
  timing: string;
};

function ActionDrawer({
  action,
  onClose,
  onCreate,
}: {
  action: ActionDef;
  onClose: () => void;
  onCreate: () => void;
}) {
  const [owner, setOwner] = useState(action.owner);
  const [priority, setPriority] = useState(action.priority);
  const [timing, setTiming] = useState(action.timing);

  function handleCreate() {
    onCreate();
    onClose();
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-0 top-0 bottom-0 z-50 w-96 bg-card border-l border-card-border shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Create Action</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Action title */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Action
            </label>
            <div className="px-3 py-2.5 rounded-lg bg-background border border-border">
              <p className="text-sm text-foreground leading-relaxed">{action.action}</p>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Purpose
            </label>
            <p className="text-sm text-muted-foreground leading-relaxed">{action.purpose}</p>
          </div>

          {/* Owner */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Owner
            </label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {['High', 'Medium', 'Low'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    'px-3 py-1.5 rounded-md border text-xs font-medium transition-colors',
                    priority === p
                      ? p === 'High'
                        ? 'bg-[hsl(0,84%,60%,0.12)] border-[hsl(0,84%,60%,0.4)] text-[hsl(0,84%,60%)]'
                        : p === 'Medium'
                          ? 'bg-[hsl(38,92%,50%,0.12)] border-[hsl(38,92%,50%,0.4)] text-[hsl(38,92%,50%)]'
                          : 'bg-primary/10 border-primary/30 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Timing
            </label>
            <input
              type="text"
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Linked signal */}
          <div className="pt-1 border-t border-border">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Linked signal</p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border">
              <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded', red.badge)}>
                HIGH
              </span>
              <p className="text-xs text-foreground">Customer concentration has increased materially</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex gap-2">
          <button
            onClick={handleCreate}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Create Action
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Success toast ─────────────────────────────────────────────────────────────

function ActionSuccessToast({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
          className="fixed top-5 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-[hsl(160,84%,39%,0.35)] shadow-xl shadow-black/30"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(160,84%,39%)] flex-shrink-0" />
          <span className="text-xs font-medium text-foreground">
            Action created · Open Actions updated
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Recommended Actions content ───────────────────────────────────────────────

const ACTION_DEFS: ActionDef[] = [
  {
    id: 'ra-1',
    title: 'Request monthly customer-level revenue for the previous 24 months',
    purpose: 'Determine whether Q2 concentration is seasonal or structural.',
    action: 'Request 24 months of customer-level revenue',
    owner: 'Deal Team',
    priority: 'High',
    timing: 'Before next IC review',
  },
  {
    id: 'ra-2',
    title: 'Review Customer A contract terms',
    purpose: 'Assess duration, renewal dates, termination rights and pricing exposure.',
    action: 'Review Customer A contract terms and commercial exposure',
    owner: 'Deal Team',
    priority: 'High',
    timing: 'Within 5 business days',
  },
  {
    id: 'ra-3',
    title: 'Stress-test customer loss in the investment model',
    purpose: 'Quantify EBITDA, cash flow and leverage impact if the largest customer churns.',
    action: 'Stress-test customer loss scenario in the investment model',
    owner: 'Finance Team',
    priority: 'Medium',
    timing: 'Before IC',
  },
  {
    id: 'ra-4',
    title: 'Validate management explanation',
    purpose: 'Reconcile the 18% statement in the management presentation with the latest trading data.',
    action: 'Request written management explanation for concentration discrepancy',
    owner: 'Deal Team',
    priority: 'High',
    timing: 'Immediately',
  },
];

function RecommendedActionsContent({
  createdIds,
  onCreateClick,
}: {
  createdIds: Set<string>;
  onCreateClick: (action: ActionDef) => void;
}) {
  return (
    <div className="divide-y divide-border rounded-xl border border-card-border overflow-hidden">
      {ACTION_DEFS.map((action, idx) => {
        const created = createdIds.has(action.id);
        return (
          <div key={action.id} className="px-5 py-4 flex items-start gap-4">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center mt-0.5">
              <span className="text-[10px] font-bold text-muted-foreground">{idx + 1}</span>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-0.5">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.purpose}</p>
            </div>
            {created ? (
              <div className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-[hsl(160,84%,39%,0.3)] bg-[hsl(160,84%,39%,0.08)] text-[hsl(160,84%,39%)]">
                <CheckCircle2 className="w-3 h-3" />
                Created
              </div>
            ) : (
              <button
                onClick={() => onCreateClick(action)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Create Action
              </button>
            )}
          </div>
        );
      })}
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

// ─── Hero section ──────────────────────────────────────────────────────────────

function SignalHero({
  lifecycle,
  onInvestigate,
  onResolve,
}: {
  lifecycle: LifecycleStatus;
  onInvestigate: () => void;
  onResolve: () => void;
}) {
  const [, navigate] = useLocation();
  const lc = LIFECYCLE_COLORS[lifecycle];

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

      {/* Badges row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded', red.badge)}>
          High Priority
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
          Commercial
        </span>
        {/* Lifecycle badge */}
        <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1.5', lc.badge)}>
          <span className={cn('w-1 h-1 rounded-full', lc.dot)} />
          {lifecycle}
        </span>
      </div>

      {/* Lifecycle stepper */}
      <div className="flex items-center justify-between mb-4">
        <LifecyclePip status={lifecycle} />
        <div className="flex items-center gap-2">
          {lifecycle === 'New' && (
            <p className="text-[10px] text-muted-foreground italic">Moves to Investigating when you create an action or click Investigate</p>
          )}
          {lifecycle === 'Investigating' && (
            <button
              onClick={onResolve}
              className="text-[10px] text-muted-foreground hover:text-[hsl(160,84%,39%)] transition-colors border border-border hover:border-[hsl(160,84%,39%,0.4)] rounded px-2 py-1"
            >
              Mark as Resolved
            </button>
          )}
          {lifecycle === 'Resolved' && (
            <span className="text-[10px] text-[hsl(160,84%,39%)] font-medium">Signal resolved · evidence and trace retained</span>
          )}
        </div>
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
        onClick={onInvestigate}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <TrendingUp className="w-4 h-4" />
        Investigate
      </button>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SignalDetail() {
  const [, navigate] = useLocation();

  // Lifecycle state
  const [lifecycle, setLifecycle] = useState<LifecycleStatus>('New');

  // Evidence drawer state
  const [evidenceDrawer, setEvidenceDrawer] = useState<EvidenceDef | null>(null);

  // Action drawer state
  const [actionDrawer, setActionDrawer] = useState<ActionDef | null>(null);
  const [createdIds, setCreatedIds] = useState<Set<string>>(new Set());
  const [showActionToast, setShowActionToast] = useState(false);

  function handleInvestigate() {
    if (lifecycle === 'New') setLifecycle('Investigating');
    navigate('/ask-watchtower');
  }

  function handleResolve() {
    setLifecycle('Resolved');
  }

  function handleCreateAction(action: ActionDef) {
    setCreatedIds((prev) => new Set([...prev, action.id]));
    if (lifecycle === 'New') setLifecycle('Investigating');
    setShowActionToast(true);
    setTimeout(() => setShowActionToast(false), 3500);
  }

  function handleOpenActionDrawer(action: ActionDef) {
    setActionDrawer(action);
  }

  return (
    <>
      <ActionSuccessToast visible={showActionToast} />

      <div className="animate-in fade-in duration-400 max-w-4xl">
        {/* Hero — above the fold */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <SignalHero
            lifecycle={lifecycle}
            onInvestigate={handleInvestigate}
            onResolve={handleResolve}
          />
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
            <EvidenceContent onOpenEvidence={setEvidenceDrawer} />
          </DisclosureSection>

          <DisclosureSection title="Watchtower Assessment" defaultOpen={false}>
            <AssessmentContent />
          </DisclosureSection>

          <DisclosureSection
            title="Recommended Actions"
            badge={<span className="text-xs text-muted-foreground">4 actions</span>}
            defaultOpen={false}
          >
            <RecommendedActionsContent
              createdIds={createdIds}
              onCreateClick={handleOpenActionDrawer}
            />
          </DisclosureSection>

          <DisclosureSection title="Investigate this Signal" defaultOpen={false}>
            <InvestigateContent />
          </DisclosureSection>
        </motion.div>
      </div>

      {/* Evidence drawer */}
      <AnimatePresence>
        {evidenceDrawer && (
          <EvidenceDrawer
            key={evidenceDrawer.id}
            evidence={evidenceDrawer}
            onClose={() => setEvidenceDrawer(null)}
          />
        )}
      </AnimatePresence>

      {/* Action drawer */}
      <AnimatePresence>
        {actionDrawer && (
          <ActionDrawer
            key={actionDrawer.id}
            action={actionDrawer}
            onClose={() => setActionDrawer(null)}
            onCreate={() => handleCreateAction(actionDrawer)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
