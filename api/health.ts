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

  const masKeyId = process.env.MAS_KEY_ID || (req.headers['keyid'] as string) || (req.query.keyId as string);
  const now = new Date();
  const sgtTime = new Intl.DateTimeFormat('en-SG', {
    timeZone: 'Asia/Singapore',
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(now);

  return res.status(200).json({
    status: 'ok',
    timestamp: now.toISOString(),
    sgtTime,
    environment: process.env.NODE_ENV || 'development',
    masApi: {
      configured: Boolean(masKeyId),
      hasEnvKey: Boolean(process.env.MAS_KEY_ID),
      headerKeyProvided: Boolean(req.headers['keyid']),
      message: masKeyId
        ? 'MAS API KeyId detected. Ready to proxy requests to MAS datasets.'
        : 'MAS_KEY_ID environment variable is not configured. Add it in your environment or pass via KeyId header.',
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
