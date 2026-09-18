import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import healthHandler from './api/health';
import exchangeRatesHandler from './api/exchangerates';
import soraRatesHandler from './api/sorarates';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount API endpoints from /api folder
  app.all('/api/health', (req, res) => healthHandler(req, res));
  app.all('/api/health.ts', (req, res) => healthHandler(req, res));

  app.all('/api/exchangerates', (req, res) => exchangeRatesHandler(req, res));
  app.all('/api/exchangerates.ts', (req, res) => exchangeRatesHandler(req, res));

  app.all('/api/sorarates', (req, res) => soraRatesHandler(req, res));
  app.all('/api/sorarates.ts', (req, res) => soraRatesHandler(req, res));

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
