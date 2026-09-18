import React, { useState, useEffect, useCallback } from 'react';
import {
  CurrencyRate,
  SoraRate,
  HistoricalRatePoint,
  TimeRange,
  SoraTenor,
  ApiEndpointConfig,
} from './types';
import { MarketDataService } from './services/apiService';
import { Header } from './components/Header';
import { SearchModal } from './components/SearchBar';
import { SoraOverviewCardSection } from './components/SoraOverviewCard';
import { HistoricalChartSection } from './components/HistoricalChartSection';
import { FxRatesTable } from './components/FxRatesTable';
import { CurrencyConverter } from './components/CurrencyConverter';
import { SoraMortgageCalculator } from './components/SoraMortgageCalculator';
import { ApiConnectionModal } from './components/ApiConnectionModal';
import {
  INITIAL_CURRENCIES,
  INITIAL_SORA_RATES,
  generateHistoricalData,
} from './data/mockData';
import {
  TrendingUp,
  Download,
  ShieldCheck,
  Building2,
  ExternalLink,
  Info,
  Calendar,
} from 'lucide-react';
import { exportToCsv, exportToJson } from './utils/exportUtils';

export default function App() {
  const [currencies, setCurrencies] = useState<CurrencyRate[]>(INITIAL_CURRENCIES);
  const [soraRates, setSoraRates] = useState<SoraRate[]>(INITIAL_SORA_RATES);
  const [apiConfig, setApiConfig] = useState<ApiEndpointConfig>(
    MarketDataService.getConfig()
  );

  // Search Modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Chart configuration state
  const [chartMode, setChartMode] = useState<'sora' | 'currency'>('sora');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [selectedSoraTenor, setSelectedSoraTenor] = useState<SoraTenor | 'all'>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [historicalData, setHistoricalData] = useState<HistoricalRatePoint[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  // Converter helper target
  const [converterTargetCode, setConverterTargetCode] = useState<string>('USD');

  // Load active chart historical data
  const loadHistoricalData = useCallback(async () => {
    setIsChartLoading(true);
    try {
      const targetCode = chartMode === 'sora' ? selectedSoraTenor : selectedCurrency;
      const data = await MarketDataService.fetchHistoricalData(
        chartMode,
        targetCode,
        timeRange
      );
      setHistoricalData(data);
    } catch (e) {
      console.error('Failed to load historical data', e);
    } finally {
      setIsChartLoading(false);
    }
  }, [chartMode, selectedCurrency, selectedSoraTenor, timeRange]);

  useEffect(() => {
    loadHistoricalData();
  }, [loadHistoricalData]);

  // Handle global refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [fetchedSora, fetchedFx] = await Promise.all([
        MarketDataService.fetchSoraRates(),
        MarketDataService.fetchExchangeRates(),
      ]);
      setSoraRates(fetchedSora);
      setCurrencies(fetchedFx);
      await loadHistoricalData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Quick selections from search or cards
  const handleSelectCurrency = (code: string) => {
    setSelectedCurrency(code);
    setChartMode('currency');
    // Scroll to chart
    document.getElementById('market-historical-chart-container')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const handleSelectSora = (tenor: string) => {
    setSelectedSoraTenor(tenor as SoraTenor | 'all');
    setChartMode('sora');
    document.getElementById('market-historical-chart-container')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const handleOpenConverterWithCurrency = (code: string) => {
    setConverterTargetCode(code);
    document.getElementById('currency-converter-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const handleExportFullReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      reportTitle: 'Singapore Daily Exchange Rates & SORA Benchmark Summary',
      source: 'Monetary Authority of Singapore (MAS) & Interbank Quotes',
      soraRates,
      exchangeRates: currencies,
    };
    exportToJson(reportData, `singapore-market-snapshot-${new Date().toISOString().split('T')[0]}.json`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased selection:bg-red-100 selection:text-red-900">
      {/* Top Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        apiConfig={apiConfig}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Quick Snapshot Ticker Ribbon */}
        <div className="mb-6 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">SORA Overnight:</span>
              <span className="font-mono font-bold text-slate-800">
                {soraRates[0]?.rateFormatted}
              </span>
              <span className="text-[11px] font-semibold text-rose-600">
                {soraRates[0]?.changeBps} bps
              </span>
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">3M SORA:</span>
              <span className="font-mono font-bold text-slate-800">
                {soraRates[2]?.rateFormatted}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                +{soraRates[2]?.changeBps} bps
              </span>
            </div>
            <span className="text-slate-300 hidden md:inline">•</span>
            <div className="flex items-center gap-1.5 hidden md:flex">
              <span className="font-bold text-slate-900">USD/SGD:</span>
              <span className="font-mono font-bold text-slate-800">
                {currencies[0]?.mid.toFixed(4)}
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  currencies[0]?.changePct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {currencies[0]?.changePct >= 0 ? '+' : ''}
                {currencies[0]?.changePct}%
              </span>
            </div>
            <span className="text-slate-300 hidden lg:inline">•</span>
            <div className="flex items-center gap-1.5 hidden lg:flex">
              <span className="font-bold text-slate-900">100 MYR/SGD:</span>
              <span className="font-mono font-bold text-slate-800">
                {currencies.find((c) => c.code === 'MYR')?.mid.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handleExportFullReport}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors shrink-0"
            title="Export complete market snapshot as JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Full Market Export</span>
          </button>
        </div>

        {/* 1. Daily SORA Rates Overview Section */}
        <SoraOverviewCardSection
          soraRates={soraRates}
          selectedTenor={chartMode === 'sora' ? selectedSoraTenor : 'all'}
          onSelectTenor={(tenor) => {
            setSelectedSoraTenor(tenor);
            setChartMode('sora');
            document.getElementById('market-historical-chart-container')?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }}
        />

        {/* 2. Interactive Historical Trends Chart Visualisation */}
        <HistoricalChartSection
          activeMode={chartMode}
          onModeChange={setChartMode}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
          selectedSoraTenor={selectedSoraTenor}
          onSoraTenorChange={setSelectedSoraTenor}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          data={historicalData}
          currencies={currencies}
          soraRates={soraRates}
          isLoading={isChartLoading}
        />

        {/* 3. Daily Singapore Exchange Rates (SGD) Table */}
        <FxRatesTable
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onSelectCurrency={handleSelectCurrency}
          onOpenConverterWithCurrency={handleOpenConverterWithCurrency}
        />

        {/* 4. Practical Calculators: Currency Converter & SORA Mortgage Estimator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div id="currency-converter-section">
            <CurrencyConverter
              currencies={currencies}
              defaultCurrencyCode={converterTargetCode}
            />
          </div>
          <div>
            <SoraMortgageCalculator soraRates={soraRates} />
          </div>
        </div>

        {/* Institutional Disclosure & API Notice Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Ready for Manual API Connection
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mt-0.5">
                The frontend interface is pre-configured with the official data schemas for Singapore Exchange Rates and MAS SORA rates. You can connect your live MAS or custom proxy endpoint anytime via the settings panel.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsApiModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-2xs"
          >
            Open API Connection Settings
          </button>
        </div>
      </main>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        currencies={currencies}
        soraRates={soraRates}
        onSelectCurrency={handleSelectCurrency}
        onSelectSora={handleSelectSora}
      />

      {/* API Connection & Documentation Modal */}
      <ApiConnectionModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        config={apiConfig}
        onSaveConfig={(updated) => {
          setApiConfig(updated);
          handleRefresh();
        }}
      />

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Singapore Market Financial Terminal</span>
            <span className="text-slate-300">|</span>
            <span>MAS Benchmark Standards</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>SORA: Singapore Overnight Rate Average</span>
            <span>•</span>
            <span>SGD Interbank FX</span>
            <span>•</span>
            <span>Exportable Charts (PNG, SVG, CSV, JSON)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
