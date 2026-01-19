
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTechnicalSummary = async (description: string, category: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Eres un ingeniero experto en trazabilidad técnica. Genera un resumen técnico ejecutivo breve (máximo 3 líneas) basado en la siguiente actividad:
      Categoría: ${category}
      Descripción: ${description}
      
      El tono debe ser profesional y técnico.`,
    });
    return response.text || "No se pudo generar el resumen técnico.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error al generar insights técnicos.";
  }
};
