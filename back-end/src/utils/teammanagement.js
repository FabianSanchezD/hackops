import { supabase } from './supabase.js';

// Fetch team members created by a specific user
export async function getTeamMembersByCreator(userId) {
  if (!userId) return { data: [], error: 'MISSING_USER_ID' };
  const { data, error } = await supabase
    .from('team_members')
    .select('id, created_at, name, email, phone_number, created_by')
    .eq('created_by', userId)
    .order('created_at', { ascending: true });
  return { data: data || [], error };
}
