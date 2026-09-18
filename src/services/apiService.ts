import { INITIAL_CURRENCIES, INITIAL_SORA_RATES, generateHistoricalData } from '../data/mockData';
import { CurrencyRate, SoraRate, HistoricalRatePoint, TimeRange, ApiEndpointConfig } from '../types';

const STORAGE_KEY_API_CONFIG = 'sg_market_rates_api_config';

export function getStoredApiConfig(): ApiEndpointConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_API_CONFIG);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not read API config from localStorage', e);
  }
  return {
    mode: 'simulated',
    customUrl: '',
    lastSync: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }) + ' SGT',
    status: 'idle',
  };
}

export function saveStoredApiConfig(config: ApiEndpointConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_API_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.warn('Could not save API config to localStorage', e);
  }
}

/**
 * Data fetcher designed to allow seamless transition between the built-in
 * high-fidelity simulated Singapore market data and the user's manual API endpoint.
 */
export class MarketDataService {
  private static config: ApiEndpointConfig = getStoredApiConfig();

  public static getConfig(): ApiEndpointConfig {
    return this.config;
  }

  public static updateConfig(newConfig: Partial<ApiEndpointConfig>): ApiEndpointConfig {
    this.config = { ...this.config, ...newConfig };
    saveStoredApiConfig(this.config);
    return this.config;
  }

  public static async fetchSoraRates(): Promise<SoraRate[]> {
    if (this.config.mode === 'custom' && this.config.customUrl) {
      try {
        const res = await fetch(`${this.config.customUrl}/sora`, {
          headers: this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {},
        });
        if (!res.ok) throw new Error(`Custom API returned status ${res.status}`);
        const data = await res.json();
        return Array.isArray(data) ? data : INITIAL_SORA_RATES;
      } catch (err) {
        console.warn('Failed to fetch from custom SORA endpoint, falling back to simulated data:', err);
      }
    }
    // Default simulated instant response
    return INITIAL_SORA_RATES;
  }

  public static async fetchExchangeRates(): Promise<CurrencyRate[]> {
    if (this.config.mode === 'custom' && this.config.customUrl) {
      try {
        const res = await fetch(`${this.config.customUrl}/exchange-rates`, {
          headers: this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {},
        });
        if (!res.ok) throw new Error(`Custom API returned status ${res.status}`);
        const data = await res.json();
        return Array.isArray(data) ? data : INITIAL_CURRENCIES;
      } catch (err) {
        console.warn('Failed to fetch from custom FX endpoint, falling back to simulated data:', err);
      }
    }
    return INITIAL_CURRENCIES;
  }

  public static async fetchHistoricalData(
    type: 'sora' | 'currency',
    code: string,
    range: TimeRange
  ): Promise<HistoricalRatePoint[]> {
    if (this.config.mode === 'custom' && this.config.customUrl) {
      try {
        const res = await fetch(
          `${this.config.customUrl}/historical?type=${type}&code=${code}&range=${range}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch (err) {
        console.warn('Custom historical endpoint fetch failed, using generated trend:', err);
      }
    }
    return generateHistoricalData(type, code, range);
  }
}
