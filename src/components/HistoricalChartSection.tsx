import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  Download,
  Calendar,
  Layers,
  ChevronDown,
  Percent,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import {
  HistoricalRatePoint,
  TimeRange,
  CurrencyRate,
  SoraRate,
  SoraTenor,
} from '../types';
import {
  exportSvgToPng,
  exportSvgToFile,
  exportToCsv,
  exportToJson,
} from '../utils/exportUtils';

interface HistoricalChartSectionProps {
  activeMode: 'sora' | 'currency';
  onModeChange: (mode: 'sora' | 'currency') => void;
  selectedCurrency: string; // e.g. 'USD'
  onCurrencyChange: (code: string) => void;
  selectedSoraTenor: SoraTenor | 'all';
  onSoraTenorChange: (tenor: SoraTenor | 'all') => void;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  data: HistoricalRatePoint[];
  currencies: CurrencyRate[];
  soraRates: SoraRate[];
  isLoading?: boolean;
}

const TIME_RANGES: TimeRange[] = ['7D', '1M', '3M', '6M', '1Y', '3Y', 'ALL'];

export const HistoricalChartSection: React.FC<HistoricalChartSectionProps> = ({
  activeMode,
  onModeChange,
  selectedCurrency,
  onCurrencyChange,
  selectedSoraTenor,
  onSoraTenorChange,
  timeRange,
  onTimeRangeChange,
  data,
  currencies,
  soraRates,
  isLoading,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMa, setShowMa] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  const currentCurrencyObj = currencies.find((c) => c.code === selectedCurrency) || currencies[0];
  const chartElementId = 'market-historical-chart-container';

  // Calculate high, low, average for active range
  const values: number[] = activeMode === 'sora'
    ? data
        .map((d) => {
          if (selectedSoraTenor === 'all' || selectedSoraTenor === 'overnight') return Number(d.soraOvernight ?? 0);
          if (selectedSoraTenor === '1m') return Number(d.sora1M ?? 0);
          if (selectedSoraTenor === '3m') return Number(d.sora3M ?? 0);
          if (selectedSoraTenor === '6m') return Number(d.sora6M ?? 0);
          return Number(d.sora3M ?? 0);
        })
        .filter((n): n is number => typeof n === 'number' && !isNaN(n) && n > 0)
    : data
        .map((d) => Number(d.rate ?? 0))
        .filter((n): n is number => typeof n === 'number' && !isNaN(n) && n > 0);

  const periodHigh = values.length ? Math.max(...values) : 0;
  const periodLow = values.length ? Math.min(...values) : 0;
  const periodAvg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const periodFirst = values.length ? values[0] : 0;
  const periodLast = values.length ? values[values.length - 1] : 0;
  const periodChange = periodLast - periodFirst;
  const periodChangePct = periodFirst !== 0 ? (periodChange / periodFirst) * 100 : 0;

  const triggerExportNotification = (msg: string) => {
    setExportSuccessMessage(msg);
    setShowExportMenu(false);
    setTimeout(() => setExportSuccessMessage(null), 3000);
  };

  const handleExportPng = () => {
    const filename = `${activeMode}-${activeMode === 'sora' ? selectedSoraTenor : selectedCurrency}-${timeRange}.png`;
    exportSvgToPng(chartElementId, filename);
    triggerExportNotification('Chart downloaded as high-res PNG');
  };

  const handleExportSvg = () => {
    const filename = `${activeMode}-${activeMode === 'sora' ? selectedSoraTenor : selectedCurrency}-${timeRange}.svg`;
    exportSvgToFile(chartElementId, filename);
    triggerExportNotification('Chart downloaded as scalable SVG');
  };

  const handleExportCsv = () => {
    const filename = `${activeMode}-${activeMode === 'sora' ? selectedSoraTenor : selectedCurrency}-${timeRange}.csv`;
    if (activeMode === 'sora') {
      exportToCsv(data, filename, [
        { key: 'date', label: 'Date' },
        { key: 'soraOvernight', label: 'SORA Overnight (%)' },
        { key: 'sora1M', label: '1M Compounded SORA (%)' },
        { key: 'sora3M', label: '3M Compounded SORA (%)' },
        { key: 'sora6M', label: '6M Compounded SORA (%)' },
        { key: 'soraIndex', label: 'SORA Index' },
        { key: 'volume', label: 'Interbank Volume (S$ Billions)' },
      ]);
    } else {
      exportToCsv(data, filename, [
        { key: 'date', label: 'Date' },
        { key: 'rate', label: `${selectedCurrency}/SGD Rate` },
        { key: 'ma30', label: '30-Day Moving Average' },
      ]);
    }
    triggerExportNotification('Dataset exported as CSV for Excel');
  };

  const handleExportJson = () => {
    const filename = `${activeMode}-${activeMode === 'sora' ? selectedSoraTenor : selectedCurrency}-${timeRange}.json`;
    exportToJson(data, filename);
    triggerExportNotification('Raw dataset exported as JSON');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden mb-8">
      {/* Chart Control Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Mode Selection & Asset Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          {/* SORA vs Currency Tab switch */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              id="chart-mode-sora-button"
              onClick={() => onModeChange('sora')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeMode === 'sora'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Percent className="w-3.5 h-3.5 text-amber-600" />
              <span>SORA Rates</span>
            </button>
            <button
              id="chart-mode-fx-button"
              onClick={() => onModeChange('currency')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeMode === 'currency'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              <span>SGD Exchange Rates</span>
            </button>
          </div>

          {/* Sub-selector for active mode */}
          {activeMode === 'sora' ? (
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Tenor:
              </span>
              {(['all', 'overnight', '1m', '3m', '6m'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onSoraTenorChange(t)}
                  className={`px-2 py-1 rounded font-medium text-xs transition-colors ${
                    selectedSoraTenor === t
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t === 'all'
                    ? 'All'
                    : t === 'overnight'
                    ? 'O/N'
                    : t.toUpperCase()}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <label htmlFor="currency-select" className="text-xs font-semibold text-slate-500 hidden sm:inline">
                Currency:
              </label>
              <div className="relative">
                <select
                  id="currency-select"
                  value={selectedCurrency}
                  onChange={(e) => onCurrencyChange(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}/SGD ({c.name})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Right: Time Range Buttons & Export Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Time range selector */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Toggle MA / Volume */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600">
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showMa}
                onChange={(e) => setShowMa(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-0 w-3.5 h-3.5"
              />
              <span className="text-[11px] font-medium">30D MA</span>
            </label>
            {activeMode === 'sora' && (
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showVolume}
                  onChange={(e) => setShowVolume(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-medium">Volume</span>
              </label>
            )}
          </div>

          {/* Export Dropdown Button */}
          <div className="relative">
            <button
              id="export-chart-menu-button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Chart & Data</span>
              <ChevronDown className="w-3 h-3 text-slate-300" />
            </button>

            {showExportMenu && (
              <div
                id="export-options-dropdown"
                className="absolute right-0 mt-1.5 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-40 text-xs animate-in fade-in duration-100"
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Visualisation Formats
                </div>
                <button
                  onClick={handleExportPng}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <div>
                    <div>Export Chart as PNG</div>
                    <div className="text-[10px] text-slate-400">High-resolution presentation image</div>
                  </div>
                </button>
                <button
                  onClick={handleExportSvg}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <div>
                    <div>Export Chart as SVG</div>
                    <div className="text-[10px] text-slate-400">Vector graphics for reports</div>
                  </div>
                </button>

                <div className="border-t border-slate-100 my-1"></div>
                <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Data Formats
                </div>
                <button
                  onClick={handleExportCsv}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <div>
                    <div>Export Data as CSV</div>
                    <div className="text-[10px] text-slate-400">Formatted for Excel / Google Sheets</div>
                  </div>
                </button>
                <button
                  onClick={handleExportJson}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-600" />
                  <div>
                    <div>Export Data as JSON</div>
                    <div className="text-[10px] text-slate-400">Raw structure for developers</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export notification toast */}
      {exportSuccessMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 flex items-center gap-2 text-emerald-800 text-xs font-medium">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>{exportSuccessMessage}</span>
        </div>
      )}

      {/* Metric Summary Ribbon */}
      <div className="bg-slate-50/80 px-4 sm:px-6 py-2.5 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {timeRange} Range High
          </span>
          <div className="font-mono font-bold text-slate-900 text-sm">
            {activeMode === 'sora'
              ? `${periodHigh.toFixed(4)}%`
              : `${periodHigh.toFixed(currentCurrencyObj.unit === 100 && periodHigh < 0.1 ? 5 : 4)} SGD`}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {timeRange} Range Low
          </span>
          <div className="font-mono font-bold text-slate-900 text-sm">
            {activeMode === 'sora'
              ? `${periodLow.toFixed(4)}%`
              : `${periodLow.toFixed(currentCurrencyObj.unit === 100 && periodLow < 0.1 ? 5 : 4)} SGD`}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Period Average
          </span>
          <div className="font-mono font-bold text-slate-900 text-sm">
            {activeMode === 'sora'
              ? `${periodAvg.toFixed(4)}%`
              : `${periodAvg.toFixed(currentCurrencyObj.unit === 100 && periodAvg < 0.1 ? 5 : 4)} SGD`}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Net Change ({timeRange})
          </span>
          <div
            className={`font-mono font-bold text-sm flex items-center gap-1 ${
              periodChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            <span>
              {periodChange >= 0 ? '+' : ''}
              {activeMode === 'sora'
                ? `${(periodChange * 100).toFixed(1)} bps`
                : `${periodChange.toFixed(4)} SGD`}
            </span>
            <span className="text-[11px] font-normal text-slate-500">
              ({periodChange >= 0 ? '+' : ''}
              {periodChangePct.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div id={chartElementId} className="p-4 sm:p-6 bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10">
            <div className="text-xs font-semibold text-slate-600 animate-pulse">
              Loading historical market points...
            </div>
          </div>
        )}

        <div className="h-72 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeMode === 'sora' ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  dy={6}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  domain={['dataMin - 0.05', 'dataMax + 0.05']}
                  tickFormatter={(val) => `${val.toFixed(2)}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white rounded-lg p-3 text-xs shadow-xl border border-slate-800">
                          <div className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 mb-2">
                            {payload[0]?.payload?.date} ({label})
                          </div>
                          <div className="space-y-1 font-mono">
                            {payload.map((entry: any) => (
                              <div key={entry.name} className="flex items-center justify-between gap-4">
                                <span style={{ color: entry.color }} className="font-sans font-medium">
                                  {entry.name}:
                                </span>
                                <span className="font-bold text-slate-100">
                                  {typeof entry.value === 'number'
                                    ? entry.name.includes('Index')
                                      ? entry.value.toFixed(5)
                                      : `${entry.value.toFixed(4)}%`
                                    : entry.value}
                                </span>
                              </div>
                            ))}
                            {payload[0]?.payload?.volume && (
                              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                                <span className="font-sans">Interbank Vol:</span>
                                <span>S${payload[0].payload.volume}B</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 14, fontSize: 12 }}
                  formatter={(value) => <span className="text-slate-700 font-medium">{value}</span>}
                />

                {(selectedSoraTenor === 'all' || selectedSoraTenor === 'overnight') && (
                  <Line
                    type="monotone"
                    dataKey="soraOvernight"
                    name="SORA Overnight"
                    stroke="#dc2626" // Singapore Red
                    strokeWidth={2.2}
                    dot={false}
                    activeDot={{ r: 5, fill: '#dc2626' }}
                  />
                )}
                {(selectedSoraTenor === 'all' || selectedSoraTenor === '1m') && (
                  <Line
                    type="monotone"
                    dataKey="sora1M"
                    name="1M Compounded"
                    stroke="#2563eb"
                    strokeWidth={1.8}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {(selectedSoraTenor === 'all' || selectedSoraTenor === '3m') && (
                  <Line
                    type="monotone"
                    dataKey="sora3M"
                    name="3M Compounded"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {(selectedSoraTenor === 'all' || selectedSoraTenor === '6m') && (
                  <Line
                    type="monotone"
                    dataKey="sora6M"
                    name="6M Compounded"
                    stroke="#d97706"
                    strokeWidth={1.8}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {showMa && (
                  <Line
                    type="monotone"
                    dataKey="ma30"
                    name="30D Moving Avg"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                )}
              </LineChart>
            ) : (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  dy={6}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  domain={['dataMin - 0.002', 'dataMax + 0.002']}
                  tickFormatter={(val) =>
                    currentCurrencyObj.unit === 100 && val < 0.1
                      ? val.toFixed(4)
                      : val.toFixed(3)
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const point = payload[0]?.payload;
                      return (
                        <div className="bg-slate-900 text-white rounded-lg p-3 text-xs shadow-xl border border-slate-800">
                          <div className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 mb-2">
                            {point?.date} ({label})
                          </div>
                          <div className="space-y-1 font-mono">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-blue-400 font-sans font-medium">
                                {selectedCurrency}/SGD:
                              </span>
                              <span className="font-bold text-slate-100">
                                {point?.rate} SGD
                              </span>
                            </div>
                            {point?.ma30 && (
                              <div className="flex items-center justify-between gap-4 text-slate-400">
                                <span className="font-sans">30-Day MA:</span>
                                <span>{point.ma30} SGD</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 14, fontSize: 12 }}
                  formatter={(value) => <span className="text-slate-700 font-medium">{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name={`${selectedCurrency}/SGD Rate`}
                  stroke="#2563eb"
                  strokeWidth={2.2}
                  fillOpacity={1}
                  fill="url(#rateGradient)"
                />
                {showMa && (
                  <Line
                    type="monotone"
                    dataKey="ma30"
                    name="30D Moving Avg"
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                )}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Volume Sub-chart (if toggled for SORA) */}
        {activeMode === 'sora' && showVolume && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5 text-slate-500">
              <span className="font-bold uppercase tracking-wider text-[10px]">
                Interbank SGD Transaction Volume (S$ Billions)
              </span>
            </div>
            <div className="h-20 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="label" hide />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`S$${val}B`, 'Transaction Volume']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="volume" fill="#cbd5e1" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart Watermark / Caption */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1">
          <span>
            {activeMode === 'sora'
              ? 'Data Source: Monetary Authority of Singapore (MAS). Daily publication at 09:00 SGT.'
              : `Quotes reflect SGD interbank indicative rates for ${currentCurrencyObj.unit} ${currentCurrencyObj.code}.`}
          </span>
          <span className="font-mono">Timeframe: {timeRange} · SGT (UTC+8)</span>
        </div>
      </div>
    </div>
  );
};
