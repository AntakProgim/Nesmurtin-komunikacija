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
      return new Response(JSON.stringify({ error: "Input text is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.DEFAULT_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Performuok šią kritiką į Nesmurtinės komunikacijos prašymą (stebėjimas, jausmas, poreikis, prašymas). Auditorija: ${audience}, Tonas (skalėje 1-20): ${intensity} (${intensityDesc}). Mintis: "${input}". Atsakyk tik prašymu.`,
      config: { systemInstruction: "Tu esi Nesmurtinės komunikacijos (NK) ekspertas." }
    });

    return new Response(JSON.stringify({ text: response.text }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Rephrase Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Nepavyko sugeneruoti atsakymo." }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config: Config = {
  path: "/api/rephrase"
};
