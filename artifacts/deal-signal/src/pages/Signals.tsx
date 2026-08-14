import React from 'react';
import { useLocation } from 'wouter';
import { PageHeader } from '@/components/layout/PageHeader';
import { MATERIAL_SIGNALS } from '@/data/mock';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function priorityStyle(priority: string) {
  if (priority === 'HIGH')
    return {
      badge: 'bg-[hsl(0,84%,60%,0.12)] text-[hsl(0,84%,60%)] border border-[hsl(0,84%,60%,0.25)]',
      accent: 'border-l-[hsl(0,84%,60%,0.5)]',
      conf: 'text-[hsl(0,84%,60%)]',
    };
  return {
    badge: 'bg-[hsl(38,92%,50%,0.12)] text-[hsl(38,92%,50%)] border border-[hsl(38,92%,50%,0.25)]',
    accent: 'border-l-[hsl(38,92%,50%,0.5)]',
    conf: 'text-[hsl(38,92%,50%)]',
  };
}

export default function Signals() {
  const [, navigate] = useLocation();

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Signals"
        subtitle="NovaCura Therapeutics — active material signals"
      />

      <div className="space-y-3">
        {MATERIAL_SIGNALS.map((signal, idx) => {
          const ps = priorityStyle(signal.priority);

          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={cn(
                'bg-card border border-card-border rounded-xl overflow-hidden border-l-[3px]',
                ps.accent,
              )}
            >
              <div className="px-5 py-4 flex items-start gap-6">
                {/* Left: badge + title + summary */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded', ps.badge)}>
                      {signal.priority}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {signal.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-snug mb-1">
                    {signal.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {signal.summary}
                  </p>
                </div>

                {/* Right: meta + action */}
                <div className="flex-shrink-0 flex flex-col items-end gap-3 min-w-[130px]">
                  <div className="text-right space-y-1.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-[10px] text-muted-foreground">Confidence</span>
                      <span className={cn('text-xs font-semibold', ps.conf)}>{signal.confidence}%</span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-[10px] text-muted-foreground">Detected</span>
                      <span className="text-xs text-foreground">{signal.detected}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/signals/customer-concentration')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors group"
                  >
                    View Signal
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-8">
        3 active signals · NovaCura Therapeutics · Last updated 14 Aug 2026, 14:32
      </p>
    </div>
  );
}
