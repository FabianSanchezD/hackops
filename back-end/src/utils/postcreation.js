import OpenAI from "openai";
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the main project directory (two levels up from src/utils)
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Creates a social media post image based on a user prompt
 * @param {string} prompt - The user's prompt for the post content
 * @returns {Promise<object>} - Returns the generated image URL and prompts
 */
export async function createPost(prompt) {
  try {
    // Use GPT-image-1 model directly for image generation
    const imageResponse = await client.images.generate({
      model: "gpt-image-1",
      prompt: `Create a high-quality social media post image (1080x1080 square format) based on this prompt: ${prompt}. Make it visually appealing, professional, and suitable for social media sharing with vibrant colors and engaging composition.`,
      size: "1024x1024"
    });

    // gpt-image-1 may return base64 data; persist to disk and return a link
    const data = imageResponse?.data?.[0];
    const b64 = data?.b64_json;
    const url = data?.url;
    if (!b64 && !url) throw new Error('No image returned by gpt-image-1');

    let publicUrl = url;
    if (b64) {
      const buffer = Buffer.from(b64, 'base64');
      const mediaDir = path.join(__dirname, '../media');
      await fs.mkdir(mediaDir, { recursive: true });
  const filename = `post_${Date.now()}.png`;
      const filePath = path.join(mediaDir, filename);
      await fs.writeFile(filePath, buffer);

  const port = process.env.BACKEND_PORT || 5000;
  const baseUrl = process.env.BACKEND_PUBLIC_URL || `http://localhost:${port}`;
  publicUrl = `${baseUrl.replace(/\/$/, '')}/media/${filename}`;
    }

    return {
      imageUrl: publicUrl,
      originalPrompt: prompt,
      enhancedPrompt: `Create a high-quality social media post image (1080x1080 square format) based on this prompt: ${prompt}. Make it visually appealing, professional, and suitable for social media sharing with vibrant colors and engaging composition.`
    };
  } catch (error) {
    const reason = error?.response?.data?.error?.message || error?.message || String(error);
    console.error('Error creating post:', error?.response?.data || error);
    throw new Error(`Failed to create post image with GPT-image-1: ${reason}`);
  }
}

/**
 * Creates a concise, engaging description based on a prompt
 * @param {string} prompt - The user's prompt for the description content
 * @returns {Promise<string>} - Returns the generated description text
 */
export async function createDescription(prompt) {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful copywriter who crafts concise, compelling, and clear social media post descriptions. Keep it human, positive, and scannable.",
        },
        {
          role: "user",
          content:
            `Write an engaging social media post description based on this brief: "${prompt}".\n\nRequirements:\n- 80-140 words\n- Plain text (no markdown)\n- 1–3 tasteful emojis if relevant\n- 0–5 targeted hashtags at the end (optional)`,
        },
      ],
    });

    const text = completion?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("No description was generated");
    return text;
  } catch (error) {
    console.error("Error creating description:", error);
    throw new Error("Failed to create description with GPT-4o-mini");
  }
}