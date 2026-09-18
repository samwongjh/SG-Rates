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
import { SoraBenchmarkTable } from './components/SoraBenchmarkTable';
import { CurrencyConverter } from './components/CurrencyConverter';
import { SoraMortgageCalculator } from './components/SoraMortgageCalculator';
import { ApiConnectionModal } from './components/ApiConnectionModal';
import {
  INITIAL_CURRENCIES,
  INITIAL_SORA_RATES,
} from './data/mockData';
import {
  TrendingUp,
  Download,
  ShieldCheck,
  Building2,
  DollarSign,
  Percent,
  Landmark,
  Star,
  Layers,
} from 'lucide-react';
import { exportToJson } from './utils/exportUtils';

export type MainCategoryFilter = 'exchange_rates' | 'sora_rates';

export default function App() {
  const [currencies, setCurrencies] = useState<CurrencyRate[]>(INITIAL_CURRENCIES);
  const [soraRates, setSoraRates] = useState<SoraRate[]>(INITIAL_SORA_RATES);
  const [apiConfig, setApiConfig] = useState<ApiEndpointConfig>(
    MarketDataService.getConfig()
  );

  // Main Page Primary Key Filter: 'exchange_rates' or 'sora_rates'
  const [mainFilter, setMainFilter] = useState<MainCategoryFilter>('exchange_rates');

  // Favourite Currencies state with LocalStorage persistence
  const [favouriteCurrencies, setFavouriteCurrencies] = useState<string[]>(() => {
    try {
      const saved =
        localStorage.getItem('sg_rates_favourite_currencies') ||
        localStorage.getItem('sg_rates_bookmarked_currencies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read favourites from localStorage', e);
    }
    return ['USD', 'MYR', 'JPY', 'EUR', 'GBP'];
  });

  const handleToggleFavourite = (code: string) => {
    setFavouriteCurrencies((prev) => {
      const next = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code];
      try {
        localStorage.setItem('sg_rates_favourite_currencies', JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save favourites to localStorage', e);
      }
      return next;
    });
  };

  // Search Modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Chart configuration state
  const [chartMode, setChartMode] = useState<'sora' | 'currency'>('currency');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [selectedSoraTenor, setSelectedSoraTenor] = useState<SoraTenor | 'all'>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [historicalData, setHistoricalData] = useState<HistoricalRatePoint[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  // Converter helper target
  const [converterTargetCode, setConverterTargetCode] = useState<string>('USD');

  // Sync mainFilter and chartMode when user clicks the main tab
  const handleSelectMainFilter = (filter: MainCategoryFilter) => {
    setMainFilter(filter);
    if (filter === 'sora_rates') {
      setChartMode('sora');
    } else {
      setChartMode('currency');
    }
  };

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
    setMainFilter('exchange_rates');
    document.getElementById('market-historical-chart-container')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const handleSelectSora = (tenor: string) => {
    setSelectedSoraTenor(tenor as SoraTenor | 'all');
    setChartMode('sora');
    setMainFilter('sora_rates');
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
      favouriteCurrencies,
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
        {/* TOP SECTION: Instant Currency Converter & SORA Mortgage & Loan Estimator */}
        {/* Placed at the top of the page with aligned dimensions for ease of user input */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div id="currency-converter-section" className="flex flex-col h-full">
              <CurrencyConverter
                currencies={currencies}
                defaultCurrencyCode={converterTargetCode}
                favouriteCurrencies={favouriteCurrencies}
                onToggleFavourite={handleToggleFavourite}
              />
            </div>
            <div id="sora-mortgage-calculator-section" className="flex flex-col h-full">
              <SoraMortgageCalculator soraRates={soraRates} />
            </div>
          </div>
        </section>

        {/* PRIMARY KEY FILTER: SORA Rates vs Singapore Exchange Rates */}
        <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                id="main-filter-exchange-rates"
                onClick={() => handleSelectMainFilter('exchange_rates')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  mainFilter === 'exchange_rates'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <DollarSign className="w-4 h-4 text-blue-400" />
                <span>Singapore Exchange Rates</span>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-200">
                  SGD FX ({currencies.length})
                </span>
              </button>

              <button
                id="main-filter-sora-rates"
                onClick={() => handleSelectMainFilter('sora_rates')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  mainFilter === 'sora_rates'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Percent className="w-4 h-4 text-emerald-400" />
                <span>SORA Rates</span>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-200">
                  MAS Benchmark
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3 justify-between sm:justify-end flex-wrap">
              {/* Context Badge */}
              <div className="flex items-center gap-2 px-3 py-1 text-xs text-slate-500 font-medium">
                {mainFilter === 'exchange_rates' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Viewing 30+ SGD Interbank & MAS Daily Quotations</span>
                    {favouriteCurrencies.length > 0 && (
                      <span className="hidden sm:inline text-amber-600 font-semibold">
                        ({favouriteCurrencies.length} favourites)
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Viewing Singapore Overnight Rate Average & Compounded Tenors</span>
                  </>
                )}
              </div>

              <button
                onClick={handleExportFullReport}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors shrink-0"
                title="Export complete market snapshot as JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">Export Market Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* DYNAMIC CONTENT AREA BASED ON PRIMARY FILTER */}
        {mainFilter === 'sora_rates' ? (
          /* ========================================================================= */
          /* SORA RATES VIEW                                                          */
          /* ========================================================================= */
          <div className="space-y-8">
            {/* 1. Daily SORA Rates Overview Cards */}
            <SoraOverviewCardSection
              soraRates={soraRates}
              selectedTenor={selectedSoraTenor}
              onSelectTenor={(tenor) => {
                setSelectedSoraTenor(tenor);
                setChartMode('sora');
                document.getElementById('market-historical-chart-container')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
              }}
            />

            {/* 2. Comprehensive SORA Benchmark Reference Table & Specifications */}
            <SoraBenchmarkTable
              soraRates={soraRates}
              selectedTenor={selectedSoraTenor}
              onSelectTenor={(tenor) => {
                setSelectedSoraTenor(tenor);
                setChartMode('sora');
                document.getElementById('market-historical-chart-container')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
              }}
            />

            {/* 3. Interactive SORA Historical Trends Chart (at bottom) */}
            <HistoricalChartSection
              activeMode="sora"
              onModeChange={(mode) => {
                setChartMode(mode);
                if (mode === 'currency') setMainFilter('exchange_rates');
              }}
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
          </div>
        ) : (
          /* ========================================================================= */
          /* SINGAPORE EXCHANGE RATES VIEW                                             */
          /* ========================================================================= */
          <div className="space-y-8">
            {/* 1. Daily Singapore Exchange Rates (SGD) Table with Favourites */}
            <FxRatesTable
              currencies={currencies}
              selectedCurrency={selectedCurrency}
              onSelectCurrency={handleSelectCurrency}
              onOpenConverterWithCurrency={handleOpenConverterWithCurrency}
              favouriteCurrencies={favouriteCurrencies}
              onToggleFavourite={handleToggleFavourite}
            />

            {/* 2. Interactive Currency Historical Trends Chart Visualisation (at bottom) */}
            <HistoricalChartSection
              activeMode="currency"
              onModeChange={(mode) => {
                setChartMode(mode);
                if (mode === 'sora') setMainFilter('sora_rates');
              }}
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
          </div>
        )}

        {/* Institutional Disclosure & API Notice Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs mt-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Ready for Manual API Connection
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mt-0.5">
                The frontend interface is pre-configured with the official data schemas for Singapore Exchange Rates (MAS_EXCHANGE_ID) and MAS SORA rates (MAS_RATE_ID). You can connect your live MAS or custom proxy endpoint anytime via the settings panel.
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
        favouriteCurrencies={favouriteCurrencies}
        onToggleFavourite={handleToggleFavourite}
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
