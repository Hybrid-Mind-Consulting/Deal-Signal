import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DATA_SOURCES } from '@/data/mock';
import { Database, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function DataSources() {
  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Data Sources" 
        subtitle="Active integrations and continuous feeds"
      >
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Source</span>
        </button>
      </PageHeader>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-sidebar/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Source Name</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Last Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {DATA_SOURCES.map((source, idx) => (
              <motion.tr 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={source.id} 
                className="hover:bg-sidebar/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Database className="w-4 h-4 text-muted-foreground mr-3" />
                    <span className="font-medium text-foreground">{source.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                  {source.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-full border",
                    source.status === 'Active' 
                      ? "text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%,0.3)] bg-[hsl(160,84%,39%,0.1)]" 
                      : "text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%,0.3)] bg-[hsl(38,92%,50%,0.1)]"
                  )}>
                    {source.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-muted-foreground text-xs">
                  {source.lastSync}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
