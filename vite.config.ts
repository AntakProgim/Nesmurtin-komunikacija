import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { GoogleGenAI } from '@google/genai';
import express from 'express';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // API plugin for dev mode
    const apiPlugin = {
      name: 'api-plugin',
      configureServer(server: any) {
        const app = express();
        app.use(express.json());

        let ai: GoogleGenAI | null = null;
        function getAiClient(): GoogleGenAI {
          if (!ai) {
            const apiKey = env.GEMINI_API_KEY || env.DEFAULT_API_KEY;
            if (!apiKey) {
              throw new Error('Missing GEMINI_API_KEY in environment variables.');
            }
            ai = new GoogleGenAI({ apiKey });
          }
          return ai;
        }

        app.post('/api/rephrase', async (req, res) => {
          try {
            const { audience, intensityDesc, intensity, input } = req.body;
            if (!input) {
              res.status(400).json({ error: 'Input text is required' });
              return;
            }

            const client = getAiClient();
            const response = await client.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Performuok šią kritiką į Nesmurtinės komunikacijos prašymą (stebėjimas, jausmas, poreikis, prašymas). Auditorija: ${audience}, Tonas (skalėje 1-20): ${intensity} (${intensityDesc}). Mintis: "${input}". Atsakyk tik prašymu.`,
              config: { systemInstruction: "Tu esi Nesmurtinės komunikacijos (NK) ekspertas." }
            });

            res.json({ text: response.text });
          } catch (error: any) {
            console.error('Server rephrase error:', error);
            res.status(500).json({ error: error.message || 'Nepavyko sugeneruoti atsakymo.' });
          }
        });

        app.post('/api/chat', async (req, res) => {
          try {
            const { messages } = req.body;
            if (!messages || !Array.isArray(messages)) {
              res.status(400).json({ error: 'Messages array is required' });
              return;
            }

            const client = getAiClient();
            const response = await client.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: messages,
              config: {
                systemInstruction: 'Tu esi Nesmurtinės Komunikacijos (NK) ekspertas ir empatiškas mentorius. Padėk vartotojui suformuluoti prašymus, atpažinti jausmus ir poreikius. Kalbėk šiltai, palaikančiai, naudok lietuvių kalbą.',
              }
            });

            res.json({ text: response.text });
          } catch (error: any) {
            console.error('Server chat error:', error);
            res.status(500).json({ error: error.message || 'Nepavyko sugeneruoti pokalbio atsakymo.' });
          }
        });

        server.middlewares.use(app);
      }
    };

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [apiPlugin],
      define: {
        'process.env.DEFAULT_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
