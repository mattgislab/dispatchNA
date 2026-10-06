import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseAllowedOrigins = () =>
  (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const isValidGeminiKey = (key: string) => /^AIza[0-9A-Za-z\-_]{35}$/.test(key);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT ?? 3000);
  const allowedOrigins = parseAllowedOrigins();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '10mb' }));
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      const isAllowed = allowedOrigins.includes(origin);
      if (!isAllowed) {
        return res.status(403).json({
          error: 'Origin non autorisée. Configurez ALLOWED_ORIGINS pour cette application.'
        });
      }
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    }

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });

  // API endpoint for Gemini Cognitive Dispatcher
  app.post('/api/gemini/dispatch-analysis', async (req, res) => {
    try {
      const { prompt, customApiKey } = req.body ?? {};
      const normalizedApiKey = typeof customApiKey === 'string' ? customApiKey.trim() : '';
      const apiKey = normalizedApiKey || process.env.GEMINI_API_KEY?.trim();

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || !isValidGeminiKey(apiKey)) {
        return res.status(200).json({
          fallback: true,
          text: null,
          message: 'Clé Gemini non configurée ou invalide. Utilisation du moteur de règles local.'
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.status(200).json({
        fallback: false,
        text: response.text
      });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return res.status(500).json({
        error: error.message || 'Erreur lors de la génération IA'
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ArcGIS Network Analyst & Dispatcher IA',
      version: '2.5.0',
      timestamp: new Date().toISOString()
    });
  });

  // Vite development middleware
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dispatcher Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
