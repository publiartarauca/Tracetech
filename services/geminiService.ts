
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a brief technical summary using Gemini 3 Flash.
 * @param description The activity description.
 * @param category The activity category.
 */
export const generateTechnicalSummary = async (description: string, category: string) => {
  try {
    // Instantiate the GoogleGenAI client right before the API call to ensure it uses the latest process.env.API_KEY.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Use ai.models.generateContent with model name, prompt in contents, and system instructions in config.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Actividad técnica:
      - Categoría: ${category}
      - Descripción: ${description}`,
      config: {
        systemInstruction: "Eres un ingeniero experto en trazabilidad técnica. Tu tarea es generar un resumen ejecutivo extremadamente breve (máximo 3 líneas) de la actividad proporcionada. El tono debe ser profesional y altamente técnico.",
      }
    });
    // Use the .text property directly as it is a getter, not a method.
    return response.text || "No se pudo generar el resumen técnico.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error al generar insights técnicos.";
  }
};
