import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play, Pause, StepForward, RotateCcw, Activity, Database, Terminal, Network,
  Sparkles, ShieldCheck, FileText, MessageSquare, GitFork,
  Cloud, Check, CheckCircle, Loader2, Zap, ChevronRight, Layers, BarChart2, Target,
  MessageCircle, BotMessageSquare, Send, RefreshCw, User, Monitor, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient();

// ─── Timing constants ─────────────────────────────────────────────────────────
const NORMAL_STAGE_DURATION  = 8000;   // ms — all regular nodes in Auto mode
const INSIGHT_STAGE_DURATION = 10000;  // ms — Insight Agent (node 7)
const REPORT_STAGE_DURATION  = 12000;  // ms — Executive Report (node 10)
const BULLET_REVEAL_DELAY    = 1400;   // ms between bullets (0.8 → 2.2 → 3.6 s)
const POPUP_FADE_DURATION    = 400;    // ms — pop-up card fade in/out

/** Dwell time for a node in Auto mode. */
const getStageDuration = (nodeIndex: number): number => {
  if (nodeIndex === 7)  return INSIGHT_STAGE_DURATION;
  if (nodeIndex === 10) return REPORT_STAGE_DURATION;
  return NORMAL_STAGE_DURATION;
};

// ─── Types & Data ────────────────────────────────────────────────────────────

type WorkflowNode = {
  id: number;
  label: string;
  icon: React.ElementType;
  tasks: string[];
  x: number;
  y: number;
  parents: number[];
};

// ─── Central icon configuration ──────────────────────────────────────────────

/** Semantic category — drives visual distinction between node roles. */
type NodeType = 'input' | 'logic' | 'datasource' | 'agent' | 'evaluation' | 'observability' | 'report';

type NodeIconCfg = {
  /** Lucide component for this node. Single source of truth. */
  icon: React.ElementType;
  /** Rendered size in px (strokeWidth always 2.5). */
  iconSize: number;
  /** Semantic category — used to apply consistent role-based styling. */
  nodeType: NodeType;
  /**
   * Raw RGB triplet for the accent colour, e.g. '139,92,246'.
   * Used to compute active glow box-shadows without duplicating hex values.
   */
  accentRgb: string;
  /** Tailwind bg+text classes when node is ACTIVE (processing). */
  activeCls: string;
  /**
   * Tailwind bg+text classes when node is DONE (completed).
   * Data-source nodes keep a faint tint; logic/agent nodes go neutral.
   */
  doneCls: string;
  /**
   * Tailwind bg+text classes when node is IDLE (not yet reached).
   * Data-source nodes show a subtle tint; all others are muted-neutral.
   */
  idleCls: string;
};

/** Compute active glow box-shadow — layered inner + outer for a tile-lamp effect. */
const iconGlow = (rgb: string): string =>
  `0 0 18px rgba(${rgb},0.70), 0 0 6px rgba(${rgb},0.40), inset 0 0 8px rgba(${rgb},0.20)`;

/** Faint resting glow for done-state tiles so they stay perceptible on screen share. */
const iconDoneGlow = (rgb: string): string =>
  `0 0 9px rgba(${rgb},0.28)`;

const PULSING_ICON_GLOW = iconGlow('192,132,252');

/**
 * Per-node icon configuration — the single source of truth for all icon
 * styling. NodeCard must not hardcode any icon colours directly.
 *
 * Visual taxonomy:
 *  • logic      — neutral idle, accent active, neutral done
 *  • datasource — faint accent tint at all states (always recognisable as data)
 *  • agent      — vivid purple active, soft purple done
 *  • evaluation — amber accent, subtle done tint
 *  • observability — slate accent, subtle done tint
 *  • report     — blue accent, soft blue done tint
 */
const NODE_ICON_CFG: Record<number, NodeIconCfg> = {
  // ── Input gate — brand violet ──────────────────────────────────────────────
  0:  {
    icon: MessageSquare, iconSize: 15, nodeType: 'input', accentRgb: '139,92,246',
    activeCls: 'bg-violet-500/45 text-violet-50',
    doneCls:   'bg-violet-500/22 text-violet-300',
    idleCls:   'bg-violet-500/10 text-violet-400/60',
  },
  // ── Intent Classifier — indigo (classification / targeting) ───────────────
  1:  {
    icon: Target, iconSize: 15, nodeType: 'logic', accentRgb: '99,102,241',
    activeCls: 'bg-indigo-500/45 text-indigo-50',
    doneCls:   'bg-indigo-500/22 text-indigo-300',
    idleCls:   'bg-indigo-500/10 text-indigo-400/60',
  },
  // ── ASK / AGENT Router — amber (decision branch) ──────────────────────────
  2:  {
    icon: GitFork, iconSize: 15, nodeType: 'logic', accentRgb: '251,191,36',
    activeCls: 'bg-amber-500/42 text-amber-50',
    doneCls:   'bg-amber-500/20 text-amber-300',
    idleCls:   'bg-amber-500/10 text-amber-400/60',
  },
  // ── Dataset Router — purple (data hub / dispatch) ─────────────────────────
  3:  {
    icon: Layers, iconSize: 15, nodeType: 'logic', accentRgb: '168,85,247',
    activeCls: 'bg-purple-500/45 text-purple-50',
    doneCls:   'bg-purple-500/22 text-purple-300',
    idleCls:   'bg-purple-500/10 text-purple-400/60',
  },
  // ── Text-to-Query — emerald (terminal / code) ─────────────────────────────
  4:  {
    icon: Terminal, iconSize: 15, nodeType: 'logic', accentRgb: '16,185,129',
    activeCls: 'bg-emerald-500/42 text-emerald-50',
    doneCls:   'bg-emerald-500/20 text-emerald-300',
    idleCls:   'bg-emerald-500/10 text-emerald-400/60',
  },
  // ── Snowflake — cyan (data warehouse / columnar store) ────────────────────
  5:  {
    icon: Database, iconSize: 15, nodeType: 'datasource', accentRgb: '6,182,212',
    activeCls: 'bg-cyan-500/48 text-cyan-50',
    doneCls:   'bg-cyan-500/24 text-cyan-300',
    idleCls:   'bg-cyan-500/12 text-cyan-400/65',
  },
  // ── Neo4j Knowledge Graph — fuchsia-purple (graph nodes) ─────────────────
  6:  {
    icon: Network, iconSize: 15, nodeType: 'datasource', accentRgb: '217,70,239',
    activeCls: 'bg-fuchsia-500/45 text-fuchsia-50',
    doneCls:   'bg-fuchsia-500/22 text-fuchsia-300',
    idleCls:   'bg-fuchsia-500/10 text-fuchsia-400/60',
  },
  // ── Insight Agent — brand violet, most vivid (the "AI brain" of the pipeline) ──
  7:  {
    icon: Sparkles, iconSize: 15, nodeType: 'agent', accentRgb: '167,139,250',
    activeCls: 'bg-violet-400/50 text-violet-50',
    doneCls:   'bg-violet-400/24 text-violet-200',
    idleCls:   'bg-violet-400/10 text-violet-300/65',
  },
  // ── Answer Evaluation — amber (quality gate / shield) ─────────────────────
  8:  {
    icon: ShieldCheck, iconSize: 15, nodeType: 'evaluation', accentRgb: '251,191,36',
    activeCls: 'bg-amber-500/45 text-amber-50',
    doneCls:   'bg-amber-500/22 text-amber-300',
    idleCls:   'bg-amber-500/10 text-amber-400/60',
  },
  // ── LangSmith Trace — sky (waveform / observability line) ────────────────
  9:  {
    icon: Activity, iconSize: 15, nodeType: 'observability', accentRgb: '56,189,248',
    activeCls: 'bg-sky-500/45 text-sky-50',
    doneCls:   'bg-sky-500/22 text-sky-300',
    idleCls:   'bg-sky-500/10 text-sky-400/60',
  },
  // ── Executive Report — blue (bar chart / report output) ──────────────────
  10: {
    icon: BarChart2, iconSize: 15, nodeType: 'report', accentRgb: '96,165,250',
    activeCls: 'bg-blue-500/45 text-blue-50',
    doneCls:   'bg-blue-500/22 text-blue-300',
    idleCls:   'bg-blue-500/10 text-blue-400/60',
  },
};

const NODES: WorkflowNode[] = [
  { id: 0,  label: 'Stakeholder Question',  icon: MessageSquare, tasks: ['A senior user asks a business question in plain English', 'They do not need to know which system or dashboard to use', 'The assistant prepares the question for analysis'],           x: 44, y: 6,  parents: [] },
  { id: 1,  label: 'Intent Classifier',     icon: Target,        tasks: ['The assistant works out what type of question has been asked', 'It recognises this as an analytical operations question', 'This determines which workflow should run next'],                   x: 44, y: 17, parents: [0] },
  { id: 2,  label: 'ASK / AGENT Router',    icon: GitFork,       tasks: ['The assistant decides whether this needs a simple answer or deeper analysis', 'This question needs multiple sources and reasoning', 'AGENT mode is selected'],          x: 44, y: 28, parents: [1] },
  // ── Middle row (y ≈ 46 %) ─────────────────────────────────────────────────
  { id: 3,  label: 'Dataset Router',        icon: Layers,        tasks: ['The assistant identifies which datasets are relevant', 'It routes the question to the right operational sources', 'The user does not need to choose the dataset manually'],      x: 42, y: 46, parents: [2] },
  { id: 4,  label: 'Text-to-Query',         icon: Terminal,      tasks: ['The assistant turns the plain-English question into query logic', 'This allows the system to retrieve the right data', 'It bridges the gap between business language and operational data'],             x: 20, y: 46, parents: [3] },
  { id: 7,  label: 'Insight Agent',         icon: Sparkles,      tasks: ['The assistant combines the data and context', 'It identifies production risk areas and likely drivers', 'It turns raw data into a business-readable risk insight'],          x: 64, y: 46, parents: [5, 6, 3] },
  { id: 9,  label: 'LangSmith Trace',       icon: Activity,      tasks: ['The team can inspect how the assistant behaved', 'Prompt calls, tool usage and agent steps are visible', 'This makes issues easier to debug and improve'],   x: 86, y: 40, parents: [8] },
  // ── Lower row (y ≈ 65 %) ─────────────────────────────────────────────────
  { id: 5,  label: 'Snowflake',             icon: Database,      tasks: ['Production activity data is queried', 'Market and site-level signals retrieved', 'Risk indicators calculated from operational data'],          x: 14, y: 65, parents: [4] },
  { id: 6,  label: 'Neo4j · Context Graph', icon: Network,       tasks: ['Relationship context is added to the analysis', 'The assistant links markets, sites and operational entities', 'This helps explain why the numbers may have changed'],            x: 34, y: 65, parents: [4] },
  { id: 8,  label: 'Answer Evaluation',     icon: ShieldCheck,   tasks: ['The answer is checked before being presented', 'Query quality and response reliability are assessed', 'This helps improve confidence in the output'],  x: 54, y: 65, parents: [7] },
  { id: 10, label: 'Executive Report',      icon: BarChart2,     tasks: ['The final output is turned into an executive-ready report', 'It summarises production risks, drivers and key signals', 'It gives the user suggested follow-up questions'],       x: 79, y: 68, parents: [8] },
];

const EDGES = NODES.flatMap(node => node.parents.map(p => ({ from: p, to: node.id })));

const FOLLOWUP_NODES = [
  { id: 'f0', label: 'Analyst Question',  icon: MessageSquare, task: 'Parsing follow-up intent…' },
  { id: 'f1', label: 'Context Retrieval', icon: Layers,        task: 'Loading prior reasoning context…' },
  { id: 'f2', label: 'Insight Agent',     icon: Sparkles,      task: 'Re-running insight synthesis…' },
  { id: 'f3', label: 'Report Update',     icon: FileText,      task: 'Appending section to report…' },
] as const;

// Scripted follow-up definitions — each carries the ordered node route the
// follow-up re-consults (always starts and ends at node 10 = Executive Report).
type FollowUpKey = 'site-breakdown' | 'highest-risk' | 'leadership-actions' | 'confidence-details';
const FOLLOWUP_DEFS: { key: FollowUpKey; label: string; route: number[]; runningLabel: string }[] = [
  { key: 'site-breakdown',     label: 'Show site-level risk breakdown',    route: [10, 3, 5, 7, 8, 10], runningLabel: 'Retrieving site-level risk detail…' },
  { key: 'highest-risk',       label: 'Explain the Northern Europe risk',   route: [10, 7, 8, 10],        runningLabel: 'Analysing Northern Europe drivers…' },
  { key: 'leadership-actions', label: 'Recommend actions for leadership',  route: [10, 7, 8, 10],        runningLabel: 'Generating recommended actions…'  },
  { key: 'confidence-details', label: 'Show confidence / evaluation details', route: [10, 8, 9, 10],     runningLabel: 'Loading evaluation and trace details…' },
];

// ─── Task Bubble ─────────────────────────────────────────────────────────────

const TaskBubble = ({ tasks, alignRight }: { tasks: string[]; alignRight: boolean }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [dimmed, setDimmed] = useState(false);

  useEffect(() => {
    setVisibleCount(0);
    setDimmed(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    tasks.forEach((_, i) => {
      // Reveal each line at 480 ms intervals
      timers.push(setTimeout(() => setVisibleCount(i + 1), i * 480));
    });
    // After all lines are shown, gently dim — signals "done, moving on"
    timers.push(setTimeout(() => setDimmed(true), tasks.length * 480 + 600));
    return () => timers.forEach(clearTimeout);
  }, [tasks]);

  return (
    <motion.div
      initial={{ opacity: 0, x: alignRight ? 10 : -10, scale: 0.94 }}
      animate={{ opacity: dimmed ? 0.45 : 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: alignRight ? 6 : -6, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }}
      className={`absolute ${alignRight ? 'right-[108%]' : 'left-[108%]'} top-1/2 -translate-y-1/2 w-48 z-30 pointer-events-none`}
    >
      {/* Connector line from bubble to node edge */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 h-px w-3 bg-active/30
          ${alignRight ? 'left-full' : 'right-full'}`}
      />

      <div className="bg-card/92 backdrop-blur-sm border border-border/55 rounded-md px-3 py-2.5 shadow-lg">
        {/* Thin active bar at top */}
        <div className="absolute top-0 left-3 right-3 h-px bg-active/40 rounded-full" />

        <ul className="space-y-1.5 mt-0.5">
          {tasks.map((task, i) => (
            <AnimatePresence key={i}>
              {i < visibleCount && (
                <motion.li
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="flex items-start gap-2"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.18, delay: 0.05 }}
                    className="mt-[5px] w-1 h-1 rounded-full bg-active/55 shrink-0"
                  />
                  <span className="text-[10.5px] text-foreground/78 leading-snug">{task}</span>
                </motion.li>
              )}
            </AnimatePresence>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

// ─── Mode Selector ────────────────────────────────────────────────────────────

const ModeSelector = ({ isRouterActive, isRouterComplete }: { isRouterActive: boolean; isRouterComplete: boolean }) => {
  const show = isRouterActive || isRouterComplete;
  const settled = isRouterComplete && !isRouterActive;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="mode-selector"
          initial={{ opacity: 0, y: -6, scale: 0.95 }}
          animate={{ opacity: settled ? 0.45 : 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] as const }}
          className="absolute z-30"
          style={{ left: '57%', top: '15%' }}
        >
          {/* Connector line from ASK Router card to this panel */}
          <svg
            className="absolute pointer-events-none"
            style={{ left: '-48px', top: '50%', transform: 'translateY(-50%)', width: '48px', height: '2px', overflow: 'visible' }}
          >
            <line
              x1="0" y1="1" x2="48" y2="1"
              stroke={settled ? 'hsl(var(--border) / 0.50)' : 'hsl(var(--active) / 0.65)'}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          </svg>

          {/* Main card */}
          <motion.div
            animate={
              isRouterActive
                ? { boxShadow: ['0 4px 24px rgba(139,108,246,0.12)', '0 4px 32px rgba(139,108,246,0.22)', '0 4px 24px rgba(139,108,246,0.12)'] }
                : { boxShadow: '0 2px 12px rgba(0,0,0,0.35)' }
            }
            transition={{ duration: 2.2, repeat: isRouterActive ? Infinity : 0, ease: 'easeInOut' }}
            className="bg-card border border-border/70 rounded-xl overflow-hidden"
            style={{ width: 276 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border/50 bg-muted/20">
              <GitFork size={10} className={`shrink-0 transition-colors ${settled ? 'text-muted-foreground/50' : 'text-active/80'}`} />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground/70">
                Routing Decision
              </span>
              {isRouterActive && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-active/80 shrink-0"
                />
              )}
            </div>

            {/* Explanation — replaces the separate StageExplainer card for this node */}
            <div className="px-3.5 pt-2.5 pb-0">
              <p className="text-[9.5px] text-muted-foreground/65 leading-relaxed">
                The assistant decides whether the question needs a direct answer or deeper multi-source analysis.
              </p>
            </div>

            {/* Two-column options */}
            <div className="flex gap-2 p-2.5">

              {/* ASK Mode — not selected, muted */}
              <div className="flex-1 rounded-lg border border-border/40 bg-muted/10 px-2.5 py-2.5 opacity-45">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="p-1 rounded bg-muted/50 shrink-0">
                    <MessageCircle size={10} className="text-muted-foreground/60" />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground/60 leading-none">ASK Mode</span>
                </div>
                <div className="space-y-0.5 pl-0.5">
                  <div className="text-[9px] text-muted-foreground/60 leading-relaxed">Single-source lookup</div>
                  <div className="text-[9px] text-muted-foreground/60 leading-relaxed">Fast direct answer</div>
                </div>
              </div>

              {/* AGENT Mode — selected, active */}
              <motion.div
                animate={
                  isRouterActive
                    ? { borderColor: ['rgba(139,108,246,0.55)', 'rgba(139,108,246,0.85)', 'rgba(139,108,246,0.55)'] }
                    : { borderColor: 'rgba(139,108,246,0.45)' }
                }
                transition={{ duration: 1.6, repeat: isRouterActive ? Infinity : 0, ease: 'easeInOut' }}
                className="flex-1 rounded-lg border bg-purple-500/8 px-2.5 py-2.5 relative overflow-hidden"
                style={{ borderColor: 'rgba(139,108,246,0.55)' }}
              >
                {/* Top shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />

                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="p-1 rounded bg-purple-500/20 shrink-0">
                    <BotMessageSquare size={10} className="text-purple-300" />
                  </div>
                  <span className="text-[11px] font-semibold text-purple-200 leading-none">AGENT Mode</span>
                  {/* Checkmark */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.22, ease: 'backOut' }}
                    className="ml-auto w-4 h-4 rounded-full bg-purple-500/25 border border-purple-400/50 flex items-center justify-center shrink-0"
                  >
                    <Check size={8} className="text-purple-200" strokeWidth={2.5} />
                  </motion.div>
                </div>
                <div className="space-y-0.5 pl-0.5">
                  <div className="text-[9px] text-purple-300/80 leading-relaxed">Multi-source analysis</div>
                  <div className="text-[9px] text-purple-300/80 leading-relaxed">Combines Snowflake + Neo4j</div>
                  <div className="text-[9px] text-purple-400/60 leading-relaxed font-medium">Selected for this query</div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Floating Question Card ──────────────────────────────────────────────────

// ─── Stakeholder Node ─────────────────────────────────────────────────────────

const StakeholderNode = ({
  query,
  setQuery,
  introPhase,
  typedChars,
}: {
  query: string;
  setQuery: (v: string) => void;
  introPhase: 'idle' | 'typing' | 'sending' | 'done';
  typedChars: number;
}) => {
  const isIdle      = introPhase === 'idle';
  const isTyping    = introPhase === 'typing';
  const isSending   = introPhase === 'sending';
  const isDone      = introPhase === 'done';
  const active      = introPhase !== 'idle';
  const submitted   = isSending || isDone;

  const displayText = isIdle ? query : query.slice(0, typedChars);

  return (
    <div className="absolute z-30" style={{ left: '2.5%', top: '5%' }}>
      <div className="flex items-start gap-3">

        {/* ── Avatar column ── */}
        <div className="flex flex-col items-center gap-2 shrink-0 pt-0.5">
          {/* Professional avatar — rounded square, violet ring when active */}
          <motion.div
            animate={active
              ? { boxShadow: ['0 0 0px rgba(139,108,246,0)', '0 0 18px rgba(139,108,246,0.30)', '0 0 0px rgba(139,108,246,0)'] }
              : { boxShadow: '0 0 0px transparent' }}
            transition={{ duration: 2.4, repeat: active ? Infinity : 0, ease: 'easeInOut' }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500
              ${active
                ? 'bg-gradient-to-br from-violet-500/22 to-indigo-600/14 border border-violet-400/40'
                : 'bg-card/60 border border-border/35'}`}
          >
            <User
              size={17}
              className={`transition-colors duration-500 ${active ? 'text-violet-300/85' : 'text-muted-foreground/38'}`}
            />
          </motion.div>

          {/* Role label */}
          <div className="text-center leading-tight">
            <div className="text-[7px] font-semibold uppercase tracking-wider text-foreground/35 whitespace-nowrap">
              VP Operations
            </div>
          </div>
        </div>

        {/* ── Speech bubble ── */}
        <div className="relative mt-0.5">
          {/* Bubble tail */}
          <div
            className="absolute -left-[6px] top-3.5 w-3 h-3 bg-card/90 border-l border-b border-border/42 z-10"
            style={{ transform: 'rotate(45deg)' }}
          />

          <motion.div
            animate={
              isTyping
                ? { boxShadow: '0 4px 28px rgba(0,0,0,0.24)' }
                : submitted
                ? { boxShadow: '0 3px 20px rgba(0,0,0,0.20)' }
                : { boxShadow: '0 2px 12px rgba(0,0,0,0.14)' }
            }
            transition={{ duration: 0.4 }}
            className="relative bg-card/90 backdrop-blur border border-border/42 rounded-xl overflow-hidden"
            style={{ width: 232 }}
          >
            {/* Active top progress bar */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  key="typing-bar"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0, opacity: 0 }}
                  style={{ transformOrigin: 'left' }}
                  transition={{ duration: 0.35 }}
                  className="absolute top-0 left-0 right-0 h-[2px] bg-violet-400/65"
                />
              )}
              {submitted && (
                <motion.div
                  key="submitted-bar"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  style={{ transformOrigin: 'left' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400/70 via-teal-300/50 to-transparent"
                />
              )}
            </AnimatePresence>

            <div className="px-4 pt-3 pb-3">
              {/* Header row */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[7.5px] font-mono uppercase tracking-widest text-muted-foreground/40">
                  Plain-English question
                </span>
                {/* Live indicator while typing */}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-[5px] h-[5px] rounded-full bg-violet-400/75 shrink-0"
                  />
                )}
                {/* Submitted badge */}
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, x: 4 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
                    className="flex items-center gap-1 shrink-0"
                  >
                    <CheckCircle size={8} className="text-teal-400/75" />
                    <span className="text-[7px] font-semibold uppercase tracking-wider text-teal-400/70">
                      Sent
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Question body */}
              {isIdle ? (
                <textarea
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent text-[11px] text-foreground/72 leading-relaxed resize-none focus:outline-none"
                />
              ) : (
                <p className="text-[11px] text-foreground/82 leading-relaxed min-h-[52px]">
                  {displayText}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.52, repeat: Infinity, repeatType: 'reverse' }}
                      className="ml-[1px] inline-block w-[2px] h-[12px] bg-violet-400/80 align-[-2px] rounded-sm"
                    />
                  )}
                </p>
              )}

              {/* Footer — separator + context line */}
              <div className="mt-2.5 pt-2 border-t border-border/20">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    /* "Question submitted" state */
                    <motion.div
                      key="submitted-footer"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.30, delay: 0.10 }}
                      className="flex items-center gap-1.5"
                    >
                      <CheckCircle size={9} className="text-teal-400/65 shrink-0" />
                      <span className="text-[9px] font-medium text-teal-400/65 leading-none">
                        Question submitted
                      </span>
                    </motion.div>
                  ) : (
                    /* Goal line — idle + typing */
                    <motion.p
                      key="goal-footer"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[8.5px] text-muted-foreground/30 leading-snug"
                    >
                      {isIdle
                        ? 'Press Run to submit'
                        : 'Goal: turn complex operational questions into trusted executive insight across connected datasets.'}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

// ─── Canvas Status Strip ──────────────────────────────────────────────────────

/**
 * Compact status chip rendered inline in the header's right control strip.
 * Shows "Step N / 11 · Label" while running, "Complete" when done.
 * Replaces the old bottom-of-canvas pill so the canvas floor stays clear.
 */
const HeaderStatusChip = ({
  workflowState,
  activeNodeIndex,
}: {
  workflowState: string;
  activeNodeIndex: number;
}) => (
  <AnimatePresence mode="wait">
    {workflowState === 'running' && activeNodeIndex >= 0 && (
      <motion.div
        key="hdr-running"
        initial={{ opacity: 0, scale: 0.88, x: 6 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.88, x: 6 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex items-center gap-1.5 bg-active/8 border border-active/22 rounded-full px-2.5 py-0.5 shrink-0"
      >
        <span className="relative flex h-[7px] w-[7px] shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-active/55 opacity-75" />
          <span className="relative inline-flex rounded-full h-[7px] w-[7px] bg-active/80" />
        </span>
        <span className="text-[10px] font-mono text-active/80 whitespace-nowrap">
          Step {activeNodeIndex + 1}&thinsp;/&thinsp;{NODES.length}
        </span>
        <span className="text-active/35 text-[10px] font-mono">·</span>
        <span className="text-[10px] font-mono text-foreground/55 whitespace-nowrap max-w-[120px] truncate">
          {NODES[activeNodeIndex]?.label}
        </span>
      </motion.div>
    )}
    {workflowState === 'complete' && (
      <motion.div
        key="hdr-done"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.88 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="flex items-center gap-1.5 bg-complete/8 border border-complete/25 rounded-full px-2.5 py-0.5 shrink-0"
      >
        <CheckCircle size={9} className="text-complete/70 shrink-0" />
        <span className="text-[10px] font-mono text-complete/70 whitespace-nowrap">Complete</span>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Report sub-components ────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-muted-foreground/60">{children}</span>
    <div className="flex-1 h-px bg-border/35" />
  </div>
);

const TrendSparkline = () => {
  const points = [48, 51, 50, 54, 58, 61, 67, 72];
  const w = 220, h = 56, pad = 6;
  const minV = Math.min(...points), maxV = Math.max(...points);
  const toX = (i: number) => pad + (i / (points.length - 1)) * (w - pad * 2);
  const toY = (v: number) => h - pad - ((v - minV) / (maxV - minV)) * (h - pad * 2);
  const linePath = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${toX(points.length - 1).toFixed(1)},${h} L${toX(0).toFixed(1)},${h} Z`;
  const lastX = toX(points.length - 1);
  const lastY = toY(points[points.length - 1]);

  return (
    <div className="flex items-end gap-6">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible shrink-0">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--active))" stopOpacity="0.20" />
            <stop offset="100%" stopColor="hsl(var(--active))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={pad} y1={pad + f * (h - pad * 2)} x2={w - pad} y2={pad + f * (h - pad * 2)}
            stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
        ))}
        <path d={areaPath} fill="url(#sparkGrad)" />
        <path d={linePath} fill="none" stroke="hsl(var(--active))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastX} cy={lastY} r="3.5" fill="hsl(var(--active))" />
        <circle cx={lastX} cy={lastY} r="6" fill="hsl(var(--active))" opacity="0.15" />
        {[0, 3, 7].map(i => (
          <text key={i} x={toX(i)} y={h + 2} textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.6">
            W{i + 1}
          </text>
        ))}
      </svg>
      <div className="flex flex-col gap-2 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Signal</span>
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded font-mono">ELEVATED</span>
        </div>
        <div className="text-2xl font-bold text-foreground tracking-tight">+18.4%</div>
        <div className="text-[11px] text-muted-foreground leading-snug">vs. 8-week rolling<br />baseline average</div>
      </div>
    </div>
  );
};

const ValidationStrip = () => {
  const [expanded, setExpanded] = useState(false);
  const primary = [
    { label: '~50 users in scope' },
    { label: '6 datasets' },
    { label: '70% avg pass rate' },
    { label: '93% best dataset' },
  ];
  const detail = [
    { label: '2 production datasets' },
    { label: '3 ready in dev' },
    { label: '1 in pipeline' },
    { label: '62 avg eval questions' },
    { label: '30–100 questions / dataset' },
  ];

  return (
    <div className="px-6 py-2.5 border-b border-border/20 flex items-center gap-3 flex-wrap bg-background/20">
      {primary.map(c => (
        <span key={c.label} className="text-[10px] font-mono text-muted-foreground/50 bg-muted/25 border border-border/25 rounded-full px-2.5 py-0.5 leading-tight">
          {c.label}
        </span>
      ))}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <span className="text-border/40 text-xs select-none">·</span>
            {detail.map(c => (
              <span key={c.label} className="text-[10px] font-mono text-muted-foreground/35 border border-border/18 rounded-full px-2.5 py-0.5 leading-tight whitespace-nowrap">
                {c.label}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setExpanded(v => !v)}
        className="ml-auto text-[9px] font-mono text-muted-foreground/35 hover:text-muted-foreground/65 transition-colors flex items-center gap-1 shrink-0"
      >
        {expanded ? 'Hide detail' : 'View evaluation detail'}
        <ChevronRight size={10} className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>
    </div>
  );
};

// ─── Executive Report ─────────────────────────────────────────────────────────

const ExecutiveReport = ({
  isVisible,
  reportRef,
  reportBodyRef,
  activeFollowUpAnswer,
  onCloseFollowUp,
  onFollowUp,
  onChipSelect,
  followUpIsRunning,
  followUpNodeLabel,
  followUpStatusText,
  activeRunningKey,
  followUpJustCompleted,
  submittedQuestion = '',
}: {
  isVisible: boolean;
  reportRef: React.RefObject<HTMLDivElement | null>;
  reportBodyRef: React.RefObject<HTMLDivElement | null>;
  activeFollowUpAnswer: FollowUpKey | null;
  onCloseFollowUp: () => void;
  onFollowUp: (key: FollowUpKey) => void;
  onChipSelect: (key: FollowUpKey) => void;
  followUpIsRunning: boolean;
  followUpNodeLabel: string | null;
  followUpStatusText: string | null;
  activeRunningKey: FollowUpKey | null;
  followUpJustCompleted: boolean;
  submittedQuestion?: string;
}) => {
  if (!isVisible) return null;

  const markets = [
    {
      name: 'Northern Europe', delta: +18, status: 'high' as const, tag: 'Elevated Risk',
      note: 'Throughput pressure across 4 high-activity production sites.',
      insight: 'Output running above expected range, reducing capacity buffer and increasing scheduling pressure.',
      action: 'Review site capacity and confirm whether current throughput can be sustained.',
    },
    {
      name: 'Iberia', delta: -11, status: 'low' as const, tag: 'Schedule Risk',
      note: 'Production delay flagged across 2 sites.',
      insight: 'Local scheduling disruption may affect planned production windows if recovery slips.',
      action: 'Validate the recovery plan and check whether delays could affect downstream supply.',
    },
    {
      name: 'DACH', delta: +9, status: 'mid' as const, tag: 'Capacity Pressure',
      note: 'Demand-led production uplift within plan.',
      insight: 'Activity remains within tolerance, but rising demand may reduce flexibility next cycle.',
      action: 'Monitor next planning cycle and assess whether extra capacity cover is needed.',
    },
  ];

  const drivers = [
    { label: 'Throughput pressure',           note: 'Northern Europe output running materially above expected range across high-activity sites.',  dot: 'bg-violet-400', color: 'text-violet-300/90' },
    { label: 'Schedule recovery risk',        note: 'Iberia has delayed production windows that may create downstream planning pressure.',          dot: 'bg-amber-400',  color: 'text-amber-300/90'  },
    { label: 'Demand-led capacity pressure',  note: 'DACH is within tolerance, but continued demand uplift could reduce future capacity buffer.',   dot: 'bg-teal-400',   color: 'text-teal-300/90'   },
  ];

  // Suggestions come from FOLLOWUP_DEFS — keys passed back to onFollowUp
  const suggestions = FOLLOWUP_DEFS;

  const statusStyle = {
    high: { badge: 'text-red-400/85 bg-red-400/6 border-red-400/18',     bar: 'bg-red-400'    },
    low:  { badge: 'text-amber-400/85 bg-amber-400/6 border-amber-400/18', bar: 'bg-amber-400'  },
    mid:  { badge: 'text-teal-400/85 bg-teal-400/6 border-teal-400/18',   bar: 'bg-teal-400'   },
  };

  const fadeUp = (i: number) => ({
    initial:    { opacity: 0, y: 10 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const, delay: 0.05 + i * 0.07 },
  });

  // Mini sparkline
  const pts = [48, 51, 50, 54, 58, 61, 67, 72];
  const W = 360, H = 38, P = 4;
  const mn = Math.min(...pts), mx = Math.max(...pts);
  const sx = (i: number) => P + (i / (pts.length - 1)) * (W - P * 2);
  const sy = (v: number) => H - P - ((v - mn) / (mx - mn)) * (H - P * 2);
  const spkLine = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
  const spkArea = `${spkLine} L${sx(pts.length - 1).toFixed(1)},${H} L${sx(0).toFixed(1)},${H} Z`;

  return (
    <div ref={reportRef} className="flex-1 min-h-0 flex flex-col overflow-hidden">

      {/* ── Panel header (non-scrolling) ── */}
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-border/35">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-muted-foreground/42">Illustrative executive report</span>
          <span className="text-muted-foreground/28 text-[10px]">·</span>
          <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-muted-foreground/42">Aug 2026</span>
        </div>
        <h2 className="text-[16px] font-semibold leading-snug text-foreground tracking-tight">
          Production Risk Insight
        </h2>
        <p className="text-[10.5px] text-muted-foreground/62 mt-0.5 leading-snug">
          3 production risk areas · Northern Europe · Iberia · DACH
        </p>
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {[
            { k: 'Confidence', v: '94%',   hi: true  },
            { k: 'Mode',       v: 'AGENT', hi: false },
            { k: 'Datasets',   v: '6',     hi: false },
            { k: 'Trace',      v: 'ls_8a2f', hi: false },
          ].map(m => (
            <div key={m.k} className={`flex items-center gap-1 rounded-full border px-2 py-0.5
              ${m.hi ? 'border-complete/22 bg-complete/5 text-complete/72' : 'border-border/28 bg-muted/12 text-muted-foreground/48'}`}
            >
              <span className="text-[7.5px] font-mono uppercase tracking-wider opacity-65">{m.k}</span>
              <span className="text-[8.5px] font-semibold font-mono">{m.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div ref={reportBodyRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="px-5 py-4 flex flex-col gap-5">

          {/* Follow-up running status banner */}
          <AnimatePresence>
            {followUpIsRunning && (
              <motion.div key="fu-banner"
                initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2.5 bg-active/8 border border-active/22 rounded-xl px-3.5 py-3">
                  <Loader2 size={11} className="text-active/70 animate-spin shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-active/88 leading-none mb-1">Running follow-up analysis…</div>
                    {followUpStatusText && (
                      <div className="text-[9px] text-active/48 font-mono leading-none truncate">{followUpStatusText}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Follow-up complete tick */}
          <AnimatePresence>
            {followUpJustCompleted && (
              <motion.div key="fu-done"
                initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 bg-complete/6 border border-complete/20 rounded-xl px-3.5 py-2.5">
                  <CheckCircle size={11} className="text-complete/72 shrink-0" />
                  <span className="text-[11px] font-medium text-complete/78">Follow-up complete</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary */}
          <motion.p {...fadeUp(0)} className="text-[12px] text-foreground/78 leading-relaxed">
            Three production risk areas require attention this month: elevated{' '}
            <span className="text-foreground font-medium">throughput pressure in Northern Europe</span>,
            schedule recovery risk in{' '}
            <span className="text-foreground font-medium">Iberia</span>, and emerging capacity
            pressure across <span className="text-foreground font-medium">DACH</span>.
          </motion.p>

          {/* Executive Interpretation */}
          <motion.div {...fadeUp(1)} className="relative rounded-lg border border-active/18 bg-active/5 px-4 py-3 overflow-hidden">
            {/* Left accent rule */}
            <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-active/40" />
            <div className="text-[8px] font-mono uppercase tracking-[0.14em] text-active/55 mb-1.5 pl-1">
              Executive Interpretation
            </div>
            <p className="text-[11.5px] text-foreground/75 leading-relaxed pl-1">
              Northern Europe requires immediate capacity review. Iberia has a localised scheduling
              risk that should be escalated. DACH remains within plan, but demand-led uplift should
              be monitored before the next production cycle.
            </p>
          </motion.div>

          {/* Market metrics */}
          <motion.div {...fadeUp(2)}>
            <div className="text-[8.5px] font-mono uppercase tracking-[0.13em] text-muted-foreground/35 mb-3">
              Priority Risk Areas
            </div>
            <div className="flex flex-col gap-2">
              {markets.map((m, i) => {
                const st = statusStyle[m.status];
                const barW = (Math.abs(m.delta) / 18) * 50;
                return (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.32, delay: 0.15 + i * 0.07, ease: 'easeOut' }}
                    className="bg-background/50 border border-border/25 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11.5px] font-semibold text-foreground/80">{m.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[7.5px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${st.badge}`}>{m.tag}</span>
                        <span className={`text-[13px] font-bold font-mono tabular-nums leading-none
                          ${m.status === 'high' ? 'text-red-400' : m.status === 'low' ? 'text-amber-400' : 'text-teal-400'}`}>
                          {m.delta > 0 ? `+${m.delta}%` : `${m.delta}%`}
                        </span>
                      </div>
                    </div>
                    {/* Center-origin bar */}
                    <div className="relative h-[3px] bg-muted/22 rounded-full overflow-hidden mb-1.5">
                      <div className="absolute left-1/2 top-0 w-px h-full bg-border/50" />
                      {m.delta >= 0 ? (
                        <motion.div initial={{ width: 0 }} animate={{ width: `${barW}%` }}
                          transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
                          className={`absolute left-1/2 top-0 h-full rounded-r-full ${st.bar}`} />
                      ) : (
                        <motion.div initial={{ width: 0 }} animate={{ width: `${barW}%` }}
                          transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
                          className={`absolute right-1/2 top-0 h-full rounded-l-full ${st.bar}`} />
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground/55 leading-snug mb-2">{m.note}</div>
                    <div className="border-t border-border/18 pt-2 flex flex-col gap-1.5">
                      <div className="flex items-start gap-1.5">
                        <span className="text-[7.5px] font-mono uppercase tracking-wider text-active/55 bg-active/8 border border-active/15 px-1 py-0.5 rounded shrink-0 mt-[1px]">Insight</span>
                        <span className="text-[10px] text-foreground/60 leading-snug">{m.insight}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-[7.5px] font-mono uppercase tracking-wider text-complete/55 bg-complete/6 border border-complete/15 px-1 py-0.5 rounded shrink-0 mt-[1px]">Action</span>
                        <span className="text-[10px] text-foreground/52 leading-snug">{m.action}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* 8-Week sparkline */}
          <motion.div {...fadeUp(3)}>
            <div className="text-[8.5px] font-mono uppercase tracking-[0.13em] text-muted-foreground/35 mb-3">
              8-Week Production Index
            </div>
            <div className="bg-background/50 border border-border/25 rounded-lg px-3.5 pt-3 pb-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono text-muted-foreground/38">Batch volume · rolling avg</span>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono text-amber-400/75 bg-amber-400/8 border border-amber-400/18 px-1.5 py-0.5 rounded">Elevated</span>
                  <span className="text-[13px] font-bold text-foreground/82 font-mono tabular-nums">+18.4%</span>
                </div>
              </div>
              <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="overflow-visible">
                <defs>
                  <linearGradient id="spkG2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--active))" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="hsl(var(--active))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.33, 0.66].map(f => (
                  <line key={f} x1={P} y1={P + f * (H - P * 2)} x2={W - P} y2={P + f * (H - P * 2)}
                    stroke="hsl(var(--border))" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.35" />
                ))}
                <path d={spkArea} fill="url(#spkG2)" />
                <path d={spkLine} fill="none" stroke="hsl(var(--active))" strokeWidth="1.4"
                  strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={sx(pts.length - 1)} cy={sy(pts[pts.length - 1])} r="2.5" fill="hsl(var(--active))" />
                <circle cx={sx(pts.length - 1)} cy={sy(pts[pts.length - 1])} r="5" fill="hsl(var(--active))" opacity="0.14" />
              </svg>
              <div className="flex justify-between mt-1.5">
                {['W1','W3','W5','W7','Now'].map(l => (
                  <span key={l} className="text-[8px] font-mono text-muted-foreground/28">{l}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Key Drivers */}
          <motion.div {...fadeUp(4)}>
            <div className="text-[8.5px] font-mono uppercase tracking-[0.13em] text-muted-foreground/35 mb-3">Key Drivers</div>
            <div className="flex flex-col gap-2.5">
              {drivers.map((d, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.07, ease: 'easeOut' }}
                  className="flex items-start gap-3"
                >
                  <div className={`mt-[5px] w-1.5 h-1.5 rounded-full shrink-0 ${d.dot}`} />
                  <div>
                    <div className={`text-[11px] font-medium mb-0.5 ${d.color}`}>{d.label}</div>
                    <div className="text-[10.5px] text-muted-foreground/52 leading-snug">{d.note}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Suggested follow-ups */}
          <motion.div {...fadeUp(5)}>
            <div className="text-[8.5px] font-mono uppercase tracking-[0.13em] text-muted-foreground/35 mb-3">Explore Further</div>
            <div className="flex flex-col gap-1.5">
              {suggestions.map((s) => {
                const isActive  = activeFollowUpAnswer === s.key;
                const isRunning = activeRunningKey === s.key;
                return (
                  <button key={s.key} onClick={() => !isRunning && onChipSelect(s.key)}
                    className={`flex items-center gap-2.5 text-left border rounded-lg px-3.5 py-2.5 transition-all duration-200 group
                      ${isRunning
                        ? 'bg-active/8 border-active/32 cursor-default'
                        : isActive
                        ? 'bg-active/6 border-active/28'
                        : 'bg-background/40 hover:bg-active/5 border-border/25 hover:border-active/28'}`}
                  >
                    {isRunning
                      ? <Loader2 size={10} className="text-active/65 animate-spin shrink-0" />
                      : <ChevronRight size={10} className={`shrink-0 transition-colors ${isActive ? 'text-active/60' : 'text-muted-foreground/30 group-hover:text-active/55'}`} />}
                    <span className={`text-[11px] leading-snug transition-colors
                      ${isRunning ? 'text-active/82' : isActive ? 'text-foreground/88' : 'text-foreground/62 group-hover:text-foreground/85'}`}>
                      {s.label}
                    </span>
                    {isRunning && (
                      <span className="ml-auto text-[8px] font-mono text-active/65 bg-active/8 border border-active/22 px-1.5 py-0.5 rounded shrink-0">
                        Running…
                      </span>
                    )}
                    {isActive && !isRunning && (
                      <span className="ml-auto text-[8px] font-mono text-active/60 bg-active/8 border border-active/20 px-1.5 py-0.5 rounded shrink-0">
                        Viewing ↓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* ── Follow-up answer ── one section at a time, replaced on new selection ── */}
          <AnimatePresence mode="wait">
            {activeFollowUpAnswer && (
              <motion.div key={activeFollowUpAnswer}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] as const }}
              >
                {/* Follow-up answer header: label + close button */}
                <div className="flex items-center gap-2 mb-2 px-0.5">
                  <MessageCircle size={10} className="text-muted-foreground/40 shrink-0" />
                  <span className="text-[8.5px] font-mono uppercase tracking-widest text-muted-foreground/38">Follow-up answer</span>
                  <button onClick={onCloseFollowUp}
                    className="ml-auto flex items-center gap-1 text-[8.5px] font-mono text-muted-foreground/38 hover:text-foreground/65 hover:bg-muted/20 border border-transparent hover:border-border/25 rounded-md px-2 py-0.5 transition-all"
                  >
                    <X size={10} /> Close
                  </button>
                </div>

                {/* Asked: label — shows the question that was submitted */}
                {submittedQuestion && (
                  <motion.div
                    key={submittedQuestion}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-2 mb-3 px-0.5"
                  >
                    <span className="shrink-0 mt-[1px] text-[7.5px] font-mono uppercase tracking-[0.12em] text-active/60 bg-active/8 border border-active/20 px-1.5 py-[3px] rounded-md leading-none">
                      Asked
                    </span>
                    <span className="text-[11.5px] text-foreground/72 leading-snug font-light">{submittedQuestion}</span>
                  </motion.div>
                )}

              {activeFollowUpAnswer === 'site-breakdown' && (
                <div className="border border-sky-500/22 rounded-xl overflow-hidden">
                  <div className="h-[2px] bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400" />
                  <div className="p-4 bg-sky-500/3">
                    <div className="flex items-center gap-2 mb-3">
                      <Layers size={11} className="text-sky-400/65" />
                      <span className="text-[8.5px] font-mono uppercase tracking-[0.13em] text-sky-400/60">Site-level risk breakdown</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {([
                        {
                          market: 'Market 01', site: 'Site A',
                          signal: 'Throughput +24%', risk: 'High' as const,
                          note: 'Sustained output above expected range',
                        },
                        {
                          market: 'Market 01', site: 'Site B',
                          signal: 'Throughput +19%', risk: 'High' as const,
                          note: 'Capacity buffer narrowing',
                        },
                        {
                          market: 'Market 02', site: 'Site C',
                          signal: 'Schedule delay', risk: 'Medium' as const,
                          note: 'Delayed production window across two lines',
                        },
                        {
                          market: 'Market 03', site: 'Site D',
                          signal: 'Demand uplift', risk: 'Watch' as const,
                          note: 'Increased demand-led production activity',
                        },
                      ] as const).map((row, i) => {
                        const badge = row.risk === 'High'
                          ? 'text-red-400/90 bg-red-400/8 border-red-400/22'
                          : row.risk === 'Medium'
                          ? 'text-amber-400/90 bg-amber-400/8 border-amber-400/22'
                          : 'text-sky-400/90 bg-sky-400/8 border-sky-400/22';
                        return (
                          <motion.div key={i}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 + i * 0.08, duration: 0.28 }}
                            className="flex items-center gap-3 bg-background/45 border border-border/20 rounded-xl px-3.5 py-2.5"
                          >
                            <div className="shrink-0 min-w-[72px]">
                              <div className="text-[9px] font-mono font-semibold text-foreground/55 leading-none mb-0.5">{row.market}</div>
                              <div className="text-[8.5px] font-mono text-muted-foreground/38">{row.site}</div>
                            </div>
                            <div className="w-px h-7 bg-border/30 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-medium text-foreground/78 leading-snug mb-0.5">{row.signal}</div>
                              <div className="text-[9.5px] text-muted-foreground/50 leading-snug truncate">{row.note}</div>
                            </div>
                            <span className={`shrink-0 text-[8px] font-mono font-semibold px-2 py-0.5 rounded-full border ${badge}`}>
                              {row.risk}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                   </div>
                 </div>
              )}

              {activeFollowUpAnswer === 'highest-risk' && (
                <div className="border border-violet-500/22 rounded-xl overflow-hidden">
                  <div className="h-[2px] bg-gradient-to-r from-violet-500 via-active to-purple-400" />
                  <div className="p-4 bg-violet-500/3">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={11} className="text-violet-400/65" />
                      <span className="text-[8.5px] font-mono uppercase tracking-[0.13em] text-violet-400/60">Highest-risk driver</span>
                    </div>

                    {/* Highlighted insight */}
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08, duration: 0.30 }}
                      className="bg-violet-500/6 border border-violet-500/20 rounded-xl p-3.5 mb-3"
                    >
                      <div className="text-[8.5px] font-mono uppercase tracking-wider text-violet-400/52 mb-1.5">Primary finding</div>
                      <p className="text-[11px] text-foreground/80 leading-relaxed">
                        Market 01 is the highest-risk area this month. The main driver is sustained throughput
                        pressure across four production sites, with output running materially above expected levels.
                      </p>
                    </motion.div>

                    {/* Likely causes */}
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.20, duration: 0.26 }}
                      className="mb-3"
                    >
                      <div className="text-[8.5px] font-mono uppercase tracking-wider text-muted-foreground/38 mb-2">Likely causes</div>
                      <div className="flex flex-col gap-1.5">
                        {['Higher-than-forecast production demand', 'Increased site utilisation', 'Reduced capacity buffer', 'Knock-on scheduling pressure'].map((cause, i) => (
                          <div key={i} className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400/55 shrink-0" />
                            <span className="text-[10.5px] text-foreground/68 leading-snug">{cause}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Leadership focus */}
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.36, duration: 0.26 }}
                      className="flex items-start gap-2.5 bg-active/5 border border-active/18 rounded-xl px-3.5 py-3"
                    >
                      <Target size={10} className="text-active/55 shrink-0 mt-[3px]" />
                      <div>
                        <div className="text-[8.5px] font-mono uppercase tracking-wider text-active/48 mb-1">Leadership focus</div>
                        <p className="text-[10.5px] text-foreground/70 leading-snug">
                          Review whether current throughput can be sustained without creating quality, maintenance or supply resilience risk.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {activeFollowUpAnswer === 'leadership-actions' && (
                <div className="border border-purple-500/22 rounded-xl overflow-hidden">
                  <div className="h-[2px] bg-gradient-to-r from-purple-500 via-active to-complete" />
                  <div className="p-4 bg-purple-500/3">
                    <div className="flex items-center gap-2 mb-3">
                      <Target size={11} className="text-purple-400/65" />
                      <span className="text-[8.5px] font-mono uppercase tracking-[0.13em] text-purple-400/60">Recommended leadership actions</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {[
                        {
                          num: 1,
                          title: 'Review Market 01 capacity',
                          body: 'Confirm whether current throughput can be sustained without affecting quality, maintenance windows or supply resilience.',
                        },
                        {
                          num: 2,
                          title: 'Validate Market 02 schedule recovery',
                          body: 'Check whether the scheduling delay is temporary or likely to affect future production windows.',
                        },
                        {
                          num: 3,
                          title: 'Monitor Market 03 demand shift',
                          body: 'Track whether the demand-led uplift continues into the next planning cycle and whether extra capacity planning is required.',
                        },
                        {
                          num: 4,
                          title: 'Prioritise follow-up with site leads',
                          body: 'Focus first on sites contributing to Market 01 throughput pressure and Market 02 schedule risk.',
                        },
                      ].map((item, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.10 + i * 0.09, duration: 0.30 }}
                          className="flex items-start gap-3 bg-background/45 border border-border/20 rounded-xl p-3.5"
                        >
                          <div className="w-6 h-6 rounded-full bg-purple-500/14 border border-purple-500/24 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[9px] font-mono font-semibold text-purple-400/80">{item.num}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold text-foreground/88 mb-1 leading-snug">{item.title}</div>
                            <p className="text-[10.5px] text-muted-foreground/62 leading-relaxed">{item.body}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeFollowUpAnswer === 'confidence-details' && (
                <div className="border border-teal-500/22 rounded-xl overflow-hidden">
                  <div className="h-[2px] bg-gradient-to-r from-teal-400 via-complete to-cyan-400" />
                  <div className="p-4 bg-teal-500/3">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck size={11} className="text-teal-400/65" />
                      <span className="text-[8.5px] font-mono uppercase tracking-[0.13em] text-teal-400/60">Evaluation &amp; traceability</span>
                    </div>

                    {/* Context */}
                    <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08, duration: 0.26 }}
                      className="text-[10.5px] text-foreground/68 leading-relaxed mb-3"
                    >
                      Evaluation applied before report generation. Text-to-query quality assessed across
                      representative questions.
                    </motion.p>

                    {/* Metric chips */}
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.26 }}
                      className="grid grid-cols-3 gap-2 mb-3"
                    >
                      {[
                        { label: 'Avg pass rate', value: '70%' },
                        { label: 'Best dataset',  value: '93%' },
                        { label: 'Avg eval Qs',   value: '62'  },
                      ].map((chip, i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.22 + i * 0.05, duration: 0.22 }}
                          className="bg-background/50 border border-teal-500/18 rounded-xl px-2.5 py-2.5 text-center"
                        >
                          <div className="text-[14px] font-semibold font-mono tabular-nums text-teal-400/85 leading-none mb-1">{chip.value}</div>
                          <div className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/38 leading-snug">{chip.label}</div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* LangSmith trace */}
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.32, duration: 0.26 }}
                      className="flex items-start gap-2.5 bg-background/50 border border-border/20 rounded-xl px-3.5 py-3 mb-3"
                    >
                      <Activity size={11} className="text-teal-400/55 shrink-0 mt-[3px]" />
                      <div>
                        <div className="text-[8.5px] font-mono uppercase tracking-wider text-teal-400/48 mb-1">LangSmith trace</div>
                        <p className="text-[10.5px] text-foreground/68 leading-snug">
                          Captured for agent steps, prompt calls and debugging.
                        </p>
                      </div>
                    </motion.div>

                    {/* Explanation */}
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.44, duration: 0.28 }}
                      className="text-[10px] text-muted-foreground/45 leading-relaxed border-t border-border/15 pt-3"
                    >
                      This gives the team visibility into how the assistant reached the answer and where the workflow can be improved.
                    </motion.p>
                  </div>
                </div>
              )}

              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation chips */}
          <motion.div {...fadeUp(6)} className="pt-1 border-t border-border/15">
            <div className="text-[7.5px] font-mono uppercase tracking-widest text-muted-foreground/25 mb-1.5">Validation</div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '~50 users in scope' },
                { label: '6 datasets' },
                { label: '70% avg pass rate' },
                { label: '93% best dataset' },
                { label: '62 avg eval questions' },
              ].map(({ label }) => (
                <span key={label} className="text-[8px] font-mono text-muted-foreground/38 bg-muted/12 border border-border/18 px-1.5 py-0.5 rounded">
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Data sources */}
          <div className="pb-2">
            <div className="text-[7.5px] font-mono uppercase tracking-widest text-muted-foreground/25 mb-1.5">Data sources</div>
            <div className="flex flex-wrap gap-1.5">
              {['Snowflake · Production DB', 'Neo4j · Operations Graph', 'LangSmith · ls_8a2f'].map(s => (
                <span key={s} className="text-[8px] font-mono text-muted-foreground/35 bg-muted/15 border border-border/18 px-1.5 py-0.5 rounded">{s}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── Follow-up Panel ──────────────────────────────────────────────────────────

const FollowUpPanel = ({
  followUpState,
  followUpStep,
  followUpInput,
  setFollowUpInput,
  onSubmit,
  onChipSelect,
  showChips = true,
  noMatch = false,
  onClearNoMatch,
  inputFlash = false,
}: {
  followUpState: 'idle' | 'running' | 'complete';
  followUpStep: number;
  followUpInput: string;
  setFollowUpInput: (v: string) => void;
  onSubmit: (text?: string) => void;
  onChipSelect: (key: FollowUpKey) => void;
  showChips?: boolean;
  noMatch?: boolean;
  onClearNoMatch?: () => void;
  inputFlash?: boolean;
}) => {
  const chips = FOLLOWUP_DEFS.map(d => ({ label: d.label, key: d.key }));
  const isRunning = followUpState === 'running';
  const isDone    = followUpState === 'complete';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const, delay: 0.25 }}
      className="border-0 bg-transparent rounded-none overflow-hidden"
    >
      <div className="px-4 pt-3 pb-2.5 flex items-center gap-2">
        <MessageCircle size={12} className="text-muted-foreground/50" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">Analyst Follow-up</span>
        {isDone && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-auto text-[9px] font-mono text-complete/65 bg-complete/8 border border-complete/22 px-2 py-0.5 rounded flex items-center gap-1"
          >
            <CheckCircle size={9} /> Report updated
          </motion.span>
        )}
      </div>
      <div className="px-4 pb-3 pt-1 flex flex-col gap-2.5">
        <div className="flex gap-2">
          <input
            type="text"
            value={followUpInput}
            onChange={e => { setFollowUpInput(e.target.value); if (noMatch) onClearNoMatch?.(); }}
            onKeyDown={e => e.key === 'Enter' && !isRunning && !isDone && onSubmit()}
            placeholder="Ask a follow-up question about this data…"
            disabled={isRunning || isDone}
            className={`flex-1 bg-background/60 border rounded-lg px-3 py-2 text-sm font-mono
              placeholder:text-muted-foreground/35 focus:outline-none focus:ring-1
              disabled:opacity-60 transition-all duration-200
              ${inputFlash
                ? 'border-active/60 ring-1 ring-active/30 text-active/90 bg-active/5'
                : 'border-border/45 text-foreground/85 focus:border-active/40 focus:ring-active/20'}`}
          />
          <button
            onClick={() => !isRunning && !isDone && onSubmit()}
            disabled={!followUpInput.trim() || isRunning || isDone}
            className={`text-white rounded-lg px-3 py-2 flex items-center gap-1.5 transition-all duration-200
              ${inputFlash ? 'bg-active scale-105 shadow-lg shadow-active/25' : 'bg-active/85 hover:bg-active'}
              disabled:opacity-35`}
          >
            <Send size={13} className={inputFlash ? 'animate-pulse' : ''} />
          </button>
        </div>
        {showChips && !isRunning && !isDone && (
          <div className="flex gap-2 flex-wrap">
            {chips.map(chip => (
              <button
                key={chip.key}
                onClick={() => onChipSelect(chip.key)}
                className="text-[11px] font-mono text-muted-foreground/60 hover:text-foreground/80 bg-muted/25 hover:bg-active/8
                  border border-border/30 hover:border-active/30 rounded-full px-3 py-1 transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
        <AnimatePresence>
          {noMatch && (
            <motion.div
              key="no-match"
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-2 text-[10.5px] text-muted-foreground/55 bg-muted/15 border border-border/25 rounded-lg px-3 py-2.5 leading-snug">
                <span className="shrink-0 text-muted-foreground/35 font-mono mt-px">—</span>
                This demo currently supports follow-ups on site-level risk, Northern Europe risk, recommended actions and evaluation details.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {(isRunning || isDone) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-1.5 pt-1">
                {FOLLOWUP_NODES.map((node, i) => {
                  const Icon = node.icon;
                  const isNodeActive = followUpStep === i && isRunning;
                  const isNodeDone   = isDone || followUpStep > i;
                  return (
                    <React.Fragment key={node.id}>
                      <motion.div
                        animate={isNodeActive ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all duration-300
                          ${isNodeActive ? 'border-active/50 bg-active/8 text-active/85'   : ''}
                          ${isNodeDone   ? 'border-complete/35 bg-complete/6 text-complete/70' : ''}
                          ${!isNodeActive && !isNodeDone ? 'border-border/25 bg-muted/15 text-muted-foreground/40' : ''}
                        `}
                      >
                        {isNodeActive ? <Loader2 size={11} className="animate-spin shrink-0" /> : isNodeDone ? <CheckCircle size={11} className="shrink-0" /> : <Icon size={11} className="shrink-0" />}
                        <span className="whitespace-nowrap">{node.label}</span>
                      </motion.div>
                      {i < FOLLOWUP_NODES.length - 1 && (
                        <div className={`h-px flex-1 min-w-[8px] transition-colors duration-500 ${isNodeDone ? 'bg-complete/25' : 'bg-border/25'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};


// ─── Node Accent Palettes + Card ─────────────────────────────────────────────

// All Tailwind class strings written in full so the scanner picks them up
// ─── Card-level accent palette (border, stripe, chip, shadow, status text) ───
// Icon styling has moved to NODE_ICON_CFG — do not add iconA back here.
const A = {
  violet: {
    stripe: 'bg-violet-400/55',
    bdr:    'border-violet-400/55',
    ring:   'ring-violet-400/18',
    sh:     '0 2px 22px rgba(139,108,246,0.24)',
    txt:    'text-violet-300/85',
    chip:   'text-violet-300 bg-violet-500/14 border-violet-400/35',
  },
  sky: {
    stripe: 'bg-sky-400/55',
    bdr:    'border-sky-400/55',
    ring:   'ring-sky-400/18',
    sh:     '0 2px 20px rgba(56,189,248,0.20)',
    txt:    'text-sky-300/85',
    chip:   'text-sky-300 bg-sky-500/14 border-sky-400/35',
  },
  amber: {
    stripe: 'bg-amber-400/55',
    bdr:    'border-amber-400/55',
    ring:   'ring-amber-400/18',
    sh:     '0 2px 18px rgba(251,191,36,0.18)',
    txt:    'text-amber-300/85',
    chip:   'text-amber-300 bg-amber-500/14 border-amber-400/35',
  },
  teal: {
    stripe: 'bg-teal-400/55',
    bdr:    'border-teal-400/55',
    ring:   'ring-teal-400/18',
    sh:     '0 2px 18px rgba(45,212,191,0.18)',
    txt:    'text-teal-300/85',
    chip:   'text-teal-300 bg-teal-500/14 border-teal-400/35',
  },
  purple: {
    stripe: 'bg-purple-400/58',
    bdr:    'border-purple-400/58',
    ring:   'ring-purple-400/18',
    sh:     '0 2px 24px rgba(192,132,252,0.26)',
    txt:    'text-purple-300/85',
    chip:   'text-purple-300 bg-purple-500/14 border-purple-400/35',
  },
  blue: {
    stripe: 'bg-blue-400/55',
    bdr:    'border-blue-400/55',
    ring:   'ring-blue-400/18',
    sh:     '0 2px 20px rgba(96,165,250,0.20)',
    txt:    'text-blue-300/85',
    chip:   'text-blue-300 bg-blue-500/14 border-blue-400/35',
  },
  slate: {
    stripe: 'bg-slate-400/50',
    bdr:    'border-slate-400/50',
    ring:   'ring-slate-400/16',
    sh:     '0 2px 16px rgba(148,163,184,0.16)',
    txt:    'text-slate-300/80',
    chip:   'text-slate-300 bg-slate-500/14 border-slate-400/32',
  },
} as const;

type AKey = keyof typeof A;

// Per-accent icon glow: outer spread + faint inset bloom, applied when active
// Per-node card config — palette key drives border/stripe/chip/shadow/status-text.
// Icon styling is in NODE_ICON_CFG above; do not add iconSz or iconA here.
const NODE_CFG: Record<number, { key: AKey; w: string }> = {
  0:  { key: 'violet', w: 'w-[168px]' },
  1:  { key: 'violet', w: 'w-[168px]' },
  2:  { key: 'amber',  w: 'w-[178px]' },
  3:  { key: 'violet', w: 'w-[168px]' },   // was sky — brand uses purple family
  4:  { key: 'teal',   w: 'w-[168px]' },
  5:  { key: 'slate',  w: 'w-[182px]' },   // was sky — data-source node, neutral slate
  6:  { key: 'purple', w: 'w-[182px]' },
  7:  { key: 'purple', w: 'w-[178px]' },
  8:  { key: 'amber',  w: 'w-[168px]' },
  9:  { key: 'slate',  w: 'w-[168px]' },
  10: { key: 'blue',   w: 'w-[192px]' },
};

// Per-node sub-content rendered below the label row
const NodeSub = ({ nodeId, isActive, isComplete, isIdle }: {
  nodeId: number; isActive: boolean; isComplete: boolean; isIdle: boolean;
}) => {
  const cfg = NODE_CFG[nodeId];
  const pal = A[cfg.key];
  const dim = !isActive;

  switch (nodeId) {

    // Intent Classifier — "Analytical" intent chip
    case 1: return (
      <div className="px-2.5 pb-2.5 pt-0.5">
        <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded border ${pal.chip} ${dim ? 'opacity-55' : 'opacity-100'} transition-opacity`}>
          Analytical
        </span>
      </div>
    );

    // ASK / AGENT Router — two route chips
    case 2: return (
      <div className="px-2.5 pb-2.5 pt-0.5 flex gap-1.5">
        <span className={`text-[9.5px] font-semibold font-mono px-2 py-0.5 rounded border text-muted-foreground/60 bg-muted/20 border-border/35 ${dim ? 'opacity-55' : 'opacity-80'} transition-opacity`}>
          ASK
        </span>
        <span className={`text-[9.5px] font-semibold font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${pal.chip} ${dim ? 'opacity-55' : 'opacity-100'} transition-opacity`}>
          AGENT&nbsp;<span className="text-[8px]">✓</span>
        </span>
      </div>
    );

    // Dataset Router — dataset count chip
    case 3: return (
      <div className="px-2.5 pb-2.5 pt-0.5">
        <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded border ${pal.chip} ${dim ? 'opacity-55' : 'opacity-100'} transition-opacity`}>
          6 datasets
        </span>
      </div>
    );

    // Text-to-Query — inline SQL preview
    case 4: return (
      <div className="px-2.5 pb-2.5 pt-0.5">
        <div className={`font-mono text-[9px] bg-background/60 border border-border/40 rounded px-2 py-1 truncate ${dim ? 'text-muted-foreground/45' : 'text-teal-300/80'} transition-colors`}>
          SELECT mkt_id, SUM(batch_vol)…
        </div>
      </div>
    );

    // Snowflake — database cylinder with animated data scan
    case 5: return (
      <div className={`px-2.5 pb-2.5 pt-1 transition-opacity duration-300 ${dim ? 'opacity-35' : 'opacity-100'}`}>
        {/* Cylinder / data-warehouse visual */}
        <div className="relative overflow-hidden rounded-[3px] border border-sky-400/18 bg-sky-500/5" style={{ height: 34 }}>
          <svg width="100%" height="34" viewBox="0 0 148 34" preserveAspectRatio="none" className="absolute inset-0">
            {/* Cylinder body fill */}
            <rect x="6" y="7" width="136" height="18" rx="1" fill="hsl(200 80% 60% / 0.06)" />
            {/* Bottom cap ellipse */}
            <ellipse cx="74" cy="25" rx="68" ry="6" fill="hsl(200 80% 60% / 0.08)" stroke="hsl(200 80% 60% / 0.22)" strokeWidth="0.8" />
            {/* Body side lines */}
            <line x1="6"   y1="7" x2="6"   y2="25" stroke="hsl(200 80% 60% / 0.20)" strokeWidth="0.8" />
            <line x1="142" y1="7" x2="142" y2="25" stroke="hsl(200 80% 60% / 0.20)" strokeWidth="0.8" />
            {/* Top cap ellipse */}
            <ellipse cx="74" cy="7" rx="68" ry="6" fill="hsl(200 80% 60% / 0.14)" stroke="hsl(200 80% 60% / 0.32)" strokeWidth="0.8" />
            {/* Data row stripes inside cylinder */}
            <line x1="10" y1="13" x2="138" y2="13" stroke="hsl(200 80% 60% / 0.18)" strokeWidth="0.7" />
            <line x1="10" y1="18" x2="138" y2="18" stroke="hsl(200 80% 60% / 0.18)" strokeWidth="0.7" />
            <line x1="10" y1="22" x2="138" y2="22" stroke="hsl(200 80% 60% / 0.14)" strokeWidth="0.7" />
            {/* Animated horizontal scan line sweeping down */}
            <rect
              x="6" y="7" width="136" height="3" rx="1"
              fill="hsl(200 80% 60% / 0.28)"
              className={isActive ? 'animate-db-scan' : ''}
            />
            {/* Packet on row 1 */}
            <circle
              cx="10" cy="13" r="2"
              fill="hsl(200 80% 60% / 0.85)"
              className={isActive ? 'animate-db-packet' : ''}
            />
            {/* Packet on row 2 (offset) */}
            <circle
              cx="10" cy="18" r="1.5"
              fill="hsl(200 80% 60% / 0.65)"
              className={isActive ? 'animate-db-packet-2' : ''}
            />
          </svg>
        </div>
        {/* Label */}
        <div className={`mt-1.5 text-[9px] font-medium tracking-wide ${isActive ? 'text-sky-300/85' : 'text-muted-foreground/52'} transition-colors`}>
          Structured operational data
        </div>
      </div>
    );

    // Neo4j — knowledge graph with pulsing relationship edges
    case 6: return (
      <div className={`px-2.5 pb-2.5 pt-1 transition-opacity duration-300 ${dim ? 'opacity-35' : 'opacity-100'}`}>
        {/* Graph network visual */}
        <div className="relative overflow-hidden rounded-[3px] border border-purple-400/18 bg-purple-500/5" style={{ height: 34 }}>
          <svg width="100%" height="34" viewBox="0 0 146 34" preserveAspectRatio="xMidYMid meet" className="absolute inset-0">
            {/* Relationship edges — dashed + animated when active */}
            {/* Centre ↔ Top */}
            <line x1="73" y1="17" x2="73" y2="5"
              stroke="hsl(270 55% 68%)" strokeWidth="1.2" opacity="0.35"
              strokeDasharray="3 3"
              className={isActive ? 'animate-edge-flow' : ''}
            />
            {/* Centre ↔ Left */}
            <line x1="73" y1="17" x2="22" y2="22"
              stroke="hsl(270 55% 68%)" strokeWidth="1.2" opacity="0.35"
              strokeDasharray="3 3"
              className={isActive ? 'animate-edge-flow-2' : ''}
            />
            {/* Centre ↔ Right */}
            <line x1="73" y1="17" x2="124" y2="22"
              stroke="hsl(270 55% 68%)" strokeWidth="1.2" opacity="0.35"
              strokeDasharray="3 3"
              className={isActive ? 'animate-edge-flow-3' : ''}
            />
            {/* Centre ↔ Bottom-left */}
            <line x1="73" y1="17" x2="38" y2="30"
              stroke="hsl(270 55% 68%)" strokeWidth="0.9" opacity="0.22"
              strokeDasharray="2 3"
              className={isActive ? 'animate-edge-flow-4' : ''}
            />
            {/* Left ↔ Bottom-left */}
            <line x1="22" y1="22" x2="38" y2="30"
              stroke="hsl(270 55% 68%)" strokeWidth="0.8" opacity="0.20"
              strokeDasharray="2 3"
              className={isActive ? 'animate-edge-flow-2' : ''}
            />
            {/* Satellite nodes */}
            <circle cx="73" cy="5"   r="3.5" fill="hsl(270 55% 68%)" opacity="0.62" />
            <circle cx="22" cy="22"  r="3"   fill="hsl(270 55% 68%)" opacity="0.55" />
            <circle cx="124" cy="22" r="3"   fill="hsl(270 55% 68%)" opacity="0.55" />
            <circle cx="38" cy="30"  r="2.2" fill="hsl(270 55% 68%)" opacity="0.40" />
            {/* Centre node — pulses when active */}
            <circle cx="73" cy="17" r="5"
              fill="hsl(270 55% 68%)" opacity="0.80"
              className={isActive ? 'animate-graph-pulse' : ''}
            />
            <circle cx="73" cy="17" r="2.5" fill="hsl(270 85% 90%)" opacity="0.55" />
          </svg>
        </div>
        {/* Label */}
        <div className={`mt-1.5 text-[9px] font-medium tracking-wide ${isActive ? 'text-purple-300/85' : 'text-muted-foreground/52'} transition-colors`}>
          Relationship context
        </div>
      </div>
    );

    // Answer Evaluation — pass rate chip
    case 8: return (
      <div className="px-2.5 pb-2.5 pt-0.5">
        <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded border ${pal.chip} ${dim ? 'opacity-55' : 'opacity-100'} transition-opacity`}>
          70% avg pass
        </span>
      </div>
    );

    // LangSmith Trace — call-stack bar motif
    case 9: return (
      <div className="px-2.5 pb-2.5 pt-0.5 flex items-end gap-[3px]">
        {[55, 100, 35, 80, 50].map((h, i) => (
          <div
            key={i}
            className={`w-[5px] rounded-[1px] ${dim ? 'bg-slate-400/35' : 'bg-slate-400/65'} transition-colors`}
            style={{ height: `${Math.round(h * 0.18)}px` }}
          />
        ))}
        <span className={`text-[9px] font-medium font-mono ml-1 ${dim ? 'text-muted-foreground/48' : 'text-slate-300/80'} transition-colors`}>trace</span>
      </div>
    );

    // Executive Report — mini bar chart
    case 10: return (
      <div className="px-2.5 pb-2.5 pt-0.5 flex items-end gap-1.5">
        {[
          { h: 55, label: 'A' },
          { h: 100, label: 'B' },
          { h: 42, label: 'C' },
        ].map(({ h, label }) => (
          <div key={label} className="flex flex-col items-center gap-0.5 flex-1">
            <div
              className={`w-full rounded-[2px] ${dim ? 'bg-blue-400/30' : 'bg-blue-400/55'} transition-colors`}
              style={{ height: `${Math.round(h * 0.22)}px` }}
            />
            <span className={`text-[9px] font-medium font-mono ${dim ? 'text-muted-foreground/48' : 'text-blue-300/80'} transition-colors`}>{label}</span>
          </div>
        ))}
      </div>
    );

    default: return null;
  }
};

// ─── NodeIconBadge ────────────────────────────────────────────────────────────
/**
 * Renders the icon container for a workflow node.
 * Reads ALL styling from NODE_ICON_CFG — no hardcoded colours here.
 *
 * States:
 *  active   → vivid accent bg, full glow, opacity+scale pulse animation
 *  pulsing  → purple tint (Insight re-run), spin on RefreshCw, pulse animation
 *  done     → faint accent tint (datasource) or neutral (logic/agent)
 *  idle     → muted neutral; datasource nodes keep a subtle colour tint
 */
const NodeIconBadge = ({
  nodeId,
  isActive,
  isComplete,
  isPulsing = false,
}: {
  nodeId: number;
  isActive: boolean;
  isComplete: boolean;
  isPulsing?: boolean;
}) => {
  const icfg = NODE_ICON_CFG[nodeId];
  if (!icfg) return null;
  const Icon = icfg.icon;
  const sz   = icfg.iconSize;

  const cls =
    isActive && !isPulsing ? icfg.activeCls
    : isPulsing             ? 'bg-purple-500/32 text-purple-100'
    : isComplete            ? icfg.doneCls
    :                         icfg.idleCls;

  const glow =
    isActive && !isPulsing ? iconGlow(icfg.accentRgb)
    : isPulsing             ? PULSING_ICON_GLOW
    : undefined;

  const doneGlow = isComplete && !isActive && !isPulsing
    ? { boxShadow: iconDoneGlow(icfg.accentRgb) }
    : {};

  return (
    <motion.div
      className={`p-[8px] rounded-lg shrink-0 transition-colors duration-300 ${cls}`}
      style={glow ? { boxShadow: glow } : doneGlow}
      animate={
        isActive && !isPulsing
          ? { scale: [1, 1.10, 1] }          /* scale pulse only — no opacity dim */
          : isPulsing
          ? { opacity: [1, 0.65, 1] }
          : { scale: 1, opacity: 1 }
      }
      transition={
        isActive && !isPulsing
          ? { duration: 2.0, repeat: Infinity, ease: 'easeInOut' }
          : isPulsing
          ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.3 }
      }
    >
      {isPulsing
        ? <RefreshCw size={sz} strokeWidth={2.2} className="animate-spin" />
        : <Icon size={sz} strokeWidth={2.2} />}
    </motion.div>
  );
};

const NodeCard = ({
  node,
  isActive,
  isComplete,
  isIdle,
  isPulsing,
  activeNodeIndex: _ani,
  focusOpacity,
}: {
  node: WorkflowNode;
  isActive: boolean;
  isComplete: boolean;
  isIdle: boolean;
  isPulsing: boolean;
  activeNodeIndex: number;
  focusOpacity: number;
}) => {
  const status = isActive || isPulsing ? 'active' : isComplete ? 'done' : 'idle';
  const cfg = NODE_CFG[node.id];
  const pal = A[cfg.key];
  const hasSub = [1, 2, 3, 4, 5, 6, 8, 9, 10].includes(node.id);

  // Insight Agent (7): gradient top stripe
  const isInsight = node.id === 7;

  return (
    <motion.div
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${cfg.w} rounded-md border overflow-hidden flex flex-col transition-colors duration-300
        ${isActive && !isPulsing ? `${pal.bdr} ${pal.ring} bg-card z-20` : ''}
        ${isPulsing              ? 'border-purple-400/55 ring-1 ring-purple-400/20 bg-card z-20' : ''}
        ${isComplete && !isPulsing ? 'border-border/76 bg-card z-10' : ''}
        ${isIdle                 ? 'border-border/62 bg-card/92 z-10' : ''}
      `}
      style={{
        left: `${node.x}%`,
        top:  `${node.y}%`,
        ...(isActive && !isPulsing ? { boxShadow: pal.sh, '--ring-width': '1px' } as React.CSSProperties : {}),
        ...(isPulsing ? { boxShadow: '0 2px 22px rgba(192,132,252,0.28)' } : {}),
        ...(isComplete && !isPulsing ? { boxShadow: '0 2px 12px rgba(0,0,0,0.35)' } : {}),
        ...(isIdle ? { boxShadow: '0 1px 8px rgba(0,0,0,0.30)' } : {}),
      }}
      animate={isPulsing ? { scale: [1, 1.04, 1, 1.03, 1], opacity: focusOpacity } : { scale: isActive ? 1.028 : 1, opacity: focusOpacity }}
      transition={isPulsing ? { duration: 1.2, repeat: 1 } : { duration: 0.35, ease: 'easeOut' }}
    >
      {/* ── Top accent stripe ── */}
      {isInsight && isActive ? (
        <div className="h-[2px] w-full shrink-0 bg-gradient-to-r from-purple-500 via-violet-400 to-indigo-400" />
      ) : (
        <div className={`h-[2px] w-full shrink-0 transition-colors duration-300
          ${isActive && !isPulsing ? pal.stripe
          : isPulsing             ? 'bg-purple-400/45'
          : isComplete            ? 'bg-border/40'
          :                         'bg-transparent'}`}
        />
      )}

      {/* ── Body row ── */}
      <div className={`flex items-center gap-2 px-2.5 ${hasSub ? 'pt-2 pb-0' : 'py-2'}`}>
        {/* Icon — all styling from NODE_ICON_CFG via NodeIconBadge */}
        <NodeIconBadge
          nodeId={node.id}
          isActive={isActive}
          isComplete={isComplete}
          isPulsing={isPulsing}
        />

        {/* Label + status */}
        <div className="flex-1 min-w-0">
          <div className={`text-[12px] font-semibold truncate leading-tight transition-colors duration-300
            ${isActive || isPulsing ? 'text-foreground'
            : isComplete           ? 'text-foreground/92'
            :                        'text-foreground/82'}`}
          >
            {node.label}
          </div>
          <div className={`text-[9px] font-mono uppercase tracking-wider mt-0.5 transition-colors duration-300
            ${isActive && !isPulsing ? pal.txt
            : isPulsing             ? 'text-purple-300/80'
            : isComplete            ? 'text-muted-foreground/72'
            :                         'text-muted-foreground/68'}`}
          >
            {status}
          </div>
        </div>

        {/* Done tick */}
        {isComplete && !isPulsing && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}>
            <CheckCircle size={10} className="text-complete/80 shrink-0" />
          </motion.div>
        )}
      </div>

      {/* ── Per-node sub-content ── */}
      {hasSub && (
        <NodeSub nodeId={node.id} isActive={isActive} isComplete={isComplete} isIdle={isIdle} />
      )}

      {/* ── Task bubble ── */}
      <AnimatePresence>
        {isActive && (
          <TaskBubble
            key={`bubble-${node.id}-${_ani}`}
            tasks={node.tasks}
            alignRight={node.x > 62}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Stage Explainer ─────────────────────────────────────────────────────────

const NODE_EXPLAINER: Record<number, { title: string; bullets: string[] }> = {
  0:  { title: 'Question submitted',       bullets: ['Business question in plain English', 'No system or tool knowledge needed', 'Assistant prepares for analysis'] },
  1:  { title: 'Understanding intent',     bullets: ['Production risk question detected', 'Operations leadership intent identified', 'Risk analysis workflow selected'] },
  2:  { title: 'Analysis path chosen',     bullets: ['Simple answer or deep analysis?', 'Multi-source reasoning required', 'AGENT mode selected'] },
  3:  { title: 'Finding the right data',   bullets: ['Relevant production datasets identified', 'Risk indicators selected', 'Connected operational sources routed'] },
  4:  { title: 'Translating the question', bullets: ['Question translated into query logic', 'Production risk signals mapped', 'Data request prepared'] },
  5:  { title: 'Retrieving data',          bullets: ['Production activity data queried', 'Market and site-level signals retrieved', 'Risk indicators calculated'] },
  6:  { title: 'Adding context',           bullets: ['Site, market and product relationships mapped', 'Operational dependencies added', 'Context linked to risk signals'] },
  7:  { title: 'Turning data into insight',bullets: ['Production risk areas identified', 'Likely drivers compared', 'Executive risk insight prepared'] },
  8:  { title: 'Checking quality',         bullets: ['Answer checked before presenting', 'Assesses quality and reliability', 'Improves confidence in the output'] },
  9:  { title: 'Observability trace',      bullets: ['Inspect how the assistant behaved', 'Prompt calls and steps logged', 'Easier to debug and improve'] },
  10: { title: 'Producing the report',     bullets: ['Executive-ready report generated', 'Summarises risk insight and drivers', 'Suggests follow-up questions'] },
};

// ─── Safe placement rules ─────────────────────────────────────────────────────
//
//  Canvas is ~1280 × 660 px (body minus 40 px header).
//  Node card half-widths: 168 px→6.6%, 178 px→6.95%, 182 px→7.1%, 192 px→7.5%
//  Node card half-heights: ~5–6.5% (conservative 6%)
//  Pop-up:  196 px wide = 15.3%,  ~100 px tall = 15.2%
//  24 px gap: ≈ 1.9% H / 3.6% V
//
//  Positions are verified against every idle / done card that is still rendered:
//    node 1 right → IC right edge 50.6%, ModeSelector not visible yet, clear ✓
//    node 2 left  → below StakeholderNode bottom (~26%), StakeholderNode x=2.5–26.3% ✓
//    node 3 left  → below node 2 slot, above TtQ top (~52%) ✓
//    node 4 left  → box bottom 62.2%, Snowflake top 67%, gap 32 px ✓
//    node 5 below → box top 83%, Snowflake bottom ~79%, gap 26 px ✓
//    node 6 below → same slot as 5, sequential — never simultaneous ✓
//    node 7 above → box bottom 66.2%, IA top 67%, 5 px (tightest possible — no overlap) ✓
//    node 8 left  → box right 53.3%, AE left 55.4%, gap 27 px ✓ ; IA bottom 79%, box top 83% ✓
//    node 9 above → box right 86.3%, IA right 69% (gap 26 px ✓), LS top 73%, gap 46 px ✓
//    node 10 above→ same column as 9, sequential ✓; LS top 73%, box bottom 69.2% ✓
//
type ExplainSide = 'left' | 'right' | 'top' | 'bottom';
type CardDir     = 'right' | 'left' | 'above' | 'below';

// Maps where the card sits relative to its node → which card edge carries the arrow tip.
// Convention (matches ExplainArrow CSS):
//   'left'  — arrow on card's LEFT  edge  → card is to the RIGHT of the node
//   'right' — arrow on card's RIGHT edge  → card is to the LEFT  of the node
//   'top'   — arrow on card's BOTTOM edge → card is BELOW the node
//   'bottom'— arrow on card's TOP   edge  → card is ABOVE the node
const DIR_TO_SIDE: Record<CardDir, ExplainSide> = {
  right: 'left',
  left:  'right',
  above: 'bottom',
  below: 'top',
};

// Slide-in direction: card enters from the node side so it feels like it emerges from there.
const DIR_SLIDE: Record<CardDir, { x?: number; y?: number }> = {
  right: { x: -6 },
  left:  { x:  6 },
  above: { y:  6 },
  below: { y: -6 },
};

// ── Card-placement constants ───────────────────────────────────────────────────
const CARD_W     = 172;   // px — matches w-[172px] on StageExplainer
const CARD_EST_H = 112;   // px — estimated rendered height for a 3-bullet card
const CARD_GAP   = 14;    // px — gap between node card edge and explainer card edge

// Approximate half-dimensions (px, from node centre) for each node card.
// Used to compute SVG connector endpoints from the node's edge midpoint.
const NODE_HALF_W: Record<number, number> = {
  0: 84, 1: 84, 2: 89, 3: 84, 4: 84, 5: 91, 6: 91, 7: 89, 8: 84, 9: 84, 10: 96,
};
const NODE_HALF_H: Record<number, number> = {
  0: 34, 1: 34, 2: 42, 3: 44, 4: 38, 5: 58, 6: 64, 7: 48, 8: 42, 9: 34, 10: 36,
};

// ── Fixed safe positions ──────────────────────────────────────────────────────
//
// All explanation cards sit in one of two manually defined zones:
//
//   LOCAL  — placed adjacent to the node, arrow tip + SVG connector line.
//            Used only when there is clear space next to the node.
//
//   ANCHOR — placed in a consistent upper-right safe zone (xFrac≈0.81, yFrac≈0.04).
//            Shows an anchor badge naming the active step; no connector line drawn.
//            At a 1280 px canvas the anchor zone is at ≈1037 px, clear of:
//              • the Routing Decision card right edge (57 % + 276 px ≈ 1006 px)
//              • all workflow node cards
//              • the LangSmith Trace column (visually distinct vertical slice)
//            Nodes 3–8 and 10 use this zone — the dense canvas topology leaves
//            no adjacent slot free of inactive node cards for these nodes.
//
// Priority: clean, predictable spacing over physical proximity to the node.

const ANCHOR_ZONE = { xFrac: 0.812, yFrac: 0.040 } as const;

const FIXED_CARD_POS: Record<number, {
  xFrac:  number;
  yFrac:  number;
  dir:    CardDir;
  anchor: boolean;  // true → anchor badge + connector suppressed
}> = {
  // Node 0 — Stakeholder Question
  //   Gap between speech-bubble card right (≈310 px) and IC card left (≈479 px)
  //   is only 169 px — narrower than a 172 px card. Anchor zone used.
  0:  { ...ANCHOR_ZONE, dir: 'left',  anchor: true  },

  // Node 1 — Intent Classifier
  //   IC right edge ≈ 50.5 % of canvas. Card placed immediately to the right.
  //   At 1280 px: card left ≈ 679 px, right ≈ 851 px. Clears all neighbours.
  //   No Routing Decision card yet (it appears when node 2 activates).
  1:  { xFrac: 0.530, yFrac: 0.050, dir: 'right', anchor: false },

  // Nodes 3–8 — anchor zone
  //   No viable adjacent slot free of inactive node cards for any of these nodes.
  3:  { ...ANCHOR_ZONE, dir: 'left',  anchor: true  },
  4:  { ...ANCHOR_ZONE, dir: 'left',  anchor: true  },
  5:  { ...ANCHOR_ZONE, dir: 'left',  anchor: true  },
  6:  { ...ANCHOR_ZONE, dir: 'left',  anchor: true  },
  7:  { ...ANCHOR_ZONE, dir: 'left',  anchor: true  },
  8:  { ...ANCHOR_ZONE, dir: 'left',  anchor: true  },

  // Node 9 — LangSmith Trace
  //   Placed directly above the LangSmith column.
  //   At 1280 px: card left ≈ 1015 px, which clears the RD card right (≈1006 px)
  //   by ~9 px. Card top ≈ 102 px; LS card top ≈ 230 px — no vertical overlap.
  9:  { xFrac: 0.793, yFrac: 0.155, dir: 'above', anchor: false },

  // Node 10 — Executive Report
  //   Card is shown only briefly; filtered out once showReport=true so the
  //   small explainer fades cleanly before the full report panel slides in.
  10: { ...ANCHOR_ZONE, dir: 'left',  anchor: true  },
};

// Accent dot colour per node — matches NODE_ICON_CFG accent families.
const EXPLAIN_DOT: Record<number, string> = {
  0: 'bg-violet-400',  1: 'bg-indigo-400',  2: 'bg-amber-400',
  3: 'bg-purple-400',  4: 'bg-emerald-400', 5: 'bg-cyan-400',
  6: 'bg-fuchsia-400', 7: 'bg-violet-400',  8: 'bg-amber-400',
  9: 'bg-sky-400',     10: 'bg-blue-400',
};

interface CardPlacement {
  left: number;           // px from canvas left
  top:  number;           // px from canvas top
  side: ExplainSide;      // which card edge has the arrow tip (ignored for zone placements)
  dir:  CardDir;          // which side of the node the card sits on
  cnx:  [number, number, number, number];  // [x1,y1,x2,y2] in viewBox 0-100 for SVG connector
  zone: 'local' | 'A';   // 'local' = adjacent to node; 'A' = dedicated upper-right safe zone
}

/**
 * Fixed-position placement for explanation cards.
 *
 * Replaces the previous collision-aware dynamic placement algorithm.
 * Each node has a manually verified safe position defined in FIXED_CARD_POS.
 * Two zone types:
 *   local  — card sits adjacent to the node (arrow tip + SVG connector)
 *   A      — card sits in the upper-right anchor zone (anchor badge, no connector)
 */
function getFixedPlacement(
  nodeId:  number,
  node:    { x: number; y: number },
  canvasW: number,
  canvasH: number,
): CardPlacement {
  const entry = FIXED_CARD_POS[nodeId] ?? { ...ANCHOR_ZONE, dir: 'left' as CardDir, anchor: true };

  const left   = entry.xFrac * canvasW;
  const top    = entry.yFrac * canvasH;
  const cardH  = CARD_EST_H;
  const side   = DIR_TO_SIDE[entry.dir];

  const pctX = (px: number) => (px / canvasW) * 100;
  const pctY = (py: number) => (py / canvasH) * 100;

  const nx    = (node.x / 100) * canvasW;
  const ny    = (node.y / 100) * canvasH;
  const halfW = NODE_HALF_W[nodeId] ?? 84;
  const halfH = NODE_HALF_H[nodeId] ?? 42;

  // Connector endpoints: card-edge midpoint → node-edge midpoint
  let cx1: number, cy1: number, cx2: number, cy2: number;
  switch (entry.dir) {
    case 'right': // card is right of node
      cx1 = pctX(left);               cy1 = pctY(top + cardH / 2);
      cx2 = pctX(nx + halfW);         cy2 = pctY(ny);           break;
    case 'left':  // card is left of node
      cx1 = pctX(left + CARD_W);      cy1 = pctY(top + cardH / 2);
      cx2 = pctX(nx - halfW);         cy2 = pctY(ny);           break;
    case 'above': // card is above node → arrow on card bottom edge
      cx1 = pctX(left + CARD_W / 2);  cy1 = pctY(top + cardH);
      cx2 = pctX(nx);                 cy2 = pctY(ny - halfH);   break;
    default:      // below — card is below node → arrow on card top edge
      cx1 = pctX(left + CARD_W / 2);  cy1 = pctY(top);
      cx2 = pctX(nx);                 cy2 = pctY(ny + halfH);   break;
  }

  return {
    left,
    top,
    side,
    dir: entry.dir,
    cnx: [cx1, cy1, cx2, cy2],
    zone: entry.anchor ? 'A' : 'local',
  };
}

// Arrow tip — a rotated square clipped to look like a speech-bubble pointer.
// Rendered outside the glass card, positioned on the edge facing the active node.
const ExplainArrow = ({ side }: { side: ExplainSide }) => {
  const base = 'absolute w-[9px] h-[9px] rotate-45 bg-card/88 border border-white/10';
  const pos: Record<ExplainSide, string> = {
    left:   'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-l-0 border-b-0',
    right:  'left-0  top-1/2 -translate-y-1/2 -translate-x-1/2 border-r-0 border-t-0',
    top:    'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-0 border-l-0',
    bottom: 'top-0   left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0',
  };
  return <div className={`${base} ${pos[side]}`} />;
};

const StageExplainer = ({
  nodeId,
  isActive,
  placement,
}: {
  nodeId:    number;
  isActive:  boolean;
  placement: CardPlacement | null;
}) => {
  const data = NODE_EXPLAINER[nodeId];
  const dot  = EXPLAIN_DOT[nodeId] ?? 'bg-active';
  if (!placement || !data) return null;

  const { left, top, side, dir, zone } = placement;
  const isZoneA = zone === 'A';
  // Zone A: slide in from the right edge; local: slide from the node direction
  const { x: ix = 0, y: iy = 0 } = isZoneA ? { x: 10, y: 0 } : DIR_SLIDE[dir];
  const nodeLabel = NODES.find(n => n.id === nodeId)?.label ?? `Step ${nodeId}`;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key={`explainer-${nodeId}`}
          className="absolute z-[22] w-[172px] pointer-events-none"
          style={{ left: `${Math.round(left)}px`, top: `${Math.round(top)}px` }}
          initial={{ opacity: 0, x: ix, y: iy, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: ix * 0.5, y: iy * 0.5, scale: 0.97 }}
          transition={{ duration: POPUP_FADE_DURATION / 1000, ease: 'easeOut' }}
        >
          <div className="relative">
            {/* Arrow tip only for local placements — Zone A cards use an anchor badge */}
            {!isZoneA && <ExplainArrow side={side} />}
            <div
              className="rounded-lg border border-white/10 bg-card/88 backdrop-blur-md px-2.5 py-2"
              style={{ boxShadow: '0 4px 28px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.05)' }}
            >
              {/* Zone A anchor badge — identifies which node this card belongs to */}
              {isZoneA && (
                <div className="flex items-center gap-1 mb-1 pb-1 border-b border-white/6">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                  <span className="text-[7.5px] font-mono uppercase tracking-widest text-foreground/40 truncate leading-none">
                    {nodeLabel}
                  </span>
                </div>
              )}
              <div className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/55 mb-1.5 pb-1 border-b border-white/8 leading-none">
                {data.title}
              </div>
              <ul className="space-y-[5px]">
                {data.bullets.map((bullet, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-1.5 leading-snug"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * (BULLET_REVEAL_DELAY / 1000), duration: 0.30, ease: 'easeOut' }}
                  >
                    <span className={`mt-[3px] w-[4px] h-[4px] rounded-full shrink-0 ${dot} opacity-80`} />
                    <span className="text-[10px] text-foreground/82 font-medium">{bullet}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Edge path helpers ────────────────────────────────────────────────────────

/** Cubic bezier that exits vertically from source, arrives vertically at target.
 *  For near-horizontal edges it bows gently perpendicular to the direction. */
const cubicPath = (x1: number, y1: number, x2: number, y2: number): string => {
  if (Math.abs(y2 - y1) < 3) {
    // Near-horizontal: gentle perpendicular bow
    const mx = (x1 + x2) / 2;
    const bow = (x2 > x1 ? -3.5 : 3.5);
    return `M ${x1} ${y1} C ${mx} ${y1 + bow} ${mx} ${y2 + bow} ${x2} ${y2}`;
  }
  // Standard: control pts share x with their endpoint, meet at midY
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${midY} ${x2} ${midY} ${x2} ${y2}`;
};

/** Override paths for edges that need special routing.
 *  Middle row y≈46, lower row y≈65.
 *  Key centres: 3=(42,46) 4=(20,46) 5=(14,65) 6=(34,65) 7=(64,46) 8=(54,65) 9=(82,46) 10=(74,65)
 *
 *  Routing rules applied:
 *  - Edges that rise from the lower row travel RIGHTWARD along the lower row first, then
 *    arc upward into their target — this keeps them below the middle-row nodes (y≈46)
 *    and prevents crossing through Dataset Router / TtQ card areas.
 *  - Edges at the same y bow gently in OPPOSITE vertical directions so they never overlap.
 *  - All control points avoid the node card bounding boxes. */
const EDGE_PATH_OVERRIDES: Record<string, string> = {
  // 3→4  Dataset Router→TtQ: same y, arc bows DOWN (stays below middle row)
  '3-4': 'M 42 46 C 33 55 27 55 20 46',

  // 3→7  Dataset Router→Insight Agent: same y, arc bows UP (clears 3→4 and stays above lower row)
  '3-7': 'M 42 46 C 51 38 57 38 64 46',

  // 5→7  Snowflake→Insight Agent: exit Snowflake going UPWARD immediately, then sweep right.
  //       Old path travelled along y=65 through Answer Evaluation's position — misleading.
  //       New path: at x=47 (AnsEval left edge) the arc is at y≈44, well above AnsEval top (y≈59).
  '5-7': 'M 14 65 C 14 52 56 40 64 46',

  // 6→7  Neo4j→Insight Agent: same upward-first strategy, shorter rightward leg.
  //       Clears Answer Evaluation (at x=54, y=65) by going above it from the start.
  '6-7': 'M 34 65 C 34 52 58 40 64 46',

  // 7→8  Insight Agent→Answer Evaluation: explicit downward-left arc so the handoff
  //       reads as a deliberate post-completion step (dim while Insight Agent is active).
  '7-8': 'M 64 46 C 64 58 54 58 54 65',

  // 8→9  Answer Eval→LangSmith: upward-right arc to observability branch.
  '8-9': 'M 54 65 C 54 55 86 52 86 40',
};

const getEdgePath = (fromId: number, toId: number, fx: number, fy: number, tx: number, ty: number) =>
  EDGE_PATH_OVERRIDES[`${fromId}-${toId}`] ?? cubicPath(fx, fy, tx, ty);

// ─── Canvas size hook ─────────────────────────────────────────────────────────

/** Tracks the rendered pixel dimensions of a DOM element via ResizeObserver. */
function useElementSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function MainContent() {
  const [workflowState, setWorkflowState] = useState<'idle' | 'running' | 'complete'>('idle');
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(-1);
  const [completedNodes, setCompletedNodes]   = useState<Set<number>>(new Set());
  const [isAutoRun,      setIsAutoRun]      = useState(false);
  const [isPaused,       setIsPaused]       = useState(false);
  const [presenterMode,  setPresenterMode]  = useState(true);
  const [query, setQuery] = useState('Show me the key production risks this month.');

  // Intro sequence: stakeholder types the question, then a packet fires into node 0
  const [introPhase, setIntroPhase] = useState<'idle' | 'typing' | 'sending' | 'done'>('idle');
  const [typedChars, setTypedChars] = useState(0);

  const [followUpInput,       setFollowUpInput]       = useState('');
  const [followUpState,       setFollowUpState]       = useState<'idle' | 'running' | 'complete'>('idle');
  const [followUpStep,        setFollowUpStep]        = useState<number>(-1);
  const [activeFollowUpAnswer, setActiveFollowUpAnswer] = useState<FollowUpKey | null>(null);
  const [activeFollowUpKey,   setActiveFollowUpKey]   = useState<FollowUpKey | null>(null);
  const [activeRoute,         setActiveRoute]         = useState<number[]>([]);
  const [followUpRouteStep,   setFollowUpRouteStep]   = useState<number>(-1);
  const [followUpNoMatch,     setFollowUpNoMatch]     = useState(false);
  const [followUpJustCompleted, setFollowUpJustCompleted] = useState(false);
  const [submittedQuestion,    setSubmittedQuestion]    = useState('');
  const [inputFlash,           setInputFlash]           = useState(false);
  const [insightPulse,        setInsightPulse]        = useState(false);
  // showReport controls the early-reveal of the Executive Report panel.
  // Set to true ~3.5 s after node 10 activates so the explanation card can
  // fade out before the panel slides in (even while still in 'running' state).
  const [showReport,    setShowReport]    = useState(false);

  // Completion packet animations (one-shot SVG packets that travel between nodes)
  const cpIdRef = useRef(0);
  const [completionPackets, setCompletionPackets] = useState<
    Array<{ id: number; fromId: number; toId: number }>
  >([]);

  const reportRef     = useRef<HTMLDivElement>(null);
  const reportBodyRef = useRef<HTMLDivElement>(null);
  const reportAreaRef = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLDivElement>(null);
  const canvasSize   = useElementSize(canvasRef);

  // Recompute card placements whenever the canvas resizes
  const cardPlacements = useMemo<Record<number, CardPlacement>>(() => {
    if (!canvasSize.w) return {};
    return Object.fromEntries(
      NODES.map(n => [n.id, getFixedPlacement(n.id, n, canvasSize.w, canvasSize.h)])
    );
  }, [canvasSize.w, canvasSize.h]);

  // ── Intro sequence: typewriter ──────────────────────────────────────────────
  useEffect(() => {
    if (introPhase !== 'typing') return;
    if (typedChars >= query.length) {
      const t = setTimeout(() => setIntroPhase('sending'), 380);
      return () => clearTimeout(t);
    }
    const delay = typedChars === 0 ? 0 : 28 + (Math.random() * 14 - 7); // slight jitter
    const t = setTimeout(() => setTypedChars(c => c + 1), delay);
    return () => clearTimeout(t);
  }, [introPhase, typedChars, query.length]);

  // ── Intro sequence: packet travel → activate node 0 ─────────────────────
  useEffect(() => {
    if (introPhase !== 'sending') return;
    const t = setTimeout(() => {
      setIntroPhase('done');
      setActiveNodeIndex(0);
    }, 900);
    return () => clearTimeout(t);
  }, [introPhase]);

  // Auto-advance main workflow (gated on intro complete)
  useEffect(() => {
    if (!(workflowState === 'running' && isAutoRun && introPhase === 'done' && !isPaused)) return;
    if (activeNodeIndex < 0) return;
    const duration = getStageDuration(activeNodeIndex);
    const timer = setTimeout(() => {
      if (activeNodeIndex < NODES.length - 1) {
        const nextIdx = activeNodeIndex + 1;
        // Fire completion packet(s) — for node 7 the convergence effect handles it
        if (NODES[nextIdx]?.parents.length === 1) {
          fireCompletionPacket(activeNodeIndex, nextIdx);
        }
        setCompletedNodes(prev => new Set(prev).add(activeNodeIndex));
        setActiveNodeIndex(nextIdx);
      } else if (activeNodeIndex === NODES.length - 1) {
        setCompletedNodes(prev => new Set(prev).add(activeNodeIndex));
        setActiveNodeIndex(-1);
        setWorkflowState('complete');
      }
    }, duration);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowState, activeNodeIndex, isAutoRun, introPhase, isPaused]);

  // Early-reveal the Executive Report panel ~3.5 s after node 10 activates.
  // This lets the brief explanation card fade out before the panel slides in.
  useEffect(() => {
    if (workflowState !== 'running' || activeNodeIndex !== 10) return;
    const t = setTimeout(() => setShowReport(true), 3500);
    return () => clearTimeout(t);
  }, [workflowState, activeNodeIndex]);

  // Auto-advance follow-up steps — 480 ms per step (~2 s total for 4 steps)
  useEffect(() => {
    if (followUpState !== 'running') return;
    const timer = setTimeout(() => {
      if (followUpStep < FOLLOWUP_NODES.length - 1) {
        setFollowUpStep(prev => prev + 1);
      } else {
        setFollowUpState('complete');
        setFollowUpStep(-1);
        setActiveRoute([]);
        setFollowUpRouteStep(-1);
        setFollowUpJustCompleted(true);
        setTimeout(() => setFollowUpJustCompleted(false), 2400);
        setActiveFollowUpKey(prev => {
          if (prev) setActiveFollowUpAnswer(prev);
          return null;
        });
      }
    }, 480);
    return () => clearTimeout(timer);
  }, [followUpState, followUpStep]);

  // Advance the canvas route one hop every 450 ms
  useEffect(() => {
    if (followUpState !== 'running' || followUpRouteStep < 0 || activeRoute.length === 0) return;
    if (followUpRouteStep >= activeRoute.length - 1) return;
    const timer = setTimeout(() => setFollowUpRouteStep(p => p + 1), 450);
    return () => clearTimeout(timer);
  }, [followUpState, followUpRouteStep, activeRoute.length]);

  /** Fire a one-shot animated packet from fromId → toId node */
  const fireCompletionPacket = (fromId: number, toId: number) => {
    if (fromId < 0 || toId < 0 || toId >= NODES.length) return;
    const id = ++cpIdRef.current;
    setCompletionPackets(prev => [...prev, { id, fromId, toId }]);
    setTimeout(() => setCompletionPackets(prev => prev.filter(p => p.id !== id)), 1000);
  };

  // When Insight Agent (node 7) activates, show convergence packets from all complete parents
  useEffect(() => {
    if (activeNodeIndex !== 7) return;
    NODES[7].parents.forEach((parentId, i) => {
      if (completedNodes.has(parentId)) {
        setTimeout(() => fireCompletionPacket(parentId, 7), i * 130);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNodeIndex]);

  const handleRun = () => {
    setWorkflowState('running');
    setActiveNodeIndex(-1); // node 0 activates after intro sequence
    setCompletedNodes(new Set());
    setTypedChars(0);
    setIntroPhase('typing');
  };

  const handleNextStep = () => {
    // Skip intro animation if still in progress
    if (introPhase === 'typing' || introPhase === 'sending') {
      setIntroPhase('done');
      setActiveNodeIndex(0);
      return;
    }
    if (activeNodeIndex < NODES.length - 1) {
      const nextIdx = activeNodeIndex + 1;
      if (NODES[nextIdx]?.parents.length === 1) {
        fireCompletionPacket(activeNodeIndex, nextIdx);
      }
      setCompletedNodes(prev => new Set(prev).add(activeNodeIndex));
      setActiveNodeIndex(nextIdx);
    } else if (activeNodeIndex === NODES.length - 1) {
      setCompletedNodes(prev => new Set(prev).add(activeNodeIndex));
      setActiveNodeIndex(-1);
      setWorkflowState('complete');
    }
  };

  const handleChipSelect = (key: FollowUpKey) => {
    if (followUpState === 'running') return;
    const label = FOLLOWUP_DEFS.find(d => d.key === key)?.label ?? key;
    // Scroll the report body to bottom so the input is the visual focus
    reportBodyRef.current?.scrollTo({ top: reportBodyRef.current.scrollHeight, behavior: 'smooth' });
    setFollowUpInput(label);
    setInputFlash(true);
    setTimeout(() => setInputFlash(false), 600);
    setTimeout(() => handleFollowUp(key), 400);
  };

  const handleFollowUp = (textOrKey?: string) => {
    if (followUpState === 'running') return;
    const input = (textOrKey ?? followUpInput).trim();
    if (!input) return;
    setFollowUpNoMatch(false);
    setFollowUpJustCompleted(false);

    // Resolve the follow-up key — direct key match first, then keyword heuristic
    const isKey = FOLLOWUP_DEFS.some(d => d.key === input);
    let key: FollowUpKey | null = null;
    if (isKey) {
      key = input as FollowUpKey;
    } else {
      const t = input.toLowerCase();
      if (t.includes('site') || t.includes('breakdown') || t.includes('sites'))
        key = 'site-breakdown';
      else if (t.includes('driver') || t.includes('why') || t.includes('cause') ||
               t.includes('highest risk') || t.includes('driving') ||
               t.includes('northern') || t.includes('explain') ||
               t.includes('driv') || t.includes('highest'))
        key = 'highest-risk';
      else if (t.includes('action') || t.includes('recommend') || t.includes('leadership') ||
               t.includes('leader') || t.includes('next step') || t.includes('what should'))
        key = 'leadership-actions';
      else if (t.includes('confidence') || t.includes('quality') || t.includes('evaluation') ||
               t.includes('trace') || t.includes('langsmith') || t.includes('trust') ||
               t.includes('confid') || t.includes('eval'))
        key = 'confidence-details';
    }

    // No keyword match — show a polite demo hint and bail out
    if (!key) {
      setFollowUpNoMatch(true);
      return;
    }

    // Activate the canvas route animation
    const def = FOLLOWUP_DEFS.find(d => d.key === key)!;
    setActiveRoute([...def.route]);
    setFollowUpRouteStep(0);

    setSubmittedQuestion(FOLLOWUP_DEFS.find(d => d.key === key)?.label ?? input);
    setActiveFollowUpKey(key);
    setFollowUpState('running');
    setFollowUpStep(0);
  };

  const handleReset = () => {
    setWorkflowState('idle');
    setActiveNodeIndex(-1);
    setCompletedNodes(new Set());
    setIntroPhase('idle');
    setTypedChars(0);
    setFollowUpInput('');
    setFollowUpState('idle');
    setFollowUpStep(-1);
    setActiveFollowUpAnswer(null);
    setActiveFollowUpKey(null);
    setActiveRoute([]);
    setFollowUpRouteStep(-1);
    setFollowUpNoMatch(false);
    setSubmittedQuestion('');
    setInputFlash(false);
    setInsightPulse(false);
    setIsPaused(false);
    setShowReport(false);
  };

  // Presenter mode — disable auto-run when entering presenter mode so
  // the presenter controls the pace manually with Next.
  useEffect(() => {
    if (presenterMode) setIsAutoRun(false);
  }, [presenterMode]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans overflow-hidden selection:bg-active/25">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="h-10 shrink-0 border-b border-border/30 bg-card/70 backdrop-blur flex items-center justify-between px-4 z-50">

        {/* Left — brand */}
        <div className="flex items-center gap-2.5">
          {/* Icon mark — cropped mark inside a subtle glass tile */}
          <div
            className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, hsl(265 38% 20% / 0.70) 0%, hsl(265 38% 12% / 0.55) 100%)',
              boxShadow: '0 0 0 1px hsl(265 42% 66% / 0.20), 0 2px 8px hsl(265 42% 8% / 0.40)',
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}hm-icon.png`}
              alt=""
              aria-hidden="true"
              className="w-[20px] h-[20px] object-contain"
              style={{ imageRendering: 'auto' }}
            />
          </div>
          {/* Wordmark + tagline as live text */}
          <div className="leading-none">
            <span className="text-[13px] font-semibold tracking-tight text-foreground/95 block leading-tight">Hybrid Mind</span>
            <span className="text-[8px] text-muted-foreground/55 tracking-wide block mt-[2px]">AI &amp; Data Without The Hype</span>
          </div>
        </div>

        {/* Centre — title */}
        <span className="absolute left-1/2 -translate-x-1/2 text-[11.5px] font-medium text-foreground/48 tracking-wide pointer-events-none">
          AI Operations Assistant
        </span>

        {/* Right — controls (presenter mode or dev mode) */}
        {presenterMode ? (

          /* ── Presenter Mode: clean client-facing controls ── */
          <div className="flex items-center gap-1.5">

            {/* Run — idle state only */}
            <AnimatePresence>
              {workflowState === 'idle' && (
                <motion.button
                  key="p-run"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.14 }}
                  onClick={handleRun}
                  className="flex items-center gap-1 text-[10px] font-medium px-3 py-1 rounded-full bg-active/90 text-white hover:bg-active transition-all"
                >
                  <Play size={9} fill="currentColor" strokeWidth={0} />
                  Run
                </motion.button>
              )}
            </AnimatePresence>

            {/* Next — advance one step while running */}
            <AnimatePresence>
              {workflowState === 'running' && (
                <motion.button
                  key="p-next"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.14 }}
                  onClick={handleNextStep}
                  disabled={workflowState !== 'running'}
                  className="flex items-center gap-1 text-[10px] font-medium px-3 py-1 rounded-full bg-active/90 text-white hover:bg-active disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={10} />
                  Next
                </motion.button>
              )}
            </AnimatePresence>

            {/* Reset — visible once workflow has started */}
            <AnimatePresence>
              {workflowState !== 'idle' && (
                <motion.button
                  key="p-reset"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.14 }}
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border border-border/40 text-foreground/45 hover:text-foreground/65 hover:bg-muted/30 transition-all"
                >
                  <RotateCcw size={9} />
                  Reset
                </motion.button>
              )}
            </AnimatePresence>

            {/* Step counter chip */}
            <HeaderStatusChip workflowState={workflowState} activeNodeIndex={activeNodeIndex} />

            {/* Presenter mode indicator / exit to dev */}
            <div className="w-px h-3.5 bg-border/28 mx-0.5" />
            <button
              onClick={() => setPresenterMode(false)}
              title="Switch to Dev mode"
              className="flex items-center gap-1 text-[8.5px] font-mono uppercase tracking-wider px-2 py-[3px] rounded-full border border-active/20 text-active/50 bg-active/5 hover:bg-active/10 hover:text-active/70 transition-all"
            >
              <Monitor size={8} />
              Presenter
            </button>
          </div>

        ) : (

          /* ── Dev Mode: full internal controls ── */
          <div className="flex items-center gap-1">

            {/* Run */}
            <button
              onClick={handleRun}
              disabled={workflowState !== 'idle'}
              className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full bg-active/90 text-white disabled:opacity-30 hover:bg-active transition-all"
            >
              <Play size={9} fill="currentColor" strokeWidth={0} />
              Run
            </button>

            {/* Pause / Resume */}
            <AnimatePresence mode="wait">
              {workflowState === 'running' && (
                <motion.button
                  key="pause-btn"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setIsPaused(v => !v)}
                  className={`flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all
                    ${isPaused
                      ? 'border-active/40 bg-active/10 text-active/80 hover:bg-active/15'
                      : 'border-border/40 text-foreground/52 hover:bg-muted/35'}`}
                >
                  {isPaused
                    ? <><Play size={9} fill="currentColor" strokeWidth={0} /> Resume</>
                    : <><Pause size={9} fill="currentColor" strokeWidth={0} /> Pause</>}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Step */}
            <button
              onClick={handleNextStep}
              disabled={workflowState !== 'running' || isAutoRun}
              className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border border-border/45 text-foreground/50 disabled:opacity-25 hover:bg-muted/40 transition-all"
            >
              <StepForward size={9} />
              Step
            </button>

            {/* Auto toggle */}
            <button
              onClick={() => setIsAutoRun(v => !v)}
              className={`flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all
                ${isAutoRun
                  ? 'border-active/30 text-active/80 bg-active/8'
                  : 'border-border/35 text-muted-foreground/42 hover:bg-muted/30'}`}
            >
              <Zap size={9} className={isAutoRun ? 'fill-active/80' : ''} />
              Auto
            </button>

            {/* Restart */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border border-border/38 text-foreground/42 hover:text-foreground/65 hover:bg-muted/35 transition-all"
            >
              <RotateCcw size={9} />
              Restart
            </button>

            {/* Divider */}
            <div className="w-px h-4 bg-border/35 mx-1" />

            {/* Workflow status chip */}
            <HeaderStatusChip workflowState={workflowState} activeNodeIndex={activeNodeIndex} />

            {/* Switch to Presenter mode */}
            <button
              onClick={() => setPresenterMode(true)}
              title="Switch to Presenter mode"
              className="flex items-center gap-1 text-[8.5px] font-mono uppercase tracking-wider px-2 py-[3px] rounded-full border border-border/30 text-muted-foreground/38 bg-muted/12 hover:text-muted-foreground/58 hover:bg-muted/22 transition-all"
            >
              <Monitor size={8} />
              Presenter
            </button>
          </div>

        )}
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">

        {/* Canvas — always full height */}
        <div ref={canvasRef} className="absolute inset-0 bg-canvas bg-canvas-pattern">

          {/* Stakeholder character node */}
          <StakeholderNode
            query={query}
            setQuery={setQuery}
            introPhase={introPhase}
            typedChars={typedChars}
          />

          {/* Mode selector */}
          <ModeSelector
            isRouterActive={activeNodeIndex === 2}
            isRouterComplete={completedNodes.has(2)}
          />

          {/* SVG Edges */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Active edge glow — only applied to the single live edge, kept tight */}
              <filter id="edge-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.18 0.32" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* ── Stakeholder → Node 0 intro edge (curved) ── */}
            {(() => {
              const introPath = `M 24 ${NODES[0].y} C 34 ${NODES[0].y} 42 ${NODES[0].y} ${NODES[0].x} ${NODES[0].y}`;
              return (
                <>
                  {introPhase === 'sending' && (
                    <>
                      {/* Leading packet — primary signal */}
                      <circle r="0.42" fill="hsl(var(--active))" opacity="0.95">
                        <animateMotion dur="0.80s" repeatCount="1" fill="freeze" path={introPath} />
                      </circle>
                      {/* Second packet */}
                      <circle r="0.25" fill="hsl(var(--active))" opacity="0.62">
                        <animateMotion dur="0.80s" repeatCount="1" fill="freeze" begin="0.18s" path={introPath} />
                      </circle>
                      {/* Third trailing packet */}
                      <circle r="0.15" fill="hsl(var(--active))" opacity="0.32">
                        <animateMotion dur="0.80s" repeatCount="1" fill="freeze" begin="0.34s" path={introPath} />
                      </circle>
                    </>
                  )}
                </>
              );
            })()}

            {/* ── Main workflow edges ── */}
            {EDGES.map(edge => {
              const fromNode       = NODES.find(n => n.id === edge.from)!;
              const toNode         = NODES.find(n => n.id === edge.to)!;
              const fromIsComplete = completedNodes.has(fromNode.id);
              const toIsActive     = activeNodeIndex === toNode.id;
              const toIsComplete   = completedNodes.has(toNode.id);
              const isLive         = fromIsComplete && toIsActive;
              const isDone         = fromIsComplete && toIsComplete;
              const pathD          = getEdgePath(edge.from, edge.to, fromNode.x, fromNode.y, toNode.x, toNode.y);

              // Opacity tiers — only the live edge and its direct feeder get emphasis;
              // all other completed edges fade to a gentle trace so the active path reads clearly.
              const activeNode      = NODES.find(n => n.id === activeNodeIndex);
              const activeParentIds = new Set(activeNode?.parents ?? []);
              // "feeder" = a completed edge whose target is the currently active node
              const isFeeder        = isDone && activeParentIds.has(fromNode.id) && activeParentIds.has(toNode.id)
                                      || (isDone && toNode.id === activeNodeIndex);
              const edgeOpacity = workflowState !== 'running' || activeNodeIndex < 0
                ? 1
                : isLive    ? 1
                : isFeeder  ? 0.70
                : isDone    ? 0.35
                : 0.20;

              // Stroke appearance per state
              const baseStroke      = isLive   ? 'hsl(var(--active) / 0.72)'
                                    : isFeeder ? 'hsl(var(--active) / 0.55)'
                                    : isDone   ? 'hsl(var(--active) / 0.38)'
                                    : 'hsl(var(--border) / 0.70)';
              const baseWidth       = isLive   ? 0.38
                                    : isFeeder ? 0.28
                                    : isDone   ? 0.22
                                    : 0.24;

              return (
                <g key={`${edge.from}-${edge.to}`} style={{ opacity: edgeOpacity, transition: 'opacity 0.5s ease' }}>
                  {/* Base track — always present, weight varies by state */}
                  <path
                    d={pathD}
                    stroke={baseStroke}
                    strokeWidth={baseWidth}
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Live only: tight glow halo — one filter, one path, no stacking */}
                  {isLive && (
                    <path
                      d={pathD}
                      stroke="hsl(var(--active) / 0.32)"
                      strokeWidth="0.70"
                      fill="none"
                      filter="url(#edge-glow)"
                    />
                  )}

                  {/* Live only: animated dashed overlay */}
                  {isLive && (
                    <path
                      d={pathD}
                      stroke="hsl(var(--active) / 0.80)"
                      strokeWidth="0.26"
                      strokeDasharray="1.6 3.6"
                      strokeLinecap="round"
                      fill="none"
                      className="animate-flow"
                    />
                  )}

                  {/* Live only: single flowing data packet (one, not two, reduces clutter) */}
                  {isLive && (
                    <circle r="0.36" fill="hsl(var(--active))" opacity="0.90">
                      <animateMotion dur="2.0s" repeatCount="indefinite" path={pathD} />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* ── Follow-up route: hop lines + travelling packet ── */}
            {followUpState === 'running' && activeRoute.length > 1 && (() => {
              // Build per-hop geometry from the NODES positions
              const nodePos = (id: number) => {
                const n = NODES.find(x => x.id === id);
                return { x: n?.x ?? 79, y: n?.y ?? 68 };
              };
              return (
                <g>
                  {/* Lines for each hop */}
                  {activeRoute.slice(0, -1).map((fromId, i) => {
                    const toId   = activeRoute[i + 1];
                    const from   = nodePos(fromId);
                    const to     = nodePos(toId);
                    const pathD  = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
                    const isCur  = followUpRouteStep === i;
                    const isDone = followUpRouteStep > i;
                    return (
                      <path key={`frl-${i}`} d={pathD}
                        stroke={isCur  ? 'hsl(var(--active) / 0.72)'
                              : isDone ? 'hsl(var(--complete) / 0.42)'
                              :          'hsl(var(--border) / 0.28)'}
                        strokeWidth={isCur ? 0.38 : 0.20}
                        strokeDasharray={isCur ? undefined : '1.6 2.4'}
                        strokeLinecap="round" fill="none"
                        filter={isCur ? 'url(#edge-glow)' : undefined}
                      />
                    );
                  })}
                  {/* Animated packet on the current hop */}
                  {followUpRouteStep >= 0 && followUpRouteStep < activeRoute.length - 1 && (() => {
                    const from  = nodePos(activeRoute[followUpRouteStep]);
                    const to    = nodePos(activeRoute[followUpRouteStep + 1]);
                    const pathD = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
                    return (
                      <g key={`frp-${followUpRouteStep}`}>
                        <circle r="0.42" fill="hsl(var(--active))" opacity="0.94">
                          <animateMotion dur="0.70s" fill="freeze" path={pathD} />
                        </circle>
                        <circle r="0.23" fill="hsl(var(--active))" opacity="0.55">
                          <animateMotion dur="0.70s" fill="freeze" begin="0.14s" path={pathD} />
                        </circle>
                      </g>
                    );
                  })()}
                </g>
              );
            })()}

            {/* ── One-shot completion packets (node → next node) ── */}
            {completionPackets.map(cp => {
              const fn = NODES.find(n => n.id === cp.fromId);
              const tn = NODES.find(n => n.id === cp.toId);
              if (!fn || !tn) return null;
              const pathD = getEdgePath(cp.fromId, cp.toId, fn.x, fn.y, tn.x, tn.y);
              return (
                <g key={cp.id}>
                  {/* Leading dot */}
                  <circle r="0.42" fill="hsl(var(--active))" opacity="0.96">
                    <animateMotion dur="0.78s" fill="freeze" path={pathD} />
                  </circle>
                  {/* Trailing dot */}
                  <circle r="0.24" fill="hsl(var(--active))" opacity="0.55">
                    <animateMotion dur="0.78s" fill="freeze" begin="0.18s" path={pathD} />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Nodes — node 0 is the StakeholderNode; skip its duplicate card */}
          {(() => {
            // Compute focus neighbourhood for the active node
            const activeNode       = NODES.find(n => n.id === activeNodeIndex);
            const activeParentIds  = new Set(activeNode?.parents ?? []);
            const activeChildIds   = new Set(
              NODES.filter(n => n.parents.includes(activeNodeIndex)).map(n => n.id)
            );
            const isFocusing = workflowState === 'running' && activeNodeIndex >= 0;

            // Follow-up route state — used for dimming + pulsing
            const routeNodeSet        = new Set(activeRoute);
            const followUpDimming     = followUpState === 'running' && activeRoute.length > 0;
            const routeArrivalNodeId  = followUpDimming && followUpRouteStep >= 0
              ? activeRoute[Math.min(followUpRouteStep + 1, activeRoute.length - 1)]
              : -1;

            return NODES.filter(node => node.id !== 0).map(node => {
              const isActive   = activeNodeIndex === node.id;
              const isComplete = completedNodes.has(node.id);
              const isIdle     = !isActive && !isComplete;

              // During follow-up: pulse the node the packet is arriving at
              const isPulsing  = (insightPulse && node.id === 7)
                || (followUpDimming && node.id === routeArrivalNodeId && node.id !== 10);

              // During follow-up: dim nodes outside the route; otherwise normal focus logic
              const focusOpacity = followUpDimming
                ? (routeNodeSet.has(node.id) ? 1 : 0.12)
                : !isFocusing                       ? 1
                : isActive                          ? 1
                : activeParentIds.has(node.id)      ? 0.78
                : activeChildIds.has(node.id)       ? 0.78
                : isComplete                        ? 0.48
                : /* idle, unrelated */               0.25;

              return (
                <NodeCard
                  key={node.id}
                  node={node}
                  isActive={isActive}
                  isComplete={isComplete}
                  isIdle={isIdle}
                  isPulsing={isPulsing}
                  activeNodeIndex={activeNodeIndex}
                  focusOpacity={focusOpacity}
                />
              );
            });
          })()}

          {/* Stage explainer bubbles — dynamically placed, one per node.
              Node 2 (ASK / AGENT Router): excluded — explanation merged into the Routing Decision card.
              Node 10 (Executive Report): hidden once showReport is true so the explanation card
              fades out cleanly before the full report panel slides in. */}
          {workflowState === 'running' && NODES
            .filter(n => n.id !== 2 && !(n.id === 10 && showReport))
            .map(node => (
              <StageExplainer
                key={node.id}
                nodeId={node.id}
                isActive={activeNodeIndex === node.id}
                placement={cardPlacements[node.id] ?? null}
              />
            ))
          }

          {/* Explainer connector lines — 1px anchor computed from dynamic placement.
              viewBox 0-100 matches the node % coordinate system.
              vector-effect="non-scaling-stroke" keeps the line exactly 1px. */}
          {workflowState === 'running' && (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 21 }}
            >
              <AnimatePresence>
                {NODES
                  .filter(n =>
                    n.id !== 0 &&
                    activeNodeIndex === n.id &&
                    cardPlacements[n.id]?.cnx &&
                    // Zone A cards use an anchor badge — connector would cross the RD card
                    cardPlacements[n.id]?.zone !== 'A'
                  )
                  .map(node => {
                    const [x1, y1, x2, y2] = cardPlacements[node.id].cnx;
                    return (
                      <motion.line
                        key={`connector-${node.id}`}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="rgba(255,255,255,0.25)"
                        strokeWidth="1"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        strokeDasharray="3 3"
                        fill="none"
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{ opacity: 1, pathLength: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: POPUP_FADE_DURATION / 1000, ease: 'easeOut' }}
                      />
                    );
                  })
                }
              </AnimatePresence>
            </svg>
          )}

          {/* Canvas disclaimer — bottom-left, always visible, understated */}
          <div className="absolute bottom-3 left-3.5 pointer-events-none select-none z-[2]">
            <p className="text-[7.5px] text-foreground/[0.18] leading-none tracking-wide">
              Illustrative workflow based on real AI Operations Assistant delivery patterns. Demo data used.
            </p>
          </div>

          {/* Status chip now lives in the header — nothing to render here */}
        </div>

        {/* ── Dim overlay when report is open ── */}
        <AnimatePresence>
          {(workflowState === 'complete' || showReport) && (
            <motion.div key="canvas-dim"
              className="absolute inset-0 bg-background/52 pointer-events-none z-[25]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* ── Executive Report — expands from the report node (bottom-right) ── */}
        <AnimatePresence>
          {(workflowState === 'complete' || showReport) && (
            <motion.div
              key="report-panel"
              className="absolute right-0 top-0 h-full w-[440px] bg-background/98 backdrop-blur-md border-l border-border/55 z-[30] flex flex-col"
              style={{
                boxShadow: '-20px 0 80px rgba(0,0,0,0.55), -4px 0 16px rgba(0,0,0,0.30)',
                transformOrigin: 'right bottom',
              }}
              initial={{ x: '100%', scaleY: 0.55, scaleX: 0.9, opacity: 0 }}
              animate={{ x: 0, scaleY: 1, scaleX: 1, opacity: 1 }}
              exit={{ x: '100%', scaleY: 0.8, opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Gradient accent bar — 3px, vivid */}
              <div className="h-[3px] shrink-0 bg-gradient-to-r from-violet-500 via-active to-teal-400" />

              <ExecutiveReport
                isVisible
                reportRef={reportRef}
                reportBodyRef={reportBodyRef}
                activeFollowUpAnswer={activeFollowUpAnswer}
                onCloseFollowUp={() => setActiveFollowUpAnswer(null)}
                onFollowUp={handleFollowUp}
                onChipSelect={handleChipSelect}
                submittedQuestion={submittedQuestion}
                followUpIsRunning={followUpState === 'running'}
                followUpNodeLabel={(() => {
                  if (followUpState !== 'running' || activeRoute.length === 0 || followUpRouteStep < 0) return null;
                  const destId = activeRoute[Math.min(followUpRouteStep + 1, activeRoute.length - 1)];
                  if (destId === 10) return 'Compiling results…';
                  return NODES.find(n => n.id === destId)?.label ?? null;
                })()}
                followUpStatusText={
                  followUpState === 'running' && activeFollowUpKey
                    ? (FOLLOWUP_DEFS.find(d => d.key === activeFollowUpKey)?.runningLabel ?? null)
                    : null
                }
                activeRunningKey={followUpState === 'running' ? activeFollowUpKey : null}
                followUpJustCompleted={followUpJustCompleted}
              />

              {/* Follow-up input — docked at panel bottom */}
              <div className="shrink-0 border-t border-border/20">
                <FollowUpPanel
                  followUpState={followUpState}
                  followUpStep={followUpStep}
                  followUpInput={followUpInput}
                  setFollowUpInput={setFollowUpInput}
                  onSubmit={handleFollowUp}
                  onChipSelect={handleChipSelect}
                  inputFlash={inputFlash}
                  showChips={false}
                  noMatch={followUpNoMatch}
                  onClearNoMatch={() => setFollowUpNoMatch(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Router + App ─────────────────────────────────────────────────────────────

function Router() {
  return (
    <Switch>
      <Route path="/" component={MainContent} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
