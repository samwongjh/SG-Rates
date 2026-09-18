import React, { useState } from 'react';
import { CurrencyRate } from '../types';
import { ArrowRightLeft, DollarSign, Calculator, Info } from 'lucide-react';

interface CurrencyConverterProps {
  currencies: CurrencyRate[];
  defaultCurrencyCode?: string;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  currencies,
  defaultCurrencyCode = 'USD',
}) => {
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(defaultCurrencyCode);
  const [amount, setAmount] = useState<number>(1000);
  const [direction, setDirection] = useState<'sgd_to_foreign' | 'foreign_to_sgd'>('sgd_to_foreign');

  const currency = currencies.find((c) => c.code === selectedCurrencyCode) || currencies[0];

  // Calculation taking into account unit (1 or 100)
  // For USD: unit = 1, mid = 1.3285 SGD per 1 USD
  // If direction is sgd_to_foreign: 1000 SGD / 1.3285 = 752.73 USD
  // If direction is foreign_to_sgd: 1000 USD * 1.3285 = 1328.50 SGD
  // For JPY: unit = 100, mid = 0.8919 SGD per 100 JPY
  // If direction is sgd_to_foreign: (1000 SGD / 0.8919) * 100 = 112,120 JPY
  // If direction is foreign_to_sgd: (1000 JPY / 100) * 0.8919 = 8.919 SGD
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Instant Currency Converter
            </h3>
            <p className="text-[11px] text-slate-500">Live Interbank SGD rates</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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
          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
            Currency Pair
          </label>
          <select
            value={selectedCurrencyCode}
            onChange={(e) => setSelectedCurrencyCode(e.target.value)}
            className="w-full text-xs font-semibold text-slate-900 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} - {c.name}
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
            1 {currency.code} = {(currency.mid / currency.unit).toFixed(4)} SGD
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

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
        <Info className="w-3 h-3 text-slate-400 shrink-0" />
        <span>Calculations use Singapore wholesale mid-market rate with zero markup.</span>
      </div>
    </div>
  );
};
