import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  // Allow CORS for preview / serverless invocations
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasLtaKey = Boolean(
    process.env.LTA_DATAMALL_ACCOUNT_KEY || process.env.LTA_ACCOUNT_KEY
  );

  return res.status(200).json({
    status: 'ok',
    service: 'SG ParkPulse LTA DataMall Serverless API',
    timestamp: new Date().toISOString(),
    ltaKeyConfigured: hasLtaKey,
    endpoints: [
      '/api/health',
      '/api/carparkavailability',
    ],
  });
}
