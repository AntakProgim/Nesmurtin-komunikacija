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
      contents: messages,
      config: {
        systemInstruction: 'Tu esi Nesmurtinės Komunikacijos (NK) ekspertas ir empatiškas mentorius. Padėk vartotojui suformuluoti prašymus, atpažinti jausmus ir poreikius. Kalbėk šiltai, palaikančiai, naudok lietuvių kalbą.',
      }
    });

    return new Response(JSON.stringify({ text: response.text }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Chat Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Nepavyko sugeneruoti pokalbio atsakymo." }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config: Config = {
  path: "/api/chat"
};
