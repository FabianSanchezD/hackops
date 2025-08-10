import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root (two levels up)
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

if (!process.env.OPENAI_API_KEY) {
  console.warn('[OpenAI] OPENAI_API_KEY is not set. Challenge builder features will fail until configured.');
}

function parseJsonFromText(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (_) { /* noop */ }
    }
    return null;
  }
}

/**
 * Generate hackathon tracks and challenge ideas as strict JSON.
 * @param {Object} params
 * @param {string} [params.theme="AI & Impact"] - Main theme of the hackathon
 * @param {string} [params.audience="students and professionals"] - Target audience
 * @param {number} [params.durationDays=2] - Event duration in days
 * @param {number} [params.tracksCount=4] - Number of tracks to propose
 * @param {number} [params.challengesPerTrack=3] - Number of challenge ideas per track
 * @returns {Promise<{tracks: Array<{name: string, objective: string, challenges: Array<{title: string, description: string}>}>}>}
 */
export async function generateTrackIdeas(params = {}) {
  const {
    theme = 'AI & Impact',
    audience = 'students and professionals',
    durationDays = 2,
    tracksCount = 4,
    challengesPerTrack = 3,
  } = params;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'You are an experienced hackathon organizer. Return strictly valid JSON. No markdown, no extra text.'
        },
        {
          role: 'user',
          content: [
            `Generate ${tracksCount} hackathon tracks for a ${durationDays}-day event on the theme "${theme}" targeting ${audience}.`,
            `For each track, include: name (short), objective (1 sentence), and ${challengesPerTrack} concrete challenges with a title and brief description.`,
            'Return JSON with shape: { "tracks": [ { "name": string, "objective": string, "challenges": [ { "title": string, "description": string } ] } ] }'
          ].join('\n')
        }
      ]
    });

    const text = completion?.choices?.[0]?.message?.content?.trim();
    const ideas = parseJsonFromText(text) || { tracks: [] };
    // Basic normalization
    ideas.tracks = Array.isArray(ideas.tracks) ? ideas.tracks : [];
    ideas.tracks = ideas.tracks.map(t => ({
      name: String(t?.name || '').trim() || 'Untitled Track',
      objective: String(t?.objective || '').trim(),
      challenges: Array.isArray(t?.challenges) ? t.challenges.map(c => ({
        title: String(c?.title || '').trim() || 'Untitled Challenge',
        description: String(c?.description || '').trim()
      })) : []
    }));
    return ideas;
  } catch (error) {
    const reason = error?.response?.data?.error?.message || error?.message || String(error);
    console.error('Error generating track ideas:', error?.response?.data || error);
    throw new Error(`Failed to generate track ideas: ${reason}`);
  }
}

/**
 * Generate challenge ideas for a single track name.
 * @param {Object} params
 * @param {string} params.trackName
 * @param {string} [params.theme]
 * @param {number} [params.count=5]
 * @returns {Promise<Array<{title:string, description:string}>>}
 */
export async function generateChallengesForTrack({ trackName, theme, count = 5 }) {
  if (!trackName) throw new Error('trackName is required');
  if (!process.env.OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'Return strictly valid JSON. No prose.' },
        { role: 'user', content: [
          `Propose ${count} challenge ideas for the track "${trackName}"${theme ? ` under the theme "${theme}"` : ''}.`,
          'Return JSON: { "challenges": [ { "title": string, "description": string } ] }'
        ].join('\n') }
      ]
    });

    const text = completion?.choices?.[0]?.message?.content?.trim();
    const parsed = parseJsonFromText(text) || { challenges: [] };
    const challenges = Array.isArray(parsed.challenges) ? parsed.challenges.map(c => ({
      title: String(c?.title || '').trim() || 'Untitled Challenge',
      description: String(c?.description || '').trim()
    })) : [];
    return challenges;
  } catch (error) {
    const reason = error?.response?.data?.error?.message || error?.message || String(error);
    console.error('Error generating challenges:', error?.response?.data || error);
    throw new Error(`Failed to generate challenges: ${reason}`);
  }
}

/**
 * Summarize a set of ideas into a short blurb (optional helper).
 * @param {{tracks: Array<{name:string, objective:string, challenges:Array<{title:string, description:string}>}>}} ideas
 * @returns {Promise<string>}
 */
export async function summarizeIdeas(ideas) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OpenAI API key not configured');
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      messages: [
        { role: 'system', content: 'You summarize plans crisply in 2-3 sentences.' },
        { role: 'user', content: `Summarize these hackathon tracks and challenges succinctly: ${JSON.stringify(ideas)}` }
      ]
    });
    const text = completion?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('No summary generated');
    return text;
  } catch (error) {
    console.error('Error summarizing ideas:', error);
    throw new Error('Failed to summarize ideas');
  }
}

/**
 * Refine an existing set of ideas based on an instruction, preserving schema.
 * @param {{ideas: {tracks: Array}, instruction?: string}} params
 * @returns {Promise<{tracks: Array}>}
 */
export async function refineIdeas({ ideas, instruction = 'Improve clarity, remove overlap, and increase practicality while preserving structure.' }) {
  if (!ideas) throw new Error('ideas is required');
  if (!process.env.OPENAI_API_KEY) throw new Error('OpenAI API key not configured');
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.6,
      messages: [
        { role: 'system', content: 'Return strictly valid JSON only. Maintain the same schema.' },
        { role: 'user', content: [
          'Refine the following hackathon tracks and challenges without changing the JSON shape.',
          `Guidance: ${instruction}`,
          `JSON: ${JSON.stringify(ideas)}`,
          'Schema: { "tracks": [ { "name": string, "objective": string, "challenges": [ { "title": string, "description": string } ] } ] }'
        ].join('\n') }
      ]
    });
    const text = completion?.choices?.[0]?.message?.content?.trim();
    const parsed = parseJsonFromText(text) || { tracks: [] };
    parsed.tracks = Array.isArray(parsed.tracks) ? parsed.tracks : [];
    return parsed;
  } catch (error) {
    const reason = error?.response?.data?.error?.message || error?.message || String(error);
    console.error('Error refining ideas:', error?.response?.data || error);
    throw new Error(`Failed to refine ideas: ${reason}`);
  }
}

