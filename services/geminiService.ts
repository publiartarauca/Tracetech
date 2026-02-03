import { GoogleGenAI } from "@google/genai";

/**
 * Generates a brief technical summary using Gemini 3 Flash.
 * @param description The activity description.
 * @param category The activity category.
 */
export const generateTechnicalSummary = async (description: string, category: string) => {
  try {
    // Instantiate the GoogleGenAI client using the API key injected by Vite via define.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Actividad técnica:
      - Categoría: ${category}
      - Descripción: ${description}`,
      config: {
        systemInstruction: "Eres un ingeniero experto en trazabilidad técnica. Tu tarea es generar un resumen ejecutivo extremadamente breve (máximo 3 líneas) de la actividad proporcionada. El tono debe ser profesional y altamente técnico.",
      }
    });
    return response.text || "No se pudo generar el resumen técnico.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error al generar insights técnicos.";
  }
};

/**
 * Selects the best icon from a provided list based on the category name and description.
 * @param name Category name
 * @param description Category description
 * @param availableIcons List of available icon names
 */
export const suggestCategoryIcon = async (name: string, description: string, availableIcons: string[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      Category Name: ${name}
      Category Description: ${description}
      Available Icons: ${availableIcons.join(', ')}
      
      Task: Select the single icon name from the list above that best visually represents this category. 
      Return ONLY the icon name string. Nothing else.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.1, // Low temperature for deterministic selection
      }
    });

    const suggestedIcon = response.text?.trim() || '';
    
    // Fallback validation
    if (availableIcons.includes(suggestedIcon)) {
      return suggestedIcon;
    }
    
    return 'Tag'; // Default fallback
  } catch (error) {
    console.error("Error suggesting icon:", error);
    return 'Tag'; // Default fallback
  }
};