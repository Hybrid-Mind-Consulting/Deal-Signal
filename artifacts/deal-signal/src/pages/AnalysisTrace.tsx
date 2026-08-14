import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ANALYSIS_EVENTS } from '@/data/mock';
import { Network, Database, BrainCircuit, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalysisTrace() {
  const getIcon = (type: string) => {
    switch(type) {
      case 'Ingestion': return <Database className="w-4 h-4" />;
      case 'Detection': return <BrainCircuit className="w-4 h-4" />;
      case 'Cross-Reference': return <Network className="w-4 h-4" />;
      case 'Alert': return <BellRing className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Analysis Trace" 
        subtitle="System execution log for NovaCura Therapeutics"
      />

      <div className="max-w-3xl">
        <div className="relative border-l border-border ml-4 space-y-8 pb-8">
          
          {ANALYSIS_EVENTS.map((event, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={event.id} 
              className="relative pl-8"
            >
              <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-primary z-10">
                {getIcon(event.type)}
              </div>
              
              <div className="bg-card border border-border rounded-xl p-5 hover-elevate transition-all">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-foreground uppercase tracking-wide">{event.type}</span>
                  <span className="text-xs font-mono text-muted-foreground">{event.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
                
                {/* Synthetic payload visual */}
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="bg-sidebar rounded flex items-center px-3 py-2">
                    <span className="text-xs font-mono text-[hsl(215,20.2%,45%)]">
                      {`{ "trace_id": "tx_${Math.random().toString(36).substr(2, 9)}", "status": "200 OK" }`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* End marker */}
          <div className="relative pl-8 pt-4 text-sm text-muted-foreground italic">
            <div className="absolute -left-1.5 top-5 w-3 h-3 rounded-full border-2 border-border bg-background z-10"></div>
            End of trace
          </div>

        </div>
      </div>
    </div>
  );
}
