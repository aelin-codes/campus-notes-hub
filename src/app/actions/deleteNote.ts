"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ieonggxbgelervhkhhqm.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllb25nZ3hiZ2VsZXJ2aGtoaHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTM0NDYsImV4cCI6MjEwNDA4OTQ0Nn0.0yJnGEdnuE5LaIrgwpCLH3EbNX_RDparMl3l1GJQbtg";

export async function deleteNoteAction(noteId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;

  if (!token) {
    throw new Error("Unauthorized: You must be logged in to delete notes.");
  }

  // Create client with authenticated user's token so Postgres RLS evaluates auth.uid()
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);

  if (userError || !user) {
    throw new Error("Unauthorized: Invalid or expired session.");
  }

  // Attempt to delete note. RLS policy notes_delete_policy enforces that:
  // auth.uid() = uploader_id OR profiles.role = 'admin'
  const { data, error: deleteError } = await authClient
    .from("notes")
    .delete()
    .eq("id", noteId)
    .select();

  if (deleteError) {
    throw new Error(`Delete failed: ${deleteError.message}`);
  }

  // If RLS blocked the deletion, 0 rows are returned
  if (!data || data.length === 0) {
    throw new Error("Forbidden: You do not have permission to delete this note.");
  }

  revalidatePath("/");
  revalidatePath("/browse");

  return { success: true, deletedId: noteId };
}
