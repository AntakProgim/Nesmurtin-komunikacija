import type { Config } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { audience, intensityDesc, intensity, input } = body;
    
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

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Performuok šią kritiką į Nesmurtinės komunikacijos prašymą (stebėjimas, jausmas, poreikis, prašymas). Auditorija: ${audience}, Tonas (skalėje 1-20): ${intensity} (${intensityDesc}). Mintis: "${input}". Atsakyk tik prašymu.`,
      config: { systemInstruction: "Tu esi Nesmurtinės komunikacijos (NK) ekspertas." }
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
