import { supabase, supabaseAdmin } from './supabase.js';

// Generic: fetch rows by created_by for arbitrary table with common columns
export async function getByCreator(table, userId) {
  if (!table || !userId) return { data: [], error: 'MISSING_PARAMS' };
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from(table)
    .select('id, created_at, name, email, phone_number, created_by')
    .eq('created_by', userId)
    .order('created_at', { ascending: true });
  return { data: data || [], error };
}

// Generic: create a row with required name/email, optional phone_number
export async function createEntry(table, payload, userId) {
  if (!table || !payload || !userId) return { data: null, error: 'MISSING_PARAMS' };
  const { name, email, phone_number } = payload;
  if (!name || !email) return { data: null, error: 'NAME_EMAIL_REQUIRED' };

  const insert = {
    name: String(name).trim(),
    email: String(email).trim(),
    phone_number: phone_number ? normalizePhone(phone_number) : null,
    created_by: userId,
  };

  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from(table)
    .insert([insert])
    .select('id, created_at, name, email, phone_number, created_by')
    .single();
  return { data: data || null, error };
}

export function normalizePhone(input) {
  if (input == null || input === '') return null;
  if (typeof input === 'object') return input; // already JSON
  const str = String(input).trim();
  if (!str) return null;
  // Store as JSON with a single key to match json column
  return { number: str };
}

// Back-compat helper retained
export async function getTeamMembersByCreator(userId) {
  return getByCreator('team_members', userId);
}
