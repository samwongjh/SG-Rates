import type { Request, Response } from 'express';

const MAS_SORA_RATES_URL =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

export default async function handler(req: Request, res: Response) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Retrieve MAS KeyId strictly from environment (MAS_RATE_ID) or request headers/query (NO HARDCODING)
  const masKeyId =
    process.env.MAS_RATE_ID ||
    (req.headers['keyid'] as string) ||
    (req.query.keyId as string);

  if (!masKeyId) {
    return res.status(401).json({
      error: 'Unauthorized - Missing MAS Interest Rate KeyId',
      message:
        'MAS_RATE_ID is not configured. Please set the MAS_RATE_ID environment variable or pass it via the "KeyId" request header.',
      targetEndpoint: MAS_SORA_RATES_URL,
      documentation:
        'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql',
    });
  }

  try {
    // Construct MAS target URL with incoming query params (e.g. limit, sort, start_date)
    const targetUrl = new URL(MAS_SORA_RATES_URL);
    const incomingQuery = req.query || {};

    // Forward relevant query parameters if present
    for (const [key, value] of Object.entries(incomingQuery)) {
      if (key !== 'keyId' && typeof value === 'string') {
        targetUrl.searchParams.set(key, value);
      }
    }

    // Default to limit=30 if not specified
    if (!targetUrl.searchParams.has('limit')) {
      targetUrl.searchParams.set('limit', '30');
    }

    const masResponse = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        KeyId: masKeyId,
        Accept: 'application/json',
        'User-Agent': 'SingaporeMarketRates/1.0',
      },
    });

    if (!masResponse.ok) {
      const errorBody = await masResponse.text();
      return res.status(masResponse.status).json({
        error: `MAS API returned HTTP ${masResponse.status}`,
        statusText: masResponse.statusText,
        details: errorBody,
        endpoint: MAS_SORA_RATES_URL,
      });
    }

    const data = await masResponse.json();

    // Cache control for daily data: cache for 15 minutes
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

    return res.status(200).json({
      success: true,
      source: 'Monetary Authority of Singapore (MAS)',
      endpoint: MAS_SORA_RATES_URL,
      fetchedAt: new Date().toISOString(),
      data,
    });
  } catch (error: any) {
    console.error('Error connecting to MAS SORA rates endpoint:', error);
    return res.status(500).json({
      error: 'Failed to connect to MAS Domestic Interest Rates dataset',
      details: error.message || 'Unknown network error',
      endpoint: MAS_SORA_RATES_URL,
    });
  }
}
