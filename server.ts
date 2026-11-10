import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import healthHandler from './api/health';
import carparkAvailabilityHandler from './api/carparkavailability';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Serverless API Routes
app.all('/api/health', (req, res) => {
  return healthHandler(req, res);
});

app.all('/api/carparkavailability', (req, res) => {
  return carparkAvailabilityHandler(req, res);
});

// Also support alias matching user prompt spelling
app.all('/api/carparkavailabliity', (req, res) => {
  return carparkAvailabilityHandler(req, res);
});

async function startServer() {
  if (!isProduction) {
    // In development mode, mount Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve built static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SG ParkPulse full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
