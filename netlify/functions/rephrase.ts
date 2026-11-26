import type { Config } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

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

    const prompt = isWritten
      ? `Performuok šią kritiką, problemą ar juodraštį į konstruktyvų oficialų el. laišką arba raštą pagal Nesmurtinės komunikacijos (NK) principus.
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

Atsakyk tik paruoštu laiško tekstu lietuvių kalba, be papildomų įžanginių ar baigiamųjų komentarų.`
      : `Performuok šią kritiką į Nesmurtinės komunikacijos (NK) žodinį prašymą (stebėjimas, jausmas, poreikis, konkretus prašymas klausimu).
Auditorija: ${audienceLabel}
Formatas: Žodinis pokalbis
Tonas (skalėje 1-20): ${intensity} (${intensityDesc})
Pradinė mintis: "${input}"

Atsakyk tik performuluotu prašymu lietuvių kalba, be papildomų komentarų.`;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction: "Tu esi Nesmurtinės komunikacijos (NK) ekspertas. Puikiai išmanai tiek kasdienius pokalbius, tiek oficialų dalykinį susirašinėjimą su institucijomis pagal NK principus.",
      }
    });

    return new Response(JSON.stringify({ text: response.text }), {
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
