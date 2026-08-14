import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { motion } from 'framer-motion';

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
        <div className="space-y-10 text-card-foreground">
          
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4 text-white">Executive Summary</h2>
            <p className="text-muted-foreground leading-relaxed">
              NovaCura Therapeutics is a clinical-stage specialty pharmaceutical company focused on targeted biologics for severe autoimmune indications. The company’s lead asset, NCT-440, has demonstrated superior efficacy profiles in Phase 2b trials compared to standard-of-care. Management is seeking a $150M Series C round to fund Phase 3 initiation and expand manufacturing capacity at their North Carolina facility.
            </p>
          </motion.section>

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4 text-white">Investment Thesis</h2>
            <p className="text-muted-foreground leading-relaxed">
              Acquisition of a controlling stake provides entry into a $4.2B addressable market with high barriers to entry and limited generic competition. NovaCura’s proprietary liposomal delivery platform presents significant platform value beyond the lead asset, potentially enabling rapid pipeline expansion. Conservative base-case modeling projects 4.5x MOIC assuming regulatory approval within 24 months.
            </p>
          </motion.section>

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4 text-white">Key Risks</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2 leading-relaxed marker:text-border">
              <li><strong>Regulatory Timelines:</strong> PDUFA date for NCT-440 faces potential 6-month delay due to outstanding FDA manufacturing queries from recent inspection.</li>
              <li><strong>Margin Compression:</strong> Escalating raw material costs in biologic scale-up could suppress gross margins by 800bps in year 1 of commercialization.</li>
              <li><strong>Key Personnel:</strong> Deep reliance on the founding Chief Medical Officer; succession planning is currently inadequate.</li>
            </ul>
          </motion.section>

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4 text-white">Diligence Status</h2>
            <p className="text-muted-foreground leading-relaxed">
              Commercial and clinical diligence substantially complete. Financial diligence is ongoing with Q2 interim figures under review. Legal IP diligence triggered an amber flag regarding a competitor's continuation patent; outside counsel is drafting a freedom-to-operate opinion expected next Tuesday.
            </p>
          </motion.section>

        </div>
      </div>
    </div>
  );
}
