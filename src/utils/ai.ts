import Anthropic from '@anthropic-ai/sdk';
import type { FoodCategory, TimeOfDay } from '../types';

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
export const AI_ENABLED = Boolean(API_KEY);

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: API_KEY!, dangerouslyAllowBrowser: true });
  }
  return _client;
}

// Derive a TimeOfDay bucket from an HH:MM string
export function deriveTimeOfDay(hhmm: string): TimeOfDay {
  const [h, m] = hhmm.split(':').map(Number);
  const mins = h * 60 + (m || 0);
  if (mins >= 300 && mins < 660) return 'morning';   // 05:00–10:59
  if (mins >= 660 && mins < 840) return 'midday';    // 11:00–13:59
  if (mins >= 840 && mins < 1080) return 'afternoon'; // 14:00–17:59
  return 'evening';                                    // 18:00–04:59
}

// --- analyzeFood ---

export type FoodAnalysis = {
  category: FoodCategory;
  allergens: string[];
  nutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
  };
};

const ANALYZE_FOOD_PROMPT = (foodName: string) =>
  `You are a baby food nutrition assistant. Analyze "${foodName}" as typically prepared for babies (pureed, soft, or age-appropriate form).

Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences. Use exactly this schema:

{
  "category": "<one of: fruits | vegetables | grains | proteins | dairy | other>",
  "allergens": ["<zero or more of: milk, eggs, fish, shellfish, tree_nuts, peanuts, wheat, soybeans, sesame>"],
  "nutrition": {
    "calories": <number per 100g>,
    "protein_g": <number>,
    "carbs_g": <number>,
    "fat_g": <number>,
    "fiber_g": <number>
  }
}

Rules:
- allergens must only contain IDs from the exact list above
- nutrition values are per 100g, rounded to one decimal place
- if the food is unknown or ambiguous, use your best estimate and category "other"`;

function parseJson<T>(text: string): T {
  const stripped = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(stripped) as T;
}

export async function analyzeFood(foodName: string): Promise<FoodAnalysis | null> {
  if (!AI_ENABLED) return null;
  try {
    const message = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: ANALYZE_FOOD_PROMPT(foodName) }],
    });
    const text = (message.content[0] as { type: 'text'; text: string }).text;
    return parseJson<FoodAnalysis>(text);
  } catch {
    return null;
  }
}

// --- analyzeFoodImage ---

export type ImageAnalysis = {
  foodName: string;
  category: FoodCategory;
  allergens: string[];
  notes: string;
};

const ANALYZE_IMAGE_PROMPT =
  `You are a baby food assistant looking at a photo of food or a baby food label. Identify what food is shown.

Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences:

{
  "foodName": "<common name of the food, capitalized, e.g. Sweet potato>",
  "category": "<one of: fruits | vegetables | grains | proteins | dairy | other>",
  "allergens": ["<zero or more of: milk, eggs, fish, shellfish, tree_nuts, peanuts, wheat, soybeans, sesame>"],
  "notes": "<one short sentence describing what you see>"
}

Rules:
- allergens must only contain IDs from the exact list above
- foodName should be the primary ingredient if multiple items are visible
- If the image is unclear or not food, set foodName to empty string and category to "other"`;

export async function analyzeFoodImage(
  base64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
): Promise<ImageAnalysis | null> {
  if (!AI_ENABLED) return null;
  try {
    const message = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
          { type: 'text', text: ANALYZE_IMAGE_PROMPT },
        ],
      }],
    });
    const text = (message.content[0] as { type: 'text'; text: string }).text;
    return parseJson<ImageAnalysis>(text);
  } catch {
    return null;
  }
}
