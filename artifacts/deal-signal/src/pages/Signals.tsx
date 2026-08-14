import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SIGNALS } from '@/data/mock';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signals() {
  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Signals" 
        subtitle="NovaCura Therapeutics"
      />

      <div className="space-y-4">
        {SIGNALS.map((signal, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={signal.id}
            className="bg-card border border-card-border rounded-xl p-6 hover:border-border transition-colors flex items-start space-x-5"
          >
            <div className="pt-1">
              {signal.severity === 'High' && <AlertTriangle className="w-6 h-6 text-[hsl(0,84%,60%)]" />}
              {signal.severity === 'Medium' && <AlertCircle className="w-6 h-6 text-[hsl(38,92%,50%)]" />}
              {signal.severity === 'Low' && <Info className="w-6 h-6 text-primary" />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-card-foreground text-lg">{signal.type}</h3>
                  <span className={cn(
                    "px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-opacity-10",
                    signal.severity === 'High' ? "text-[hsl(0,84%,60%)] border-[hsl(0,84%,60%,0.3)] bg-[hsl(0,84%,60%,0.1)]" :
                    signal.severity === 'Medium' ? "text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%,0.3)] bg-[hsl(38,92%,50%,0.1)]" :
                    "text-primary border-primary/30 bg-primary/10"
                  )}>
                    {signal.severity}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{signal.timestamp}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {signal.description}
              </p>
              
              <div className="mt-4 pt-4 border-t border-border flex items-center space-x-4">
                <button className="text-sm font-medium text-primary hover:text-primary-foreground transition-colors">
                  View Source Evidence
                </button>
                <div className="w-1 h-1 rounded-full bg-border" />
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Create Action Item
                </button>
                <div className="w-1 h-1 rounded-full bg-border" />
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
