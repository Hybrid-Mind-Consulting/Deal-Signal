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
  Shield,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DATA_SOURCES } from '@/data/mock';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Category = 'Management' | 'Financial' | 'Commercial' | 'Regulatory';

const CATEGORY_ORDER: Category[] = ['Management', 'Financial', 'Commercial', 'Regulatory'];

const CATEGORY_COLORS: Record<Category, string> = {
  Management: 'bg-primary/8 text-primary border-primary/20',
  Financial:  'bg-[hsl(160,84%,39%,0.08)] text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%,0.2)]',
  Commercial: 'bg-[hsl(38,92%,50%,0.08)] text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%,0.2)]',
  Regulatory: 'bg-muted text-muted-foreground border-border',
};

function sourceIcon(name: string) {
  const lower = name.toLowerCase();
  if (
    lower.includes('model') ||
    lower.includes('accounts') ||
    lower.includes('analysis') ||
    lower.includes('revenue')
  )
    return FileSpreadsheet;
  return FileText;
}

// ─── Summary strip ────────────────────────────────────────────────────────────

function SummaryStrip() {
  const stats = [
    { label: 'Sources monitored', value: '42', icon: Database },
    { label: 'Updated today',     value: '5',  icon: RefreshCw },
    { label: 'Material signals',  value: '3',  icon: AlertTriangle },
  ];
  return (
    <div className="flex items-center gap-4 mb-7">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-card-border"
        >
          <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-lg font-bold text-foreground leading-none">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        Last refresh: 14 Aug 2026, 14:32
      </div>
    </div>
  );
}

// ─── Source row ───────────────────────────────────────────────────────────────

function SourceRow({
  source,
  index,
}: {
  source: (typeof DATA_SOURCES)[number];
  index: number;
}) {
  const [, navigate] = useLocation();
  const Icon = sourceIcon(source.name);
  const catCls = CATEGORY_COLORS[source.category];

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'group transition-colors',
        source.highlight
          ? 'bg-[hsl(0,84%,60%,0.04)] hover:bg-[hsl(0,84%,60%,0.07)]'
          : 'hover:bg-muted/30',
      )}
    >
      {/* Name */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          {/* Highlight indicator */}
          {source.highlight && (
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[hsl(0,84%,60%)] animate-pulse" />
          )}
          <div
            className={cn(
              'flex-shrink-0 w-7 h-7 rounded bg-muted border border-border flex items-center justify-center',
              source.highlight && 'border-[hsl(0,84%,60%,0.3)] bg-[hsl(0,84%,60%,0.08)]',
            )}
          >
            <Icon
              className={cn(
                'w-3.5 h-3.5',
                source.highlight ? 'text-[hsl(0,84%,60%)]' : 'text-muted-foreground',
              )}
            />
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                'text-sm font-medium truncate',
                source.highlight ? 'text-foreground' : 'text-foreground',
              )}
            >
              {source.name}
            </p>
            {source.highlight && (
              <p className="text-[10px] text-[hsl(0,84%,60%)] mt-0.5 font-medium">
                Triggered high-priority signal
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span
          className={cn(
            'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border',
            catCls,
          )}
        >
          {source.category}
        </span>
      </td>

      {/* Last updated */}
      <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono text-muted-foreground">
        {source.updatedAt}
      </td>

      {/* Status */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%,0.3)] bg-[hsl(160,84%,39%,0.08)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(160,84%,39%)]" />
          Monitored
        </span>
      </td>

      {/* Signals */}
      <td className="px-5 py-3.5 whitespace-nowrap text-center">
        {source.signals > 0 ? (
          <span
            className={cn(
              'text-xs font-bold px-2 py-0.5 rounded',
              source.highlight
                ? 'text-[hsl(0,84%,60%)] bg-[hsl(0,84%,60%,0.1)] border border-[hsl(0,84%,60%,0.25)]'
                : 'text-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%,0.1)] border border-[hsl(38,92%,50%,0.2)]',
            )}
          >
            {source.signals}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      {/* View linked signals */}
      <td className="px-5 py-3.5 whitespace-nowrap text-right">
        {source.signals > 0 ? (
          <button
            onClick={() =>
              source.highlight
                ? navigate('/signals/customer-concentration')
                : navigate('/signals')
            }
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity"
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

function CategoryGroup({
  category,
  sources,
  startIndex,
}: {
  category: Category;
  sources: (typeof DATA_SOURCES);
  startIndex: number;
}) {
  if (sources.length === 0) return null;
  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      {/* Group header */}
      <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
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

      <div className="space-y-5">
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
