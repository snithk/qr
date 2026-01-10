
import { GoogleGenAI, Type } from "@google/genai";
import { FileInsights } from "../types";

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getFileInsights = async (fileName: string, fileType: string, fileSize: number): Promise<FileInsights> => {
  const ai = getClient();

  // Fallback if no API key is configured
  if (!ai) {
    return {
      title: fileName,
      description: "Securely shared file via QR-Drop.",
      category: "File"
    };
  }

  const prompt = `Analyze this file metadata and provide a creative share title and a short 1-sentence description for a QR code landing page.
  File Name: ${fileName}
  File Type: ${fileType}
  File Size: ${(fileSize / 1024).toFixed(2)} KB`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A catchy, short title for the file share." },
            description: { type: Type.STRING, description: "A concise 1-sentence description." },
            category: { type: Type.STRING, description: "One word category: Document, Image, Media, Code, or Other." }
          },
          required: ["title", "description", "category"]
        }
      }
    });

    // The SDK often returns the text directly or in a specific structure; ensure safe parsing
    const text = response.text;

    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    // Identify if the text is wrapped in markdown code blocks
    const cleanedText = typeof text === 'string' ? text.replace(/```json\n|\n```/g, '') : JSON.stringify(text);

    return JSON.parse(cleanedText);
  } catch (error: any) {
    // Gracefully handle rate limits
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
      console.warn("Gemini Rate Limit Hit (429). Using default file details.");
    } else {
      console.error("Gemini Error:", error);
    }

    return {
      title: fileName,
      description: "Securely shared file via QR-Drop.",
      category: "Other"
    };
  }
};
