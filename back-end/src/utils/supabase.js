import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	// Warning if there is no supabase key or url
	console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY from environment.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);