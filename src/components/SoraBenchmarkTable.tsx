import React from 'react';
import { SoraRate, SoraTenor } from '../types';
import {
  TrendingUp,
  TrendingDown,
  LineChart,
  Download,
  Info,
  Building2,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { exportToCsv } from '../utils/exportUtils';

interface SoraBenchmarkTableProps {
  soraRates: SoraRate[];
  selectedTenor: SoraTenor | 'all';
  onSelectTenor: (tenor: SoraTenor | 'all') => void;
}

interface SoraDetailedMetadata {
  tenor: SoraTenor;
  code: string;
  name: string;
  dayCount: string;
  volumeInfo: string;
  fixingSchedule: string;
  marketUsage: string;
  methodology: string;
  low30D: number;
  high30D: number;
}

const SORA_METADATA: Record<SoraTenor, SoraDetailedMetadata> = {
  overnight: {
    tenor: 'overnight',
    code: 'SORA-O/N',
    name: 'SORA Overnight Rate',
    dayCount: 'Actual/365 (Singapore Business Day)',
    volumeInfo: 'S$ 4.28 Billion (Daily Interbank)',
    fixingSchedule: 'Next Business Day, 09:00 SGT',
    marketUsage: 'SGD Overnight Index Swaps (OIS), Base for Compounded Rates, Derivatives',
    methodology: 'Volume-weighted trimmed mean of unsecured overnight SGD interbank transactions',
    low30D: 3.42,
    high30D: 3.68,
  },
  '1m': {
    tenor: '1m',
    code: 'SORA-1M',
    name: '1-Month Compounded SORA',
    dayCount: '30-Day Calendar Lookback Compounded',
    volumeInfo: 'Derived from Daily SORA Transactions',
    fixingSchedule: 'Daily, 09:00 SGT',
    marketUsage: '1-Month Floating Mortgages, SME Working Capital Facilities, Commercial Paper',
    methodology: 'Compounded in arrears over preceding 30 calendar days',
    low30D: 3.48,
    high30D: 3.62,
  },
  '3m': {
    tenor: '3m',
    code: 'SORA-3M',
    name: '3-Month Compounded SORA',
    dayCount: '90-Day Calendar Lookback Compounded',
    volumeInfo: 'Derived from Daily SORA Transactions',
    fixingSchedule: 'Daily, 09:00 SGT',
    marketUsage: 'Most Common Singapore Floating Home Loans (DBS, OCBC, UOB), Commercial Loans',
    methodology: 'Compounded in arrears over preceding 90 calendar days',
    low30D: 3.52,
    high30D: 3.65,
  },
  '6m': {
    tenor: '6m',
    code: 'SORA-6M',
    name: '6-Month Compounded SORA',
    dayCount: '180-Day Calendar Lookback Compounded',
    volumeInfo: 'Derived from Daily SORA Transactions',
    fixingSchedule: 'Daily, 09:00 SGT',
    marketUsage: 'Semi-annual Corporate Facilities, Project Finance, Bilateral Bank Loans',
    methodology: 'Compounded in arrears over preceding 180 calendar days',
    low30D: 3.55,
    high30D: 3.68,
  },
  index: {
    tenor: 'index',
    code: 'SORA-INDEX',
    name: 'SORA Compounded Index',
    dayCount: 'Base 10,000 on 3 Jan 2020',
    volumeInfo: 'Standardized Cumulative Unit',
    fixingSchedule: 'Daily, 09:00 SGT',
    marketUsage: 'Standardized calculation of compounded interest across bespoke contractual dates',
    methodology: 'Cumulative index reflecting daily compounding of SORA since inception',
    low30D: 116.85,
    high30D: 118.22,
  },
};

export const SoraBenchmarkTable: React.FC<SoraBenchmarkTableProps> = ({
  soraRates,
  selectedTenor,
  onSelectTenor,
}) => {
  const handleExportCsv = () => {
    const exportRows = soraRates.map((rate) => {
      const meta = SORA_METADATA[rate.tenor] || SORA_METADATA.overnight;
      return {
        tenor: rate.tenor,
        code: meta.code,
        name: rate.name,
        rate: rate.rateFormatted,
        changeBps: `${rate.changeBps >= 0 ? '+' : ''}${rate.changeBps} bps`,
        dayCount: meta.dayCount,
        fixingSchedule: meta.fixingSchedule,
        marketUsage: meta.marketUsage,
        volume: rate.volumeSgdBillions ? `S$ ${rate.volumeSgdBillions}B` : 'Derived',
        methodology: meta.methodology,
        asOf: rate.publishTime || 'Daily 09:00 SGT',
      };
    });

    exportToCsv(
      exportRows,
      `mas-sora-rates-${new Date().toISOString().split('T')[0]}.csv`,
      [
        { key: 'code', label: 'Benchmark Code' },
        { key: 'name', label: 'Tenor Name' },
        { key: 'rate', label: 'Published Rate' },
        { key: 'changeBps', label: '1-Day Change' },
        { key: 'dayCount', label: 'Day Count Convention' },
        { key: 'volume', label: 'Transaction Volume' },
        { key: 'marketUsage', label: 'Common Singapore Market Application' },
        { key: 'fixingSchedule', label: 'Fixing Publication' },
        { key: 'methodology', label: 'Calculation Methodology' },
        { key: 'asOf', label: 'As Of Date' },
      ]
    );
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden mb-8">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              SORA Benchmark Reference Rates & Methodology
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              MAS Administered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Published daily by the Monetary Authority of Singapore at 09:00 SGT (T+1 convention)
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0 self-start md:self-auto"
          title="Download SORA Rates Specification as CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export SORA CSV</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4">Tenor & Code</th>
              <th className="py-3 px-3 text-right">Published Rate</th>
              <th className="py-3 px-3 text-right">1-Day Change</th>
              <th className="py-3 px-3 text-center hidden md:table-cell">30-Day Range</th>
              <th className="py-3 px-3 hidden lg:table-cell">Daily Volume / Base</th>
              <th className="py-3 px-4 hidden xl:table-cell">Singapore Market Application</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {soraRates.map((rate) => {
              const meta = SORA_METADATA[rate.tenor] || SORA_METADATA.overnight;
              const isSelected = selectedTenor === rate.tenor;
              const isPositive = rate.changeBps >= 0;

              return (
                <tr
                  key={rate.tenor}
                  className={`hover:bg-slate-50 transition-colors ${
                    isSelected ? 'bg-emerald-50/50 font-medium' : ''
                  }`}
                >
                  {/* Tenor & Code */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {rate.code}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{rate.name}</span>
                          <span className="text-[10px] font-mono text-slate-500 font-semibold px-1.5 py-0.2 bg-slate-100 rounded">
                            {meta.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {meta.dayCount}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Rate */}
                  <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900 text-sm sm:text-base">
                    {rate.rateFormatted}
                  </td>

                  {/* 1-Day Change */}
                  <td className="py-3.5 px-3 text-right font-mono">
                    <div
                      className={`inline-flex items-center gap-1 font-bold text-xs ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        {isPositive ? '+' : ''}
                        {rate.changeBps} bps
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isPositive ? '+' : ''}
                      {rate.changePct.toFixed(2)}%
                    </div>
                  </td>

                  {/* 30D Range */}
                  <td className="py-3.5 px-3 text-center hidden md:table-cell font-mono text-[11px] text-slate-600">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                      <span>{meta.low30D.toFixed(2)}%</span>
                      <span className="text-slate-300">—</span>
                      <span>{meta.high30D.toFixed(2)}%</span>
                    </div>
                  </td>

                  {/* Daily Volume */}
                  <td className="py-3.5 px-3 hidden lg:table-cell text-slate-600 text-xs">
                    {rate.volumeSgdBillions ? (
                      <span className="font-mono font-bold text-slate-800">
                        S$ {rate.volumeSgdBillions} Billion
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium">
                        {meta.volumeInfo}
                      </span>
                    )}
                  </td>

                  {/* Market Application */}
                  <td className="py-3.5 px-4 hidden xl:table-cell text-slate-600 text-[11px] max-w-xs">
                    <span className="line-clamp-2 leading-relaxed">
                      {meta.marketUsage}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        onSelectTenor(rate.tenor);
                        document.getElementById('market-historical-chart-container')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        });
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                      title={`Plot ${rate.name} in historical chart`}
                    >
                      <LineChart className="w-3.5 h-3.5" />
                      <span>Chart</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SORA Explanatory Notes & MAS Fixing Guidelines */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-900 mb-0.5">
              Why SORA is Used for Singapore Floating Mortgages
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Unlike forward-looking benchmarks (such as discontinued SOR or SIBOR), SORA is computed from actual, transparent, and audited overnight borrowing transactions among banks in Singapore, making it robust against market manipulation.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-900 mb-0.5">
              Compounded in Arrears Convention
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              1-Month, 3-Month, and 6-Month Compounded SORA smooth out short-term spikes and month-end liquidity fluctuations, providing borrowers with predictable and stable interest rate payments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
