import Link from "next/link";
import { supabase, Note } from "@/lib/supabase";
import NoteCard from "@/components/NoteCard";

export const revalidate = 0;

async function getRecentNotes(): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("Error fetching recent notes:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Failed to query recent notes:", err);
    return [];
  }
}

export default async function HomePage() {
  const recentNotes = await getRecentNotes();

  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-zinc-900 text-white p-8 sm:p-14 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-indigo-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open & Free for All Students</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            All your campus notes & exam prep, in one central place.
          </h1>

          <p className="text-base sm:text-lg text-indigo-100/90 leading-relaxed max-w-2xl">
            Stop digging through crowded WhatsApp groups and broken Google Drive links.
            Find notes, syllabus guides, and solutions organized by department and semester.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              href="/browse"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-indigo-900 font-bold hover:bg-zinc-100 transition-colors shadow-lg shadow-black/10"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse All Notes
            </Link>

            <Link
              href="/upload"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold border border-indigo-400/30 backdrop-blur-sm transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Notes
            </Link>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Snapshot of Recent Uploads */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-zinc-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              Recent Uploads
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              Latest lecture notes and past papers shared by campus contributors
            </p>
          </div>
          <Link
            href="/browse"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center"
          >
            View all resources
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-zinc-200 p-6">
            <p className="text-zinc-500 text-sm">No notes uploaded yet.</p>
            <Link
              href="/upload"
              className="mt-4 inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Upload the First Note
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}