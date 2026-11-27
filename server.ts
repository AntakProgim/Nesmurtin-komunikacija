import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

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
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || '');
      const status = err?.status || err?.code;
      const isRetryable =
        status === 429 ||
        status === 503 ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('429');
      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 900 * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

function formatError(error: any): string {
  const msg = error?.message || '';
  if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
    return 'Neteisingas arba negaliojantis Gemini API raktas. Įsitikinkite, kad nukopijavote visą raktą be klaidų, arba atnaujinkite jį Secrets nustatymuose.';
  }
  if (msg.includes('leaked')) {
    return 'Jūsų API raktas buvo užblokuotas kaip nutekėjęs. Sukurkite naują raktą Google AI Studio ir atnaujinkite Secrets nustatymus.';
  }
  if (msg.includes('spending cap') || msg.includes('monthly spending')) {
    return 'Pasiektas šio Google Cloud projekto mėnesinis išlaidų limitas (spending cap). Patikrinkite arba pakoreguokite limitą Google AI Studio skiltyje „Spend“ (ai.studio/spend).';
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('429')) {
    return 'Laikinai pasiektas užklausų limitas (kvota). Palaukite kelias sekundes ir pabandykite dar kartą arba patikrinkite API rakto nustatymus (Settings > Secrets).';
  }
  return msg || 'Nepavyko sugeneruoti atsakymo.';
}

const audienceMap: Record<string, string> = {
  child: 'Mokinys arba vaikas',
  parent: 'Tėvai arba globėjai',
  colleague: 'Kolega arba mokytojas',
  institution: 'Institucija (savivaldybė, ministerija, įstaiga, administracija)',
};

function buildRephrasePrompt(audience: string, format: string, intensity: string, intensityDesc: string, input: string): string {
  const audienceLabel = audienceMap[audience] || audience || 'Pašnekovas';
  const isWritten = format === 'written' || audience === 'institution';

  const modeInstructions = isWritten
    ? `Performuok pradinį tekstą į konstruktyvų oficialų el. laišką arba raštą pagal Nesmurtinės komunikacijos (NK) principus (Tema, mandagus kreipinys, neutralūs faktai su datomis/vietomis laužtiniuose skliaustuose jei trūksta, dalykiška jausmo/poveikio formuluotė, bendras poreikis, konkretus prašymas su terminu, atsisveikinimas).`
    : `Performuok pradinį tekstą į Nesmurtinės komunikacijos (NK) žodinį prašymą (stebėjimas, jausmas, poreikis, konkretus prašymas klausimu).`;

  return `${modeInstructions}
Gavėjas: ${audienceLabel}
Formatas: ${isWritten ? 'Oficialus susirašinėjimas (el. laiškas / raštas)' : 'Žodinis pokalbis'}
Tonas (skalėje 1-20): ${intensity} (${intensityDesc})

Taip pat įvertink PRADINĮ vartotojo tekstą pagal tai, kiek jame išreikšta orientacijos į:
1. faktus (stebėjimą / konkrečius įvykius) – facts (0–100)
2. jausmus (emocinę būseną / toną) – feelings (0–100)
3. poreikius (vertybes / tikslus / norimus rezultatus) – needs (0–100)
Šių trijų procentų suma PRIVALO būti lygi 100. Pridėk trumpą 1 sakinio įžvalgą lietuvių kalba (summary) apie tai, ko pradiniame tekste daugiausia ir ko verta pridėti.

Pradinis tekstas: "${input}"`;
}

function normalizeAnalysis(raw: any) {
  let facts = Number(raw?.facts);
  let feelings = Number(raw?.feelings);
  let needs = Number(raw?.needs);
  if (!Number.isFinite(facts) || !Number.isFinite(feelings) || !Number.isFinite(needs) || facts + feelings + needs <= 0) {
    return {
      facts: 34,
      feelings: 33,
      needs: 33,
      summary: 'Tekste matomas mišrus emocinis ir faktinis turinys – aiškus NK struktūrizavimas padės tiksliau išreikšti poreikį.',
    };
  }
  const total = facts + feelings + needs;
  facts = Math.round((facts / total) * 100);
  feelings = Math.round((feelings / total) * 100);
  needs = Math.max(0, 100 - facts - feelings);
  return {
    facts,
    feelings,
    needs,
    summary: typeof raw?.summary === 'string' && raw.summary.trim() ? raw.summary.trim() : '',
  };
}

// API Routes
app.post('/api/rephrase', async (req: Request, res: Response) => {
  try {
    const { audience, format = 'spoken', intensityDesc, intensity, input } = req.body;
    if (!input) {
      res.status(400).json({ error: 'Prašome įvesti tekstą.' });
      return;
    }

    const client = getAiClient();
    const response = await withRetry(() =>
      client.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: buildRephrasePrompt(audience, format, intensity, intensityDesc, input),
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: 'Performuluotas NK prašymas arba laiškas lietuvių kalba.' },
              analysis: {
                type: Type.OBJECT,
                properties: {
                  facts: { type: Type.INTEGER, description: 'Orientacija į faktus procentais (0-100).' },
                  feelings: { type: Type.INTEGER, description: 'Orientacija į jausmus procentais (0-100).' },
                  needs: { type: Type.INTEGER, description: 'Orientacija į poreikius procentais (0-100).' },
                  summary: { type: Type.STRING, description: 'Trumpa 1 sakinio įžvalga apie pradinio teksto balansą.' },
                },
              },
            },
          },
          systemInstruction: 'Tu esi Nesmurtinės komunikacijos (NK) ekspertas. Puikiai išmanai tiek kasdienius pokalbius (su vaikais, tėvais, kolegomis), tiek oficialų dalykinį susirašinėjimą su institucijomis pagal NK principus. Visada grąžink tikslų JSON objektą.',
        },
      })
    );

    const rawText = (response.text ?? '').trim();
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { text: rawText, analysis: null };
    }

    res.json({
      text: parsed?.text || rawText,
      analysis: normalizeAnalysis(parsed?.analysis),
    });
  } catch (error: any) {
    console.error('Server rephrase error:', error);
    res.status(500).json({ error: formatError(error) });
  }
});

app.post('/api/chat', (_req: Request, res: Response) => {
  res.status(410).json({ error: 'DI pagalbos pokalbis yra išjungtas.' });
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
