import type { Request, Response } from 'express';

/**
 * Health check handler for the MAS datasets serverless connection
 */
export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const masExchangeId = process.env.MAS_EXCHANGE_ID || (req.headers['keyid'] as string) || (req.query.keyId as string);
  const masRateId = process.env.MAS_RATE_ID || (req.headers['keyid'] as string) || (req.query.keyId as string);
  const now = new Date();
  const sgtTime = new Intl.DateTimeFormat('en-SG', {
    timeZone: 'Asia/Singapore',
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(now);

  const exchangeConfigured = Boolean(masExchangeId);
  const rateConfigured = Boolean(masRateId);

  return res.status(200).json({
    status: 'ok',
    timestamp: now.toISOString(),
    sgtTime,
    environment: process.env.NODE_ENV || 'development',
    masApi: {
      exchangeRates: {
        configured: exchangeConfigured,
        hasEnvVar: Boolean(process.env.MAS_EXCHANGE_ID),
        envVarName: 'MAS_EXCHANGE_ID',
      },
      soraRates: {
        configured: rateConfigured,
        hasEnvVar: Boolean(process.env.MAS_RATE_ID),
        envVarName: 'MAS_RATE_ID',
      },
      allConfigured: exchangeConfigured && rateConfigured,
      message:
        exchangeConfigured && rateConfigured
          ? 'Both MAS_EXCHANGE_ID and MAS_RATE_ID are configured.'
          : `Configuration needed: ${!exchangeConfigured ? 'MAS_EXCHANGE_ID missing. ' : ''}${!rateConfigured ? 'MAS_RATE_ID missing.' : ''}`.trim(),
    },
    endpoints: {
      health: '/api/health',
      exchangeRates: '/api/exchangerates',
      soraRates: '/api/sorarates',
    },
    masEndpoints: {
      exchangeRates: 'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily',
      soraRates: 'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily',
    },
  });
}
