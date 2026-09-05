import { createClient } from "@supabase/supabase-js";

export interface Note {
  id: string;
  title: string;
  description: string | null;
  department: string;
  semester: number;
  subject: string;
  uploader_name: string;
  uploader_id?: string | null;
  file_url: string;
  file_type: "pdf" | "image";
  created_at: string;
}

export interface Profile {
  id: string;
  role: "user" | "admin";
  created_at: string;
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ieonggxbgelervhkhhqm.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllb25nZ3hiZ2VsZXJ2aGtoaHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTM0NDYsImV4cCI6MjEwNDA4OTQ0Nn0.0yJnGEdnuE5LaIrgwpCLH3EbNX_RDparMl3l1GJQbtg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);