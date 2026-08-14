import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock } from 'lucide-react';

interface RiskItemProps {
  title: string;
  description: string;
}

function RiskItem({ title, description }: RiskItemProps) {
  return (
    <li className="flex items-start gap-3">
      <AlertTriangle className="w-4 h-4 text-[hsl(38,92%,50%)] flex-shrink-0 mt-0.5" />
      <div>
        <span className="text-sm font-semibold text-foreground">{title}: </span>
        <span className="text-sm text-muted-foreground leading-relaxed">{description}</span>
      </div>
    </li>
  );
}

export default function DealBrief() {
  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Deal Brief"
        subtitle="NovaCura Therapeutics"
      >
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
          Export PDF
        </button>
      </PageHeader>

      <div className="bg-card border border-card-border rounded-xl p-8 max-w-4xl">
        {/* Watchtower evidence stamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg px-3 py-2 mb-8 w-fit">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          Generated from Watchtower evidence — 14 Aug 2026, 14:32
        </div>

        <div className="space-y-10 text-card-foreground">

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4 text-white">
              Executive Summary
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              NovaCura Therapeutics is a profitable specialty pharmaceutical business operating across specialist care markets. The investment team is evaluating a potential majority investment, with diligence focused on the sustainability of commercial growth, financial assumptions and selected regulatory milestones. Recent evidence has increased the overall diligence assessment to Amber, with three material issues currently requiring investment-team attention.
            </p>
          </motion.section>

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4 text-white">
              Investment Thesis
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              The opportunity is underpinned by an established commercial platform, specialist market positioning and potential for continued organic growth. The investment case assumes further expansion across existing products and selected pipeline opportunities. Current diligence is focused on validating the durability of that growth and the downside resilience of the base case.
            </p>
          </motion.section>

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4 text-white">
              Key Risks
            </h2>
            <p className="text-xs text-muted-foreground mb-4 italic">
              Current Watchtower findings — 3 active material signals
            </p>
            <ul className="space-y-4">
              <RiskItem
                title="Customer Concentration"
                description="Latest evidence indicates the largest customer represents 31% of Q2 revenue versus 18% previously understood."
              />
              <RiskItem
                title="Growth Assumptions"
                description="FY27 base-case revenue growth of 14% is above the latest annualised trading run-rate of approximately 8%."
              />
              <RiskItem
                title="Regulatory Timing"
                description="Latest evidence suggests a key regulatory milestone may occur in Q2 2027 rather than Q1 2027."
              />
            </ul>
          </motion.section>

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4 text-white">
              Diligence Status
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Diligence is in progress across commercial, financial, regulatory, legal, technology and management workstreams. Commercial and financial workstreams are active, with three material signals currently under investigation. Legal, technology and management workstreams show no material changes at this stage.
            </p>
          </motion.section>

        </div>
      </div>
    </div>
  );
}
