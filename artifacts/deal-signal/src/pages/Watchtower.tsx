import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Activity, Radio, Database, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Watchtower() {
  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Watchtower" 
        subtitle="NovaCura Therapeutics — Live Signal Monitor"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricTile title="Sources Monitored" value="42" icon={Database} />
        <MetricTile title="Last Scan" value="2 mins ago" icon={Radio} />
        <MetricTile title="Active Signals" value="3" icon={Activity} alert />
        <MetricTile title="Pending Actions" value="7" icon={CheckCircle2} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-96 border border-border rounded-xl bg-card flex flex-col items-center justify-center text-center p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full border border-white" />
          <div className="w-[400px] h-[400px] rounded-full border border-white absolute" />
          <div className="w-[300px] h-[300px] rounded-full border border-white absolute" />
        </div>
        
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative z-10">
          <Radio className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2 relative z-10">Monitoring Active</h3>
        <p className="text-muted-foreground max-w-md relative z-10">
          Signal monitoring is active. No new material signals in the last 24 hours. The watchtower is continuously analyzing incoming evidence across 42 configured sources.
        </p>
      </motion.div>
    </div>
  );
}

function MetricTile({ title, value, icon: Icon, alert }: { title: string, value: string, icon: React.ElementType, alert?: boolean }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5 flex items-center">
      <div className={`p-3 rounded-lg mr-4 ${alert ? 'bg-[hsl(38,92%,50%,0.1)] text-[hsl(38,92%,50%)]' : 'bg-primary/10 text-primary'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-semibold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}
