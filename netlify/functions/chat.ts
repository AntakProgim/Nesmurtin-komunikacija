import type { Config } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), { 
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
      contents: messages,
      config: {
        systemInstruction: 'Tu esi Nesmurtinės Komunikacijos (NK) ekspertas ir empatiškas mentorius. Padėk vartotojui suformuluoti prašymus, atpažinti jausmus ir poreikius tiek gyvuose pokalbiuose (šeimoje, mokykloje, darbe), tiek oficialiame susirašinėjime su institucijomis (el. laiškuose, raštuose, kreipimuose į savivaldybę, ministerijas ar įstaigas). Kai vartotojas klausia apie raštą institucijai, patark, kaip neutraliai pateikti faktus su datomis, profesionaliai įvardyti poveikį/susirūpinimą, bendrą poreikį ir suformuluoti konkretų prašymą su terminu. Kalbėk šiltai, aiškiai, palaikančiai, naudok taisyklingą lietuvių kalbą.',
      }
    });

    return new Response(JSON.stringify({ text: response.text }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Chat Error:", error);
    let message = error?.message || "Nepavyko sugeneruoti pokalbio atsakymo.";
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
  path: "/api/chat"
};
