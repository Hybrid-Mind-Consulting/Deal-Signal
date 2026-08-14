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
    description: 'Competitor filed a continuation patent that could marginally intersect with NovaCura’s secondary delivery mechanism.',
    timestamp: '10 Aug 2026, 14:00',
  },
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
