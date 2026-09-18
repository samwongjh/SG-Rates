import React, { useState, useEffect } from 'react';
import { CurrencyRate } from '../types';
import {
  ArrowRightLeft,
  Calculator,
  Info,
  Star,
  X,
} from 'lucide-react';

interface CurrencyConverterProps {
  currencies: CurrencyRate[];
  defaultCurrencyCode?: string;
  favouriteCurrencies?: string[];
  onToggleFavourite?: (code: string) => void;
  // Backward compatibility props
  bookmarkedCurrencies?: string[];
  onToggleBookmark?: (code: string) => void;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  currencies,
  defaultCurrencyCode = 'USD',
  favouriteCurrencies: propFavourites,
  onToggleFavourite: propOnToggleFavourite,
  bookmarkedCurrencies,
  onToggleBookmark,
}) => {
  // Support both favouriteCurrencies and legacy bookmarkedCurrencies
  const favourites = propFavourites || bookmarkedCurrencies || [];
  const handleToggleFav = propOnToggleFavourite || onToggleBookmark || (() => {});

  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(defaultCurrencyCode);
  const [amount, setAmount] = useState<number>(1000);
  const [direction, setDirection] = useState<'sgd_to_foreign' | 'foreign_to_sgd'>('sgd_to_foreign');
  const [currencyToAdd, setCurrencyToAdd] = useState<string>('');

  // Keep updated when defaultCurrencyCode changes (e.g. from table action)
  useEffect(() => {
    if (defaultCurrencyCode && currencies.some((c) => c.code === defaultCurrencyCode)) {
      setSelectedCurrencyCode(defaultCurrencyCode);
    }
  }, [defaultCurrencyCode, currencies]);

  const currency = currencies.find((c) => c.code === selectedCurrencyCode) || currencies[0];
  const isCurrentFavourite = favourites.includes(currency.code);

  // Available currencies not yet in favourites for the quick add dropdown
  const unaddedCurrencies = currencies.filter((c) => !favourites.includes(c.code));

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

  const handleAddCurrencyToFavourites = (code: string) => {
    if (!code) return;
    if (!favourites.includes(code)) {
      handleToggleFav(code);
    }
    setCurrencyToAdd('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 sm:p-6 flex flex-col justify-between h-full">
      <div className="flex flex-col flex-1">
        {/* Top Header with Title and Direction Swap */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 min-h-[46px]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
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
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
            title="Swap Conversion Direction"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Swap Direction</span>
          </button>
        </div>

        {/* 1. WATCHLIST & FAVOURITE CURRENCIES AT THE TOP */}
        <div className="bg-amber-50/60 rounded-xl border border-amber-200/80 p-3 mb-4 min-h-[116px] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              </div>
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                Watchlist & Favourite Currencies
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {favourites.length}
              </span>
            </div>

            {/* Quick Add Dropdown */}
            {unaddedCurrencies.length > 0 && (
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <select
                  value={currencyToAdd}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      handleAddCurrencyToFavourites(val);
                    }
                  }}
                  className="text-xs bg-white text-slate-700 border border-amber-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs font-medium"
                >
                  <option value="">+ Add to Favourites...</option>
                  {unaddedCurrencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.name})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Favourites Chip List */}
          {favourites.length > 0 ? (
            <div className="flex items-center flex-wrap gap-1.5 max-h-[76px] overflow-y-auto pr-1">
              {favourites.map((code) => {
                const item = currencies.find((c) => c.code === code);
                if (!item) return null;
                const isSelected = selectedCurrencyCode === code;
                const isPos = item.changePct >= 0;

                return (
                  <div
                    key={code}
                    className={`inline-flex items-center rounded-lg text-xs font-semibold transition-all border shadow-2xs ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 ring-1 ring-slate-900'
                        : 'bg-white text-slate-800 border-amber-200 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    {/* Click body to select and convert */}
                    <button
                      type="button"
                      onClick={() => setSelectedCurrencyCode(code)}
                      className="px-2 py-1 flex items-center gap-1.5 text-left focus:outline-none"
                      title={`Select ${item.name} for conversion`}
                    >
                      <span role="img" aria-label={item.country} className="text-sm">
                        {item.flag}
                      </span>
                      <span className="font-bold">{code}</span>
                      <span
                        className={`text-[10px] font-mono font-normal ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {(item.mid / item.unit).toFixed(item.unit === 100 && item.mid < 0.1 ? 4 : 3)}
                      </span>
                      <span
                        className={`text-[9px] font-bold ${
                          isPos
                            ? isSelected
                              ? 'text-emerald-300'
                              : 'text-emerald-600'
                            : isSelected
                            ? 'text-rose-300'
                            : 'text-rose-600'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {item.changePct.toFixed(1)}%
                      </span>
                    </button>

                    {/* Quick remove cross button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFav(code);
                      }}
                      className={`p-1 mr-0.5 rounded hover:bg-black/10 transition-colors ${
                        isSelected ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-rose-600'
                      }`}
                      title={`Remove ${code} from Favourites`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-2 px-3 bg-white/80 rounded-lg border border-amber-200/60 text-center">
              <p className="text-xs text-slate-600 mb-1">
                No favourite currencies added yet.
              </p>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">Quick add:</span>
                {['USD', 'MYR', 'JPY', 'EUR', 'GBP'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleToggleFav(code)}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white hover:bg-amber-100 text-slate-700 border border-slate-200 transition-colors"
                  >
                    + {code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Inputs: Amount and Currency Pair */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 min-h-[64px]">
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
                className="w-full text-sm font-mono font-bold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
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
              <button
                type="button"
                onClick={() => handleToggleFav(currency.code)}
                className={`text-[10px] font-semibold flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded ${
                  isCurrentFavourite
                    ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                    : 'text-slate-500 hover:text-amber-600 bg-slate-100 hover:bg-slate-200'
                }`}
                title={
                  isCurrentFavourite
                    ? `Remove ${currency.code} from favourites`
                    : `Add ${currency.code} to favourites`
                }
              >
                <Star
                  className={`w-3 h-3 ${
                    isCurrentFavourite
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-400'
                  }`}
                />
                <span>{isCurrentFavourite ? 'In Favourites' : 'Add Favourite'}</span>
              </button>
            </div>
            <select
              value={selectedCurrencyCode}
              onChange={(e) => setSelectedCurrencyCode(e.target.value)}
              className="w-full text-xs font-semibold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} - {c.name} ({c.unit === 100 ? 'per 100' : 'per 1'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Result Display Box */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4 flex-1 flex flex-col justify-between min-h-[135px]">
          <div>
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
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>Est. Retail Bank Rate (~1.5% markup):</span>
            <span className="font-mono font-bold text-slate-800">
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
