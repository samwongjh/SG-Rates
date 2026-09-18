import React, { useState } from 'react';
import { SoraRate } from '../types';
import { Home, ShieldAlert, Sparkles } from 'lucide-react';

interface SoraMortgageCalculatorProps {
  soraRates: SoraRate[];
}

export const SoraMortgageCalculator: React.FC<SoraMortgageCalculatorProps> = ({
  soraRates,
}) => {
  const [loanAmount, setLoanAmount] = useState<number>(750000);
  const [tenureYears, setTenureYears] = useState<number>(25);
  const [selectedTenor, setSelectedTenor] = useState<'1m' | '3m'>('3m');
  const [bankSpread, setBankSpread] = useState<number>(0.65); // 0.65% p.a. bank margin
  const [stressBps] = useState<number>(100); // 100 bps (+1.0%)

  const activeSora =
    soraRates.find((s) => s.tenor === selectedTenor) || soraRates[1] || { rate: 3.5645, code: '3M SORA' };
  const soraRateVal = activeSora.rate; // e.g. 3.56%

  const effectiveRate = soraRateVal + bankSpread; // e.g. 4.21%
  const stressRate = effectiveRate + stressBps / 100; // e.g. 5.21%

  // Monthly mortgage calculation formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const calculateMonthly = (principal: number, annualRatePct: number, years: number) => {
    const monthlyRate = annualRatePct / 100 / 12;
    const totalPayments = years * 12;
    if (monthlyRate === 0) return principal / totalPayments;
    const factor = Math.pow(1 + monthlyRate, totalPayments);
    return (principal * (monthlyRate * factor)) / (factor - 1);
  };

  const monthlyPayment = calculateMonthly(loanAmount, effectiveRate, tenureYears);
  const totalRepayment = monthlyPayment * tenureYears * 12;
  const totalInterest = totalRepayment - loanAmount;

  const stressMonthlyPayment = calculateMonthly(loanAmount, stressRate, tenureYears);

  const handleApplyPreset = (amount: number, tenure: number, spread: number) => {
    setLoanAmount(amount);
    setTenureYears(tenure);
    setBankSpread(spread);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 sm:p-6 flex flex-col justify-between h-full">
      <div className="flex flex-col flex-1">
        {/* Top Header with Title and Tenor Toggle */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 min-h-[46px]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                SORA Mortgage & Loan Estimator
              </h3>
              <p className="text-[11px] text-slate-500">
                Simulate floating home loan payments with live SORA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs shrink-0">
            <button
              onClick={() => setSelectedTenor('1m')}
              className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors ${
                selectedTenor === '1m'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1M SORA
            </button>
            <button
              onClick={() => setSelectedTenor('3m')}
              className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors ${
                selectedTenor === '3m'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3M SORA
            </button>
          </div>
        </div>

        {/* 1. TOP QUICK SCENARIOS (Matching CurrencyConverter Watchlist dimensions & height) */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-3 mb-4 min-h-[116px] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                Quick Loan Scenarios & Presets
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
              <span>Benchmark:</span>
              <span className="font-bold text-slate-800">
                {selectedTenor.toUpperCase()} = {soraRateVal.toFixed(4)}%
              </span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center flex-wrap gap-1.5 max-h-[76px] overflow-y-auto pr-1">
            {[
              { label: 'HDB Flat', amount: 450000, tenure: 25, spread: 0.65, subtitle: 'S$450k / 25Y' },
              { label: 'Condo / Private', amount: 1200000, tenure: 30, spread: 0.60, subtitle: 'S$1.2M / 30Y' },
              { label: 'Refinancing', amount: 700000, tenure: 20, spread: 0.55, subtitle: 'S$700k / 20Y' },
              { label: 'Jumbo', amount: 2000000, tenure: 30, spread: 0.50, subtitle: 'S$2.0M / 30Y' },
            ].map((preset) => {
              const isActive =
                loanAmount === preset.amount &&
                tenureYears === preset.tenure &&
                bankSpread === preset.spread;

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset.amount, preset.tenure, preset.spread)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border shadow-2xs flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 ring-1 ring-slate-900'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                  title={`Apply preset: ${preset.amount.toLocaleString()} SGD over ${preset.tenure} years`}
                >
                  <span>{preset.label}</span>
                  <span
                    className={`text-[10px] font-mono font-normal ${
                      isActive ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {preset.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Form Inputs: Loan Amount, Tenure, Bank Spread */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 min-h-[64px]">
          {/* Loan Principal */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Loan Amount (SGD)
            </label>
            <input
              type="number"
              step="10000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Math.max(10000, Number(e.target.value)))}
              className="w-full text-sm font-mono font-bold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Tenure */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Tenure (Years)
            </label>
            <select
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full text-xs font-semibold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              {[15, 20, 25, 30].map((yr) => (
                <option key={yr} value={yr}>
                  {yr} Years ({yr * 12} Mos)
                </option>
              ))}
            </select>
          </div>

          {/* Bank Spread */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Bank Margin (% p.a.)
            </label>
            <input
              type="number"
              step="0.05"
              value={bankSpread}
              onChange={(e) => setBankSpread(Math.max(0, Number(e.target.value)))}
              className="w-full text-sm font-mono font-bold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* 3. Result Display Box */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4 flex-1 flex flex-col justify-between min-h-[135px]">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200/80 pb-3 mb-2.5">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Estimated Monthly Installment
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                S${Math.round(monthlyPayment).toLocaleString('en-SG')}
                <span className="text-xs font-medium text-slate-500 font-sans"> / month</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                All-In Effective Rate
              </span>
              <div className="text-base font-bold font-mono text-slate-900">
                {effectiveRate.toFixed(2)}% p.a.
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                ({selectedTenor.toUpperCase()} {soraRateVal.toFixed(2)}% + Margin {bankSpread.toFixed(2)}%)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <span className="text-slate-500 text-[11px] block">Total Interest Over Tenure:</span>
              <div className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                S${Math.round(totalInterest).toLocaleString('en-SG')}
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">MAS Stress-Test (+100 bps):</span>
              <div className="font-mono font-bold text-amber-700 text-xs sm:text-sm">
                S${Math.round(stressMonthlyPayment).toLocaleString('en-SG')}/mo
                <span className="font-normal text-[10px] text-slate-500 ml-1">({stressRate.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
        <ShieldAlert className="w-3 h-3 text-slate-400 shrink-0" />
        <span>For indicative planning only. Bank packages reset monthly or quarterly based on MAS SORA.</span>
      </div>
    </div>
  );
};
