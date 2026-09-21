import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize GoogleGenAI lazily to prevent crash if key is missing on startup
let currentKey = '';
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const rawKey = process.env.GEMINI_API_KEY || process.env.DEFAULT_API_KEY || '';
  const apiKey = typeof rawKey === 'string' ? rawKey.trim() : '';
  if (!apiKey) {
    throw new Error('Nenurodytas GEMINI_API_KEY aplinkos kintamasis. Nustatykite galiojantį API raktą nustatymų skiltyje (Secrets).');
  }
  if (!aiClient || currentKey !== apiKey) {
    currentKey = apiKey;
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

function formatError(error: any): string {
  const msg = error?.message || '';
  if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
    return 'Neteisingas arba negaliojantis Gemini API raktas. Įsitikinkite, kad nukopijavote visą raktą be klaidų, arba atnaujinkite jį Secrets nustatymuose.';
  }
  if (msg.includes('leaked')) {
    return 'Jūsų API raktas buvo užblokuotas kaip nutekėjęs. Sukurkite naują raktą Google AI Studio ir atnaujinkite Secrets nustatymus.';
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
    return 'Pasiektas užklausų limitas (kvota). Pabandykite šiek tiek vėliau.';
  }
  return msg || 'Nepavyko sugeneruoti atsakymo.';
}

// API Routes
app.post('/api/rephrase', async (req: Request, res: Response) => {
  try {
    const { audience, intensityDesc, intensity, input } = req.body;
    if (!input) {
      res.status(400).json({ error: 'Input text is required' });
      return;
    }

    const client = getAiClient();
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Performuok šią kritiką į Nesmurtinės komunikacijos prašymą (stebėjimas, jausmas, poreikis, prašymas). Auditorija: ${audience}, Tonas (skalėje 1-20): ${intensity} (${intensityDesc}). Mintis: "${input}". Atsakyk tik prašymu.`,
      config: { systemInstruction: "Tu esi Nesmurtinės komunikacijos (NK) ekspertas." }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Server rephrase error:', error);
    res.status(500).json({ error: formatError(error) });
  }
});

app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const client = getAiClient();
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: messages,
      config: {
        systemInstruction: 'Tu esi Nesmurtinės Komunikacijos (NK) ekspertas ir empatiškas mentorius. Padėk vartotojui suformuluoti prašymus, atpažinti jausmus ir poreikius. Kalbėk šiltai, palaikančiai, naudok lietuvių kalbą.',
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Server chat error:', error);
    res.status(500).json({ error: formatError(error) });
  }
});

// Serve static files from the React/Vite app
app.use(express.static(path.join(__dirname, 'dist')));

// Wildcard route to handle client-side routing using a safe RegExp to support Express 5
app.get(/^(?!\/api).*/, (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
