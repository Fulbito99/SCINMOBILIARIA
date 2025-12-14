import { GoogleGenAI } from "@google/genai";
import { Property } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to format properties into a string context for the AI
const formatPropertiesContext = (properties: Property[]): string => {
  return JSON.stringify(properties.map(p => ({
    id: p.id,
    title: p.title,
    price: `${p.price} ${p.currency}`,
    location: p.location,
    details: `${p.beds} beds, ${p.baths} baths, ${p.sqft} sqft, ${p.type}`,
    description: p.description
  })));
};

export const chatWithGemini = async (
  userMessage: string, 
  properties: Property[],
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  
  if (!apiKey) {
    return "Error: API Key is missing. Please configure the environment.";
  }

  const systemInstruction = `
    You are an expert Real Estate Agent assistant for 'Inmobiliaria Conesa'.
    Your tone is professional, warm, and helpful. You speak Spanish (Español).
    
    You have access to the following current property inventory in JSON format:
    ${formatPropertiesContext(properties)}
    
    Rules:
    1. If the user asks for recommendations, search through the inventory provided above and suggest specific properties by name and ID.
    2. Highlight key features (price, location, type) when recommending.
    3. If the user asks general real estate questions (mortgages, process, taxes in Spain), answer generally based on your knowledge.
    4. Keep responses concise but informative. Do not use Markdown formatting excessively, keep it readable for chat.
    5. Always be polite.
  `;

  try {
    const model = 'gemini-2.5-flash';
    
    // We use generateContent for a stateless approach or managing history manually to ensure system instruction context is always fresh with latest properties if needed.
    // However, to keep chat history, we construct the prompt with history.
    
    const contents = [
      {
        role: 'user',
        parts: [{ text: `System Instruction: ${systemInstruction}` }]
      },
      ...history.map(h => ({
        role: h.role,
        parts: h.parts
      })),
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    const response = await ai.models.generateContent({
      model,
      contents,
    });

    return response.text || "Lo siento, no pude generar una respuesta en este momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Lo siento, hubo un error al conectar con el asistente. Por favor intenta más tarde.";
  }
};