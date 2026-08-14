import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ANALYSIS_EVENTS } from '@/data/mock';
import {
  BellRing,
  BrainCircuit,
  Database,
  FileSearch,
  GitBranch,
  Network,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Icon map ─────────────────────────────────────────────────────────────────

function EventIcon({ type }: { type: string }) {
  const cls = 'w-4 h-4';
  switch (type) {
    case 'Ingestion':           return <Database className={cls} />;
    case 'Extraction':          return <FileSearch className={cls} />;
    case 'Context Retrieval':   return <BrainCircuit className={cls} />;
    case 'Cross-Reference':     return <Network className={cls} />;
    case 'Signal Classification': return <SlidersHorizontal className={cls} />;
    case 'Evaluation':          return <ShieldCheck className={cls} />;
    case 'Alert':               return <BellRing className={cls} />;
    default:                    return <GitBranch className={cls} />;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalysisTrace() {
  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Analysis Trace"
        subtitle="System execution log — Customer concentration has increased materially · NovaCura Therapeutics"
      />

      <div className="max-w-3xl">
        {/* Signal context strip */}
        <div className="mb-8 flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-card-border text-xs text-muted-foreground font-mono">
          <span className="text-primary font-semibold">SIG-001</span>
          <span className="text-border">|</span>
          <span>Customer concentration has increased materially</span>
          <span className="text-border">|</span>
          <span>NovaCura Therapeutics</span>
          <span className="text-border">|</span>
          <span className="text-[hsl(38,92%,50%)]">HIGH · COMMERCIAL</span>
        </div>

        <div className="relative border-l border-border ml-4 space-y-8 pb-8">

          {ANALYSIS_EVENTS.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="relative pl-8"
            >
              {/* Node dot */}
              <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-primary z-10">
                <EventIcon type={event.type} />
              </div>

              <div className="bg-card border border-card-border rounded-xl p-5">
                {/* Header row */}
                <div className="flex justify-between items-start mb-2 gap-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground">
                    {event.type}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                    {event.timestamp}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {event.description}
                </p>

                {/* Detail bullets */}
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

                {/* Trace ID pill */}
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="bg-sidebar rounded flex items-center px-3 py-2">
                    <span className="text-xs font-mono text-[hsl(215,20.2%,45%)]">
                      {`{ "trace_id": "${event.traceId}", "status": "200 OK" }`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* End marker */}
          <div className="relative pl-8 pt-4 text-xs text-muted-foreground font-mono italic">
            <div className="absolute -left-1.5 top-5 w-3 h-3 rounded-full border-2 border-border bg-background z-10" />
            End of trace · 7 steps · 14 Aug 2026, 14:27
          </div>
        </div>
      </div>
    </div>
  );
}
