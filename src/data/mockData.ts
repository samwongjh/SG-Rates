import { CurrencyRate, SoraRate, HistoricalRatePoint, TimeRange } from '../types';

export const INITIAL_SORA_RATES: SoraRate[] = [
  {
    tenor: 'overnight',
    code: 'SORA-ON',
    name: 'Daily SORA (Overnight)',
    rate: 3.48,
    rateFormatted: '3.4800%',
    changeBps: -2.3,
    changePct: -0.66,
    volumeSgdBillions: 4.38,
    calculationType: 'Volume-weighted interbank unsecured overnight cash transactions',
    publishTime: 'Published daily at 09:00 SGT (T+1)',
    description: 'The volume-weighted average rate of unsecured overnight interbank SGD transactions in Singapore.',
    sparkline: [3.55, 3.52, 3.50, 3.54, 3.49, 3.51, 3.48],
  },
  {
    tenor: '1m',
    code: 'SORA-1M',
    name: '1-Month Compounded SORA',
    rate: 3.51,
    rateFormatted: '3.5120%',
    changeBps: +0.8,
    changePct: +0.23,
    calculationType: 'Compounded in arrears over a 1-month rolling period',
    publishTime: 'Published daily at 09:00 SGT',
    description: 'Backward-looking compounded average of SORA over the preceding 30 days.',
    sparkline: [3.49, 3.50, 3.50, 3.51, 3.51, 3.50, 3.51],
  },
  {
    tenor: '3m',
    code: 'SORA-3M',
    name: '3-Month Compounded SORA',
    rate: 3.56,
    rateFormatted: '3.5645%',
    changeBps: +1.2,
    changePct: +0.34,
    calculationType: 'Compounded in arrears over a 3-month rolling period',
    publishTime: 'Published daily at 09:00 SGT',
    description: 'Primary benchmark used by Singapore retail and commercial floating-rate mortgages.',
    sparkline: [3.53, 3.54, 3.54, 3.55, 3.55, 3.56, 3.56],
  },
  {
    tenor: '6m',
    code: 'SORA-6M',
    name: '6-Month Compounded SORA',
    rate: 3.61,
    rateFormatted: '3.6120%',
    changeBps: -0.5,
    changePct: -0.14,
    calculationType: 'Compounded in arrears over a 6-month rolling period',
    publishTime: 'Published daily at 09:00 SGT',
    description: 'Term reference rate for medium-term commercial facilities and corporate debt syndication.',
    sparkline: [3.63, 3.62, 3.62, 3.62, 3.61, 3.61, 3.61],
  },
  {
    tenor: 'index',
    code: 'SORA-IDX',
    name: 'SORA Index',
    rate: 1.16842,
    rateFormatted: '1.16842',
    changeBps: +1.1,
    changePct: +0.09,
    calculationType: 'Cumulative index measuring growth of SGD 10,000 invested at SORA from base date',
    publishTime: 'Published daily at 09:00 SGT',
    description: 'Standardized index designed to facilitate calculation of compounded SORA over custom periods.',
    sparkline: [1.1661, 1.1665, 1.1670, 1.1674, 1.1678, 1.1681, 1.1684],
  },
];

export const INITIAL_CURRENCIES: CurrencyRate[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    country: 'United States',
    flag: '🇺🇸',
    unit: 1,
    bid: 1.3282,
    ask: 1.3288,
    mid: 1.3285,
    change: -0.0032,
    changePct: -0.24,
    high24h: 1.3325,
    low24h: 1.3274,
    category: 'major',
    updatedAt: '17:00 SGT',
    sparkline: [1.334, 1.332, 1.330, 1.331, 1.329, 1.327, 1.3285],
  },
  {
    code: 'EUR',
    name: 'Euro',
    country: 'Eurozone',
    flag: '🇪🇺',
    unit: 1,
    bid: 1.4225,
    ask: 1.4235,
    mid: 1.4230,
    change: +0.0041,
    changePct: +0.29,
    high24h: 1.4258,
    low24h: 1.4192,
    category: 'major',
    updatedAt: '17:00 SGT',
    sparkline: [1.418, 1.419, 1.421, 1.420, 1.422, 1.424, 1.423],
  },
  {
    code: 'GBP',
    name: 'British Pound',
    country: 'United Kingdom',
    flag: '🇬🇧',
    unit: 1,
    bid: 1.6910,
    ask: 1.6922,
    mid: 1.6916,
    change: +0.0065,
    changePct: +0.39,
    high24h: 1.6948,
    low24h: 1.6855,
    category: 'major',
    updatedAt: '17:00 SGT',
    sparkline: [1.684, 1.686, 1.689, 1.688, 1.690, 1.693, 1.6916],
  },
  {
    code: 'MYR',
    name: 'Malaysian Ringgit',
    country: 'Malaysia',
    flag: '🇲🇾',
    unit: 100,
    bid: 29.80,
    ask: 29.92,
    mid: 29.86, // i.e. 1 SGD = ~3.349 MYR
    change: -0.12,
    changePct: -0.40,
    high24h: 30.05,
    low24h: 29.75,
    category: 'regional',
    updatedAt: '17:00 SGT',
    sparkline: [30.10, 30.05, 29.98, 29.95, 29.90, 29.84, 29.86],
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    country: 'Japan',
    flag: '🇯🇵',
    unit: 100,
    bid: 0.8912,
    ask: 0.8926,
    mid: 0.8919, // 100 JPY = 0.8919 SGD
    change: +0.0054,
    changePct: +0.61,
    high24h: 0.8945,
    low24h: 0.8860,
    category: 'major',
    updatedAt: '17:00 SGT',
    sparkline: [0.884, 0.886, 0.888, 0.890, 0.889, 0.893, 0.8919],
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    country: 'China',
    flag: '🇨🇳',
    unit: 1,
    bid: 0.1828,
    ask: 0.1834,
    mid: 0.1831,
    change: -0.0004,
    changePct: -0.22,
    high24h: 0.1838,
    low24h: 0.1826,
    category: 'regional',
    updatedAt: '17:00 SGT',
    sparkline: [0.184, 0.1838, 0.1835, 0.1833, 0.1831, 0.1830, 0.1831],
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    country: 'Australia',
    flag: '🇦🇺',
    unit: 1,
    bid: 0.8705,
    ask: 0.8715,
    mid: 0.8710,
    change: +0.0028,
    changePct: +0.32,
    high24h: 0.8732,
    low24h: 0.8678,
    category: 'major',
    updatedAt: '17:00 SGT',
    sparkline: [0.866, 0.868, 0.870, 0.869, 0.871, 0.872, 0.871],
  },
  {
    code: 'THB',
    name: 'Thai Baht',
    country: 'Thailand',
    flag: '🇹🇭',
    unit: 100,
    bid: 3.882,
    ask: 3.898,
    mid: 3.890,
    change: +0.015,
    changePct: +0.39,
    high24h: 3.910,
    low24h: 3.870,
    category: 'regional',
    updatedAt: '17:00 SGT',
    sparkline: [3.86, 3.87, 3.88, 3.875, 3.885, 3.892, 3.89],
  },
  {
    code: 'HKD',
    name: 'Hong Kong Dollar',
    country: 'Hong Kong',
    flag: '🇭🇰',
    unit: 1,
    bid: 0.1700,
    ask: 0.1706,
    mid: 0.1703,
    change: -0.0003,
    changePct: -0.18,
    high24h: 0.1708,
    low24h: 0.1701,
    category: 'regional',
    updatedAt: '17:00 SGT',
    sparkline: [0.171, 0.1708, 0.1706, 0.1705, 0.1704, 0.1702, 0.1703],
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    country: 'Switzerland',
    flag: '🇨🇭',
    unit: 1,
    bid: 1.5115,
    ask: 1.5128,
    mid: 1.5122,
    change: +0.0035,
    changePct: +0.23,
    high24h: 1.5150,
    low24h: 1.5080,
    category: 'major',
    updatedAt: '17:00 SGT',
    sparkline: [1.505, 1.508, 1.510, 1.511, 1.509, 1.513, 1.5122],
  },
  {
    code: 'IDR',
    name: 'Indonesian Rupiah',
    country: 'Indonesia',
    flag: '🇮🇩',
    unit: 100,
    bid: 0.00835,
    ask: 0.00845,
    mid: 0.00840,
    change: -0.00004,
    changePct: -0.47,
    high24h: 0.00848,
    low24h: 0.00838,
    category: 'regional',
    updatedAt: '17:00 SGT',
    sparkline: [0.0085, 0.00848, 0.00846, 0.00844, 0.00842, 0.00841, 0.0084],
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    country: 'India',
    flag: '🇮🇳',
    unit: 100,
    bid: 1.578,
    ask: 1.586,
    mid: 1.582,
    change: -0.004,
    changePct: -0.25,
    high24h: 1.590,
    low24h: 1.579,
    category: 'regional',
    updatedAt: '17:00 SGT',
    sparkline: [1.59, 1.588, 1.586, 1.585, 1.584, 1.581, 1.582],
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    country: 'Canada',
    flag: '🇨🇦',
    unit: 1,
    bid: 0.9775,
    ask: 0.9788,
    mid: 0.9782,
    change: +0.0018,
    changePct: +0.18,
    high24h: 0.9805,
    low24h: 0.9755,
    category: 'major',
    updatedAt: '17:00 SGT',
    sparkline: [0.974, 0.975, 0.977, 0.976, 0.978, 0.979, 0.9782],
  },
  {
    code: 'NZD',
    name: 'New Zealand Dollar',
    country: 'New Zealand',
    flag: '🇳🇿',
    unit: 1,
    bid: 0.8035,
    ask: 0.8048,
    mid: 0.8041,
    change: +0.0031,
    changePct: +0.39,
    high24h: 0.8062,
    low24h: 0.7998,
    category: 'major',
    updatedAt: '17:00 SGT',
    sparkline: [0.798, 0.800, 0.802, 0.801, 0.803, 0.805, 0.8041],
  },
  {
    code: 'KRW',
    name: 'South Korean Won',
    country: 'South Korea',
    flag: '🇰🇷',
    unit: 100,
    bid: 0.0982,
    ask: 0.0988,
    mid: 0.0985,
    change: -0.0003,
    changePct: -0.30,
    high24h: 0.0991,
    low24h: 0.0981,
    category: 'other',
    updatedAt: '17:00 SGT',
    sparkline: [0.099, 0.0989, 0.0988, 0.0987, 0.0986, 0.0984, 0.0985],
  },
  {
    code: 'TWD',
    name: 'Taiwan Dollar',
    country: 'Taiwan',
    flag: '🇹🇼',
    unit: 100,
    bid: 4.115,
    ask: 4.128,
    mid: 4.121,
    change: +0.008,
    changePct: +0.19,
    high24h: 4.135,
    low24h: 4.110,
    category: 'other',
    updatedAt: '17:00 SGT',
    sparkline: [4.11, 4.112, 4.115, 4.118, 4.12, 4.122, 4.121],
  },
  {
    code: 'PHP',
    name: 'Philippine Peso',
    country: 'Philippines',
    flag: '🇵🇭',
    unit: 100,
    bid: 2.315,
    ask: 2.328,
    mid: 2.321,
    change: -0.006,
    changePct: -0.26,
    high24h: 2.332,
    low24h: 2.318,
    category: 'regional',
    updatedAt: '17:00 SGT',
    sparkline: [2.33, 2.328, 2.326, 2.324, 2.322, 2.32, 2.321],
  },
  {
    code: 'VND',
    name: 'Vietnamese Dong',
    country: 'Vietnam',
    flag: '🇻🇳',
    unit: 100,
    bid: 0.00528,
    ask: 0.00534,
    mid: 0.00531,
    change: -0.00002,
    changePct: -0.38,
    high24h: 0.00536,
    low24h: 0.00529,
    category: 'regional',
    updatedAt: '17:00 SGT',
    sparkline: [0.00535, 0.00534, 0.00533, 0.00532, 0.00531, 0.0053, 0.00531],
  },
];

// Helper to generate realistic historical trend data points
export function generateHistoricalData(
  type: 'sora' | 'currency',
  targetCode: string,
  timeRange: TimeRange
): HistoricalRatePoint[] {
  const pointsCount =
    timeRange === '7D' ? 7 :
    timeRange === '1M' ? 30 :
    timeRange === '3M' ? 90 :
    timeRange === '6M' ? 180 :
    timeRange === '1Y' ? 250 :
    timeRange === '3Y' ? 360 : 500;

  const now = new Date(2026, 8, 17); // Sep 17, 2026
  const data: HistoricalRatePoint[] = [];

  if (type === 'sora') {
    let soraOn = 3.48;
    let sora1M = 3.51;
    let sora3M = 3.56;
    let sora6M = 3.61;
    let soraIndex = 1.16842;
    let volume = 4.38;

    // Work backwards then reverse
    for (let i = 0; i < pointsCount; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - (pointsCount - 1 - i));
      // skip weekends if simulating trading days
      const dateStr = d.toISOString().split('T')[0];
      const monthName = d.toLocaleString('en-SG', { month: 'short' });
      const day = d.getDate();
      const label = pointsCount > 90 ? `${monthName} '${d.getFullYear().toString().slice(2)}` : `${day} ${monthName}`;

      // Sine wave plus pseudo-random drift for realistic macro movement
      const phase = (i / pointsCount) * Math.PI * 2;
      const macroCycle = Math.sin(phase) * 0.25;
      const noise = (Math.sin(i * 1.7) * 0.03) + (Math.cos(i * 3.1) * 0.02);

      const curOn = Number((soraOn - (macroCycle * 0.6) + noise).toFixed(4));
      const cur1M = Number((sora1M - (macroCycle * 0.45) + (noise * 0.6)).toFixed(4));
      const cur3M = Number((sora3M - (macroCycle * 0.3) + (noise * 0.4)).toFixed(4));
      const cur6M = Number((sora6M - (macroCycle * 0.2) + (noise * 0.3)).toFixed(4));
      const curIdx = Number((soraIndex - ((pointsCount - 1 - i) * 0.00012) + (noise * 0.001)).toFixed(5));
      const curVol = Number((volume + (Math.sin(i * 0.8) * 0.6) + (Math.cos(i * 1.5) * 0.3)).toFixed(2));

      data.push({
        date: dateStr,
        label,
        timestamp: d.getTime(),
        soraOvernight: curOn,
        sora1M: cur1M,
        sora3M: cur3M,
        sora6M: cur6M,
        soraIndex: curIdx,
        volume: Math.max(1.8, curVol),
        ma30: Number((cur3M * 0.995).toFixed(4)),
      });
    }
  } else {
    // Currency specific series
    const currency = INITIAL_CURRENCIES.find((c) => c.code === targetCode) || INITIAL_CURRENCIES[0];
    const baseRate = currency.mid;
    const volatility = currency.unit === 100 ? baseRate * 0.03 : baseRate * 0.02;

    for (let i = 0; i < pointsCount; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - (pointsCount - 1 - i));
      const dateStr = d.toISOString().split('T')[0];
      const monthName = d.toLocaleString('en-SG', { month: 'short' });
      const day = d.getDate();
      const label = pointsCount > 90 ? `${monthName} '${d.getFullYear().toString().slice(2)}` : `${day} ${monthName}`;

      const progress = i / pointsCount;
      const wave = Math.sin(progress * Math.PI * 3) * volatility * 0.8;
      const micro = Math.cos(i * 2.3) * (volatility * 0.25);
      const rateVal = Number((baseRate - (wave + micro)).toFixed(currency.unit === 100 && baseRate < 0.1 ? 5 : 4));

      data.push({
        date: dateStr,
        label,
        timestamp: d.getTime(),
        value: rateVal,
        rate: rateVal,
        volume: Number((1.2 + Math.sin(i * 0.5) * 0.4).toFixed(2)),
      });
    }

    // Add moving average (e.g. 20-period)
    for (let i = 0; i < data.length; i++) {
      const window = data.slice(Math.max(0, i - 19), i + 1);
      const sum = window.reduce((acc, p) => acc + (typeof p.rate === 'number' ? p.rate : 0), 0);
      data[i].ma30 = Number((sum / window.length).toFixed(currency.unit === 100 && baseRate < 0.1 ? 5 : 4));
    }
  }

  return data;
}
