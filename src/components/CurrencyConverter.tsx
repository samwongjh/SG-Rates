import React, { useState, useEffect } from 'react';
import { CurrencyRate } from '../types';
import { ArrowRightLeft, DollarSign, Calculator, Info, Star } from 'lucide-react';

interface CurrencyConverterProps {
  currencies: CurrencyRate[];
  defaultCurrencyCode?: string;
  bookmarkedCurrencies?: string[];
  onToggleBookmark?: (code: string) => void;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  currencies,
  defaultCurrencyCode = 'USD',
  bookmarkedCurrencies = [],
  onToggleBookmark,
}) => {
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(defaultCurrencyCode);
  const [amount, setAmount] = useState<number>(1000);
  const [direction, setDirection] = useState<'sgd_to_foreign' | 'foreign_to_sgd'>('sgd_to_foreign');

  // Keep updated when defaultCurrencyCode changes (e.g. from table action)
  useEffect(() => {
    if (defaultCurrencyCode && currencies.some((c) => c.code === defaultCurrencyCode)) {
      setSelectedCurrencyCode(defaultCurrencyCode);
    }
  }, [defaultCurrencyCode, currencies]);

  const currency = currencies.find((c) => c.code === selectedCurrencyCode) || currencies[0];
  const isBookmarked = bookmarkedCurrencies.includes(currency.code);

  // Calculation taking into account unit (1 or 100)
  const unitFactor = currency.unit;
  const ratePerSingleUnit = currency.mid / unitFactor;

  const convertedResult =
    direction === 'sgd_to_foreign'
      ? amount / ratePerSingleUnit
      : amount * ratePerSingleUnit;

  // Typical bank retail spread (+1.5% markup)
  const retailResult =
    direction === 'sgd_to_foreign'
      ? convertedResult * 0.985 // retail bank gives less foreign currency
      : convertedResult * 1.015; // retail bank charges more SGD

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Instant Currency Converter
              </h3>
              <p className="text-[11px] text-slate-500">Live Singapore Interbank SGD rates</p>
            </div>
          </div>

          <button
            onClick={() =>
              setDirection(
                direction === 'sgd_to_foreign' ? 'foreign_to_sgd' : 'sgd_to_foreign'
              )
            }
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Swap Conversion Direction"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>
        </div>

        {/* Bookmarked Quick Pills for fast selection */}
        {bookmarkedCurrencies.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              Watchlist:
            </span>
            {bookmarkedCurrencies.slice(0, 6).map((code) => {
              const item = currencies.find((c) => c.code === code);
              if (!item) return null;
              const isCurrent = selectedCurrencyCode === code;
              return (
                <button
                  key={code}
                  onClick={() => setSelectedCurrencyCode(code)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 border ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{item.flag}</span>
                  <span>{code}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
          {/* Input amount */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              {direction === 'sgd_to_foreign' ? 'You Pay (SGD)' : `You Pay (${currency.code})`}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full text-base font-mono font-bold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">
                {direction === 'sgd_to_foreign' ? 'SGD' : currency.code}
              </span>
            </div>
          </div>

          {/* Currency selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold uppercase text-slate-400">
                Currency Pair
              </label>
              {onToggleBookmark && (
                <button
                  onClick={() => onToggleBookmark(currency.code)}
                  className="text-[11px] font-semibold flex items-center gap-1 text-slate-500 hover:text-amber-600 transition-colors"
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark currency'}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isBookmarked
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                  <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
              )}
            </div>
            <select
              value={selectedCurrencyCode}
              onChange={(e) => setSelectedCurrencyCode(e.target.value)}
              className="w-full text-xs font-semibold text-slate-900 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} - {c.name} ({c.unit === 100 ? 'per 100' : 'per 1'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Display */}
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 mb-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {direction === 'sgd_to_foreign'
              ? `You Receive (${currency.code})`
              : 'You Receive (SGD)'}
          </div>
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
              {direction === 'sgd_to_foreign'
                ? `${currency.unit === 100 && convertedResult > 1000 ? Math.round(convertedResult).toLocaleString('en-SG') : convertedResult.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency.code}`
                : `${convertedResult.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SGD`}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              1 {currency.code} = {(currency.mid / currency.unit).toFixed(currency.unit === 100 && currency.mid < 0.1 ? 5 : 4)} SGD
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Est. Retail Bank Rate (~1.5% spread):</span>
            <span className="font-mono font-medium text-slate-700">
              {direction === 'sgd_to_foreign'
                ? `${retailResult.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency.code}`
                : `${retailResult.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SGD`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
        <Info className="w-3 h-3 text-slate-400 shrink-0" />
        <span>Calculations use Singapore wholesale mid-market rate with zero markup.</span>
      </div>
    </div>
  );
};
