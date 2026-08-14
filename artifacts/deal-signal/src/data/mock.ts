export interface Deal {
  id: string;
  name: string;
  sector: string;
  stage: string;
  status: 'Green' | 'Amber' | 'Red';
  materialSignals: number;
  openActions: number;
  sourcesMonitored: number;
  lastUpdated: string;
}

export const DEALS: Deal[] = [
  {
    id: 'novacura-therapeutics',
    name: 'NovaCura Therapeutics',
    sector: 'Specialty Pharma',
    stage: 'Diligence',
    status: 'Amber',
    materialSignals: 3,
    openActions: 7,
    sourcesMonitored: 42,
    lastUpdated: '14 Aug 2026, 14:32',
  },
  {
    id: 'medicore-diagnostics',
    name: 'MediCore Diagnostics',
    sector: 'Diagnostics',
    stage: 'Early Diligence',
    status: 'Green',
    materialSignals: 0,
    openActions: 3,
    sourcesMonitored: 27,
    lastUpdated: '14 Aug 2026, 13:48',
  },
  {
    id: 'vantage-bio',
    name: 'Vantage Bio',
    sector: 'Biotechnology',
    stage: 'Confirmatory Diligence',
    status: 'Red',
    materialSignals: 5,
    openActions: 11,
    sourcesMonitored: 61,
    lastUpdated: '14 Aug 2026, 14:05',
  },
];

export interface Signal {
  id: string;
  type: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  timestamp: string;
}

export const SIGNALS: Signal[] = [
  {
    id: 'sig-1',
    type: 'Regulatory Risk',
    severity: 'High',
    description: 'FDA indicates delay in PDUFA date for lead asset NCT-440 due to manufacturing facility inspection findings.',
    timestamp: '14 Aug 2026, 11:20',
  },
  {
    id: 'sig-2',
    type: 'Financial Discrepancy',
    severity: 'Medium',
    description: 'Q2 interim unaudited figures reflect a 14% deviation in projected COGS for the biologics segment compared to management presentation.',
    timestamp: '13 Aug 2026, 16:45',
  },
  {
    id: 'sig-3',
    type: 'Management Change',
    severity: 'Medium',
    description: 'Chief Medical Officer Dr. Aris Thorne submitted resignation. Not yet publicly disclosed.',
    timestamp: '12 Aug 2026, 09:15',
  },
  {
    id: 'sig-4',
    type: 'IP Litigation',
    severity: 'Low',
    description: "Competitor filed a continuation patent that could marginally intersect with NovaCura's secondary delivery mechanism.",
    timestamp: '10 Aug 2026, 14:00',
  },
];

// Watchtower-specific material signals for NovaCura
export interface MaterialSignal {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  status: 'New' | 'Updated' | 'Resolved';
  title: string;
  summary: string;
  previousLabel: string;
  previousValue: string;
  latestLabel: string;
  latestValue: string;
  materiality: 'High' | 'Medium' | 'Low';
  confidence: number;
  detected: string;
  sources: string[];
  recommendedAction: string;
}

export const MATERIAL_SIGNALS: MaterialSignal[] = [
  {
    id: 'ms-1',
    priority: 'HIGH',
    category: 'Commercial',
    status: 'New',
    title: 'Customer concentration has increased materially',
    summary: 'The largest customer now represents 31% of Q2 revenue, versus 18% stated in the management presentation.',
    previousLabel: 'Previous understanding',
    previousValue: '18%',
    latestLabel: 'Latest evidence',
    latestValue: '31%',
    materiality: 'High',
    confidence: 94,
    detected: '14 Aug 2026, 14:27',
    sources: ['Management Presentation — May 2026', 'July Management Accounts — Aug 2026'],
    recommendedAction: 'Validate whether the increase is seasonal or structural and request monthly customer-level revenue for the previous 24 months.',
  },
  {
    id: 'ms-2',
    priority: 'MEDIUM',
    category: 'Financial',
    status: 'Updated',
    title: 'FY27 growth assumption exceeds current run-rate',
    summary: 'The investment model assumes 14% FY27 revenue growth while the latest trading data implies an annualised run-rate closer to 8%.',
    previousLabel: 'Model assumption',
    previousValue: '14%',
    latestLabel: 'Current run-rate',
    latestValue: '8%',
    materiality: 'Medium',
    confidence: 89,
    detected: '14 Aug 2026, 13:58',
    sources: ['Investment Model v7', 'July Management Accounts', 'CFO Trading Update'],
    recommendedAction: 'Stress-test the base case at 8–10% growth and quantify the resulting EBITDA and leverage impact.',
  },
  {
    id: 'ms-3',
    priority: 'MEDIUM',
    category: 'Regulatory',
    status: 'New',
    title: 'Regulatory milestone timing is inconsistent',
    summary: 'Management guidance implies a Q1 2027 regulatory milestone, while the latest regulatory submission indicates a likely Q2 2027 decision window.',
    previousLabel: 'Management guidance',
    previousValue: 'Q1 2027',
    latestLabel: 'Latest evidence',
    latestValue: 'Q2 2027',
    materiality: 'Medium',
    confidence: 86,
    detected: '14 Aug 2026, 12:41',
    sources: ['Management Presentation', 'Regulatory Submission Update', 'Legal DD Notes'],
    recommendedAction: 'Confirm the expected decision timeline and assess the impact of a three-month delay on launch assumptions and liquidity.',
  },
];

export const DILIGENCE_COVERAGE = [
  { area: 'Commercial', status: 'Amber' as const, signals: 2, note: '2 signals' },
  { area: 'Financial', status: 'Amber' as const, signals: 1, note: '1 signal' },
  { area: 'Regulatory', status: 'Amber' as const, signals: 1, note: '1 signal' },
  { area: 'Legal', status: 'Green' as const, signals: 0, note: 'No material changes' },
  { area: 'Technology', status: 'Green' as const, signals: 0, note: 'No material changes' },
  { area: 'Management', status: 'Green' as const, signals: 0, note: 'No material changes' },
];

export const RECENT_EVIDENCE = [
  { id: 're-1', name: 'July Management Accounts.xlsx', updatedAt: 'Updated 14:22', category: 'Financial', ext: 'xlsx' },
  { id: 're-2', name: 'Regulatory Submission Update.pdf', updatedAt: 'Updated 12:34', category: 'Regulatory', ext: 'pdf' },
  { id: 're-3', name: 'CFO Trading Update.docx', updatedAt: 'Updated yesterday', category: 'Financial', ext: 'docx' },
  { id: 're-4', name: 'Commercial DD Update.pdf', updatedAt: 'Updated yesterday', category: 'Commercial', ext: 'pdf' },
  { id: 're-5', name: 'Management Presentation.pdf', updatedAt: 'Updated 8 Aug', category: 'Management', ext: 'pdf' },
];

export const WATCHTOWER_ACTIVITY = [
  { id: 'wa-1', time: '14:27', description: 'New commercial signal detected' },
  { id: 'wa-2', time: '14:25', description: 'July Management Accounts analysed' },
  { id: 'wa-3', time: '13:58', description: 'Financial signal updated' },
  { id: 'wa-4', time: '12:41', description: 'Regulatory signal detected' },
  { id: 'wa-5', time: '12:38', description: 'New regulatory evidence processed' },
];

export const ANALYSIS_EVENTS = [
  {
    id: 'evt-1',
    type: 'Ingestion',
    description: 'Source ingested: FDA PDUFA calendar update (Batch #9921)',
    timestamp: '14 Aug 2026, 11:15',
  },
  {
    id: 'evt-2',
    type: 'Detection',
    description: 'Signal detected: Pipeline asset schedule reclassification (NCT-440)',
    timestamp: '14 Aug 2026, 11:18',
  },
  {
    id: 'evt-3',
    type: 'Cross-Reference',
    description: 'Cross-reference check completed: 3 internal management sources and 2 regulatory databases',
    timestamp: '14 Aug 2026, 11:20',
  },
  {
    id: 'evt-4',
    type: 'Alert',
    description: 'Alert dispatched to Deal Team (Sector Lead, Diligence Director)',
    timestamp: '14 Aug 2026, 11:21',
  },
];

export const DATA_SOURCES = [
  { id: 'ds-1', name: 'FDA CDER Database', type: 'Regulatory', status: 'Active', lastSync: '10 mins ago' },
  { id: 'ds-2', name: 'ClinicalTrials.gov', type: 'Registry', status: 'Active', lastSync: '12 mins ago' },
  { id: 'ds-3', name: 'SEC EDGAR Real-Time', type: 'Filings', status: 'Active', lastSync: '2 mins ago' },
  { id: 'ds-4', name: 'Global BioPharma News Wire', type: 'News Feed', status: 'Active', lastSync: '1 min ago' },
  { id: 'ds-5', name: 'Internal VDR (Intralinks)', type: 'Document Room', status: 'Active', lastSync: '45 mins ago' },
  { id: 'ds-6', name: 'USPTO Patent Bulk Data', type: 'IP', status: 'Pending', lastSync: '4 hrs ago' },
];
