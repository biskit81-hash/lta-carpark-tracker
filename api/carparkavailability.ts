import type { Request, Response } from 'express';

// LTA DataMall v2 Carpark Availability API Endpoint
const LTA_CARPARK_ENDPOINT = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export interface LtaCarParkRawRecord {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // "latitude longitude" e.g. "1.2935 103.8572"
  AvailableLots: number;
  LotType: 'C' | 'H' | 'Y'; // C = Car, H = Heavy, Y = Motorcycle
  Agency: 'HDB' | 'LTA' | 'URA';
}

// In-memory cache (30 seconds TTL to respect LTA rate limits)
let cachedResponse: {
  timestamp: number;
  data: any;
} | null = null;
const CACHE_TTL_MS = 25 * 1000;

export default async function handler(req: Request, res: Response) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccountKey');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Retrieve AccountKey from environment variables or custom request header
  const accountKey =
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    (req.headers['accountkey'] as string) ||
    '';

  // Check in-memory cache first if still valid
  const now = Date.now();
  if (cachedResponse && now - cachedResponse.timestamp < CACHE_TTL_MS) {
    return res.status(200).json({
      ...cachedResponse.data,
      cached: true,
      cacheAgeSeconds: Math.round((now - cachedResponse.timestamp) / 1000),
    });
  }

  // If no AccountKey is set, inform the client and provide fallback data
  if (!accountKey.trim()) {
    return res.status(200).json({
      status: 'success',
      source: 'simulated_fallback',
      isLive: false,
      message:
        'LTA_DATAMALL_ACCOUNT_KEY is not set in environment variables. Configure your LTA DataMall AccountKey in environment settings to enable live data.',
      timestamp: new Date().toISOString(),
      value: [],
    });
  }

  try {
    const ltaResponse = await fetch(LTA_CARPARK_ENDPOINT, {
      method: 'GET',
      headers: {
        AccountKey: accountKey.trim(),
        accept: 'application/json',
      },
    });

    if (!ltaResponse.ok) {
      const errorText = await ltaResponse.text();
      return res.status(ltaResponse.status).json({
        status: 'error',
        source: 'lta_datamall',
        isLive: false,
        statusCode: ltaResponse.status,
        message: `LTA DataMall API responded with status ${ltaResponse.status}: ${ltaResponse.statusText}`,
        details: errorText,
      });
    }

    const payload = (await ltaResponse.json()) as {
      'odata.metadata'?: string;
      value: LtaCarParkRawRecord[];
    };

    const formattedResponse = {
      status: 'success',
      source: 'lta_datamall',
      isLive: true,
      timestamp: new Date().toISOString(),
      count: payload.value ? payload.value.length : 0,
      value: payload.value || [],
    };

    // Store in cache
    cachedResponse = {
      timestamp: now,
      data: formattedResponse,
    };

    return res.status(200).json(formattedResponse);
  } catch (error: any) {
    console.error('Failed to query LTA DataMall API:', error);
    return res.status(502).json({
      status: 'error',
      source: 'lta_datamall',
      isLive: false,
      message: 'Failed to establish connection to LTA DataMall serverless endpoint.',
      error: error?.message || 'Unknown network error',
    });
  }
}
