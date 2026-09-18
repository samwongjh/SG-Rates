import React from 'react';
import { SoraRate, SoraTenor } from '../types';
import { TrendingUp, TrendingDown, Info, ArrowUpRight, BarChart2 } from 'lucide-react';

interface SoraOverviewCardsProps {
  soraRates: SoraRate[];
  selectedTenor: SoraTenor | 'all';
  onSelectTenor: (tenor: SoraTenor | 'all') => void;
}

export const SoraOverviewCardSection: React.FC<SoraOverviewCardsProps> = ({
  soraRates,
  selectedTenor,
  onSelectTenor,
}) => {
  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Singapore Overnight Rate Average (SORA)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              MAS Published (T+1)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Key benchmark interest rates administered by the Monetary Authority of Singapore
          </p>
        </div>

        <button
          onClick={() => onSelectTenor('all')}
          className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto border ${
            selectedTenor === 'all'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-2xs'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Compare All SORA Tenors</span>
        </button>
      </div>

      {/* Grid of SORA Tenor cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {soraRates.map((item) => {
          const isSelected = selectedTenor === item.tenor;
          const isPositive = item.changeBps >= 0;

          return (
            <div
              key={item.tenor}
              id={`sora-card-${item.tenor}`}
              onClick={() => onSelectTenor(item.tenor)}
              className={`relative bg-white rounded-xl p-4 border transition-all cursor-pointer text-left shadow-2xs hover:shadow-md ${
                isSelected
                  ? 'border-red-600 ring-2 ring-red-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header with name and tenor badge */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  {item.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {item.code}
                </span>
              </div>

              {/* Main rate value */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900">
                  {item.rateFormatted}
                </span>
              </div>

              {/* Change indicator */}
              <div className="flex items-center justify-between text-xs mb-3">
                <div
                  className={`inline-flex items-center gap-1 font-semibold text-[11px] px-1.5 py-0.5 rounded ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {item.changeBps.toFixed(1)} bps
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 font-medium">
                  {item.tenor === 'overnight' && item.volumeSgdBillions
                    ? `Vol: S$${item.volumeSgdBillions}B`
                    : 'Daily Roll'}
                </span>
              </div>

              {/* Description preview */}
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                {item.description}
              </p>

              {/* Footer action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Click to view trend</span>
                <ArrowUpRight
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-red-600' : 'text-slate-400'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
