import React, { useState } from 'react';
import { CurrencyRate } from '../types';
import {
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  LineChart,
  Repeat,
  Download,
  Star,
  ChevronDown,
} from 'lucide-react';
import { exportToCsv } from '../utils/exportUtils';

interface FxRatesTableProps {
  currencies: CurrencyRate[];
  selectedCurrency: string;
  onSelectCurrency: (code: string) => void;
  onOpenConverterWithCurrency?: (code: string) => void;
  favouriteCurrencies?: string[];
  onToggleFavourite?: (code: string) => void;
  // Legacy aliases for backward compatibility
  bookmarkedCurrencies?: string[];
  onToggleBookmark?: (code: string) => void;
}

type SortField = 'code' | 'name' | 'mid' | 'changePct';
type SortDirection = 'asc' | 'desc';

export const FxRatesTable: React.FC<FxRatesTableProps> = ({
  currencies,
  selectedCurrency,
  onSelectCurrency,
  onOpenConverterWithCurrency,
  favouriteCurrencies: propFavourites,
  onToggleFavourite: propOnToggleFavourite,
  bookmarkedCurrencies,
  onToggleBookmark,
}) => {
  // Support both favouriteCurrencies and legacy bookmarkedCurrencies
  const favourites = propFavourites || bookmarkedCurrencies || [];
  const handleToggleFav = propOnToggleFavourite || onToggleBookmark || (() => {});

  // Default display tab is Favourites as requested
  const [activeCategory, setActiveCategory] = useState<
    'favourites' | 'all' | 'regional' | 'gainers' | 'decliners'
  >('favourites');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [isAllExpanded, setIsAllExpanded] = useState<boolean>(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const isFavourite = (code: string) => favourites.includes(code);

  // Filter currencies based on tab and search
  const allFilteredCurrencies = currencies
    .filter((c) => {
      // Category filter
      if (activeCategory === 'favourites' && !isFavourite(c.code)) return false;
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
      // When in 'all' and sorting by default 'code', prioritize major currencies first
      if (activeCategory === 'all' && !searchQuery.trim() && sortField === 'code' && sortDir === 'asc') {
        const aIsMajor = a.category === 'major' ? 0 : 1;
        const bIsMajor = b.category === 'major' ? 0 : 1;
        if (aIsMajor !== bIsMajor) return aIsMajor - bIsMajor;
      }

      let comparison = 0;
      if (sortField === 'code') comparison = a.code.localeCompare(b.code);
      else if (sortField === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortField === 'mid') comparison = a.mid - b.mid;
      else if (sortField === 'changePct') comparison = a.changePct - b.changePct;
      return sortDir === 'asc' ? comparison : -comparison;
    });

  // Limit to 10 major currencies if 'all' is selected and user hasn't expanded or searched
  const shouldTruncateAll = activeCategory === 'all' && !isAllExpanded && !searchQuery.trim();
  const displayCurrencies = shouldTruncateAll
    ? allFilteredCurrencies.slice(0, 10)
    : allFilteredCurrencies;

  const handleExportCsv = () => {
    exportToCsv(
      allFilteredCurrencies,
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

  const favouriteItems = currencies.filter((c) => isFavourite(c.code));

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden mb-8">
      {/* Header & Controls */}
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

      {/* Favourites Quick Ribbon */}
      {favouriteItems.length > 0 && (
        <div className="px-4 sm:px-5 py-2.5 bg-amber-50/40 border-b border-amber-100 flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 shrink-0 mr-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>Watchlist:</span>
          </div>
          <div className="flex items-center gap-2">
            {favouriteItems.map((c) => {
              const isSelected = selectedCurrency === c.code;
              const isPos = c.changePct >= 0;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    onSelectCurrency(c.code);
                    document.getElementById('market-historical-chart-container')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    });
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-800 border-amber-200 hover:border-amber-300 hover:bg-amber-100/50'
                  }`}
                  title={`Plot ${c.code} in historical chart`}
                >
                  <span role="img" aria-label={c.country} className="text-sm">
                    {c.flag}
                  </span>
                  <span>{c.code}</span>
                  <span className="font-mono text-[11px] font-bold text-slate-700">
                    {(c.mid / c.unit).toFixed(c.unit === 100 && c.mid < 0.1 ? 5 : 4)}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      isPos ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isPos ? '+' : ''}
                    {c.changePct.toFixed(2)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Tabs - Favourites first by default, Major (G10) tab removed */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between overflow-x-auto gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          {[
            {
              id: 'favourites',
              label: `★ Favourites (${favourites.length})`,
            },
            { id: 'all', label: 'All Currencies' },
            { id: 'regional', label: 'ASEAN & Regional' },
            { id: 'gainers', label: 'Gainers' },
            { id: 'decliners', label: 'Decliners' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1 rounded-md font-medium text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 font-medium hidden sm:block shrink-0">
          {activeCategory === 'all' && shouldTruncateAll
            ? `Showing 10 major of ${currencies.length} pairs`
            : `Showing ${displayCurrencies.length} of ${currencies.length} pairs`}
        </div>
      </div>

      {/* Empty state for Favourites filter */}
      {displayCurrencies.length === 0 && activeCategory === 'favourites' ? (
        <div className="py-12 px-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            No Favourite Currencies Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
            Click the star icon next to any currency in the table or under the Instant Currency Converter to add it to your favourites for quick tracking.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-2xs"
            >
              View All Currencies
            </button>
            {['USD', 'EUR', 'MYR', 'JPY'].map((code) => (
              <button
                key={code}
                onClick={() => handleToggleFav(code)}
                className="px-2.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors"
              >
                + Add {code}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-3 text-center w-10">★</th>
                <th
                  className="py-3 px-3 cursor-pointer select-none"
                  onClick={() => handleSort('code')}
                >
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
              {displayCurrencies.map((currency) => {
                const isSelected = selectedCurrency === currency.code;
                const isPositive = currency.changePct >= 0;
                const precision = currency.unit === 100 && currency.mid < 0.1 ? 5 : 4;
                const isFav = isFavourite(currency.code);

                // Range position calculation
                const rangeDiff = currency.high24h - currency.low24h;
                const rangePct =
                  rangeDiff > 0
                    ? ((currency.mid - currency.low24h) / rangeDiff) * 100
                    : 50;

                return (
                  <tr
                    key={currency.code}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-blue-50/50 font-medium' : ''
                    }`}
                  >
                    {/* Favourite Star Toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFav(currency.code);
                        }}
                        className="p-1 rounded hover:bg-slate-200 transition-colors inline-flex items-center justify-center"
                        title={
                          isFav
                            ? `Remove ${currency.code} from favourites`
                            : `Add ${currency.code} to favourites`
                        }
                      >
                        <Star
                          className={`w-4 h-4 transition-all ${
                            isFav
                              ? 'fill-amber-400 text-amber-500 scale-110'
                              : 'text-slate-300 hover:text-amber-400'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Currency Name & Flag */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="text-xl shrink-0 select-none"
                          role="img"
                          aria-label={currency.country}
                        >
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
                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-600">
                      {currency.unit}
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
                    <td className="py-3 px-3 text-right">
                      <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                        {currency.mid.toFixed(precision)}
                      </span>
                    </td>

                    {/* 24h Change */}
                    <td className="py-3 px-3 text-right">
                      <div
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono font-bold text-[11px] ${
                          isPositive
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-rose-700 bg-rose-50'
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
                    </td>

                    {/* 24h Range Bar */}
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="w-24 sm:w-28 mx-auto">
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono mb-1">
                          <span>{currency.low24h.toFixed(precision)}</span>
                          <span>{currency.high24h.toFixed(precision)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full relative overflow-hidden border border-slate-200">
                          <div
                            className={`absolute top-0 bottom-0 rounded-full ${
                              isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{
                              left: `${Math.max(0, Math.min(rangePct - 15, 70))}%`,
                              width: '30%',
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Sparkline mini chart */}
                    <td className="py-3 px-3 text-center hidden lg:table-cell">
                      <div className="w-20 h-7 mx-auto flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 80 24">
                          {(() => {
                            const pts = currency.sparkline;
                            const min = Math.min(...pts);
                            const max = Math.max(...pts);
                            const range = max - min || 1;
                            const polylinePts = pts
                              .map((p, idx) => {
                                const x = (idx / (pts.length - 1)) * 76 + 2;
                                const y = 22 - ((p - min) / range) * 20;
                                return `${x.toFixed(1)},${y.toFixed(1)}`;
                              })
                              .join(' ');

                            return (
                              <polyline
                                fill="none"
                                stroke={isPositive ? '#10b981' : '#f43f5e'}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={polylinePts}
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
      )}

      {/* Expand / Collapse toggle button when 'All Currencies' is active */}
      {activeCategory === 'all' && !searchQuery.trim() && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => setIsAllExpanded(!isAllExpanded)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors"
          >
            <span>
              {isAllExpanded
                ? 'Show Top 10 Major Currencies Only'
                : `Expand to Show All (${currencies.length}) Currencies`}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform ${
                isAllExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
          <span className="text-[11px] text-slate-500">
            {isAllExpanded
              ? `Displaying all ${currencies.length} interbank currencies`
              : `Displaying top 10 major global pairs`}
          </span>
        </div>
      )}

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
