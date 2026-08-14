import React from 'react';
import { useLocation } from 'wouter';
import { PageHeader } from '@/components/layout/PageHeader';
import { DEALS } from '@/data/mock';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Portfolio() {
  const [, setLocation] = useLocation();

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Portfolio"
        subtitle={`${DEALS.length} deals under diligence`}
      />

      <div className="grid grid-cols-3 gap-5">
        {DEALS.map((deal, idx) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            onClick={() => setLocation('/watchtower')}
            className="bg-card border border-card-border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:border-border group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {deal.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{deal.sector}</p>
              </div>
              <span className={cn(
                'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ml-3 flex-shrink-0',
                deal.status === 'Green'
                  ? 'text-[hsl(160,84%,39%)] bg-[hsl(160,84%,39%,0.1)]'
                  : deal.status === 'Amber'
                    ? 'text-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%,0.1)]'
                    : 'text-[hsl(0,84%,60%)] bg-[hsl(0,84%,60%,0.1)]'
              )}>
                {deal.status}
              </span>
            </div>

            {/* Two key stats */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stage</span>
                <span className="font-medium text-foreground">{deal.stage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Material Signals</span>
                <span className={cn(
                  'font-medium',
                  deal.materialSignals > 0 ? 'text-[hsl(38,92%,50%)]' : 'text-foreground'
                )}>
                  {deal.materialSignals}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Updated {deal.lastUpdated}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
