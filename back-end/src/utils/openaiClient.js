import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('[OpenAI] OPENAI_API_KEY is not set. /track-creation/ai-ideas will return 500 until configured.');
}

export const openai = new OpenAI({ apiKey });
