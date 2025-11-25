
import { GoogleGenAI, Type } from '@google/genai';
import { CartItem, MenuItem } from '../types';

// Initialize the Gemini API client
// Ensure process.env.API_KEY is set in your environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Asks Gemini for upsell recommendations based on current cart items.
 */
export const getUpsellRecommendation = async (
  cartItems: CartItem[],
  allMenuItems: MenuItem[]
): Promise<{ text: string; itemIds: string[] }> => {
  if (cartItems.length === 0) return { text: '', itemIds: [] };

  const cartDescriptions = cartItems.map(item => `${item.quantity}x ${item.name}`).join(', ');
  const menuDescriptions = allMenuItems.map(item => `${item.id}: ${item.name} (${item.category})`).join('\n');

  const prompt = `
    You are a smart waiter at a restaurant.
    Current Order: ${cartDescriptions}
    
    Available Menu Items:
    ${menuDescriptions}

    Task: Suggest 1 or 2 items from the menu that would pair perfectly with the current order. 
    Explain why briefly (under 20 words).
    
    Output JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendationText: { type: Type.STRING },
            recommendedItemIds: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) return { text: '', itemIds: [] };

    const parsed = JSON.parse(jsonText);
    return {
      text: parsed.recommendationText || "Try our specials!",
      itemIds: parsed.recommendedItemIds || [],
    };
  } catch (error) {
    console.error("Gemini recommendation error:", error);
    return { text: "Don't forget to add a drink!", itemIds: [] };
  }
};
