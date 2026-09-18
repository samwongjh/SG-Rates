import React, { useState } from 'react';
import { CurrencyRate, CurrencyCategory } from '../types';
import {
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  LineChart,
  Repeat,
  Download,
  Filter,
} from 'lucide-react';
import { exportToCsv } from '../utils/exportUtils';

interface FxRatesTableProps {
  currencies: CurrencyRate[];
  selectedCurrency: string;
  onSelectCurrency: (code: string) => void;
  onOpenConverterWithCurrency?: (code: string) => void;
}

type SortField = 'code' | 'name' | 'mid' | 'changePct';
type SortDirection = 'asc' | 'desc';

export const FxRatesTable: React.FC<FxRatesTableProps> = ({
  currencies,
  selectedCurrency,
  onSelectCurrency,
  onOpenConverterWithCurrency,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'major' | 'regional' | 'gainers' | 'decliners'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredCurrencies = currencies
    .filter((c) => {
      // Category filter
      if (activeCategory === 'major' && c.category !== 'major') return false;
      if (activeCategory === 'regional' && c.category !== 'regional') return false;
      if (activeCategory === 'gainers' && c.changePct <= 0) return false;
      if (activeCategory === 'decliners' && c.changePct >= 0) return false;

      // Text search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'code') comparison = a.code.localeCompare(b.code);
      else if (sortField === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortField === 'mid') comparison = a.mid - b.mid;
      else if (sortField === 'changePct') comparison = a.changePct - b.changePct;
      return sortDir === 'asc' ? comparison : -comparison;
    });

  const handleExportCsv = () => {
    exportToCsv(
      filteredCurrencies,
      `singapore-exchange-rates-${new Date().toISOString().split('T')[0]}.csv`,
      [
        { key: 'code', label: 'Currency Code' },
        { key: 'name', label: 'Currency Name' },
        { key: 'unit', label: 'Unit' },
        { key: 'bid', label: 'Bid (SGD)' },
        { key: 'ask', label: 'Ask (SGD)' },
        { key: 'mid', label: 'Mid Rate (SGD)' },
        { key: 'change', label: '24h Change' },
        { key: 'changePct', label: '24h Change %' },
        { key: 'high24h', label: '24h High' },
        { key: 'low24h', label: '24h Low' },
        { key: 'updatedAt', label: 'Last Updated' },
      ]
    );
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden mb-8">
      {/* Header & Category Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Daily Singapore Exchange Rates (SGD)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Indicative Interbank FX
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rates quoted in Singapore Dollars (SGD) per 1 or 100 foreign currency units
          </p>
        </div>

        {/* Search & Export Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by code or name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0"
            title="Download FX Rates as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between overflow-x-auto gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'All Currencies' },
            { id: 'major', label: 'Major (G10)' },
            { id: 'regional', label: 'ASEAN & Regional' },
            { id: 'gainers', label: 'Gainers' },
            { id: 'decliners', label: 'Decliners' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1 rounded-md font-medium text-xs whitespace-nowrap transition-colors ${
                activeCategory === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 font-medium hidden sm:block shrink-0">
          Showing {filteredCurrencies.length} of {currencies.length} pairs
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('code')}>
                <div className="flex items-center gap-1">
                  <span>Currency</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Unit</th>
              <th className="py-3 px-3 text-right">Bid</th>
              <th className="py-3 px-3 text-right">Ask</th>
              <th
                className="py-3 px-3 text-right cursor-pointer select-none"
                onClick={() => handleSort('mid')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Mid Rate (SGD)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer select-none"
                onClick={() => handleSort('changePct')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>24h Change</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center hidden md:table-cell">Day&apos;s Range</th>
              <th className="py-3 px-3 text-center hidden lg:table-cell">7D Trend</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCurrencies.map((currency) => {
              const isSelected = selectedCurrency === currency.code;
              const isPositive = currency.changePct >= 0;
              const precision = currency.unit === 100 && currency.mid < 0.1 ? 5 : 4;

              // Range position calculation
              const rangeDiff = currency.high24h - currency.low24h;
              const rangePct = rangeDiff > 0 ? ((currency.mid - currency.low24h) / rangeDiff) * 100 : 50;

              return (
                <tr
                  key={currency.code}
                  className={`hover:bg-slate-50 transition-colors ${
                    isSelected ? 'bg-blue-50/50 font-medium' : ''
                  }`}
                >
                  {/* Currency Name & Flag */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl shrink-0 select-none" role="img" aria-label={currency.country}>
                        {currency.flag}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{currency.code}</span>
                          <span className="text-slate-400">/</span>
                          <span className="text-slate-500 font-medium">SGD</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[120px] sm:max-w-[160px]">
                          {currency.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Unit */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        currency.unit === 100
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {currency.unit === 100 ? 'per 100' : 'per 1'}
                    </span>
                  </td>

                  {/* Bid */}
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {currency.bid.toFixed(precision)}
                  </td>

                  {/* Ask */}
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {currency.ask.toFixed(precision)}
                  </td>

                  {/* Mid Rate */}
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                    {currency.mid.toFixed(precision)}
                  </td>

                  {/* Change */}
                  <td className="py-3 px-3 text-right">
                    <div
                      className={`inline-flex items-center gap-1 font-semibold text-xs ${
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
                        {currency.changePct.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {isPositive ? '+' : ''}
                      {currency.change.toFixed(precision)}
                    </div>
                  </td>

                  {/* 24h Range Bar */}
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="w-32 mx-auto">
                      <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                        <span>{currency.low24h.toFixed(precision)}</span>
                        <span>{currency.high24h.toFixed(precision)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden relative">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, rangePct))}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Sparkline */}
                  <td className="py-3 px-3 text-center hidden lg:table-cell">
                    <div className="w-20 h-6 mx-auto flex items-center justify-center">
                      <svg className="w-20 h-6 overflow-visible" viewBox="0 0 100 24">
                        {(() => {
                          const min = Math.min(...currency.sparkline);
                          const max = Math.max(...currency.sparkline);
                          const range = max - min || 1;
                          const points = currency.sparkline
                            .map((val, idx) => {
                              const x = (idx / (currency.sparkline.length - 1)) * 100;
                              const y = 20 - ((val - min) / range) * 16;
                              return `${x},${y}`;
                            })
                            .join(' ');
                          return (
                            <polyline
                              fill="none"
                              stroke={isPositive ? '#16a34a' : '#e11d48'}
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={points}
                            />
                          );
                        })()}
                      </svg>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          onSelectCurrency(currency.code);
                          // Scroll smoothly to chart
                          document.getElementById('market-historical-chart-container')?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          });
                        }}
                        className={`p-1.5 rounded-md transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                        title="View Historical Trend"
                      >
                        <LineChart className="w-3.5 h-3.5" />
                      </button>

                      {onOpenConverterWithCurrency && (
                        <button
                          onClick={() => onOpenConverterWithCurrency(currency.code)}
                          className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Convert Currency"
                        >
                          <Repeat className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Notes */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Note on Quoting:</span>
          <span>Currencies marked &apos;per 100&apos; (e.g. JPY, MYR, THB, IDR, INR) reflect standard Singapore interbank quotation conventions.</span>
        </div>
        <span className="text-slate-400 font-mono">Quotes refreshed at 17:00 SGT</span>
      </div>
    </section>
  );
};
