import Link from "next/link";
import { supabase, Note } from "@/lib/supabase";
import NoteCard from "@/components/NoteCard";

export const revalidate = 0;

const DEPARTMENT_SHORTCUTS = [
  { name: "CSE", full: "Computer Science & Engineering (CSE)", color: "bg-[#7C5CFF]" },
  { name: "ECE", full: "Electronics & Communication (ECE)", color: "bg-[#00E0C6]" },
  { name: "Mech", full: "Mechanical Engineering (ME)", color: "bg-[#FFB547]" },
  { name: "Civil", full: "Civil Engineering (CE)", color: "bg-[#FF6584]" },
  { name: "EEE", full: "Electrical & Electronics (EEE)", color: "bg-[#4D96FF]" },
  { name: "IT", full: "Information Technology (IT)", color: "bg-[#00E0C6]" },
];

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
      {/* 3.2 Hero Section (Techfest aesthetic: dark base, subtle gradient mesh, bold display headline) */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#151922] border border-[#262B38] p-6 sm:p-12 md:p-16 shadow-2xl">
        {/* Subtle gradient blob behind headline */}
        <div className="absolute -top-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-gradient-to-br from-[#7C5CFF]/20 to-[#00E0C6]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 sm:w-80 h-72 sm:h-80 rounded-full bg-[#7C5CFF]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1D2330] border border-[#262B38] text-xs font-medium text-[#00E0C6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E0C6] animate-pulse" />
            <span>Open & Free University Knowledge Hub</span>
          </div>

          {/* Headline with single gradient keyphrase per DESIGN.md Section 2 */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold text-[#F4F5F7] tracking-tight leading-[1.1]">
            Fast, reliable exam prep.{" "}
            <span className="bg-gradient-to-r from-[#7C5CFF] to-[#00E0C6] bg-clip-text text-transparent">
              Find Your Notes
            </span>{" "}
            in seconds.
          </h1>

          {/* One-line subtext */}
          <p className="text-base sm:text-lg text-[#9AA1B2] leading-relaxed max-w-2xl">
            No dead links or buried WhatsApp drives. Verified lecture summaries, syllabus guides, and previous question papers sorted by branch and semester.
          </p>

          {/* Two CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
            <Link
              href="/browse"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-gradient-to-r from-[#7C5CFF] to-[#00E0C6] text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-950/50 hover:brightness-110 active:scale-[0.97] transition-all text-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Notes
            </Link>

            <Link
              href="/upload"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg border border-[#262B38] bg-transparent hover:bg-[#1D2330] text-[#F4F5F7] font-semibold text-sm sm:text-base active:scale-[0.97] transition-all text-center"
            >
              <svg className="w-4 h-4 mr-2 text-[#9AA1B2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Notes
            </Link>
          </div>
        </div>
      </section>

      {/* 3.2 Quick Stats Row */}
      <section className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 rounded-xl bg-[#151922] border border-[#262B38] text-xs sm:text-sm text-[#9AA1B2]">
        <div className="flex items-center space-x-2">
          <span className="text-[#00E0C6] font-bold">100%</span>
          <span>Free Student Uploads</span>
        </div>
        <div className="h-4 w-px bg-[#262B38] hidden sm:block" />
        <div className="flex items-center space-x-2">
          <span className="text-[#7C5CFF] font-bold">8 Semesters</span>
          <span>Syllabus Indexed</span>
        </div>
        <div className="h-4 w-px bg-[#262B38] hidden sm:block" />
        <div className="flex items-center space-x-2">
          <span className="text-[#3DDC97] font-bold">Direct CDN</span>
          <span>Fast PDF Downloads</span>
        </div>
      </section>

      {/* 3.2 Browse-by-department Shortcuts */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9AA1B2]">
          Browse by Department
        </h2>
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {DEPARTMENT_SHORTCUTS.map((dept) => (
            <Link
              key={dept.name}
              href={`/browse?dept=${encodeURIComponent(dept.full)}`}
              className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#1D2330] hover:bg-[#262B38] border border-[#262B38] text-xs font-medium text-[#F4F5F7] transition-colors group"
            >
              <span className={`w-2 h-2 rounded-full ${dept.color} mr-2 group-hover:scale-110 transition-transform`} />
              {dept.name}
            </Link>
          ))}
          <Link
            href="/browse"
            className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-transparent hover:bg-[#1D2330] border border-[#262B38] text-xs font-medium text-[#9AA1B2] hover:text-[#F4F5F7] transition-colors"
          >
            All Departments &rarr;
          </Link>
        </div>
      </section>

      {/* 3.2 Recent Uploads Strip */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#262B38] pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#F4F5F7] tracking-tight">
              Recent Uploads
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA1B2] mt-0.5">
              Latest lecture notes and exam solutions shared by contributors
            </p>
          </div>
          <Link
            href="/browse"
            className="text-xs sm:text-sm font-semibold text-[#00E0C6] hover:underline inline-flex items-center self-start sm:self-auto"
          >
            View all resources &rarr;
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="text-center py-12 bg-[#151922] rounded-2xl border border-[#262B38] p-6">
            <p className="text-[#9AA1B2] text-sm">No notes uploaded yet.</p>
            <Link
              href="/upload"
              className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#7C5CFF] to-[#00E0C6] text-white text-xs sm:text-sm font-semibold hover:brightness-110 transition-all"
            >
              Upload the First Note
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}