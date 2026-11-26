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

const audienceMap: Record<string, string> = {
  child: 'Mokinys arba vaikas',
  parent: 'Tėvai arba globėjai',
  colleague: 'Kolega arba mokytojas',
  institution: 'Institucija (savivaldybė, ministerija, įstaiga, administracija)',
};

function buildRephrasePrompt(audience: string, format: string, intensity: string, intensityDesc: string, input: string): string {
  const audienceLabel = audienceMap[audience] || audience || 'Pašnekovas';
  const isWritten = format === 'written' || audience === 'institution';

  if (isWritten) {
    return `Performuok šią kritiką, problemą ar juodraštį į konstruktyvų oficialų el. laišką arba raštą pagal Nesmurtinės komunikacijos (NK) principus.
Gavėjas: ${audienceLabel}
Formatas: Oficialus susirašinėjimas (el. laiškas / raštas)
Tonas (skalėje 1-20): ${intensity} (${intensityDesc}) – išlaikyk dalykišką, pagarbų, nesmurtinį stilių.

Struktūra:
- Tema: trumpa, neutrali ir aiški laiško tema
- Mandagus kreipinys
- Faktai (stebėjimas): neutraliai išdėstyti faktai be kaltinimų ar etikečių (jei trūksta datos ar rašto numerio, palik vietą laužtiniuose skliaustuose, pvz. [data])
- Jausmas / poveikis: profesionali, institucijai tinkama formuluotė (pvz., „jaučiame susirūpinimą“, „kyla nerimas“, „mums svarbu“)
- Poreikis: bendras visuotinis poreikis (saugumas, aiškumas, skaidrumas, bendradarbiavimas, pasitikėjimas)
- Prašymas: konkretus, įgyvendinamas veiksmas ir aiškus pageidaujamas terminas ar atsakymo forma
- Mandagus atsisveikinimas

Pradinė mintis: "${input}"

Atsakyk tik paruoštu laiško tekstu lietuvių kalba, be papildomų įžanginių ar baigiamųjų komentarų.`;
  }

  return `Performuok šią kritiką į Nesmurtinės komunikacijos (NK) žodinį prašymą (stebėjimas, jausmas, poreikis, konkretus prašymas klausimu).
Auditorija: ${audienceLabel}
Formatas: Žodinis pokalbis
Tonas (skalėje 1-20): ${intensity} (${intensityDesc})
Pradinė mintis: "${input}"

Atsakyk tik performuluotu prašymu lietuvių kalba, be papildomų komentarų.`;
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
    const response = await client.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: buildRephrasePrompt(audience, format, intensity, intensityDesc, input),
      config: {
        systemInstruction: 'Tu esi Nesmurtinės komunikacijos (NK) ekspertas. Puikiai išmanai tiek kasdienius pokalbius (su vaikais, tėvais, kolegomis), tiek oficialų dalykinį susirašinėjimą su institucijomis (savivaldybėmis, mokyklų administracijomis, valstybinėmis įstaigomis) pagal NK principus.',
      },
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
      model: 'gemini-4-hydrogen',
      contents: messages,
      config: {
        systemInstruction: 'Tu esi Nesmurtinės Komunikacijos (NK) ekspertas ir empatiškas mentorius. Padėk vartotojui suformuluoti prašymus, atpažinti jausmus ir poreikius tiek gyvuose pokalbiuose (šeimoje, mokykloje, darbe), tiek oficialiame susirašinėjime su institucijomis (el. laiškuose, raštuose, kreipimuose į savivaldybę, ministerijas ar įstaigas). Kai vartotojas klausia apie raštą institucijai, patark, kaip neutraliai pateikti faktus su datomis, profesionaliai įvardyti poveikį/susirūpinimą, bendrą poreikį ir suformuluoti konkretų prašymą su terminu. Kalbėk šiltai, aiškiai, palaikančiai, naudok taisyklingą lietuvių kalbą.',
      },
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
