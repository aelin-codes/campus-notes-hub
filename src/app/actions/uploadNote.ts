"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ieonggxbgelervhkhhqm.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllb25nZ3hiZ2VsZXJ2aGtoaHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTM0NDYsImV4cCI6MjEwNDA4OTQ0Nn0.0yJnGEdnuE5LaIrgwpCLH3EbNX_RDparMl3l1GJQbtg";

export async function uploadNoteAction(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;

  if (!token) {
    throw new Error("Unauthorized: You must be logged in to upload notes.");
  }

  // Create client with the user's JWT to authenticate independently on the server
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

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const department = (formData.get("department") as string)?.trim();
  const semesterStr = (formData.get("semester") as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim();
  const uploaderName = (formData.get("uploader_name") as string)?.trim();
  const fileUrl = (formData.get("file_url") as string)?.trim();
  const fileType = (formData.get("file_type") as string)?.trim() as "pdf" | "image";

  if (!title || title.length > 150) {
    throw new Error("Note title is required and must be 150 characters or fewer.");
  }
  if (!department || department.length > 100) {
    throw new Error("Department is required and must be 100 characters or fewer.");
  }
  if (!semesterStr) {
    throw new Error("Semester is required.");
  }
  const semester = parseInt(semesterStr, 10);
  if (isNaN(semester) || semester < 1 || semester > 8) {
    throw new Error("Semester must be a valid number between 1 and 8.");
  }
  if (!subject || subject.length > 100) {
    throw new Error("Subject is required and must be 100 characters or fewer.");
  }
  if (!uploaderName || uploaderName.length > 100) {
    throw new Error("Uploader name is required and must be 100 characters or fewer.");
  }
  if (description && description.length > 1000) {
    throw new Error("Description must be 1000 characters or fewer.");
  }
  if (!fileUrl) {
    throw new Error("File URL is required.");
  }
  // Enforce that fileUrl originates strictly from the authorized Supabase Storage bucket
  const validStoragePrefix = `${supabaseUrl}/storage/v1/object/public/notes-files/`;
  if (!fileUrl.startsWith(validStoragePrefix)) {
    throw new Error("Invalid file URL: Untrusted origin or protocol.");
  }
  if (!fileType || (fileType !== "pdf" && fileType !== "image")) {
    throw new Error("Valid file type (pdf or image) is required.");
  }

  // uploader_id is set STRICTLY from the verified server-side session user.id
  const { data, error: insertError } = await authClient
    .from("notes")
    .insert([
      {
        title,
        description,
        department,
        semester,
        subject,
        uploader_name: uploaderName,
        uploader_id: user.id, // Verified server-side session user ID
        file_url: fileUrl,
        file_type: fileType,
      },
    ])
    .select()
    .single();

  if (insertError) {
    throw new Error(`Database insert failed: ${insertError.message}`);
  }

  return { success: true, note: data };
}
