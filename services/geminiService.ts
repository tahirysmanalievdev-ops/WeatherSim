import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIChatResponse } from "../types";

const parseConfig = (text: string): AIChatResponse | null => {
  try {
    // Attempt to extract JSON if the model returns markdown code blocks
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    return JSON.parse(jsonString) as AIChatResponse;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return { reply: "I'm having trouble processing that request, but I'm still here!" };
  }
};

export const generateWeatherChat = async (history: string, prompt: string): Promise<AIChatResponse | null> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found");
    return { reply: "API Key is missing. Please check your configuration." };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Schema definition for the model to follow strictly
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        reply: { 
          type: Type.STRING, 
          description: "Your conversational response to the user. Be creative and thematic." 
        },
        weatherData: {
          type: Type.OBJECT,
          nullable: true,
          description: "Optional weather configuration if the user requested a change.",
          properties: {
            description: { type: Type.STRING },
            backgroundHex: { type: Type.STRING },
            config: {
              type: Type.OBJECT,
              properties: {
                count: { type: Type.NUMBER },
                speedBase: { type: Type.NUMBER },
                speedVar: { type: Type.NUMBER },
                gravity: { type: Type.NUMBER },
                wind: { type: Type.NUMBER },
                sizeBase: { type: Type.NUMBER },
                sizeVar: { type: Type.NUMBER },
                color: { type: Type.STRING },
                opacity: { type: Type.NUMBER },
                interactionForce: { type: Type.NUMBER },
                trace: { type: Type.BOOLEAN },
              }
            }
          }
        }
      }
    };

    const systemPrompt = `
      You are the 'Atmosphere Director', an AI controlling a particle physics simulation.
      
      Your Goal:
      1. Chat naturally with the user about weather, physics, or the simulation.
      2. If the user describes a scene or asks for weather, GENERATE the 'weatherData' object.
      3. If they just want to chat, leave 'weatherData' null.
      
      Physics Guidelines for 'weatherData':
      - Gravity: Positive is down (Earth ~0.5), Negative is up (Anti-gravity).
      - Wind: Horizontal force.
      - Count: Keep between 100-1500 for performance.
      
      Personality: slightly sci-fi, helpful, and concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `History:\n${history}\n\nUser: ${prompt}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    return parseConfig(response.text);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { reply: "I lost connection to the atmosphere servers. Try again?" };
  }
};
