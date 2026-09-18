export type CurrencyCategory = 'major' | 'regional' | 'other';

export interface CurrencyRate {
  code: string; // e.g. 'USD'
  name: string; // e.g. 'US Dollar'
  country: string;
  flag: string; // emoji flag
  unit: number; // 1 or 100
  bid: number;
  ask: number;
  mid: number;
  change: number;
  changePct: number;
  high24h: number;
  low24h: number;
  category: CurrencyCategory;
  updatedAt: string;
  sparkline: number[];
}

export type SoraTenor = 'overnight' | '1m' | '3m' | '6m' | 'index';

export interface SoraRate {
  tenor: SoraTenor;
  code: string;
  name: string;
  rate: number; // percentage e.g. 3.48 for 3.48% (or index value for 'index')
  rateFormatted: string;
  changeBps: number; // basis points, e.g. +2.5 bps
  changePct: number;
  volumeSgdBillions?: number;
  calculationType: string;
  publishTime: string;
  description: string;
  sparkline: number[];
}

export interface HistoricalRatePoint {
  date: string; // YYYY-MM-DD
  label: string; // '15 Sep'
  timestamp: number;
  // Dynamic fields depending on active chart series
  value?: number;
  soraOvernight?: number;
  sora1M?: number;
  sora3M?: number;
  sora6M?: number;
  soraIndex?: number;
  volume?: number;
  ma30?: number;
  [key: string]: string | number | undefined;
}

export type TimeRange = '7D' | '1M' | '3M' | '6M' | '1Y' | '3Y' | 'ALL';

export type ChartType = 'sora' | 'currency';

export interface SearchResultItem {
  id: string;
  type: 'currency' | 'sora';
  title: string;
  subtitle: string;
  valueDisplay: string;
  changePct: number;
  tag: string;
  code: string;
  category?: CurrencyCategory | 'sora';
  originalData?: CurrencyRate | SoraRate;
}

export interface ApiEndpointConfig {
  mode: 'simulated' | 'custom';
  customUrl: string;
  apiKey?: string;
  lastSync: string;
  status: 'connected' | 'idle' | 'error';
}
