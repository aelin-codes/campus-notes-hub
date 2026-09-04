import { createClient } from '@supabase/supabase-js';

export interface Note {
  id: string;
  title: string;
  description: string | null;
  department: string;
  semester: number;
  subject: string;
  uploader_name: string;
  file_url: string;
  file_type: 'pdf' | 'image';
  created_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
