import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Plug, ShieldCheck, Clock, Download } from 'lucide-react';
import { ApiEndpointConfig } from '../types';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenApiModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  apiConfig: ApiEndpointConfig;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenApiModal,
  onRefresh,
  isRefreshing,
  apiConfig,
}) => {
  const [sgtTime, setSgtTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to SGT time (UTC+8)
      const formatted = new Intl.DateTimeFormat('en-SG', {
        timeZone: 'Asia/Singapore',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setSgtTime(`${formatted} SGT`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top micro-bar for market session & MAS notice */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-tight">
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            MAS SORA Benchmark Published
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-slate-400">
            Daily Publication: 09:00 SGT (T+1 Basis)
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="hidden md:inline text-slate-400">
            Interbank FX Indicative Rates
          </span>
        </div>

        <div className="flex items-center space-x-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{sgtTime || 'Singapore Time (SGT)'}</span>
          </div>

          <button
            id="header-api-config-button"
            onClick={onOpenApiModal}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] transition-colors border border-slate-700"
            title="Configure Manual API Connection"
          >
            <Plug className="w-2.5 h-2.5 text-emerald-400" />
            <span>{apiConfig.mode === 'custom' ? 'Custom API Active' : 'API Connection: Ready'}</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold shadow-sm shadow-red-500/20 ring-2 ring-red-100">
            <span className="text-sm tracking-wider font-mono">SG</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Singapore Market Rates
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                MAS & Interbank
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Daily SGD Exchange Rates, SORA Benchmarks & Historical Trends
            </p>
          </div>
        </div>

        {/* Global Search Bar trigger & action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick search input button */}
          <button
            id="quick-search-trigger-button"
            onClick={onOpenSearch}
            className="flex-1 md:w-72 flex items-center justify-between px-3 py-2 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-all text-left group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
              <span className="truncate">Search currency or SORA tenor...</span>
            </span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
              /
            </kbd>
          </button>

          {/* Refresh button */}
          <button
            id="refresh-rates-button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
            title="Refresh Rates"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
