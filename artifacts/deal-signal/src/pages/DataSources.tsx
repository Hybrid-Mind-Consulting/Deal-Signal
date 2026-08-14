import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Database,
  FileSpreadsheet,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DATA_SOURCES } from '@/data/mock';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Category = 'Management' | 'Financial' | 'Commercial' | 'Regulatory';

const CATEGORY_ORDER: Category[] = ['Management', 'Financial', 'Commercial', 'Regulatory'];

const CATEGORY_COLORS: Record<Category, string> = {
  Management: 'text-primary',
  Financial:  'text-[hsl(160,84%,39%)]',
  Commercial: 'text-[hsl(38,92%,50%)]',
  Regulatory: 'text-muted-foreground',
};

function sourceIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('model') || lower.includes('accounts') || lower.includes('analysis') || lower.includes('revenue'))
    return FileSpreadsheet;
  return FileText;
}

// ─── Summary strip ────────────────────────────────────────────────────────────

function SummaryStrip() {
  return (
    <div className="flex items-center gap-6 mb-8 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Database className="w-3.5 h-3.5" />
        <span className="font-medium text-foreground">42</span>
        <span>sources monitored</span>
      </div>
      <span className="text-border">·</span>
      <div className="flex items-center gap-2 text-muted-foreground">
        <RefreshCw className="w-3.5 h-3.5" />
        <span className="font-medium text-foreground">5</span>
        <span>updated today</span>
      </div>
      <span className="text-border">·</span>
      <div className="flex items-center gap-2 text-muted-foreground">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span className="font-medium text-foreground">3</span>
        <span>material signals</span>
      </div>
      <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        Last refresh: 14 Aug 2026, 14:32
      </div>
    </div>
  );
}

// ─── Source row ───────────────────────────────────────────────────────────────

function SourceRow({ source, index }: { source: (typeof DATA_SOURCES)[number]; index: number }) {
  const [, navigate] = useLocation();
  const Icon = sourceIcon(source.name);

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'group transition-colors',
        source.highlight
          ? 'bg-[hsl(0,84%,60%,0.03)] hover:bg-[hsl(0,84%,60%,0.06)]'
          : 'hover:bg-muted/20',
      )}
    >
      {/* Name */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          {source.highlight && (
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[hsl(0,84%,60%)] animate-pulse" />
          )}
          <Icon className={cn(
            'w-4 h-4 flex-shrink-0',
            source.highlight ? 'text-[hsl(0,84%,60%)]' : 'text-muted-foreground',
          )} />
          <div className="min-w-0">
            <p className="text-sm text-foreground truncate">{source.name}</p>
            {source.highlight && (
              <p className="text-[10px] text-[hsl(0,84%,60%)] mt-0.5">Triggered high-priority signal</p>
            )}
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span className={cn('text-[10px] font-medium uppercase tracking-wider', CATEGORY_COLORS[source.category])}>
          {source.category}
        </span>
      </td>

      {/* Last updated */}
      <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono text-muted-foreground">
        {source.updatedAt}
      </td>

      {/* Status */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-[10px] text-[hsl(160,84%,39%)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(160,84%,39%)]" />
          Monitored
        </div>
      </td>

      {/* Signals */}
      <td className="px-5 py-3.5 whitespace-nowrap text-center">
        {source.signals > 0 ? (
          <span className={cn(
            'text-xs font-semibold',
            source.highlight ? 'text-[hsl(0,84%,60%)]' : 'text-[hsl(38,92%,50%)]',
          )}>
            {source.signals}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </td>

      {/* View linked signals */}
      <td className="px-5 py-3.5 whitespace-nowrap text-right">
        {source.signals > 0 ? (
          <button
            onClick={() =>
              source.highlight ? navigate('/signals/customer-concentration') : navigate('/signals')
            }
            className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            View linked signals
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : null}
      </td>
    </motion.tr>
  );
}

// ─── Category group ───────────────────────────────────────────────────────────

function CategoryGroup({ category, sources, startIndex }: {
  category: Category;
  sources: typeof DATA_SOURCES;
  startIndex: number;
}) {
  if (sources.length === 0) return null;
  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <span className={cn('text-[10px] font-semibold uppercase tracking-widest', CATEGORY_COLORS[category])}>
          {category}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {sources.length} source{sources.length !== 1 ? 's' : ''}
        </span>
      </div>
      <table className="w-full text-sm text-left">
        <tbody className="divide-y divide-border">
          {sources.map((source, i) => (
            <SourceRow key={source.id} source={source} index={startIndex + i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DataSources() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    sources: DATA_SOURCES.filter((s) => s.category === cat),
  }));

  let rowIndex = 0;

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Data Sources"
        subtitle="NovaCura Therapeutics — sources monitored by Watchtower"
      />

      <SummaryStrip />

      <div className="space-y-4">
        {grouped.map(({ category, sources }) => {
          const start = rowIndex;
          rowIndex += sources.length;
          return (
            <CategoryGroup
              key={category}
              category={category}
              sources={sources}
              startIndex={start}
            />
          );
        })}
      </div>
    </div>
  );
}
