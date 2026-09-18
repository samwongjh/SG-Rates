import React, { useState } from 'react';
import { SoraRate } from '../types';
import { Home, Percent, ShieldAlert, ArrowRight, Check } from 'lucide-react';

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
  const [stressBps, setStressBps] = useState<number>(100); // 100 bps (+1.0%)

  const activeSora =
    soraRates.find((s) => s.tenor === selectedTenor) || soraRates[1];
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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Home className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              SORA Mortgage & Loan Estimator
            </h3>
            <p className="text-[11px] text-slate-500">
              Simulate floating home loan payments with live SORA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setSelectedTenor('1m')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedTenor === '1m'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1M SORA
          </button>
          <button
            onClick={() => setSelectedTenor('3m')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedTenor === '3m'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3M SORA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
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
            className="w-full text-xs font-mono font-bold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
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
            className="w-full text-xs font-semibold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {[15, 20, 25, 30].map((yr) => (
              <option key={yr} value={yr}>
                {yr} Years ({yr * 12} Months)
              </option>
            ))}
          </select>
        </div>

        {/* Bank Spread */}
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
            Bank Spread (% p.a.)
          </label>
          <input
            type="number"
            step="0.05"
            value={bankSpread}
            onChange={(e) => setBankSpread(Math.max(0, Number(e.target.value)))}
            className="w-full text-xs font-mono font-bold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Breakdown results */}
      <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/60 mb-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-amber-200/60 pb-3 mb-3">
          <div>
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Estimated Monthly Installment
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-0.5">
              S${Math.round(monthlyPayment).toLocaleString('en-SG')}
              <span className="text-xs font-medium text-slate-500 font-sans"> / month</span>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              All-In Effective Rate
            </span>
            <div className="text-base font-bold font-mono text-amber-900">
              {effectiveRate.toFixed(2)}% p.a.
            </div>
            <div className="text-[10px] text-slate-500">
              ({selectedTenor.toUpperCase()} SORA {soraRateVal.toFixed(2)}% + Spread {bankSpread.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500 text-[11px]">Total Interest Over Tenure:</span>
            <div className="font-mono font-bold text-slate-900">
              S${Math.round(totalInterest).toLocaleString('en-SG')}
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-[11px]">MAS Stress-Test (+100 bps):</span>
            <div className="font-mono font-bold text-amber-800">
              S${Math.round(stressMonthlyPayment).toLocaleString('en-SG')}/mo ({stressRate.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-slate-400">
        <ShieldAlert className="w-3 h-3 text-slate-400 shrink-0" />
        <span>For indicative planning only. Actual bank floating packages reset monthly or quarterly based on MAS SORA.</span>
      </div>
    </div>
  );
};
