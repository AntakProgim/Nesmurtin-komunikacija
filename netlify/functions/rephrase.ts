import type { Config } from "@netlify/functions";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { audience, format = 'spoken', intensityDesc, intensity, input } = body;
    
    if (!input) {
      return new Response(JSON.stringify({ error: "Prašome įvesti tekstą." }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const rawKey = process.env.GEMINI_API_KEY || process.env.DEFAULT_API_KEY || '';
    const apiKey = typeof rawKey === 'string' ? rawKey.trim() : '';
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Netlify aplinkoje nenustatytas GEMINI_API_KEY kintamasis." }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const audienceMap: Record<string, string> = {
      child: 'Mokinys arba vaikas',
      parent: 'Tėvai arba globėjai',
      colleague: 'Kolega arba mokytojas',
      institution: 'Institucija (savivaldybė, ministerija, įstaiga, administracija)',
    };
    const audienceLabel = audienceMap[audience] || audience || 'Pašnekovas';
    const isWritten = format === 'written' || audience === 'institution';

    const modeInstructions = isWritten
      ? `Performuok pradinį tekstą į konstruktyvų oficialų el. laišką arba raštą pagal Nesmurtinės komunikacijos (NK) principus (Tema, mandagus kreipinys, neutralūs faktai su datomis/vietomis laužtiniuose skliaustuose jei trūksta, dalykiška jausmo/poveikio formuluotė, bendras poreikis, konkretus prašymas su terminu, atsisveikinimas).`
      : `Performuok pradinį tekstą į Nesmurtinės komunikacijos (NK) žodinį prašymą (stebėjimas, jausmas, poreikis, konkretus prašymas klausimu).`;

    const prompt = `${modeInstructions}
Gavėjas: ${audienceLabel}
Formatas: ${isWritten ? 'Oficialus susirašinėjimas (el. laiškas / raštas)' : 'Žodinis pokalbis'}
Tonas (skalėje 1-20): ${intensity} (${intensityDesc})

Taip pat įvertink PRADINĮ vartotojo tekstą pagal tai, kiek jame išreikšta orientacijos į:
1. faktus (stebėjimą / konkrečius įvykius) – facts (0–100)
2. jausmus (emocinę būseną / toną) – feelings (0–100)
3. poreikius (vertybes / tikslus / norimus rezultatus) – needs (0–100)
Šių trijų procentų suma PRIVALO būti lygi 100. Pridėk trumpą 1 sakinio įžvalgą lietuvių kalba (summary).

Pradinis tekstas: "${input}"`;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            analysis: {
              type: Type.OBJECT,
              properties: {
                facts: { type: Type.INTEGER },
                feelings: { type: Type.INTEGER },
                needs: { type: Type.INTEGER },
                summary: { type: Type.STRING },
              },
            },
          },
        },
        systemInstruction: "Tu esi Nesmurtinės komunikacijos (NK) ekspertas. Puikiai išmanai tiek kasdienius pokalbius, tiek oficialų dalykinį susirašinėjimą su institucijomis pagal NK principus. Visada grąžink tikslų JSON objektą.",
      }
    });

    const rawText = (response.text ?? '').trim();
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { text: rawText, analysis: { facts: 34, feelings: 33, needs: 33, summary: '' } };
    }

    return new Response(JSON.stringify({ text: parsed?.text || rawText, analysis: parsed?.analysis }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Rephrase Error:", error);
    let message = error?.message || "Nepavyko sugeneruoti atsakymo.";
    if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
      message = 'Neteisingas arba negaliojantis Gemini API raktas Netlify nustatymuose.';
    } else if (message.includes('leaked')) {
      message = 'Jūsų API raktas buvo užblokuotas kaip nutekėjęs. Sukurkite naują raktą Google AI Studio ir atnaujinkite Netlify kintamąjį.';
    } else if (message.includes('spending cap') || message.includes('monthly spending')) {
      message = 'Pasiektas šio Google Cloud projekto mėnesinis išlaidų limitas (spending cap). Patikrinkite arba pakoreguokite limitą Google AI Studio skiltyje „Spend“ (ai.studio/spend).';
    } else if (message.includes('RESOURCE_EXHAUSTED') || message.includes('quota') || message.includes('429')) {
      message = 'Laikinai pasiektas užklausų limitas (kvota). Pabandykite šiek tiek vėliau.';
    }
    return new Response(JSON.stringify({ error: message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config: Config = {
  path: "/api/rephrase"
};
