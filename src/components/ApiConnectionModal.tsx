import React, { useState } from 'react';
import { X, Plug, CheckCircle2, AlertCircle, ExternalLink, Code2, Copy, Check } from 'lucide-react';
import { ApiEndpointConfig } from '../types';
import { MarketDataService } from '../services/apiService';

interface ApiConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiEndpointConfig;
  onSaveConfig: (config: ApiEndpointConfig) => void;
}

export const ApiConnectionModal: React.FC<ApiConnectionModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [mode, setMode] = useState<'simulated' | 'custom'>(config.mode);
  const [customUrl, setCustomUrl] = useState<string>(config.customUrl || '');
  const [apiKey, setApiKey] = useState<string>(config.apiKey || '');
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!customUrl.trim()) {
      setTestingStatus('failed');
      setTestMessage('Please enter a valid API Base URL');
      return;
    }

    setTestingStatus('testing');
    setTestMessage('Pinging custom endpoint...');

    try {
      // Attempt ping to either /sora or base URL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${customUrl.replace(/\/$/, '')}/sora`, {
        signal: controller.signal,
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setTestingStatus('success');
        setTestMessage('Successfully connected! Custom endpoint returned status 200 OK.');
      } else {
        setTestingStatus('failed');
        setTestMessage(`Received HTTP error ${res.status}: ${res.statusText}`);
      }
    } catch (err: any) {
      setTestingStatus('failed');
      setTestMessage(
        err.name === 'AbortError'
          ? 'Request timed out after 5 seconds.'
          : 'Could not connect to URL. Check CORS headers or network URL.'
      );
    }
  };

  const handleSave = () => {
    const updated: ApiEndpointConfig = {
      mode,
      customUrl: customUrl.trim(),
      apiKey: apiKey.trim(),
      lastSync: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }) + ' SGT',
      status: mode === 'custom' ? (testingStatus === 'success' ? 'connected' : 'idle') : 'idle',
    };
    MarketDataService.updateConfig(updated);
    onSaveConfig(updated);
    onClose();
  };

  const sampleSoraJson = `[
  {
    "tenor": "overnight",
    "code": "SORA-ON",
    "name": "Daily SORA (Overnight)",
    "rate": 3.48,
    "rateFormatted": "3.4800%",
    "changeBps": -2.3,
    "changePct": -0.66,
    "volumeSgdBillions": 4.38,
    "calculationType": "Volume-weighted interbank unsecured overnight transactions"
  },
  {
    "tenor": "3m",
    "code": "SORA-3M",
    "name": "3-Month Compounded SORA",
    "rate": 3.56,
    "rateFormatted": "3.5645%",
    "changeBps": +1.2,
    "changePct": +0.34
  }
]`;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div
      id="api-connection-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="api-connection-modal-container"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Plug className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Manual API Integration & Developer Blueprint
              </h2>
              <p className="text-xs text-slate-500">
                Connect your real backend or MAS API endpoints when ready
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Mode Switch */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">
              Data Source Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setMode('simulated')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  mode === 'simulated'
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Built-In Market Dataset</span>
                  {mode === 'simulated' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Instant, realistic MAS benchmark rates, 18+ FX pairs, and full historical trends.
                </p>
              </div>

              <div
                onClick={() => setMode('custom')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  mode === 'custom'
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Custom Manual API Endpoint</span>
                  {mode === 'custom' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Point the UI to your own backend API or MAS reverse-proxy.
                </p>
              </div>
            </div>
          </div>

          {/* Custom URL form if mode === 'custom' */}
          {mode === 'custom' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Base API URL
                </label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/v1"
                  className="w-full text-xs font-mono text-slate-900 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Authorization Header / API Key (Optional)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Bearer token or API Key"
                  className="w-full text-xs font-mono text-slate-900 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleTestConnection}
                  disabled={testingStatus === 'testing'}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  {testingStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                </button>

                {testingStatus === 'success' && (
                  <span className="text-emerald-700 flex items-center gap-1 font-medium text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {testMessage}
                  </span>
                )}
                {testingStatus === 'failed' && (
                  <span className="text-rose-700 flex items-center gap-1 font-medium text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {testMessage}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Official MAS Reference and Schemas */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-600" />
              <span>Monetary Authority of Singapore (MAS) API Reference</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Official APIs provided by MAS on data.gov.sg and eservices.mas.gov.sg:
            </p>

            <div className="bg-slate-900 text-slate-200 rounded-lg p-3 font-mono text-[11px] space-y-1.5 overflow-x-auto">
              <div className="text-emerald-400 font-bold">// MAS API Endpoints:</div>
              <div>GET https://eservices.mas.gov.sg/api/v1/commercialbanksmonthly</div>
              <div>GET /sora (SORA Overnight, 1M, 3M, 6M, Index)</div>
              <div>GET /exchange-rates (USD, EUR, GBP, MYR, JPY, CNY, etc.)</div>
              <div>GET /historical?type=sora|currency&code=USD&range=1Y</div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Expected SORA Response Schema (JSON):</span>
                <button
                  onClick={() => copyCode(sampleSoraJson, 'sora')}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
                >
                  {copiedTab === 'sora' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Schema</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[10px] font-mono text-slate-800 overflow-x-auto max-h-36">
                {sampleSoraJson}
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
