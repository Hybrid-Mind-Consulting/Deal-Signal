import React from 'react';
import { useLocation } from 'wouter';
import { PageHeader } from '@/components/layout/PageHeader';
import { DEALS } from '@/data/mock';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Portfolio() {
  const [, setLocation] = useLocation();

  const handleCardClick = (id: string) => {
    // Navigate to watchtower, simulating NovaCura as the active deal.
    setLocation('/watchtower');
  };

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Portfolio" 
        subtitle={`Active Deals Under Diligence (${DEALS.length})`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEALS.map((deal, idx) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => handleCardClick(deal.id)}
            className="bg-card border border-card-border rounded-xl p-6 cursor-pointer hover-elevate transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
                  {deal.name}
                </h3>
                <p className="text-sm text-muted-foreground">{deal.sector}</p>
              </div>
              <div className="flex items-center">
                <span className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-full border bg-opacity-10",
                  deal.status === 'Green' ? "text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%,0.3)] bg-[hsl(160,84%,39%,0.1)]" :
                  deal.status === 'Amber' ? "text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%,0.3)] bg-[hsl(38,92%,50%,0.1)]" :
                  "text-[hsl(0,84%,60%)] border-[hsl(0,84%,60%,0.3)] bg-[hsl(0,84%,60%,0.1)]"
                )}>
                  {deal.status}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stage</span>
                <span className="font-medium text-foreground">{deal.stage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Material Signals</span>
                <span className={cn(
                  "font-medium", 
                  deal.materialSignals > 0 ? "text-[hsl(38,92%,50%)]" : "text-foreground"
                )}>
                  {deal.materialSignals}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Open Actions</span>
                <span className="font-medium text-foreground">{deal.openActions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sources Monitored</span>
                <span className="font-medium text-foreground">{deal.sourcesMonitored}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
              <span>Updated</span>
              <span>{deal.lastUpdated}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
