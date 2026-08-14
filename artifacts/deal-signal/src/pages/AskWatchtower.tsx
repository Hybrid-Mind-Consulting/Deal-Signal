import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Send, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AskWatchtower() {
  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
      <PageHeader 
        title="Ask Watchtower" 
      />

      <div className="flex-1 overflow-y-auto mb-6 pr-4 space-y-8">
        
        {/* User Message */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
          <div className="bg-card border border-border rounded-2xl rounded-tr-sm px-6 py-4 max-w-2xl text-card-foreground">
            <p className="text-sm">What is the status of the FDA inspection for the North Carolina facility?</p>
          </div>
        </motion.div>

        {/* System Message */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-start">
          <div className="bg-sidebar border border-sidebar-border rounded-2xl rounded-tl-sm px-6 py-4 max-w-2xl text-sidebar-foreground">
            <div className="flex items-center space-x-2 mb-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">System Response</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Based on the latest SEC 8-K filing (ingested 2 hours ago) and management's weekly update, the FDA completed their inspection on August 10. They issued a Form 483 with three observations related to environmental monitoring protocols. 
              <br/><br/>
              Management expects to submit their formal response by August 24. We have triggered an automatic alert to monitor the FDA CDER database for subsequent classification changes.
            </p>
          </div>
        </motion.div>

        {/* User Message */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-end">
          <div className="bg-card border border-border rounded-2xl rounded-tr-sm px-6 py-4 max-w-2xl text-card-foreground">
            <p className="text-sm">How does this impact our projected timeline for NCT-440?</p>
          </div>
        </motion.div>

        {/* System Message */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-start">
          <div className="bg-sidebar border border-sidebar-border rounded-2xl rounded-tl-sm px-6 py-4 max-w-2xl text-sidebar-foreground">
            <div className="flex items-center space-x-2 mb-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">System Response</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Cross-referencing historical FDA resolution times for similar biologics facilities, there is a 72% probability of a 3-6 month delay in the PDUFA date. I have updated the Key Risks section in the Deal Brief to reflect this scenario.
            </p>
          </div>
        </motion.div>

      </div>

      <div className="relative mt-auto">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Terminal className="h-5 w-5 text-muted-foreground" />
        </div>
        <input 
          type="text" 
          placeholder="Ask about NovaCura Therapeutics..." 
          className="w-full bg-card border border-border rounded-lg py-4 pl-12 pr-16 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
          disabled
        />
        <button className="absolute inset-y-2 right-2 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md flex items-center justify-center transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
